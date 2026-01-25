'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface DroppableSlotProps {
    id: string;
    targetLetter: string;
    status: 'idle' | 'success' | 'error';
}

export function DroppableSlot({ id, targetLetter, status }: DroppableSlotProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div ref={setNodeRef} className="relative flex justify-center items-center">
            {/* Silhouette/Container */}
            <motion.div
                animate={status === 'error' ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                className={clsx(
                    "w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center border-4 border-dashed transition-colors duration-300",
                    status === 'success'
                        ? "bg-green-100 border-green-500"
                        : status === 'error'
                            ? "bg-red-100 border-red-400"
                            : isOver
                                ? "bg-indigo-50 border-indigo-400 scale-105"
                                : "bg-gray-50 border-gray-300"
                )}
            >
                <span className={clsx(
                    "text-9xl font-bold select-none transition-colors duration-300",
                    status === 'success' ? "text-green-600" : "text-gray-300"
                )}>
                    {targetLetter}
                </span>
            </motion.div>

            {/* Status Icon Overlay */}
            {status === 'success' && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    className="absolute top-0 right-0 bg-green-500 text-white p-3 rounded-full text-3xl shadow-lg"
                >
                    ✓
                </motion.div>
            )}
        </div>
    );
}
