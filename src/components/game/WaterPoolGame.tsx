'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHud } from '@/components/game/GameHud';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { recordArcadeSkill } from '@/actions/arcade';
import { useAudio } from '@/components/AudioProvider';
import { Waves, Sparkles, Target, Compass } from 'lucide-react';

interface FloatingToy {
    id: string;
    name: string;
    imageSrc: string;
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
    vx: number;
    vy: number;
    rotation: number;
    size: number; // px
}

interface Ripple {
    id: number;
    x: number; // px
    y: number; // px
}

const INITIAL_TOYS: FloatingToy[] = [
    {
        id: 'duck',
        name: 'Sarı Ördek',
        imageSrc: '/karsilastirma/ordek.jpg',
        x: 25,
        y: 35,
        vx: 0.08,
        vy: 0.04,
        rotation: 0,
        size: 80,
    },
    {
        id: 'dolphin',
        name: 'Yunus',
        imageSrc: '/karsilastirma/yunus.jpg',
        x: 65,
        y: 40,
        vx: -0.06,
        vy: 0.07,
        rotation: 0,
        size: 85,
    },
    {
        id: 'boat',
        name: 'Küçük Gemi',
        imageSrc: '/karsilastirma/gemi.jpg',
        x: 40,
        y: 65,
        vx: 0.07,
        vy: -0.05,
        rotation: 0,
        size: 80,
    },
    {
        id: 'ball',
        name: 'Deniz Topu',
        imageSrc: '/karsilastirma/top.jpg',
        x: 75,
        y: 70,
        vx: -0.08,
        vy: -0.06,
        rotation: 0,
        size: 70,
    },
];

