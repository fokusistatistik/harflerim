'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RefreshCw, Home } from 'lucide-react';
import { AUDIOS } from '@/store/gameData';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/components/AudioProvider';
import { useNotificationStore } from '@/store/notificationStore';
import { useGameContent } from '@/hooks/useGameContent';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';

// --- PERSISTENCE HELPER ---
const useMagicWordsProgress = () => {
    const [progress, setProgress] = useState({ played: 0, success: 0, date: '' });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem('magic_words_progress');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === today) {
                setProgress(parsed);
            } else {
                setProgress({ played: 0, success: 0, date: today });
            }
        } else {
            setProgress({ played: 0, success: 0, date: today });
        }
        setLoaded(true);
    }, []);

    const updateProgress = (isSuccess: boolean) => {
        setProgress(prev => {
            const next = {
                ...prev,
                played: prev.played + 1,
                success: isSuccess ? prev.success + 1 : prev.success
            };
            localStorage.setItem('magic_words_progress', JSON.stringify(next));
            return next;
        });
    };
    return { progress, updateProgress, loaded };
};

// --- MIC VOLUME HOOK ---
const useMicVolume = (listening: boolean) => {
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (listening) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                streamRef.current = stream;
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                const ctx = audioContextRef.current;
                if (ctx.state === 'suspended') ctx.resume();

                analyserRef.current = ctx.createAnalyser();
                analyserRef.current.fftSize = 256;
                const source = ctx.createMediaStreamSource(stream);
                source.connect(analyserRef.current);

                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                const updateVolume = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                    setVolume(avg);
                    requestAnimationFrame(updateVolume);
                };
                updateVolume();
            }).catch(err => console.warn("Mic access issue:", err));
        } else {
            setVolume(0);
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        }
    }, [listening]);

    return volume;
};

