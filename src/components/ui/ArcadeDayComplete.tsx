'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Home } from 'lucide-react';
import Link from 'next/link';
import { useAudio } from '@/components/AudioProvider';

interface ArcadeDayCompleteProps {
    onHome?: () => void;
}

export function ArcadeDayComplete({ onHome }: ArcadeDayCompleteProps) {
    const { speak } = useAudio();

    useEffect(() => {
        // Melike için şefkatli Türkçe sesli mesaj (tek seferlik, yumuşak ton)
        const timer = setTimeout(() => {
            speak('Oyun bitti, harika oynadın! Hadi şimdi babana kocaman sarılalım!').catch(() => {});
        }, 600);

        return () => clearTimeout(timer);
    }, [speak]);

    return (
        <div className="fixed inset-0 z-[60] bg-papatya-surface/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Arka plan sakin papatya yaprakları */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-16 h-16 rounded-full bg-papatya-petal"
                        style={{
                            top: `${(i * 19) % 95}%`,
                            left: `${(i * 27) % 95}%`,
                        }}
                        animate={{
                            y: [0, -15, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 4 + (i % 3),
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 max-w-lg bg-papatya-surface border-4 border-papatya-petal/30 shadow-xl rounded-3xl p-8 flex flex-col items-center gap-6"
            >
                {/* Şefkatli Kalp ve Papatya İkonu */}
                <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="w-24 h-24 rounded-full bg-papatya-rose/15 flex items-center justify-center text-papatya-rose shadow-inner"
                >
                    <Heart size={56} className="fill-papatya-rose/80" />
                </motion.div>

                <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-hand font-bold text-papatya-ink">
                        Oyun Saati Bitti! 🌼
                    </h2>
                    <p className="text-lg md:text-xl text-papatya-ink/80 leading-relaxed font-medium">
                        Bugün harika oynadın! <br />
                        <span className="text-papatya-rose font-bold">Hadi şimdi babana kocaman sarılalım! 🤗</span>
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href="/"
                        onClick={onHome}
                        className="min-h-tap inline-flex items-center gap-3 px-8 py-4 bg-papatya-leaf text-white font-bold rounded-2xl shadow-md hover:bg-papatya-leaf/90 hover:scale-105 active:scale-95 transition-all text-lg"
                    >
                        <Home size={24} />
                        <span>Ana Sayfaya Dön</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
