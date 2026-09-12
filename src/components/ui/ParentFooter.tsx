'use client';

import React, { useState, useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import { Lock, Target, Trophy, Timer } from 'lucide-react';

export function ParentFooter() {
    const [mounted, setMounted] = useState(false);
    const { currentLevel, isDayComplete, totalDuration } = useLevelStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const mins = Math.floor(totalDuration / 60);

    return (
        <div className="fixed bottom-0 left-0 w-full h-12 z-50 backdrop-blur-md bg-papatya-surface/80 border-t border-papatya-rule flex items-center justify-between px-4 text-xs md:text-sm text-papatya-ink-soft font-sans shadow-lg">

            {/* Grid Content */}
            <div className="flex-1 flex gap-6 items-center justify-center">

                {/* Level */}
                <div className="flex items-center gap-1">
                    <Trophy size={14} className="text-papatya-petal-deep" />
                    <span className="font-semibold">
                        {isDayComplete ? 'Tamamlandı' : `Seviye ${currentLevel} / 24`}
                    </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1">
                    <Timer size={14} className="text-papatya-sky" />
                    <span className="font-semibold">{mins} dk</span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1">
                    <Target size={14} className="text-papatya-leaf" />
                    <span className="font-semibold">
                        {isDayComplete ? 'Tamamlandı 🎉' : `Hedef: ${currentLevel > 1 ? currentLevel - 1 : 0} / 24`}
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
