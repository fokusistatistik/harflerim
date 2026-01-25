'use client';

import React, { useState, useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import { Moon, Sun, Home } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export function Header() {
    const { currentLevel, isDayComplete } = useLevelStore();
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
        <header className="fixed top-0 left-0 w-full h-16 bg-white/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-4 md:px-8 border-b border-indigo-100">

            {/* Left: Home & Clock */}
            <div className="flex items-center gap-3 md:gap-4">
                <Link
                    href="/"
                    className="p-2 bg-orange-100 rounded-xl text-orange-500 hover:bg-orange-200 hover:scale-105 transition-all shadow-sm border border-orange-200"
                    title="Ana Sayfa"
                >
                    <Home size={24} strokeWidth={2.5} />
                </Link>

                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-softIndigo font-mono leading-none">{time}</span>
                    <span className="text-xs text-gray-400 font-bold hidden md:block">CANLI</span>
                </div>
            </div>

            {/* Center: Date */}
            <div className="text-lg md:text-xl font-hand font-bold text-gray-600">
                {dateStr}
            </div>

            {/* Right: Settings / Profile / DayNight */}
            <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-indigo-50 rounded-full text-indigo-500 font-bold text-sm shadow-sm border border-indigo-100">
                    {currentLevel > 1 ? `${currentLevel - 1} Oyun Bitti` : 'Başlangıç'}
                </div>

                <div className="text-indigo-500">
                    {isDayComplete ? <Moon size={24} className="fill-indigo-500" /> : <Sun size={24} className="text-orange-400" />}
                </div>
            </div>
        </header>
    );
}
