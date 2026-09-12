'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LETTER_IMAGES, AUDIOS } from '@/store/gameData';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { Home, RefreshCw, Trophy, Lock, Star } from 'lucide-react';
import clsx from 'clsx';
import { useAudio } from '@/components/AudioProvider';
import { useNotificationStore } from '@/store/notificationStore';
// import { getDailySession } from '@/actions/game';

// Card Interface
interface Card {
    id: string; // unique
    letter: string; // 'A', 'B', etc.
    img: string; // url
    isFlipped: boolean;
    isMatched: boolean;
}

const MELIKE_AVATAR = "https://static.fokusistatistik.com/melike/melike.png";
const TOTAL_LEVELS = 24;

export default function MemoryMatchGame() {
    // Game State
    const [level, setLevel] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false); // Controls Map vs Game view

    // Level Logic
    // Simplified progress tracking for this session (could use localStorage in future)
    const [maxReachedLevel, setMaxReachedLevel] = useState(1);

    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);

    const { celebrateSuccess, encourageRetry } = useAudio();
    const pushToast = useNotificationStore((s) => s.pushToast);

    // Sounds
    const [playFlip] = useSound('https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3', { volume: 0.5 });
    const [playMatch] = useSound(AUDIOS.correct, { volume: 0.5 });
    const [playLevelUp] = useSound(AUDIOS.complete, { volume: 0.6 });

    // Load progress from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('memory_match_level');
        if (saved) {
            setMaxReachedLevel(parseInt(saved, 10));
        }
    }, []);

    const startLevel = (lvl: number) => {
        // Difficulty Logic:
        // Lvl 1-3: 6 cards (3 pairs)
        // Lvl 4-8: 8 cards (4 pairs)
        // Lvl 9-15: 12 cards (6 pairs)
        // Lvl 16-24: 16 cards (8 pairs)

        let pairCount = 3;
        if (lvl > 3) pairCount = 4;
        if (lvl > 8) pairCount = 6;
        if (lvl > 15) pairCount = 8;

        const availableLetters = Object.keys(LETTER_IMAGES);
        // Shuffle available letters
        availableLetters.sort(() => Math.random() - 0.5);

        const selectedLetters = availableLetters.slice(0, pairCount);

        // Create Pairs
        let deck: Card[] = [];
        selectedLetters.forEach(letter => {
            const img = LETTER_IMAGES[letter];
            deck.push({ id: `${letter}-1`, letter, img, isFlipped: false, isMatched: false });
            deck.push({ id: `${letter}-2`, letter, img, isFlipped: false, isMatched: false });
        });

        // Shuffle Deck
        deck.sort(() => Math.random() - 0.5);

        setCards(deck);
        setFlippedIndices([]);
        setIsProcessing(false);
        setLevel(lvl);
        setIsPlaying(true); // Switch to game view
    };

    const handleCardClick = (index: number) => {
        if (isProcessing) return;
        if (cards[index].isMatched) return;
        if (flippedIndices.includes(index)) return;
        if (flippedIndices.length >= 2) return;

        playFlip();

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setIsProcessing(true);
            const card1 = newCards[newFlipped[0]];
            const card2 = newCards[newFlipped[1]];

            if (card1.letter === card2.letter) {
                // MATCH
                setTimeout(() => {
                    playMatch();
                    celebrateSuccess().catch(() => {});
                    pushToast({ scope: 'child', kind: 'success', message: 'Harika!' });
                    newCards[newFlipped[0]].isMatched = true;
                    newCards[newFlipped[1]].isMatched = true;
                    setCards(newCards);
                    setFlippedIndices([]);
                    setIsProcessing(false);
                    checkWin(newCards);
                }, 600);
            } else {
                // MISMATCH
                setTimeout(() => {
                    encourageRetry().catch(() => {});
                    newCards[newFlipped[0]].isFlipped = false;
                    newCards[newFlipped[1]].isFlipped = false;
                    setCards(newCards);
                    setFlippedIndices([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    const checkWin = (currentCards: Card[]) => {
        if (currentCards.every(c => c.isMatched)) {
            // Level Complete
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                const nextLevel = level + 1;

                // Update Progress
                if (nextLevel > maxReachedLevel) {
                    setMaxReachedLevel(nextLevel);
                    localStorage.setItem('memory_match_level', nextLevel.toString());
                }

                if (nextLevel > TOTAL_LEVELS) {
                    setGameCompleted(true);
                    playLevelUp();
                } else {
                    // Go back to map or next level? 
                    // User requested "Bugünün macerası düzeni" (Adventure Map) between games generally means returning to map or auto advancing?
                    // In Letter Hunt it auto advances visually but shows map logic.
                    // For now, let's return to Map to show progress, or simple auto advance.
                    // Let's Auto Advance for flow, but update the 'level' state so map is updated next time they visit.

                    // Actually, "between games" implies seeing the map. Let's briefly show success then map?
                    // Or just start next level immediately for flow? 
                    // Let's start next level immediately for better UX, but the map is always accessible via "Back".
                    startLevel(nextLevel);
                }
            }, 1500);
        }
    };

    // Helper for Map Colors
    const getPhaseStyle = () => {
        if (level <= 6) return "bg-gradient-to-b from-sky-50 to-amber-50";
        if (level <= 12) return "bg-gradient-to-b from-blue-50 to-green-50";
        if (level <= 18) return "bg-gradient-to-b from-amber-50 to-orange-50";
        return "bg-gradient-to-b from-indigo-50 to-violet-100";
    };

    if (gameCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-500 flex flex-col items-center justify-center p-4 text-white">
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
                    <Trophy size={80} className="text-yellow-500 mb-4" />
                    <h1 className="text-4xl font-hand font-bold mb-2 text-gray-800">Tebrikler!</h1>
                    <p className="text-gray-500 mb-8">Hafızan harika! Bütün levelleri bitirdin.</p>
                    <Link href="/" className="w-full bg-teal-500 text-white py-4 rounded-full font-bold shadow-lg hover:bg-teal-600 transition">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- MAP VIEW ---
    if (!isPlaying) {
        return (
            <div className={`min-h-screen ${getPhaseStyle()} transition-colors duration-1000 flex flex-col items-center p-4 pt-24 overflow-x-hidden`}>

                <h1 className="text-3xl md:text-5xl font-hand font-bold text-teal-600 mb-2 text-center bg-white/60 px-8 py-2 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                    Bugünün Macerası
                </h1>
                <p className="text-gray-500 mb-12 font-medium">Kartları Eşleştir, Yolu Tamamla!</p>

                {/* Vertical Winding Map Container */}
                <div className="relative w-full max-w-md pb-32">
                    {/* SVG Path */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" style={{ minHeight: '100%' }}>
                        <path
                            d={`M 50% 40 ${Array.from({ length: TOTAL_LEVELS }).map((_, i) => {
                                const y = i * 100 + 40;
                                const nextY = (i + 1) * 100 + 40;
                                const x = 50 + Math.sin(i * 0.8) * 35;
                                const nextX = 50 + Math.sin((i + 1) * 0.8) * 35;
                                return `C ${x} ${y + 50}, ${nextX} ${nextY - 50}, ${nextX} ${nextY}`;
                            }).join(" ")}`}
                            fill="none"
                            stroke="#14b8a6" // Teal
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="16 16"
                        />
                    </svg>

                    {/* Nodes */}
                    {[...Array(TOTAL_LEVELS)].map((_, i) => {
                        const id = i + 1;
                        const isUnlocked = id <= maxReachedLevel;
                        const isCompleted = id < maxReachedLevel;
                        const isCurrent = id === maxReachedLevel;

                        const xPos = 50 + Math.sin(i * 0.8) * 35;
                        const yPos = i * 100;

                        return (
                            <div
                                key={id}
                                className="absolute flex flex-col items-center justify-center transform -translate-x-1/2"
                                style={{ left: `${xPos}%`, top: `${yPos}px` }}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-12 w-14 h-14 z-20 animate-float pointer-events-none">
                                        <img
                                            src={MELIKE_AVATAR}
                                            alt="Melike"
                                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        if (isUnlocked) startLevel(id);
                                    }}
                                    disabled={!isUnlocked}
                                    className={`
                                        relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 z-10
                                        ${isCompleted
                                            ? 'bg-yellow-400 border-4 border-white shadow-md text-white scale-100 ring-4 ring-yellow-200'
                                            : isCurrent
                                                ? 'bg-white border-8 border-teal-400 shadow-xl scale-110'
                                                : isUnlocked
                                                    ? 'bg-white border-4 border-teal-100 shadow-sm'
                                                    : 'bg-gray-100 border-4 border-gray-200 opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    {isCompleted ? <Star fill="white" size={40} /> : !isUnlocked ? <Lock className="text-gray-300" size={24} /> : (
                                        <span className={`text-2xl font-bold ${isCurrent ? 'text-teal-600' : 'text-teal-300'}`}>{id}</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="h-40"></div>

                <Link href="/" className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-8 py-3 rounded-full shadow-xl text-teal-600 font-bold z-50 flex items-center gap-2 border border-teal-50 hover:scale-105 transition">
                    <Home size={20} />
                    Ana Menü
                </Link>
            </div>
        );
    }

    // --- GAME VIEW ---
    return (
        <div className="min-h-screen bg-[#FFFDF0] flex flex-col items-center relative p-4">
            {/* Header */}
            <div className="w-full flex justify-between items-center z-10 mb-6">
                <button
                    onClick={() => setIsPlaying(false)} // Go back to Map
                    className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition"
                >
                    <span className="text-2xl">⬅</span>
                </button>

                <div className="bg-orange-100 px-6 py-2 rounded-full border-2 border-orange-200">
                    <span className="text-orange-800 font-bold">SEVİYE {level}</span>
                </div>
                <button onClick={() => startLevel(level)} className="bg-white p-3 rounded-full shadow-sm">
                    <RefreshCw className="text-gray-600" size={24} />
                </button>
            </div>

            {/* Grid Area */}
            <div className="flex-1 w-full max-w-4xl flex items-center justify-center">
                <div className={clsx(
                    "grid gap-2 md:gap-4 w-full justify-center transition-all duration-500",
                    cards.length <= 4 ? "grid-cols-2 max-w-sm" :
                        cards.length <= 6 ? "grid-cols-2 md:grid-cols-3 max-w-xl" :
                            cards.length <= 8 ? "grid-cols-2 md:grid-cols-4 max-w-2xl" :
                                "grid-cols-3 md:grid-cols-4 max-w-3xl"
                )}>
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            className="relative aspect-[3/4] cursor-pointer group"
                            onClick={() => handleCardClick(idx)}
                            style={{ perspective: '1000px' }}
                        >
                            <motion.div
                                className="w-full h-full relative rounded-2xl shadow-xl"
                                initial={false}
                                animate={{ rotateY: (card.isFlipped || card.isMatched) ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div
                                    className="absolute inset-0 bg-white rounded-2xl border-4 border-indigo-100 flex items-center justify-center overflow-hidden"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                >
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center p-4">
                                        <img src={MELIKE_AVATAR} alt="Back" className="w-full h-full object-cover opacity-80 rounded-full" />
                                    </div>
                                </div>

                                <div
                                    className="absolute inset-0 bg-white rounded-2xl border-4 border-green-200 flex items-center justify-center shadow-inner"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <img src={card.img} alt={card.letter} className="w-3/4 h-3/4 object-contain drop-shadow-md" />
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
