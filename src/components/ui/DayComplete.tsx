'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { useLevelStore } from '@/store/levelStore';

export function DayComplete() {
    const { isDayComplete } = useLevelStore();

    if (!isDayComplete) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-indigo-950 flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Stars Background */}
            <div className="absolute inset-0 opacity-50">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            animation: `twinkle ${Math.random() * 3 + 2}s infinite`
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center gap-8 relative z-10"
            >
                {/* Sleeping Moon */}
                <motion.div
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative"
                >
                    <Moon size={120} className="text-yellow-200 fill-yellow-200" />
                    <div className="absolute top-8 right-6 text-indigo-900 font-bold text-4xl opacity-50">zZz</div>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-hand font-bold text-center px-4">
                    Harfler Uyudu. <br />
                    <span className="text-yellow-300">Yarın Görüşürüz!</span>
                </h1>

                <p className="text-xl text-indigo-200 max-w-md text-center">
                    Bugün harika bir iş çıkardın. Şimdi dinlenme zamanı.
                </p>
            </motion.div>

            <style jsx>{`
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
        `}</style>
        </div>
    );
}