export function WaterPoolGame() {
    const budget = useArcadeDayBudget('arcade-water-pool');
    const reward = useRewardMoment();
    const { speak } = useAudio();

    // Mod: 'free' (serbest su oyunu) | 'target' (hedefe ulaştırma)
    const [mode, setMode] = useState<'free' | 'target'>('free');
    const [toys, setToys] = useState<FloatingToy[]>(INITIAL_TOYS);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [targetToyId, setTargetToyId] = useState<string>('duck');
    const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 50, y: 20 });
    const poolRef = useRef<HTMLDivElement>(null);
    const rippleIdCounter = useRef(0);

    const isDayComplete = budget?.isArcadeDayComplete ?? false;

    // Hedef modu için yeni bir hedef belirle
    const setupNewTarget = useCallback(() => {
        const randomToy = INITIAL_TOYS[Math.floor(Math.random() * INITIAL_TOYS.length)];
        setTargetToyId(randomToy.id);
        setTargetPos({
            x: 20 + Math.random() * 60,
            y: 15 + Math.random() * 40,
        });
        speak(`${randomToy.name}'i nilüfere doğru yüzdür!`).catch(() => {});
    }, [speak]);

    // Mod değiştiğinde hedef moduna geçilirse hedef hazırla
    useEffect(() => {
        if (mode === 'target') {
            setupNewTarget();
        } else {
            speak('Hadi suyla oynayalım!').catch(() => {});
        }
    }, [mode, setupNewTarget, speak]);

    // Yüzen oyuncakların yumuşak su salınımı animasyonu
    useEffect(() => {
        let animId: number;

        const updatePhysics = () => {
            setToys((prevToys) =>
                prevToys.map((toy) => {
                    let nx = toy.x + toy.vx;
                    let ny = toy.y + toy.vy;
                    let nvx = toy.vx;
                    let nvy = toy.vy;

                    // Havuz sınırlarından yumuşak sekme
                    if (nx < 8 || nx > 88) {
                        nvx = -nvx;
                        nx = Math.max(8, Math.min(88, nx));
                    }
                    if (ny < 12 || ny > 82) {
                        nvy = -nvy;
                        ny = Math.max(12, Math.min(82, ny));
                    }

                    // Su dalgalanmasıyla minik dönüş açısı
                    const rotation = Math.sin(Date.now() / 800 + toy.size) * 8;

                    return {
                        ...toy,
                        x: nx,
                        y: ny,
                        vx: nvx,
                        vy: nvy,
                        rotation,
                    };
                })
            );

            animId = requestAnimationFrame(updatePhysics);
        };

        animId = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(animId);
    }, []);

    // Hedef modu kontrolü: Hedef oyuncak nilüfere ulaştı mı?
    useEffect(() => {
        if (mode !== 'target') return;

        const currentTargetToy = toys.find((t) => t.id === targetToyId);
        if (!currentTargetToy) return;

        // Mesafe hesapla (%)
        const dx = currentTargetToy.x - targetPos.x;
        const dy = currentTargetToy.y - targetPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 12) {
            // Hedefe ulaşıldı!
            reward({ message: 'Harika yüzdürdün!' });
            recordArcadeSkill('duyusal-su-etkilesimi', 'arcade-water-pool', true).catch(() => {});

            // 1.5 sn sonra yeni hedef
            const timeout = setTimeout(() => {
                setupNewTarget();
            }, 1800);
            return () => clearTimeout(timeout);
        }
    }, [toys, targetToyId, targetPos, mode, reward, setupNewTarget]);

    // Suya dokunma / tıklama işleyicisi (Ripple efekti ve itme kuvveti)
    const handlePoolInteract = (clientX: number, clientY: number) => {
        if (!poolRef.current) return;
        const rect = poolRef.current.getBoundingClientRect();
        const px = clientX - rect.left;
        const py = clientY - rect.top;

        // Ripple ekle
        const newRipple: Ripple = {
            id: ++rippleIdCounter.current,
            x: px,
            y: py,
        };
        setRipples((prev) => [...prev.slice(-6), newRipple]);

        // Su damlası sesi çal
        try {
            const audio = new Audio('/sounds/pop.wav');
            audio.volume = 0.45;
            audio.play().catch(() => {});
        } catch {
            // Sessizce geç
        }

        // Tıklanan noktanın yüzde konumu
        const touchPercentX = (px / rect.width) * 100;
        const touchPercentY = (py / rect.height) * 100;

        // Oyuncaklara itme dalgası uygula
        setToys((prevToys) =>
            prevToys.map((toy) => {
                const dx = toy.x - touchPercentX;
                const dy = toy.y - touchPercentY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Yakındaki oyuncakları dalgayla it
                if (dist < 28 && dist > 0.1) {
                    const force = (28 - dist) * 0.015;
                    return {
                        ...toy,
                        vx: toy.vx + (dx / dist) * force,
                        vy: toy.vy + (dy / dist) * force,
                    };
                }
                return toy;
            })
        );
    };

    if (isDayComplete) {
        return <ArcadeDayComplete />;
    }

    const remainingMinutes = budget
        ? Math.ceil(budget.remainingArcadeSeconds / 60)
        : 30;

    return (
        <main className="min-h-app flex flex-col p-3 md:p-6 max-w-5xl mx-auto w-full select-none overflow-hidden">
            {/* Üst HUD */}
            <header className="w-full mb-3 flex items-center justify-between gap-3">
                <GameHud
                    onBack={undefined}
                    center={
                        <div className="flex items-center gap-2 bg-papatya-surface/90 backdrop-blur px-4 py-1.5 rounded-full border border-papatya-ink/10 shadow-sm text-sm font-semibold text-papatya-ink">
                            <Waves size={18} className="text-papatya-sky" />
                            <span>Kalan Süre: {remainingMinutes} dk</span>
                        </div>
                    }
                    right={
                        <div className="flex items-center bg-papatya-surface/90 backdrop-blur p-1 rounded-full border border-papatya-ink/10 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setMode('free')}
                                className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                                    mode === 'free'
                                        ? 'bg-papatya-sky text-white shadow-sm'
                                        : 'text-papatya-ink/70 hover:text-papatya-ink'
                                }`}
                            >
                                <Compass size={14} />
                                <span>Serbest Su</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('target')}
                                className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                                    mode === 'target'
                                        ? 'bg-papatya-petal text-papatya-ink shadow-sm'
                                        : 'text-papatya-ink/70 hover:text-papatya-ink'
                                }`}
                            >
                                <Target size={14} />
                                <span>Hedefli Oyun</span>
                            </button>
                        </div>
                    }
                />
            </header>

            {/* Havuz Alanı */}
            <div
                ref={poolRef}
                onClick={(e) => handlePoolInteract(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    if (touch) handlePoolInteract(touch.clientX, touch.clientY);
                }}
                className="relative flex-1 w-full rounded-3xl overflow-hidden shadow-inner border-4 border-papatya-sky/40 cursor-pointer touch-none"
                style={{
                    background: 'radial-gradient(ellipse at center, #8ec5fc 0%, #4facfe 100%)',
                    minHeight: '480px',
                }}
            >
                {/* Havuz Su Işıltısı Katmanı */}
                <div className="absolute inset-0 bg-white/10 pointer-events-none mix-blend-overlay" />

                {/* Yayılan Su Dalgaları (Ripples) */}
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 3.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            onAnimationComplete={() => {
                                setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
                            }}
                            className="absolute pointer-events-none rounded-full border-2 border-white/80"
                            style={{
                                left: ripple.x - 25,
                                top: ripple.y - 25,
                                width: 50,
                                height: 50,
                            }}
                        />
                    ))}
                </AnimatePresence>

                {/* Hedef Modunda: Nilüfer Çiçeği Hedefi */}
                {mode === 'target' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute flex flex-col items-center pointer-events-none"
                        style={{
                            left: `${targetPos.x}%`,
                            top: `${targetPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <div className="relative w-20 h-20 rounded-full border-4 border-dashed border-white/90 bg-emerald-400/30 flex items-center justify-center animate-pulse">
                            <span className="text-3xl">🪷</span>
                        </div>
                        <span className="mt-1 text-xs font-bold text-white bg-papatya-ink/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            Hedef Burası
                        </span>
                    </motion.div>
                )}

                {/* Havuzda Yüzen Oyuncaklar */}
                {toys.map((toy) => {
                    const isTarget = mode === 'target' && toy.id === targetToyId;

                    return (
                        <motion.div
                            key={toy.id}
                            className="absolute flex flex-col items-center pointer-events-none"
                            style={{
                                left: `${toy.x}%`,
                                top: `${toy.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: isTarget ? 30 : 20,
                            }}
                        >
                            {/* Hedef Belirteci */}
                            {isTarget && (
                                <motion.div
                                    animate={{ y: [-4, 4, -4] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="mb-1 flex items-center gap-1 bg-papatya-petal text-papatya-ink text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md"
                                >
                                    <Sparkles size={12} />
                                    <span>Yüzdür!</span>
                                </motion.div>
                            )}

                            {/* Oyuncak Kartı */}
                            <motion.div
                                animate={{ rotate: toy.rotation }}
                                transition={{ type: 'spring', damping: 10 }}
                                className={`relative rounded-2xl overflow-hidden bg-white/90 p-2 shadow-lg border-2 ${
                                    isTarget ? 'border-papatya-petal ring-4 ring-papatya-petal/40 scale-110' : 'border-white/80'
                                }`}
                                style={{ width: toy.size, height: toy.size }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={toy.imageSrc}
                                    alt={toy.name}
                                    className="w-full h-full object-contain pointer-events-none rounded-xl"
                                />
                            </motion.div>

                            <span className="mt-1 text-[11px] font-bold text-white/90 drop-shadow-md">
                                {toy.name}
                            </span>
                        </motion.div>
                    );
                })}

                {/* Alt Rehber İpucu */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-papatya-surface/85 backdrop-blur px-4 py-1.5 rounded-full shadow-sm text-xs md:text-sm font-semibold text-papatya-ink/80 text-center">
                    {mode === 'free'
                        ? '💦 Suya dokun, dalgalar oluştur ve oyuncakları yüzdür!'
                        : '🎯 Su dalgalarıyla oyuncağı nilüfer çiçeğine doğru it!'}
                </div>
            </div>
        </main>
    );
}
