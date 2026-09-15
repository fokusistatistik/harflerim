'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { recordSkillAttempt } from '@/actions/skills';
import { getVisualMatchDailyState } from '@/actions/visualMatch';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { useAudio } from '@/components/AudioProvider';
import { GameHud } from '@/components/game/GameHud';
import { GameIntroCard } from '@/components/ui/GameIntroCard';

const LETTERS = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M',
    'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
];

function pickDistractors(target: string, count: number): string[] {
    const pool = LETTERS.filter((l) => l !== target);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function GameBoard() {
    // Faz 1.8: Ses dosyası adları düzeltildi (ding.mp3/pop.mp3 hiç var olmayan
    // dosyalardı) — projede zaten mevcut olan public/sounds/*.wav kullanılıyor.
    const [playSuccess] = useSound('/sounds/success.wav', { volume: 0.5 });
    const [playPop] = useSound('/sounds/pop.wav', { volume: 0.25 });
    const { encourageRetry } = useAudio();
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const checkCalmingMode = useCalmingModeMonitor('golge-eslestirme'); // Faz 3.2b
    const prefersReducedMotion = useReducedMotion();

    const [targetLetter, setTargetLetter] = useState('A');
    const previousLetterRef = useRef<string | null>(null);
    const [cardLetters, setCardLetters] = useState<string[]>(['A']);
    const [isMatched, setIsMatched] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [shakeToken, setShakeToken] = useState(0);
    const [dailyLimit, setDailyLimit] = useState<{ roundsPlayedToday: number; dailyVisualMatchLimit: number; isVisualMatchLimitReached: boolean } | null>(null);

    // For window size (Confetti)
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
    }, []);

    // Sensors for better touch handling + klavye erişilebilirliği (Faz 2.11 denetimi)
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const startNewLevel = useCallback(async () => {
        const state = await getVisualMatchDailyState().catch(() => null);
        setDailyLimit(state);
        if (state?.isVisualMatchLimitReached) return;

        // Ardışık aynı harf asla seçilmez (Harf Avı'ndaki kesin korumanın aynısı) — havuzda alternatif varken.
        const pool = LETTERS.filter((l) => l !== previousLetterRef.current);
        const randomLetter = pool[Math.floor(Math.random() * pool.length)];
        previousLetterRef.current = randomLetter;

        const distractorCount = state?.distractorCount ?? 0;
        const distractors = pickDistractors(randomLetter, distractorCount);
        setCardLetters([randomLetter, ...distractors].sort(() => Math.random() - 0.5));

        setTargetLetter(randomLetter);
        setIsMatched(false);
        setShakeToken(0);
    }, []);

    useEffect(() => {
        startNewLevel();
    }, [startNewLevel]);

    const handleDragStart = (event: DragStartEvent) => {
        if (dayBudget?.isDayComplete || dailyLimit?.isVisualMatchLimitReached) return;
        setActiveId(event.active.id as string);
        playPop();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        if (dayBudget?.isDayComplete || dailyLimit?.isVisualMatchLimitReached) return;
        const { over, active } = event;
        const isCorrectCard = active.id === targetLetter;

        if (over && over.id === 'target-zone' && isCorrectCard) {
            setIsMatched(true);
            playSuccess();
            recordSkillAttempt('golge-eslestirme', 'visual-match', true).catch(() => {});
            checkCalmingMode(true);

            setTimeout(() => {
                startNewLevel();
            }, 2000);
        } else if (over && over.id === 'target-zone') {
            // Yanlış kart doğru hedefe bırakıldı — "Başarısızlık yok" ilkesi:
            // ceza/kırmızı-çarpı yok, yalnızca nazik bir "tekrar dene" daveti.
            recordSkillAttempt('golge-eslestirme', 'visual-match', false).catch(() => {});
            checkCalmingMode(false);
            encourageRetry().catch(() => {});
            setShakeToken((t) => t + 1);
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

    const isLimitReached = !!dailyLimit?.isVisualMatchLimitReached;

    return (
        <div className="flex flex-col h-app w-full bg-papatya-cream overflow-hidden relative">
            {/* Success Confetti — reduceMotion açıkken hiç gösterilmez (Faz 2.11 denetimi) */}
            {isMatched && !prefersReducedMotion && (
                <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={80} colors={['#E8B33C', '#5F7A52', '#6B87A8', '#C4756A']} />
            )}

            {/* Header / Nav — Faz 1.8: paylaşılan GameHud */}
            <div className="absolute top-4 left-4 right-4 lg:top-8 lg:left-8 lg:right-8 z-10">
                <GameHud right={<GameIntroCard gameId="visual-match" variant="tooltip" />} />
            </div>

            {isLimitReached ? (
                <div className="h-full flex flex-col items-center justify-center p-4 gap-4 text-center">
                    <p className="text-p-lg font-bold text-papatya-ink">Bugünkü {dailyLimit?.dailyVisualMatchLimit} turluk hakkın doldu</p>
                    <p className="text-p-base text-papatya-ink-soft">Yarın devam edebilirsin!</p>
                </div>
            ) : (
                <DndContext
                    id="visual-match-dnd"
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToWindowEdges]}
                >
                    <div className="h-full flex flex-col items-center justify-center p-4 gap-10 lg:gap-16 xl:gap-24">

                        {/* Target Zone (Shadow) */}
                        <div className="relative">
                            <Droppable id="target-zone" isMatched={isMatched}>
                                <div
                                    className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 flex items-center justify-center text-9xl xl:text-[10rem] font-bold text-papatya-rule select-none"
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

                        {/* Draggable Letter(s) — zorluk arttıkça çeldirici harfler eklenir (Faz 2.11 adaptif zorluk) */}
                        {!isMatched && (
                            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 mt-8">
                                {cardLetters.map((letter) => (
                                    <motion.div
                                        key={letter}
                                        animate={shakeToken > 0 && letter !== targetLetter ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Draggable id={letter} disabled={dayBudget?.isDayComplete}>
                                            <div
                                                className="w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 xl:w-64 xl:h-64 bg-papatya-sky rounded-3xl flex items-center justify-center text-7xl lg:text-8xl font-bold text-white shadow-xl cursor-grab active:cursor-grabbing border-4 border-white select-none"
                                                style={{ fontFamily: 'var(--font-andika)' }}
                                            >
                                                {letter}
                                            </div>
                                        </Draggable>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Drag Overlay (What follows the cursor) */}
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId ? (
                            <div
                                className="w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 xl:w-64 xl:h-64 bg-papatya-sky rounded-3xl flex items-center justify-center text-7xl lg:text-8xl font-bold text-white shadow-2xl opacity-90 border-4 border-white select-none scale-110 rotate-3"
                                style={{ fontFamily: 'var(--font-andika)' }}
                            >
                                {activeId}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}
