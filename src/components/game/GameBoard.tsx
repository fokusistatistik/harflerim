'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, defaultDropAnimationSideEffects, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import Link from 'next/link';

import { LETTER_OBJECTS, ALPHABET_ORDER, AUDIOS, LETTER_IMAGES, LetterAsset } from '@/store/gameData';
import { useLevelStore } from '@/store/levelStore';
import { DraggableToken } from './DraggableToken';
import { TargetFrame } from './TargetFrame';
import { HintImage } from './HintImage';

const SIMILAR_MAPPING: Record<string, string[]> = {
    'E': ['F', 'L', 'I'],
    'F': ['E', 'P', 'T'],
    'O': ['Ö', 'D', 'C', 'G'],
    'Ö': ['O', 'Ü', 'C', 'G'],
    'Ü': ['U', 'Ö', 'V'],
    'U': ['Ü', 'V', 'J'],
    'B': ['R', 'P', 'D', '8'],
    'D': ['B', 'P', 'O', 'C'],
    'P': ['R', 'B', 'D'],
    'R': ['P', 'B', 'K'],
    'M': ['N', 'H'],
    'N': ['M', 'H', 'Z'],
    'S': ['Ş', 'Z', '5'],
    'Ş': ['S', 'Ç'],
    'C': ['Ç', 'O', 'D'],
    'Ç': ['C', 'S'],
    'K': ['H', 'R', 'X'],
    'I': ['İ', '1', 'L'],
    'İ': ['I', 'J'],
    'V': ['Y', 'U'],
    'Y': ['V', 'T'],
    'Z': ['N', '7'],
    'T': ['Y', 'I']
};

