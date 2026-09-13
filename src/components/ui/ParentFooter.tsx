'use client';

import React, { useState, useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import { Lock, Target, Timer } from 'lucide-react';

/**
 * Faz 1.24 — oyun-bağımsız hale getirildi. Önceden "Seviye X/24"/"Hedef:
 * X/24" gösteriyordu — yalnızca Harf Avı'na özeldi, diğer 3 oyun oynanırken
 * alakasız/eski veri gösteriyordu. Artık dailyScreenSeconds/dailyScreenLimit
 * (Header'daki DaisyProgress ile aynı kaynak, useGameDayBudget/syncDailyUsage
 * üzerinden hangi oyun oynanırsa oynansın güncel) kullanılarak hangi oyun
 * aktifken açılırsa açılsın doğru bilgiyi gösterir.
 */
export function ParentFooter() {
    const [mounted, setMounted] = useState(false);
    const { isDayComplete, dailyScreenSeconds, dailyScreenLimit } = useLevelStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const usedMin = Math.floor(dailyScreenSeconds / 60);
    const limitMin = Math.round(dailyScreenLimit / 60);
    const remainingMin = Math.max(0, limitMin - usedMin);

    return (
        <div className="fixed bottom-0 left-0 w-full h-12 z-50 backdrop-blur-md bg-papatya-surface/80 border-t border-papatya-rule flex items-center justify-between px-4 text-xs md:text-sm text-papatya-ink-soft font-sans shadow-lg">

            {/* Grid Content */}
            <div className="flex-1 flex gap-6 items-center justify-center">

                {/* Kullanılan süre */}
                <div className="flex items-center gap-1">
                    <Timer size={14} className="text-papatya-sky" />
                    <span className="font-semibold">Bugün: {usedMin}/{limitMin} dk</span>
                </div>

                {/* Kalan süre / durum */}
                <div className="flex items-center gap-1">
                    <Target size={14} className="text-papatya-leaf" />
                    <span className="font-semibold">
                        {isDayComplete ? 'Tamamlandı 🎉' : `Kalan: ${remainingMin} dk`}
                    </span>
                </div>

            </div>

            {/* Lock Icon */}
            <div className="ml-4 pl-4 border-l border-papatya-rule opacity-50">
                <Lock size={16} />
            </div>

        </div>
    );
}
