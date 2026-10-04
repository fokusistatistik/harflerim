'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHud } from '@/components/game/GameHud';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { recordArcadeSkill } from '@/actions/arcade';
import { useAudio } from '@/components/AudioProvider';
import { Waves, Sparkles } from 'lucide-react';

interface LilyPad {
    id: number;
    x: number; // percentage (0 - 100)
    width: number; // percentage
    speed: number;
    direction: 1 | -1;
}

export function FrogJumpGame() {
    const budget = useArcadeDayBudget('arcade-frog-jump');
    const reward = useRewardMoment();
    const calmingMonitor = useCalmingModeMonitor('ritim-zamanlama');
    const { speak } = useAudio();

    // Kurbağa durumu: 'bank' (kıyıda) | 'jumping' (havada) | 'landed' (yaprakta) | 'missed' (kıyıya tutundu)
    const [frogState, setFrogState] = useState<'bank' | 'jumping' | 'landed' | 'missed'>('bank');
    const [jumpProgress, setJumpProgress] = useState(0); // 0 to 1
    const [scoreCount, setScoreCount] = useState(0);
    const [encouragement, setEncouragement] = useState<string | null>(null);

    // Nilüfer yaprağı konumu
    const [pad, setPad] = useState<LilyPad>({
        id: 1,
        x: 40,
        width: 24,
        speed: 0.22,
        direction: 1,
    });

    const isDayComplete = budget?.isArcadeDayComplete ?? false;
    const padRef = useRef(pad);
    padRef.current = pad;

    // Nilüfer yaprağının nehirde sakin salınım hareketi
    useEffect(() => {
        let animId: number;

        const movePad = () => {
            setPad((prev) => {
                let nx = prev.x + prev.speed * prev.direction;
                let ndir = prev.direction;

                if (nx > 72) {
                    ndir = -1;
                    nx = 72;
                } else if (nx < 8) {
                    ndir = 1;
                    nx = 8;
                }

                return {
                    ...prev,
                    x: nx,
                    direction: ndir,
                };
            });

            animId = requestAnimationFrame(movePad);
        };

        animId = requestAnimationFrame(movePad);
        return () => cancelAnimationFrame(animId);
    }, []);

    // Zıplama eylemi
    const handleJump = () => {
        if (frogState !== 'bank' && frogState !== 'landed' && frogState !== 'missed') return;

        setFrogState('jumping');
        setJumpProgress(0);

        // Zıplama sesi
        try {
            const audio = new Audio('/sounds/card.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
        } catch {
            // sessiz geç
        }

        // Zıplama animasyonu (yaklaşık 700ms sürer)
        const startTime = Date.now();
        const duration = 650;

        const jumpInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            setJumpProgress(progress);

            if (progress >= 1) {
                clearInterval(jumpInterval);
                checkLanding();
            }
        }, 16);
    };

    // İniş kontrolü
    const checkLanding = () => {
        const currentPad = padRef.current;
        const frogTargetX = 50; // Kurbağanın zıpladığı orta hat

        const padLeft = currentPad.x;
        const padRight = currentPad.x + currentPad.width;

        // Kurbağa yaprağın sınırları içinde mi?
        const isHit = frogTargetX >= padLeft - 4 && frogTargetX <= padRight + 4;

        if (isHit) {
            // Başarılı konma!
            setFrogState('landed');
            const newScore = scoreCount + 1;
            setScoreCount(newScore);
            calmingMonitor(true);

            recordArcadeSkill('ritim-zamanlama', 'arcade-frog-jump', true).catch(() => {});

            // Su damlası sesi
            try {
                const audio = new Audio('/sounds/pop.wav');
                audio.volume = 0.6;
                audio.play().catch(() => {});
            } catch {
                // sessiz geç
            }

            // Her 3 başarılı zıplamada konfeti kutlaması
            if (newScore % 3 === 0) {
                reward({ message: 'Harika bir zıplayış!' });
            }

            // 1.2 sn sonra kurbağayı tekrar başlangıç kıyısına yumuşakça döndür
            setTimeout(() => {
                setFrogState('bank');
            }, 1200);
        } else {
            // Iska: Suya batmaz, kıyı kütüğüne tutunur!
            setFrogState('missed');
            calmingMonitor(false);
            setEncouragement('Hop! Bir daha deneyelim 🌿');
            speak('Hop! Bir daha deneyelim!').catch(() => {});

            recordArcadeSkill('ritim-zamanlama', 'arcade-frog-jump', false).catch(() => {});

            // 1.5 sn sonra tekrar hazır
            setTimeout(() => {
                setFrogState('bank');
                setEncouragement(null);
            }, 1500);
        }
    };

    if (isDayComplete) {
        return <ArcadeDayComplete />;
    }

    const remainingMinutes = budget
        ? Math.ceil(budget.remainingArcadeSeconds / 60)
        : 30;

    // Kurbağa Y konumu (parabolik yay: zıplarken yukarı fırlar)
    const frogY =
        frogState === 'jumping'
            ? Math.sin(jumpProgress * Math.PI) * -180
            : frogState === 'landed'
            ? -120
            : 0;

    return (
        <main className="min-h-app flex flex-col p-3 md:p-6 max-w-5xl mx-auto w-full select-none overflow-hidden">
            {/* Üst HUD */}
            <header className="w-full mb-3 flex items-center justify-between gap-3">
                <GameHud
                    center={
                        <div className="flex items-center gap-2 bg-papatya-surface/90 backdrop-blur px-4 py-1.5 rounded-full border border-papatya-ink/10 shadow-sm text-sm font-semibold text-papatya-ink">
                            <Waves size={18} className="text-papatya-leaf" />
                            <span>Kalan Süre: {remainingMinutes} dk</span>
                        </div>
                    }
                    right={
                        <div className="bg-papatya-surface/90 backdrop-blur px-3 py-1.5 rounded-full border border-papatya-ink/10 shadow-sm text-sm font-bold text-papatya-ink flex items-center gap-1.5">
                            <Sparkles size={16} className="text-papatya-petal" />
                            <span>Zıplama: {scoreCount}</span>
                        </div>
                    }
                />
            </header>

            {/* Nehir ve Oyun Sahnesi */}
            <div
                onClick={handleJump}
                className="relative flex-1 w-full rounded-3xl overflow-hidden shadow-inner border-4 border-papatya-leaf/40 cursor-pointer touch-none flex flex-col justify-between"
                style={{
                    background: 'linear-gradient(180deg, #a8edea 0%, #fed6e3 100%)',
                    minHeight: '480px',
                }}
            >
                {/* Nehir Akıntısı Katmanı */}
                <div className="absolute inset-0 bg-sky-400/20 pointer-events-none" />

                {/* Karşı Kıyı / Çiçekler */}
                <div className="w-full h-16 bg-emerald-600/20 border-b-2 border-emerald-600/30 flex items-center justify-around px-6 z-10">
                    <span className="text-2xl">🌸</span>
                    <span className="text-2xl">🌼</span>
                    <span className="text-2xl">🪷</span>
                    <span className="text-2xl">🌸</span>
                    <span className="text-2xl">🌼</span>
                </div>

                {/* Orta Nehir Alanı: Süzülen Nilüfer Yaprağı */}
                <div className="relative w-full h-36 flex items-center">
                    <motion.div
                        className="absolute flex flex-col items-center justify-center pointer-events-none"
                        style={{
                            left: `${pad.x}%`,
                            width: `${pad.width}%`,
                        }}
                        animate={{
                            scale: frogState === 'landed' ? [1, 1.15, 1] : 1,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="relative w-28 h-20 bg-emerald-500 rounded-[50%] border-4 border-emerald-400 shadow-md flex items-center justify-center">
                            {/* Nilüfer Çiçeği */}
                            <span className="text-2xl">🪷</span>
                            {/* Yaprak damarları detayı */}
                            <div className="absolute inset-2 border-t border-emerald-300/40 rounded-full" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-900 bg-white/70 px-2 rounded-full mt-1">
                            Nilüfer
                        </span>
                    </motion.div>
                </div>

                {/* Alt Kıyı: Kurbağanın Başlangıç ve Zıplama Alanı */}
                <div className="relative w-full h-36 bg-amber-700/20 border-t-2 border-amber-800/30 flex flex-col items-center justify-center">
                    {/* Sığ Kıyı Kütüğü / Can Simidi */}
                    <div className="w-32 h-10 bg-amber-800/40 rounded-full border-2 border-amber-800/60 flex items-center justify-center shadow-inner mb-2">
                        <span className="text-xs font-bold text-amber-950">Başlangıç Kıyısı</span>
                    </div>

                    {/* Sevimli Kurbağa Karakteri */}
                    <motion.div
                        style={{
                            transform: `translateY(${frogY}px)`,
                        }}
                        animate={
                            frogState === 'bank'
                                ? { y: [0, -6, 0] }
                                : frogState === 'missed'
                                ? { rotate: [-8, 8, 0] }
                                : {}
                        }
                        transition={{ repeat: frogState === 'bank' ? Infinity : 0, duration: 2 }}
                        className="absolute bottom-8 w-24 h-24 rounded-2xl bg-white/95 p-1.5 shadow-xl border-3 border-emerald-500 flex flex-col items-center justify-center pointer-events-none z-30"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/karsilastirma/kurbaga.jpg"
                            alt="Neşeli Kurbağa"
                            className="w-full h-full object-contain rounded-xl"
                        />
                    </motion.div>
                </div>

                {/* Teşvik ve No-Failure Mesajı */}
                <AnimatePresence>
                    {encouragement && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-20 left-1/2 -translate-x-1/2 bg-papatya-surface/95 border-2 border-papatya-petal shadow-lg px-6 py-2.5 rounded-full text-base font-bold text-papatya-ink text-center z-40"
                        >
                            {encouragement}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Alt Dokunma Yönlendirmesi */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-papatya-surface/90 backdrop-blur px-5 py-2 rounded-full shadow-md text-xs md:text-sm font-bold text-papatya-ink text-center">
                    🐸 Nilüfer yaprağı hizalanınca ekrana dokun ve kurbağayı zıplat!
                </div>
            </div>
        </main>
    );
}
