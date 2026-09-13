'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AUDIOS } from '@/store/gameData';
import useSound from 'use-sound';
import Link from 'next/link';
import { Home, RefreshCw, Trophy, Lock, Star } from 'lucide-react';
import clsx from 'clsx';
import { useAudio } from '@/components/AudioProvider';
import { useNotificationStore } from '@/store/notificationStore';
import { useGameContent } from '@/hooks/useGameContent';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { GameHud } from './GameHud';
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
    const { data: content } = useGameContent();
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const triggerReward = useRewardMoment();

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
        if (!content) return; // İçerik henüz veritabanından gelmedi (Faz 1.4)
        if (dayBudget?.isDayComplete) return; // Faz 1.8/1.10: günlük süre bütçesi doldu

        // Difficulty Logic:
        // Lvl 1-3: 6 cards (3 pairs)
        // Lvl 4-8: 8 cards (4 pairs)
        // Lvl 9-15: 12 cards (6 pairs)
        // Lvl 16-24: 16 cards (8 pairs)

        let pairCount = 3;
        if (lvl > 3) pairCount = 4;
        if (lvl > 8) pairCount = 6;
        if (lvl > 15) pairCount = 8;

        const availableLetters = Object.keys(content.letterImages);
        // Shuffle available letters
        availableLetters.sort(() => Math.random() - 0.5);

        const selectedLetters = availableLetters.slice(0, pairCount);

        // Create Pairs
        let deck: Card[] = [];
        selectedLetters.forEach(letter => {
            const img = content.letterImages[letter];
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
            // Level Complete — Faz 1.8: paylaşılan ödül anı (papatya renkli konfeti)
            triggerReward({ message: 'Seviye tamamlandı!' });

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

    // Helper for Map Colors — Faz 1.6/1.9 papatya paletine dayalı ışık geçişleri
    const getPhaseStyle = () => {
        if (level <= 6) return "bg-gradient-to-b from-papatya-sky/10 to-papatya-petal/10";
        if (level <= 12) return "bg-gradient-to-b from-papatya-sky/15 to-papatya-leaf/10";
        if (level <= 18) return "bg-gradient-to-b from-papatya-petal/10 to-papatya-rose/10";
        return "bg-gradient-to-b from-papatya-rose/10 to-papatya-sky/15";
    };

    if (!content) {
        return <div className="flex h-screen items-center justify-center text-papatya-leaf">Yükleniyor...</div>;
    }

    if (gameCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-papatya-leaf to-papatya-sky flex flex-col items-center justify-center p-4 text-white">
                <div className="bg-papatya-surface p-8 lg:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm lg:max-w-md w-full text-center">
                    <Trophy size={80} className="text-papatya-petal-deep mb-4" />
                    <h1 className="text-4xl lg:text-5xl font-hand font-bold mb-2 text-papatya-ink">Tebrikler!</h1>
                    <p className="text-papatya-ink-soft mb-8">Hafızan harika! Bütün levelleri bitirdin.</p>
                    <Link href="/" className="w-full min-h-tap bg-papatya-leaf text-white py-4 rounded-full font-bold shadow-lg hover:opacity-90 transition">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    // --- MAP VIEW ---
    if (!isPlaying) {
        return (
            <div className={`min-h-screen ${getPhaseStyle()} transition-colors duration-1000 flex flex-col items-center p-4 pt-24 lg:pt-32 overflow-x-hidden`}>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-hand font-bold text-papatya-leaf mb-2 text-center bg-papatya-surface/60 px-8 py-2 lg:px-10 lg:py-3 rounded-full backdrop-blur-sm shadow-sm border border-papatya-surface/50">
                    Bugünün Macerası
                </h1>
                <p className="text-papatya-ink-soft mb-12 font-medium">Kartları Eşleştir, Yolu Tamamla!</p>

                {/* Vertical Winding Map Container */}
                <div className="relative w-full max-w-md lg:max-w-lg pb-32">
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
                            stroke="rgb(95 122 82)" // papatya-leaf
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="16 16"
                        />
                    </svg>

                    {/* Nodes */}
                    {[...Array(TOTAL_LEVELS)].map((_, i) => {
                        const id = i + 1;
                        const isUnlocked = id <= maxReachedLevel && !dayBudget?.isDayComplete;
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
                                        relative w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 z-10
                                        ${isCompleted
                                            ? 'bg-papatya-petal border-4 border-white shadow-md text-white scale-100 ring-4 ring-papatya-petal/30'
                                            : isCurrent
                                                ? 'bg-papatya-surface border-8 border-papatya-leaf shadow-xl scale-110'
                                                : isUnlocked
                                                    ? 'bg-papatya-surface border-4 border-papatya-leaf/20 shadow-sm'
                                                    : 'bg-papatya-rule/40 border-4 border-papatya-rule opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    {isCompleted ? <Star fill="white" size={40} /> : !isUnlocked ? <Lock className="text-papatya-ink-soft" size={24} /> : (
                                        <span className={`text-2xl lg:text-3xl font-bold ${isCurrent ? 'text-papatya-leaf' : 'text-papatya-leaf/50'}`}>{id}</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="h-40"></div>

                <Link href="/" className="fixed bottom-8 left-1/2 -translate-x-1/2 min-h-tap bg-papatya-surface px-8 py-3 rounded-full shadow-xl text-papatya-leaf font-bold z-50 flex items-center gap-2 border border-papatya-rule hover:scale-105 transition">
                    <Home size={20} />
                    Ana Menü
                </Link>
            </div>
        );
    }

    // --- GAME VIEW ---
    return (
        <div className="min-h-screen bg-papatya-cream flex flex-col items-center relative p-4 lg:p-8">
            {/* Header — Faz 1.8: paylaşılan GameHud */}
            <div className="w-full z-10 mb-6 lg:mb-8">
                <GameHud
                    onBack={() => setIsPlaying(false)}
                    center={
                        <div className="bg-papatya-petal/15 px-6 py-2 lg:px-8 lg:py-3 rounded-full border-2 border-papatya-petal/40">
                            <span className="text-papatya-petal-deep font-bold lg:text-lg">SEVİYE {level}</span>
                        </div>
                    }
                    right={
                        <button
                            onClick={() => startLevel(level)}
                            className="min-w-tap min-h-tap flex items-center justify-center bg-papatya-surface p-3 rounded-full shadow-sm hover:shadow-md transition-all"
                            aria-label="Seviyeyi yenile"
                        >
                            <RefreshCw className="text-papatya-ink-soft" size={24} />
                        </button>
                    }
                />
            </div>

            {/* Grid Area */}
            <div className="flex-1 w-full max-w-4xl xl:max-w-5xl flex items-center justify-center">
                <div className={clsx(
                    "grid gap-2 md:gap-4 lg:gap-6 w-full justify-center transition-all duration-500",
                    cards.length <= 4 ? "grid-cols-2 max-w-sm lg:max-w-md" :
                        cards.length <= 6 ? "grid-cols-2 md:grid-cols-3 max-w-xl lg:max-w-2xl" :
                            cards.length <= 8 ? "grid-cols-2 md:grid-cols-4 max-w-2xl lg:max-w-3xl" :
                                "grid-cols-3 md:grid-cols-4 max-w-3xl lg:max-w-4xl"
                )}>
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            className="relative aspect-[3/4] cursor-pointer group min-w-tap min-h-tap"
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
                                    className="absolute inset-0 bg-papatya-surface rounded-2xl border-4 border-papatya-sky/30 flex items-center justify-center overflow-hidden"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                >
                                    <div className="w-full h-full bg-papatya-sky/10 flex items-center justify-center p-4">
                                        <img src={MELIKE_AVATAR} alt="Back" className="w-full h-full object-cover opacity-80 rounded-full" />
                                    </div>
                                </div>

                                <div
                                    className="absolute inset-0 bg-papatya-surface rounded-2xl border-4 border-papatya-leaf/30 flex items-center justify-center shadow-inner"
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
