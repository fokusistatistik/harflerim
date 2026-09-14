'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { AUDIOS } from '@/store/gameData';
import useSound from 'use-sound';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/components/AudioProvider';
import { useGameContent } from '@/hooks/useGameContent';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { recordSkillAttempt } from '@/actions/skills';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { GameHud } from './GameHud';

// Faz 1.22 — burada daha önce bir useMagicWordsProgress/localStorage
// mekanizması vardı (günlük oynanan/başarı sayısı). Kaldırıldı: SkillAttempt
// (Faz 1.20, skillKey='sesli-kelime-tanima') her denemeyi zaten veritabanında
// kalıcı tutuyor ve hiçbir UI bu sayıyı göstermiyordu (1.10'da SKOR kaldırılmıştı).

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

    const checkCalmingMode = useCalmingModeMonitor('sesli-kelime-tanima'); // Faz 3.2b

    // Data
    const [gameWords, setGameWords] = useState<{ word: string; img: string }[]>([]);

    // Sound
    const { data: content } = useGameContent();
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const [playCorrect] = useSound(AUDIOS.correct, { volume: 0.5 });
    const [playSad] = useSound(AUDIOS.sad, { volume: 0.5 });
    const { encourageRetry } = useAudio();
    const triggerReward = useRewardMoment();

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

        triggerReward({ playSound: playCorrect, confettiOptions: { particleCount: 200, spread: 120 } });
        recordSkillAttempt('sesli-kelime-tanima', 'magic-words', true).catch(() => {});
        checkCalmingMode(true);

        moveToNextCard();
    }, [playCorrect, triggerReward, moveToNextCard, checkCalmingMode]);


    const handleSkip = useCallback(() => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true; // LOCK

        setSkipTriggered(true);
        playSad();
        encourageRetry().catch(() => {});
        recordSkillAttempt('sesli-kelime-tanima', 'magic-words', false).catch(() => {});
        checkCalmingMode(false);

        moveToNextCard();
    }, [playSad, encourageRetry, moveToNextCard, checkCalmingMode]);


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
    if (!isClient || !content || gameWords.length === 0) return null;
    if (!browserSupportsSpeechRecognition) return <div className="p-10 text-center">Chrome kullanın.</div>;
    if (gameStatus === 'error') return <ErrorScreen onRetry={handleStartGame} />;
    if (gameStatus === 'idle' || gameStatus === 'checking') return <WelcomeScreen onStart={handleStartGame} status={gameStatus} />;

    return (
        <div className="min-h-screen bg-papatya-cream flex flex-col items-center relative overflow-hidden">

            {/* HUD — Faz 1.8: paylaşılan GameHud */}
            <div className="w-full p-4 pt-6 lg:p-8 z-20 absolute top-0">
                <GameHud
                    right={
                        <div className={clsx("hidden md:flex px-4 py-2 lg:px-5 lg:py-3 rounded-full font-bold text-sm lg:text-base items-center gap-2", listening ? "bg-papatya-leaf/15 text-papatya-leaf" : "bg-papatya-rose/15 text-papatya-rose")}>
                            <div className={clsx("w-2.5 h-2.5 rounded-full", listening ? "bg-papatya-leaf animate-pulse" : "bg-papatya-rose")} />
                            {listening ? "Dinliyor" : "Bekliyor"}
                        </div>
                    }
                />
            </div>
            {/* Faz 1.10: puan/skor göstergesi kaldırıldı — Yönetişim'deki
                anti-bağımlılık ilkesi (puan/sıralama yok) bu oyun için de geçerli.
                Faz 1.20/1.22: her deneme artık SkillAttempt'te (DB) kalıcı
                tutuluyor (ör. gelecekte ebeveyn raporu için) — çocuğa
                gösterilmiyor, yerel bir sayaç da tutulmuyor. */}

            {/* CARD AREA */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md lg:max-w-lg mt-4 mb-40">
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
                            <div className="absolute inset-0 bg-papatya-leaf rounded-[3rem] z-0 transition-transform duration-75"
                                style={{ transform: `scale(${1 + (volume / 255) * 0.4})`, opacity: volume > 5 ? 0.3 : 0 }}
                            ></div>
                            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-papatya-surface rounded-[2rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center p-4 md:p-6 lg:p-8 relative border-4 border-papatya-surface z-10">
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
                            <span className="text-2xl font-bold text-papatya-ink-soft">Pas Geçildi</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.h2 className="mt-6 md:mt-10 text-3xl md:text-5xl lg:text-6xl font-black text-papatya-ink tracking-wide text-center uppercase">
                    {skipTriggered ? "" : currentWordObj.word}
                </motion.h2>
            </div>

            {/* FOOTER */}
            <div className="fixed bottom-0 left-0 w-full bg-papatya-surface/95 backdrop-blur-xl border-t-2 border-papatya-rule rounded-t-[2.5rem] p-6 pb-8 lg:p-8 z-30 flex flex-col items-center min-h-[160px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                {transcript ? (
                    <span className="text-3xl lg:text-4xl font-extrabold text-papatya-sky break-words leading-tight">&quot;{transcript}&quot;</span>
                ) : (
                    !listening ? (
                        <button onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' })} className="mt-4 min-h-tap px-6 py-3 bg-papatya-rose/15 text-papatya-rose rounded-full font-bold animate-bounce flex gap-2 items-center">
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
        <div className="min-h-screen bg-papatya-rose/10 flex flex-col items-center justify-center p-6 text-center">
            <MicOff size={48} className="text-papatya-rose mb-4" />
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-papatya-ink">İzin Gerekli</h1>
            <button onClick={onRetry} className="min-h-tap bg-papatya-sky text-white px-8 py-3 rounded-full font-bold">Tekrar Dene</button>
        </div>
    );
}

function WelcomeScreen({ onStart, status }: { onStart: () => void, status: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-papatya-sky to-papatya-leaf flex flex-col items-center justify-center p-4 text-white">
            <div className="bg-papatya-surface p-6 lg:p-8 rounded-full shadow-2xl mb-8 relative animate-float">
                <Mic size={64} className="text-papatya-sky" />
                {status === 'checking' && <div className="absolute inset-0 border-4 border-papatya-sky/40 rounded-full animate-spin border-t-transparent"></div>}
            </div>
            <h1 className="text-4xl lg:text-5xl font-hand font-bold mb-4">Sihirli Kelimeler</h1>
            <p className="text-center opacity-90 mb-6 max-w-xs">Sınırsız eğlenceye hazır mısın?</p>
            <div className="mb-8">
                <GameIntroCard gameId="magic-words" />
            </div>
            <button onClick={onStart} disabled={status === 'checking'} className="min-h-tap bg-papatya-surface text-papatya-sky px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-70">
                {status === 'checking' ? "Başlatılıyor..." : "Oyuna Başla"}
            </button>
        </div>
    );
}
