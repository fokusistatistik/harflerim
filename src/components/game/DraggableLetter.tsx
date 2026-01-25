'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface DraggableLetterProps {
    letter: string;
    id: string;
    disabled?: boolean;
}

export function DraggableLetter({ letter, id, disabled }: DraggableLetterProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { letter }, // Pass letter data for validation
        disabled,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="z-50 touch-none">
            <motion.div
                animate={
                    isDragging
                        ? { scale: 1.2, rotate: 5, zIndex: 100, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }
                        : { scale: 1, rotate: 0, zIndex: 10, boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }
                }
                whileHover={{ scale: disabled ? 1 : 1.1 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                className={`
          w-32 h-32 md:w-40 md:h-40 
          bg-white border-4 border-indigo-200 rounded-3xl 
          flex items-center justify-center 
          text-7xl font-bold text-indigo-600 select-none
          cursor-grab active:cursor-grabbing
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {letter}
            </motion.div>
        </div>
    );
}