export default function MagicWordsGame() {
    const router = useRouter();

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [gameStatus, setGameStatus] = useState<'idle' | 'checking' | 'playing' | 'error'>('idle');
    const [permissionError, setPermissionError] = useState(false);
    const [skipTriggered, setSkipTriggered] = useState(false);

    // Locking mechanism to prevent multiple triggers
    const isProcessingRef = useRef(false);

    // Data
    const [gameWords, setGameWords] = useState<{ word: string; img: string }[]>([]);

    // Progress & Sound
    const { updateProgress, loaded } = useMagicWordsProgress();
    const { data: content } = useGameContent();
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const [playCorrect] = useSound(AUDIOS.correct, { volume: 0.5 });
    const [playSad] = useSound((AUDIOS as any).sad || AUDIOS.wrong, { volume: 0.5 });
    const { celebrateSuccess, encourageRetry } = useAudio();
    const pushToast = useNotificationStore((s) => s.pushToast);

    // Recognition
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const volume = useMicVolume(listening);
    const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Init
    useEffect(() => {
        setIsClient(true);
    }, []);

    // İçerik veritabanından (Faz 1.4) gelince kelime destesini bir kez karıştır.
    useEffect(() => {
        if (!content) return;
        const allWords = Object.values(content.letterObjects).flat();
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        setGameWords(shuffled);
    }, [content]);

    const currentWordObj = gameWords[currentIndex];

    // Start Handler
    const handleStartGame = async () => {
        if (dayBudget?.isDayComplete) return; // Faz 1.8/1.10: günlük süre bütçesi doldu
        setGameStatus('checking');
        setPermissionError(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' });
            setGameStatus('playing');
        } catch (err) {
            setPermissionError(true);
            setGameStatus('error');
        }
    };

    // Auto-Restart
    useEffect(() => {
        if (gameStatus === 'playing' && !listening && !permissionError) {
            if (!restartTimerRef.current) {
                restartTimerRef.current = setTimeout(() => {
                    SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' });
                    restartTimerRef.current = null;
                }, 1500);
            }
        }
        return () => { if (restartTimerRef.current) clearTimeout(restartTimerRef.current); }
    }, [listening, gameStatus, permissionError]);


    // --- CORE GAME ACTIONS ---

    const moveToNextCard = useCallback(() => {
        // 1. Reset Transcription immediately to prevent old text triggering next card
        resetTranscript();

        // 2. Wait for animation
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % gameWords.length);
            setSkipTriggered(false);

            // 3. Unlock after state update is processed
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 100);

        }, 1500); // Animation duration
    }, [gameWords, resetTranscript]);


    const handleSuccess = useCallback(() => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true; // LOCK

        playCorrect();
        celebrateSuccess().catch(() => {});
        pushToast({ scope: 'child', kind: 'success', message: 'Harika!' });
        updateProgress(true);
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#FFC0CB', '#FFD700', '#00BFFF', '#32CD32'] });

        moveToNextCard();
    }, [playCorrect, celebrateSuccess, pushToast, updateProgress, moveToNextCard]);


    const handleSkip = useCallback(() => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true; // LOCK

        setSkipTriggered(true);
        playSad();
        encourageRetry().catch(() => {});
        updateProgress(false);

        moveToNextCard();
    }, [playSad, encourageRetry, updateProgress, moveToNextCard]);


    // --- MATCH LISTENER ---
    useEffect(() => {
        // Safety checks
        if (!currentWordObj || !transcript || gameStatus !== 'playing') return;
        if (dayBudget?.isDayComplete) return; // Faz 1.8/1.10: günlük süre bütçesi doldu

        // If locked, ignore everything
        if (isProcessingRef.current) return;

        const spoken = transcript.toLocaleLowerCase('tr-TR').trim();
        const target = currentWordObj.word.toLocaleLowerCase('tr-TR').trim();
        const skipKeywords = ['pas', 'başka', 'değiştir', 'geç', 'hayır'];

        // 1. Check Skip
        if (skipKeywords.some(keyword => spoken.includes(keyword))) {
            handleSkip();
            return;
        }

        // 2. Check Match (Fuzzy: includes allows simple phrasing like "bu elma")
        if (spoken.includes(target)) {
            handleSuccess();
        }
    }, [transcript, currentWordObj, handleSuccess, handleSkip, gameStatus, dayBudget?.isDayComplete]);


    // Render
    if (!isClient || !loaded || !content || gameWords.length === 0) return null;
    if (!browserSupportsSpeechRecognition) return <div className="p-10 text-center">Chrome kullanın.</div>;
    if (gameStatus === 'error') return <ErrorScreen onRetry={handleStartGame} />;
    if (gameStatus === 'idle' || gameStatus === 'checking') return <WelcomeScreen onStart={handleStartGame} status={gameStatus} />;

    return (
        <div className="min-h-screen bg-[#FFFDF0] flex flex-col items-center relative overflow-hidden">

            {/* HUD */}
            <div className="w-full flex justify-between items-center p-4 pt-6 z-20 absolute top-0">
                <Link href="/" className="bg-white/80 backdrop-blur p-3 rounded-full shadow-sm hover:shadow-md transition">
                    <Home className="text-gray-600" size={24} />
                </Link>
                {/* Faz 1.10: puan/skor göstergesi kaldırıldı — Yönetişim'deki
                    anti-bağımlılık ilkesi (puan/sıralama yok) bu oyun için de geçerli.
                    progress.success dahili olarak izlenmeye devam ediyor (ör. gelecekte
                    ebeveyn raporu için) ama çocuğa "skor" olarak gösterilmiyor. */}
                <div className={clsx("hidden md:flex px-4 py-2 rounded-full font-bold text-sm items-center gap-2", listening ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    <div className={clsx("w-2.5 h-2.5 rounded-full", listening ? "bg-green-600 animate-pulse" : "bg-red-500")} />
                    {listening ? "Dinliyor" : "Bekliyor"}
                </div>
            </div>

            {/* CARD AREA */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mt-4 mb-40">
                <AnimatePresence mode="wait">
                    {!skipTriggered ? (
                        <motion.div
                            key={currentWordObj.word}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, x: 200, rotate: 20 }} // Fly away right
                            transition={{ duration: 0.5 }}
                            className="relative z-10"
                        >
                            <div className="absolute inset-0 bg-green-400 rounded-[3rem] z-0 transition-transform duration-75"
                                style={{ transform: `scale(${1 + (volume / 255) * 0.4})`, opacity: volume > 5 ? 0.3 : 0 }}
                            ></div>
                            <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center p-4 md:p-6 relative border-4 border-white z-10">
                                <img src={currentWordObj.img} alt={currentWordObj.word} className="w-full h-full object-contain" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="skip-message"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <div className="text-6xl mb-4">😢</div>
                            <span className="text-2xl font-bold text-gray-500">Pas Geçildi</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.h2 className="mt-6 md:mt-10 text-3xl md:text-5xl font-black text-slate-800 tracking-wide text-center uppercase">
                    {skipTriggered ? "" : currentWordObj.word}
                </motion.h2>
            </div>

            {/* FOOTER */}
            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t-2 border-indigo-50 rounded-t-[2.5rem] p-6 pb-8 z-30 flex flex-col items-center min-h-[160px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                {transcript ? (
                    <span className="text-3xl font-extrabold text-indigo-600 break-words leading-tight">&quot;{transcript}&quot;</span>
                ) : (
                    !listening ? (
                        <button onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' })} className="mt-4 px-6 py-3 bg-red-100 text-red-600 rounded-full font-bold animate-bounce flex gap-2">
                            <RefreshCw size={18} /> Bağlan
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 opacity-40">
                            <Mic className="animate-pulse" />
                            Ses bekleniyor...
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

// Sub-components for cleaner file
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
            <MicOff size={48} className="text-orange-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">İzin Gerekli</h1>
            <button onClick={onRetry} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Tekrar Dene</button>
        </div>
    );
}

function WelcomeScreen({ onStart, status }: { onStart: () => void, status: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex flex-col items-center justify-center p-4 text-white">
            <div className="bg-white p-6 rounded-full shadow-2xl mb-8 relative animate-float">
                <Mic size={64} className="text-indigo-600" />
                {status === 'checking' && <div className="absolute inset-0 border-4 border-indigo-300 rounded-full animate-spin border-t-transparent"></div>}
            </div>
            <h1 className="text-4xl font-hand font-bold mb-4">Sihirli Kelimeler</h1>
            <p className="text-center opacity-90 mb-8 max-w-xs">Sınırsız eğlenceye hazır mısın?</p>
            <button onClick={onStart} disabled={status === 'checking'} className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70">
                {status === 'checking' ? "Başlatılıyor..." : "Oyuna Başla"}
            </button>
        </div>
    );
}
