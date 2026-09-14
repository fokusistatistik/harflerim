'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Lock } from 'lucide-react'; // Using Lucide icon for lock effect if needed, though simple shape is requested.
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface TargetFrameProps {
    id: string;
    targetLetter: string;
    status: 'idle' | 'success' | 'error';
    letterImages: Record<string, string>;
}

export function TargetFrame({ id, targetLetter, status, letterImages }: TargetFrameProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const imgSrc = letterImages[targetLetter];

    return (
        <div ref={setNodeRef} className="relative">
            <motion.div
                animate={
                    status === 'error' ? { x: [-10, 10, -10, 10, 0] } :
                        status === 'success' ? { scale: [1, 1.1, 1] } :
                            {}
                }
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className={clsx(
                    "w-24 h-24 md:w-48 md:h-48 rounded-2xl flex items-center justify-center transition-all duration-300",
                    "border-4 border-dashed",
                    status === 'success'
                        ? "bg-green-100 border-green-500 border-solid"
                        : status === 'error'
                            ? "bg-red-50 border-red-400"
                            : isOver
                                ? "bg-blue-50 border-blue-400 scale-105"
                                : "bg-white/80 border-gray-300"
                )}
            >
                {/* Ghost Letter */}
                {imgSrc ? (
                    <ImageWithFallback
                        src={imgSrc}
                        alt={targetLetter}
                        className={clsx(
                            "w-[80%] h-[80%] object-contain pointer-events-none transition-all duration-300",
                            status === 'success' ? "opacity-100 scale-110 drop-shadow-md" : "opacity-20 grayscale",
                            status === 'error' ? "opacity-20 grayscale" : ""
                        )}
                        fallback={
                            <span className={clsx(
                                "text-5xl md:text-8xl font-bold select-none transition-colors duration-300",
                                status === 'success' ? "text-green-600 scale-110" : "text-gray-200"
                            )}>
                                {targetLetter}
                            </span>
                        }
                    />
                ) : (
                    <span className={clsx(
                        "text-5xl md:text-8xl font-bold select-none transition-colors duration-300",
                        status === 'success' ? "text-green-600 scale-110" : "text-gray-200"
                    )}>
                        {targetLetter}
                    </span>
                )}
            </motion.div>

            {/* Success Particle Effect or Icon Overlay */}
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1.2, y: -20 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-6 -right-6 text-4xl"
                    >
                        ⭐
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