export default function GameBoard() {
    const { currentLevel, advanceLevel, getLevelConfig, isDayComplete, sessionId } = useLevelStore();

    const [isPlaying, setIsPlaying] = useState(false);
    const [levelConfig, setLevelConfig] = useState(getLevelConfig(currentLevel));

    // Round State
    const [targetLetter, setTargetLetter] = useState('A');
    const [currentObject, setCurrentObject] = useState<LetterAsset | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [distractors, setDistractors] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // Audio
    const [playSuccess] = useSound(AUDIOS.correct, { volume: 0.6 });
    const [playError] = useSound(AUDIOS.wrong, { volume: 0.5 });
    const [playComplete] = useSound(AUDIOS.complete, { volume: 0.6 });

    // Sensors
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 100, tolerance: 5 },
        })
    );

    useEffect(() => {
        setLevelConfig(getLevelConfig(currentLevel));
    }, [currentLevel, getLevelConfig]);

    // Auto-scroll to current level on Map View
    useEffect(() => {
        if (!isPlaying) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                const el = document.getElementById(`level-node-${currentLevel}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, currentLevel]);

    // Loading state
    if (!sessionId) return <div className="flex h-screen items-center justify-center text-softIndigo">Yükleniyor...</div>;

    const startRound = () => {
        const config = getLevelConfig(currentLevel);

        // Pick Target
        const randomTarget = ALPHABET_ORDER[Math.floor(Math.random() * ALPHABET_ORDER.length)];
        const objects = LETTER_OBJECTS[randomTarget];
        const randomObj = objects[Math.floor(Math.random() * objects.length)];

        setTargetLetter(randomTarget);
        setCurrentObject(randomObj);

        // Pick Distractors
        const count = config.optionCount;
        const distList: string[] = [];
        const used = new Set<string>([randomTarget]);

        const addDistractor = (candidate: string) => {
            if (!used.has(candidate) && ALPHABET_ORDER.includes(candidate)) {
                distList.push(candidate);
                used.add(candidate);
                return true;
            }
            return false;
        };

        if (config.distractorType === 'similar') {
            const likes = SIMILAR_MAPPING[randomTarget] || [];
            for (const s of likes) {
                if (distList.length < count - 1) addDistractor(s);
            }
        }

        while (distList.length < count - 1) {
            const rand = ALPHABET_ORDER[Math.floor(Math.random() * ALPHABET_ORDER.length)];
            addDistractor(rand);
        }
        setDistractors(distList);

        // Shuffle
        const allOptions = [randomTarget, ...distList].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setStatus('idle');
        setStartTime(Date.now());
    };

    const handleLevelSelect = (level: number) => {
        // Only allow selecting current or completed levels?
        // Requirement said: "If session.completedAt not null, show Sleep Mode". 
        // "No Reset button".
        // "Levels unlock sequentially".
        // currentLevel is the highest unlocked.
        if (level <= currentLevel && !isDayComplete) {
            // Technically we can't 'go back' easily with this Store logic unless we separate MaxLevel from CurrentLevel.
            // For strict "Daily 24" flow, we play the Current Level.
            // We can allow replaying previous levels if we update Store to support 'playingLevel' state.
            // For MVP "Task 1", let's assume playing the CURRENT frontier level.
            if (level === currentLevel) {
                setIsPlaying(true);
                startRound();
            }
        }
    };

    // Hint Logic
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        // Reset hint when level starts
        setShowHint(false);
        const timer = setTimeout(() => {
            setShowHint(true);
        }, 5000); // 5 seconds idle -> Show Hint

        return () => clearTimeout(timer);
    }, [targetLetter, status]); // Reset on new letter or status change

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
        setShowHint(false); // Interaction resets hint
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        // Hint timer will naturally restart due to status change if error, or stopped if success

        if (!over) return;
        // ... (rest of function)

        const droppedLetter = active.data.current?.letter;
        const isCorrect = droppedLetter === targetLetter;
        const reactionTime = Date.now() - startTime;

        advanceLevel(isCorrect, targetLetter, reactionTime);

        if (isCorrect) {
            setStatus('success');
            playSuccess();
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#F59E0B']
            });

            // Delay for animation then close or next
            setTimeout(() => {
                playComplete();
                setIsPlaying(false);
                // Auto-advance logic could go here if we wanted continuous play
            }, 1000);

        } else {
            setStatus('error');
            playError();
            setTimeout(() => setStatus('idle'), 800);
        }
    };

    // --- PHASE COLORS (ASD Friendly - Pastel & Calming) ---
    const getPhaseStyle = () => {
        const { phase } = levelConfig;
        switch (phase) {
            case 'Morning': return "bg-gradient-to-b from-sky-50 to-amber-50"; // Calm awakening
            case 'Noon': return "bg-gradient-to-b from-blue-50 to-green-50"; // Focus
            case 'Afternoon': return "bg-gradient-to-b from-amber-50 to-orange-50"; // Warmth
            case 'Evening': return "bg-gradient-to-b from-indigo-50 to-violet-100"; // Winding down
            default: return "bg-cream";
        }
    };

    // --- VIEW: LEVEL MAP (Winding Path) ---
    if (!isPlaying) {
        return (
            <div className={`min-h-screen ${getPhaseStyle()} transition-colors duration-1000 flex flex-col items-center p-4 pt-24 overflow-x-hidden`}>

                <h1 className="text-3xl md:text-5xl font-hand font-bold text-softIndigo mb-2 text-center bg-white/60 px-8 py-2 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                    Bugünün Macerası
                </h1>
                <p className="text-gray-500 mb-12 font-medium">Melike ile Harfleri Keşfet</p>

                {/* Vertical Winding Map Container */}
                <div className="relative w-full max-w-md pb-32">

                    {/* SVG Path - Connecting Line */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" style={{ minHeight: '100%' }}>
                        <path
                            d={`M 50% 40 ${Array.from({ length: 24 }).map((_, i) => {
                                // Draw a bezier curve between points
                                const y = i * 100 + 40;
                                const nextY = (i + 1) * 100 + 40;
                                const x = 50 + Math.sin(i * 0.8) * 35; // 35% sway
                                const nextX = 50 + Math.sin((i + 1) * 0.8) * 35;
                                return `C ${x} ${y + 50}, ${nextX} ${nextY - 50}, ${nextX} ${nextY}`;
                            }).join(" ")}`}
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="16 16"
                        />
                    </svg>

                    {/* Nodes */}
                    {[...Array(24)].map((_, i) => {
                        const id = i + 1;
                        const cfg = getLevelConfig(id);
                        const isUnlocked = id <= currentLevel && !isDayComplete;
                        const isCompleted = id < currentLevel;
                        const isCurrent = id === currentLevel && !isDayComplete;

                        // Calculate Winding Position using Math.sin
                        // Center is 50%, sway is +/- 35%
                        const xPos = 50 + Math.sin(i * 0.8) * 35;
                        const yPos = i * 100;

                        return (
                            <div
                                key={id}
                                id={`level-node-${id}`}
                                className="absolute flex flex-col items-center justify-center transform -translate-x-1/2"
                                style={{ left: `${xPos}%`, top: `${yPos}px` }}
                            >
                                {/* Connector/Avatar for Current Level */}
                                {isCurrent && (
                                    <div className="absolute -top-12 w-14 h-14 z-20 animate-float pointer-events-none">
                                        <img
                                            src="https://static.fokusistatistik.com/melike/melike.png"
                                            alt="Melike"
                                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={() => handleLevelSelect(id)}
                                    disabled={!isUnlocked}
                                    className={`
                                        relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 z-10
                                        ${isCompleted
                                            ? 'bg-yellow-400 border-4 border-white shadow-md text-white scale-100 ring-4 ring-yellow-200'
                                            : isCurrent
                                                ? 'bg-white border-8 border-indigo-400 shadow-xl scale-110' // Highlight Current
                                                : isUnlocked
                                                    ? 'bg-white border-4 border-indigo-100 shadow-sm'
                                                    : 'bg-gray-100 border-4 border-gray-200 opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    {isCompleted ? (
                                        <Star fill="white" className="drop-shadow-sm" size={40} />
                                    ) : !isUnlocked ? (
                                        <Lock className="text-gray-300" size={24} />
                                    ) : (
                                        <span className={`text-2xl font-bold ${isCurrent ? 'text-indigo-600' : 'text-indigo-300'}`}>
                                            {id}
                                        </span>
                                    )}

                                    {/* Ripple Effect for Current (Gentle Pulse) */}
                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full border-4 border-indigo-400 opacity-20 animate-ping"></span>
                                    )}
                                </button>

                                {/* Phase Label only on change */}
                                {(i === 0 || i === 7 || i === 13 || i === 19) && (
                                    <div className="absolute top-4 left-24 w-max bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-gray-400 shadow-sm backdrop-blur-sm">
                                        {cfg.phase === 'Morning' ? 'Sabah 🌅' :
                                            cfg.phase === 'Noon' ? 'Öğle ☀️' :
                                                cfg.phase === 'Afternoon' ? 'İkindi 🌤️' : 'Akşam 🌙'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="h-40"></div> {/* Spacer for bottom scrolling */}

                <Link href="/" className="fixed bottom-20 right-4 bg-white p-3 rounded-full shadow-lg text-indigo-500 z-50 md:hidden">
                    {/* Mobile quick home if needed, though Header has one */}
                    Ana Menü
                </Link>
            </div>
        );
    }

    // GAME BOARD (Same as before)
    return (
        <div className="h-full w-full bg-cream flex flex-col md:flex-row overflow-hidden relative">
            <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-20 left-4 z-50 p-2 bg-white rounded-full shadow-md text-gray-500 hover:bg-gray-100"
            >
                ⬅
            </button>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                <div className="flex-[4] md:flex-1 flex flex-col items-center justify-center gap-2 md:gap-6 p-4 border-b-4 md:border-b-0 md:border-r-4 border-dashed border-indigo-100 bg-white/40 pt-4 md:pt-20">
                    <HintImage
                        src={currentObject?.img || ''}
                        alt={currentObject?.word || ''}
                    />
                    <TargetFrame
                        id="target-frame"
                        targetLetter={targetLetter}
                        status={status}
                    />
                    <p className="text-xl md:text-2xl text-softIndigo font-bold">{currentObject?.word}</p>
                </div>

                <div className="flex-[6] md:flex-1 flex flex-wrap content-start md:content-center items-center justify-center gap-2 sm:gap-4 md:gap-8 p-2 md:p-4 bg-cream relative pt-4 md:pt-20 overflow-y-auto w-full">
                    <AnimatePresence>
                        {options.map((opt, index) => (
                            <div key={`${currentLevel}-${opt}-${index}`} className="relative p-2">
                                <DraggableToken
                                    id={`token-${opt}-${index}`}
                                    letter={opt}
                                    disabled={status === 'success'}
                                    highlight={showHint && opt === targetLetter}
                                />
                            </div>
                        ))}
                    </AnimatePresence>
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                    {activeId ? (
                        <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center text-7xl font-bold text-indigo-600 shadow-2xl opacity-90 border-4 border-indigo-500 overflow-hidden transform scale-110 rotate-3">
                            {LETTER_IMAGES[activeId.split('-')[1]] ? (
                                <img
                                    src={LETTER_IMAGES[activeId.split('-')[1]]}
                                    alt={activeId.split('-')[1]}
                                    className="w-[80%] h-[80%] object-contain"
                                />
                            ) : (
                                activeId.split('-')[1]
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
