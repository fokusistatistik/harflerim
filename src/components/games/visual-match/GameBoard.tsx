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

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { recordSkillAttempt } from '@/actions/skills';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { GameHud } from '@/components/game/GameHud';
import { GameIntroCard } from '@/components/ui/GameIntroCard';

const LETTERS = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z'];

export function GameBoard() {
    // Faz 1.8: Ses dosyası adları düzeltildi (ding.mp3/pop.mp3 hiç var olmayan
    // dosyalardı) — projede zaten mevcut olan public/sounds/*.wav kullanılıyor.
    const [playSuccess] = useSound('/sounds/success.wav', { volume: 0.5 });
    const [playPop] = useSound('/sounds/pop.wav', { volume: 0.25 });
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const checkCalmingMode = useCalmingModeMonitor('golge-eslestirme'); // Faz 3.2b

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
    };

    useEffect(() => {
        startNewLevel();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        if (dayBudget?.isDayComplete) return; // Faz 1.8/1.10: günlük süre bütçesi doldu
        setActiveId(event.active.id as string);
        playPop();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        if (dayBudget?.isDayComplete) return; // Faz 1.8/1.10: günlük süre bütçesi doldu
        const { over } = event;

        if (over && over.id === 'target-zone') {
            setIsMatched(true);
            playSuccess();
            recordSkillAttempt('golge-eslestirme', 'visual-match', true).catch(() => {});
            checkCalmingMode(true);

            setTimeout(() => {
                startNewLevel();
            }, 3000);
        } else {
            recordSkillAttempt('golge-eslestirme', 'visual-match', false).catch(() => {});
            checkCalmingMode(false);
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
        <div className="flex flex-col h-app w-full bg-papatya-cream overflow-hidden relative">
            {/* Success Confetti */}
            {isMatched && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} colors={['#E8B33C', '#5F7A52', '#6B87A8', '#C4756A']} />}

            {/* Header / Nav — Faz 1.8: paylaşılan GameHud */}
            <div className="absolute top-4 left-4 right-4 lg:top-8 lg:left-8 lg:right-8 z-10">
                <GameHud right={<GameIntroCard gameId="visual-match" variant="tooltip" />} />
            </div>

            <DndContext
                id="visual-match-dnd"
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                <div className="h-full flex flex-col items-center justify-center p-4 gap-12 lg:gap-16">

                    {/* Target Zone (Shadow) */}
                    <div className="relative">
                        <Droppable id="target-zone" isMatched={isMatched}>
                            <div
                                className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 flex items-center justify-center text-9xl font-bold text-papatya-rule select-none"
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
                                    aria-hidden="true"
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
                            <Draggable id={targetLetter} disabled={dayBudget?.isDayComplete}>
                                <div
                                    className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-papatya-sky rounded-3xl flex items-center justify-center text-8xl font-bold text-white shadow-xl cursor-grab active:cursor-grabbing border-4 border-white select-none"
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
                            className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-papatya-sky rounded-3xl flex items-center justify-center text-8xl font-bold text-white shadow-2xl opacity-90 border-4 border-white select-none scale-110 rotate-3"
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
