'use client';

import React, { useState, useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import { Moon, Sun, Home } from 'lucide-react';
import Link from 'next/link';
import { useLongPress } from '@/hooks/useLongPress';
import { useParentGateStore } from '@/store/parentGateStore';
import { DaisyProgress } from '@/components/ui/DaisyProgress';

const TOTAL_PETALS = 8;

export function Header() {
    const { isDayComplete, dailyScreenSeconds, dailyScreenLimit } = useLevelStore();
    // Faz 1.9 — geçici çözüm: yapraklar zaman oranına göre dolar. Faz 2.8
    // gerçek "günün sekiz etkinliği" mantığını getirdiğinde bu hesap yerini bırakır.
    const filledPetals = isDayComplete
        ? TOTAL_PETALS
        : Math.max(0, Math.min(TOTAL_PETALS, Math.floor((dailyScreenSeconds / Math.max(1, dailyScreenLimit)) * TOTAL_PETALS)));
    const openPinPrompt = useParentGateStore((s) => s.openPinPrompt);
    const longPress = useLongPress(openPinPrompt);
    const [time, setTime] = useState('');
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
            setDateStr(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full h-16 lg:h-20 bg-papatya-surface/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-4 md:px-8 lg:px-12 xl:px-16 border-b border-papatya-rule">

            {/* Left: Home & Clock */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Kısa dokunuş: ana sayfaya git. Uzun basma (~700ms): ebeveyn
                    kapısını aç (Faz 1.3) — çocuğun yanlışlıkla bulamayacağı bir jest. */}
                <Link
                    href="/"
                    {...longPress}
                    className="inline-flex items-center justify-center min-w-tap min-h-tap p-2 bg-papatya-petal/15 rounded-xl text-papatya-petal-deep hover:bg-papatya-petal/25 hover:scale-105 transition-all shadow-sm border border-papatya-petal/30"
                    title="Ana Sayfa"
                >
                    <Home size={24} strokeWidth={2.5} className="lg:w-7 lg:h-7" />
                </Link>

                <div className="flex flex-col">
                    <span className="text-2xl lg:text-3xl font-bold text-papatya-ink font-mono leading-none">{time}</span>
                    <span className="text-xs text-papatya-ink-soft font-bold hidden md:block">CANLI</span>
                </div>
            </div>

            {/* Center: Date */}
            <div className="text-lg md:text-xl lg:text-2xl font-hand font-bold text-papatya-ink-soft">
                {dateStr}
            </div>

            {/* Right: Daisy progress / Level / DayNight */}
            <div className="flex items-center gap-3 lg:gap-6">
                <DaisyProgress filledCount={filledPetals} size={36} className="lg:w-11 lg:h-11" />

                {/* 2026-09-13 — UX denetiminde kullanıcı bunu bir tema anahtarı
                    sandı (bir düğme değil, yalnızca gün durumu göstergesi).
                    Gerçek koyu tema Faz 5'e bırakıldı (bkz. YOL-HARITASI.md);
                    burada yalnızca bir buton gibi görünmediğinden emin olunuyor
                    ve ne olduğu title/aria-label ile açıklanıyor. */}
                <div
                    className="text-papatya-sky cursor-default"
                    title={isDayComplete ? 'Bugünün etkinlikleri tamamlandı' : 'Gün devam ediyor'}
                    aria-label={isDayComplete ? 'Bugünün etkinlikleri tamamlandı' : 'Gün devam ediyor'}
                >
                    {isDayComplete ? <Moon size={24} className="fill-papatya-sky lg:w-7 lg:h-7" /> : <Sun size={24} className="text-papatya-petal lg:w-7 lg:h-7" />}
                </div>
            </div>
        </header>
    );
}
