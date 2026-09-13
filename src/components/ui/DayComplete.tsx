'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { useLevelStore } from '@/store/levelStore';

export function DayComplete() {
    const { isDayComplete } = useLevelStore();

    if (!isDayComplete) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-papatya-night flex flex-col items-center justify-center text-papatya-night-ink overflow-hidden">
            {/* Stars Background */}
            <div className="absolute inset-0 opacity-50">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-papatya-night-ink rounded-full"
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
                {/* Sleeping Moon — Papatya doldu, gün sakince kapanıyor. Otomatik
                    yönlendirme, "sonraki" önerisi veya "biraz daha" seçeneği yok:
                    bu, ekranın gerçekten bittiği yumuşak ama kesin son ekranıdır. */}
                <motion.div
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative"
                >
                    <Moon size={120} className="text-papatya-petal fill-papatya-petal" />
                    <div className="absolute top-8 right-6 text-papatya-night font-bold text-4xl opacity-50">zZz</div>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-hand font-bold text-center px-4">
                    Harfler Uyudu. <br />
                    <span className="text-papatya-petal">Yarın Görüşürüz!</span>
                </h1>

                <p className="text-xl text-papatya-night-ink/80 max-w-md text-center">
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
