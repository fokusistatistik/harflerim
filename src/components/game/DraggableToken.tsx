'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface DraggableTokenProps {
    letter: string;
    id: string;
    disabled?: boolean;
    highlight?: boolean; // New prop for hints
    letterImages: Record<string, string>;
}

export function DraggableToken({ letter, id, disabled, highlight, letterImages }: DraggableTokenProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { letter },
        disabled,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const imgSrc = letterImages[letter];

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="z-50 touch-none">
            <motion.div
                animate={
                    isDragging
                        ? { scale: 1.05, zIndex: 100, rotate: 0 }
                        : highlight
                            ? {
                                scale: [1, 1.1, 1, 1.1, 1],
                                rotate: [0, -5, 5, -5, 5, 0],
                                borderColor: ["#e0e7ff", "#fcd34d", "#e0e7ff"], // Pulse Yellow Border
                                boxShadow: ["0 4px 6px -1px rgba(0, 0, 0, 0.1)", "0 0 15px 2px rgba(251, 191, 36, 0.5)", "0 4px 6px -1px rgba(0, 0, 0, 0.1)"]
                            }
                            : { scale: 1, zIndex: 10, rotate: 0, borderColor: "#e0e7ff", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }
                }
                transition={highlight ? { duration: 1.5, repeat: Infinity, repeatDelay: 1 } : undefined}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                className={clsx(
                    "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center", // Responsive sizes
                    "text-4xl sm:text-5xl md:text-7xl font-bold select-none",
                    "cursor-grab active:cursor-grabbing",
                    "shadow-md active:shadow-lg transition-all duration-300",
                    disabled
                        ? 'opacity-50 cursor-not-allowed bg-gray-200 border-4 border-gray-300'
                        : 'bg-white border-4 border-indigo-200 hover:border-indigo-300'
                )}
            >
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={letter}
                        className="w-[80%] h-[80%] object-contain pointer-events-none drop-shadow-sm"
                    />
                ) : (
                    letter
                )}
            </motion.div>
        </div>
    );
}
