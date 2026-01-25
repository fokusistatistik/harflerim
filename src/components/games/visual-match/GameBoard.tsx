'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
// import { useGameAnalytics } from '@/hooks/useGameAnalytics';

const LETTERS = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z'];

export function GameBoard() {
    // const { logEvent, resetTimer } = useGameAnalytics('visual-match');

    // Sounds - assuming these files will exist in public/sounds/
    const [playSuccess] = useSound('/sounds/ding.mp3', { volume: 0.5 });
    const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.25 });

    const [targetLetter, setTargetLetter] = useState('A');
    const [isMatched, setIsMatched] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // For window size (Confetti)
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

    // Sensors for better touch handling
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        })
    );

    const startNewLevel = () => {
        const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        setTargetLetter(randomLetter);
        setIsMatched(false);
        // resetTimer();
        // logEvent('start', { target: randomLetter });
    };

    useEffect(() => {
        startNewLevel();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        playPop();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { over, active } = event;

        if (over && over.id === 'target-zone') {
            // Success Logic
            setIsMatched(true);
            playSuccess();
            // logEvent('success', { target: targetLetter, chosen: active.id as string });

            // Next Level Delay
            setTimeout(() => {
                startNewLevel();
            }, 3000);
        } else {
            // Fail Logic
            // logEvent('attempt', { target: targetLetter, chosen: active.id as string });
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <div className="flex flex-col h-screen w-full bg-cream overflow-hidden relative">
            {/* Success Confetti */}
            {isMatched && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />}

            {/* Header / Nav */}
            <div className="absolute top-4 left-4 z-10">
                <Link href="/" className="bg-white/80 p-3 rounded-full shadow-md text-2xl hover:bg-white transition-colors">
                    🏠
                </Link>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                <div className="h-full flex flex-col items-center justify-center p-4 gap-12">

                    {/* Target Zone (Shadow) */}
                    <div className="relative">
                        <Droppable id="target-zone" isMatched={isMatched}>
                            <div
                                className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center text-9xl font-bold text-gray-300 select-none"
                                style={{ fontFamily: 'var(--font-andika)' }}
                            >
                                {targetLetter}
                            </div>
                        </Droppable>

                        {/* Success Thumbs Up */}
                        <AnimatePresence>
                            {isMatched && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-12 -right-12 text-8xl z-20 drop-shadow-lg"
                                >
                                    👍
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Draggable Letter */}
                    {!isMatched && (
                        <div className="mt-8">
                            <Draggable id={targetLetter}>
                                <div
                                    className="w-40 h-40 md:w-56 md:h-56 bg-softIndigo rounded-3xl flex items-center justify-center text-8xl font-bold text-white shadow-xl cursor-grab active:cursor-grabbing border-4 border-white select-none"
                                    style={{ fontFamily: 'var(--font-andika)' }}
                                >
                                    {targetLetter}
                                </div>
                            </Draggable>
                        </div>
                    )}
                </div>

                {/* Drag Overlay (What follows the cursor) */}
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div
                            className="w-40 h-40 md:w-56 md:h-56 bg-softIndigo rounded-3xl flex items-center justify-center text-8xl font-bold text-white shadow-2xl opacity-90 border-4 border-white select-none scale-110 rotate-3"
                            style={{ fontFamily: 'var(--font-andika)' }}
                        >
                            {activeId}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
