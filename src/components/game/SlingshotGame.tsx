'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHud } from '@/components/game/GameHud';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { recordArcadeSkill } from '@/actions/arcade';
import { useAudio } from '@/components/AudioProvider';
import { Sparkles, Compass } from 'lucide-react';

interface SlingshotBall {
    x: number; // px from origin
    y: number;
    vx: number;
    vy: number;
    flying: boolean;
}

export function SlingshotGame() {
    const budget = useArcadeDayBudget('arcade-slingshot');
    const reward = useRewardMoment();
    const calmingMonitor = useCalmingModeMonitor('motor-hedefleme');
    const { speak } = useAudio();

    // Sapan başlangıç merkezi (px)
    const slingOrigin = { x: 120, y: 300 };

    // Sürükleme durumu
    const [isDragging, setIsDragging] = useState(false);
    const [dragPos, setDragPos] = useState({ x: slingOrigin.x, y: slingOrigin.y });
    const [ball, setBall] = useState<SlingshotBall>({
        x: slingOrigin.x,
        y: slingOrigin.y,
        vx: 0,
        vy: 0,
        flying: false,
    });

    // Hedef sepet konumu (%)
    const [targetY, setTargetY] = useState(45); // percentage
    const [scoreCount, setScoreCount] = useState(0);
    const [feedback, setFeedback] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const isDayComplete = budget?.isArcadeDayComplete ?? false;

    // Dokunma başlatma
    const handleStartDrag = (clientX: number, clientY: number) => {
        if (ball.flying) return;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const px = clientX - rect.left;
        const py = clientY - rect.top;

        // Sapan yakınından tutulduysa
        const dist = Math.sqrt((px - slingOrigin.x) ** 2 + (py - slingOrigin.y) ** 2);
        if (dist < 80) {
            setIsDragging(true);
            updateDragPosition(px, py);
        }
    };

    // Sürükleme esneme hareketi
    const updateDragPosition = (px: number, py: number) => {
        const dx = px - slingOrigin.x;
        const dy = py - slingOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxPull = 90; // Maksimum gerilme mesafesi

        if (dist > maxPull) {
            const angle = Math.atan2(dy, dx);
            setDragPos({
                x: slingOrigin.x + Math.cos(angle) * maxPull,
                y: slingOrigin.y + Math.sin(angle) * maxPull,
            });
        } else {
            setDragPos({ x: px, y: py });
        }
    };

    const handleMoveDrag = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        updateDragPosition(clientX - rect.left, clientY - rect.top);
    };

    // Bırakınca fırlatma
    const handleRelease = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // Fırlatma hızı: Çekilen yönün tersine
        const pullX = slingOrigin.x - dragPos.x;
        const pullY = slingOrigin.y - dragPos.y;

        if (Math.abs(pullX) < 15 && Math.abs(pullY) < 15) {
            // Yeterince çekilmediyse geri yaylan
            setDragPos({ x: slingOrigin.x, y: slingOrigin.y });
            return;
        }

        // Fırlatma sesi
        try {
            const audio = new Audio('/sounds/card.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
        } catch {
            // sessiz geç
        }

        const speedMultiplier = 0.28;
        const initVx = pullX * speedMultiplier;
        const initVy = pullY * speedMultiplier;

        setBall({
            x: dragPos.x,
            y: dragPos.y,
            vx: initVx,
            vy: initVy,
            flying: true,
        });

        // Uçuş fiziği döngüsü
        let curX = dragPos.x;
        let curY = dragPos.y;
        let curVx = initVx;
        let curVy = initVy;
        const gravity = 0.42;

        const flightInterval = setInterval(() => {
            curX += curVx;
            curY += curVy;
            curVy += gravity; // Yerçekimi

            setBall({
                x: curX,
                y: curY,
                vx: curVx,
                vy: curVy,
                flying: true,
            });

            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            // Hedef sepet konumu (sağ tarafta)
            const targetPixelX = containerWidth * 0.82;
            const targetPixelY = containerHeight * (targetY / 100);

            // Çarpışma kontrolü
            const distToTarget = Math.sqrt((curX - targetPixelX) ** 2 + (curY - targetPixelY) ** 2);

            if (distToTarget < 50) {
                // HEDEF VURULDU!
                clearInterval(flightInterval);
                handleHit();
                return;
            }

            // Ekran sınırından çıkma veya yere düşme
            if (curX > containerWidth + 40 || curY > containerHeight - 20) {
                clearInterval(flightInterval);
                handleMiss();
            }
        }, 20);
    };

    const handleHit = () => {
        setScoreCount((s) => s + 1);
        calmingMonitor(true);
        reward({ message: 'Sepeti Buldun! Harika!' });
        recordArcadeSkill('motor-hedefleme', 'arcade-slingshot', true).catch(() => {});

        // Yeni sepet konumu
        setTimeout(() => {
            setTargetY(25 + Math.random() * 45);
            resetSling();
        }, 1200);
    };

    const handleMiss = () => {
        calmingMonitor(false);
        setFeedback('Çok yaklaştın! Bir daha dene 🎯');
        speak('Hedefe çok yaklaştın, bir daha fırlat!').catch(() => {});
        recordArcadeSkill('motor-hedefleme', 'arcade-slingshot', false).catch(() => {});

        setTimeout(() => {
            setFeedback(null);
            resetSling();
        }, 1400);
    };

    const resetSling = () => {
        setDragPos({ x: slingOrigin.x, y: slingOrigin.y });
        setBall({
            x: slingOrigin.x,
            y: slingOrigin.y,
            vx: 0,
            vy: 0,
            flying: false,
        });
    };

    if (isDayComplete) {
        return <ArcadeDayComplete />;
    }

    const remainingMinutes = budget
        ? Math.ceil(budget.remainingArcadeSeconds / 60)
        : 30;

    // Yörünge tahmin noktacıkları
    const trajectoryDots = [];
    if (isDragging) {
        const pullX = slingOrigin.x - dragPos.x;
        const pullY = slingOrigin.y - dragPos.y;
        const speedMultiplier = 0.28;
        let simX = slingOrigin.x;
        let simY = slingOrigin.y;
        let simVx = pullX * speedMultiplier;
        let simVy = pullY * speedMultiplier;

        for (let i = 0; i < 9; i++) {
            simX += simVx * 2.2;
            simY += simVy * 2.2;
            simVy += 0.42 * 2.2;
            trajectoryDots.push({ x: simX, y: simY });
        }
    }

    return (
        <main className="min-h-app flex flex-col p-3 md:p-6 max-w-5xl mx-auto w-full select-none overflow-hidden">
            {/* Üst HUD */}
            <header className="w-full mb-3 flex items-center justify-between gap-3">
                <GameHud
                    center={
                        <div className="flex items-center gap-2 bg-papatya-surface/90 backdrop-blur px-4 py-1.5 rounded-full border border-papatya-ink/10 shadow-sm text-sm font-semibold text-papatya-ink">
                            <Compass size={18} className="text-papatya-petal" />
                            <span>Kalan Süre: {remainingMinutes} dk</span>
                        </div>
                    }
                    right={
                        <div className="bg-papatya-surface/90 backdrop-blur px-3 py-1.5 rounded-full border border-papatya-ink/10 shadow-sm text-sm font-bold text-papatya-ink flex items-center gap-1.5">
                            <Sparkles size={16} className="text-papatya-petal" />
                            <span>İsabet: {scoreCount}</span>
                        </div>
                    }
                />
            </header>

            {/* Sapan Sahnesi */}
            <div
                ref={containerRef}
                onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
                onMouseUp={handleRelease}
                onTouchStart={(e) => {
                    const t = e.touches[0];
                    if (t) handleStartDrag(t.clientX, t.clientY);
                }}
                onTouchMove={(e) => {
                    const t = e.touches[0];
                    if (t) handleMoveDrag(t.clientX, t.clientY);
                }}
                onTouchEnd={handleRelease}
                className="relative flex-1 w-full rounded-3xl overflow-hidden shadow-inner border-4 border-papatya-petal/40 cursor-grab active:cursor-grabbing touch-none"
                style={{
                    background: 'linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%)',
                    minHeight: '480px',
                }}
            >
                {/* Gökyüzü ve Yumuşak Bulutlar */}
                <div className="absolute top-6 left-12 text-3xl opacity-60">☁️</div>
                <div className="absolute top-12 right-24 text-4xl opacity-50">☁️</div>

                {/* Hedef Sepet / Kutu (Sağ Tarafta) */}
                <motion.div
                    className="absolute flex flex-col items-center pointer-events-none"
                    style={{
                        right: '12%',
                        top: `${targetY}%`,
                        transform: 'translate(50%, -50%)',
                    }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                    <div className="w-24 h-24 rounded-3xl bg-amber-100/90 border-4 border-amber-600 shadow-xl flex items-center justify-center p-2">
                        {/* Sepet İkonu / Papatya */}
                        <span className="text-5xl">🧺</span>
                    </div>
                    <span className="mt-1 text-xs font-bold text-amber-950 bg-white/80 px-2.5 py-0.5 rounded-full shadow-sm">
                        Hedef Sepet
                    </span>
                </motion.div>

                {/* Sapan Çatısı (Sol Tarafta) */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        left: slingOrigin.x - 25,
                        top: slingOrigin.y - 30,
                    }}
                >
                    {/* Ahşap Sapan Vektörü */}
                    <svg width="60" height="140" viewBox="0 0 60 140">
                        {/* Sap */}
                        <path d="M 25 60 L 25 140 L 35 140 L 35 60 Z" fill="#8B4513" rx="4" />
                        {/* Sol Kol */}
                        <path d="M 28 65 L 10 10 L 20 10 L 32 60 Z" fill="#A0522D" rx="4" />
                        {/* Sağ Kol */}
                        <path d="M 32 60 L 50 10 L 40 10 L 28 65 Z" fill="#A0522D" rx="4" />
                    </svg>
                </div>

                {/* Sapan Lastikleri */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Sol Kol Lastiği */}
                    <line
                        x1={slingOrigin.x - 15}
                        y1={slingOrigin.y - 20}
                        x2={ball.flying ? slingOrigin.x : dragPos.x}
                        y2={ball.flying ? slingOrigin.y : dragPos.y}
                        stroke="#4A2E18"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                    {/* Sağ Kol Lastiği */}
                    <line
                        x1={slingOrigin.x + 15}
                        y1={slingOrigin.y - 20}
                        x2={ball.flying ? slingOrigin.x : dragPos.x}
                        y2={ball.flying ? slingOrigin.y : dragPos.y}
                        stroke="#4A2E18"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Yörünge Kılavuz Noktacıkları */}
                {trajectoryDots.map((dot, idx) => (
                    <div
                        key={idx}
                        className="absolute w-3 h-3 rounded-full bg-papatya-ink/30 border border-white/60 pointer-events-none"
                        style={{
                            left: dot.x - 6,
                            top: dot.y - 6,
                            opacity: 1 - idx * 0.1,
                        }}
                    />
                ))}

                {/* Sapan Topu / Papatya */}
                <div
                    className="absolute pointer-events-none flex items-center justify-center rounded-full shadow-lg border-2 border-white/80 bg-white/95 overflow-hidden"
                    style={{
                        left: (ball.flying ? ball.x : dragPos.x) - 28,
                        top: (ball.flying ? ball.y : dragPos.y) - 28,
                        width: 56,
                        height: 56,
                        zIndex: 35,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/karsilastirma/top.jpg"
                        alt="Papatya Topu"
                        className="w-full h-full object-contain p-1"
                    />
                </div>

                {/* Geri Bildirim Toast'ı */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-16 left-1/2 -translate-x-1/2 bg-papatya-surface/95 border-2 border-papatya-petal shadow-lg px-6 py-2.5 rounded-full text-base font-bold text-papatya-ink text-center z-40"
                        >
                            {feedback}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Alt Yönlendirme İpucu */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-papatya-surface/90 backdrop-blur px-5 py-2 rounded-full shadow-md text-xs md:text-sm font-bold text-papatya-ink text-center">
                    🏹 Topu geriye doğru çek, nişan al ve sepete fırlat!
                </div>
            </div>
        </main>
    );
}
