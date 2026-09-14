'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AUDIOS } from '@/store/gameData';
import useSound from 'use-sound';
import { LayoutGrid, Sparkles, User } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import clsx from 'clsx';
import { useAudio } from '@/components/AudioProvider';
import { useNotificationStore } from '@/store/notificationStore';
import { useGameContent } from '@/hooks/useGameContent';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { recordSkillAttempt } from '@/actions/skills';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { getDailySession } from '@/actions/game';
import { submitMemoryRoundResult, getAdaptiveMemoryRoundConfig } from '@/actions/gameProgress';
import { getComparisonPairsPool } from '@/actions/comparisonPairs';
import { GameHud } from './GameHud';

type Mode = 'harf' | 'nesne';

interface Card {
    id: string; // unique (kart örneği kimliği, çiftin iki üyesi için farklı)
    matchKey: string; // eşleşme kontrolü buradan yapılır — harf modda harf, nesne modda ComparisonItem.id
    label: string; // erişilebilirlik/alt metni — harf modda harf, nesne modda nesne adı
    img: string;
    isFlipped: boolean;
    isMatched: boolean;
}

/**
 * 2026-09-13 — kullanıcı kararıyla iki büyük değişiklik:
 * (1) Sabit 24-seviyeli kilitli harita KALDIRILDI — Harf Avı'nın Faz 3.2'de
 *     benimsediği "sonsuz + uyarlanabilir zorluk" ilkesiyle tutarlı olarak
 *     artık `getAdaptiveMemoryRoundConfig()` her round'un çift sayısını son
 *     performansa göre belirliyor, oyun hiç "bitmiyor" (günlük süre bütçesi
 *     içinde sınırsız).
 * (2) Harf havuzu (mevcut ContentItem/harf-nesne eşleştirmesi) AYNEN kalıyor
 *     — yeni eklenen "Nesneler" modu ayrı, harf-bağımsız, doğrudan görsel
 *     eşleştirme (ComparisonItem havuzu, çocuğun ilgi alanlarına göre
 *     ağırlıklandırılmış — bkz. src/actions/comparisonPairs.ts). İki mod
 *     birbirine karışmaz, kullanıcı her round başında hangisini oynayacağını
 *     seçer.
 */
export default function MemoryMatchGame() {
    const checkCalmingMode = useCalmingModeMonitor('gorsel-hafiza'); // Faz 3.2b

    const [mode, setMode] = useState<Mode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [roundsCompleted, setRoundsCompleted] = useState(0);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [roundStartTime, setRoundStartTime] = useState<number>(0);

    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const { celebrateSuccess, encourageRetry } = useAudio();
    const pushToast = useNotificationStore((s) => s.pushToast);
    const { data: content } = useGameContent();
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const triggerReward = useRewardMoment();

    const [playFlip] = useSound('https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3', { volume: 0.5 });
    const [playMatch] = useSound(AUDIOS.correct, { volume: 0.5 });

    React.useEffect(() => {
        let cancelled = false;
        getDailySession('memory-match').then((state) => {
            if (!cancelled) setSessionId(state.sessionId);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const buildLetterDeck = (pairCount: number): Card[] | null => {
        if (!content) return null;
        const availableLetters = Object.keys(content.letterImages);
        availableLetters.sort(() => Math.random() - 0.5);
        const selectedLetters = availableLetters.slice(0, pairCount);

        const deck: Card[] = [];
        selectedLetters.forEach((letter) => {
            const img = content.letterImages[letter];
            deck.push({ id: `${letter}-1`, matchKey: letter, label: letter, img, isFlipped: false, isMatched: false });
            deck.push({ id: `${letter}-2`, matchKey: letter, label: letter, img, isFlipped: false, isMatched: false });
        });
        return deck;
    };

    const buildObjectDeck = async (pairCount: number): Promise<Card[]> => {
        const pool = await getComparisonPairsPool(pairCount);
        const deck: Card[] = [];
        pool.forEach((item) => {
            deck.push({ id: `${item.id}-1`, matchKey: item.id, label: item.name, img: item.imageUrl, isFlipped: false, isMatched: false });
            deck.push({ id: `${item.id}-2`, matchKey: item.id, label: item.name, img: item.imageUrl, isFlipped: false, isMatched: false });
        });
        return deck;
    };

    const startRound = async (roundMode: Mode) => {
        if (dayBudget?.isDayComplete) return;

        const { pairCount } = await getAdaptiveMemoryRoundConfig();
        const deck = roundMode === 'harf' ? buildLetterDeck(pairCount) : await buildObjectDeck(pairCount);
        if (!deck || deck.length === 0) return;

        deck.sort(() => Math.random() - 0.5);

        setCards(deck);
        setFlippedIndices([]);
        setIsProcessing(false);
        setMode(roundMode);
        setIsPlaying(true);
        setRoundStartTime(Date.now());
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

            const isMatch = card1.matchKey === card2.matchKey;
            // Faz 1.20 — ölçüm katmanı, oyun akışını asla bloklamaz/bozmaz.
            recordSkillAttempt('gorsel-hafiza', 'memory-match', isMatch).catch(() => {});
            checkCalmingMode(isMatch);

            if (isMatch) {
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
        if (!currentCards.every((c) => c.isMatched)) return;

        triggerReward({ message: 'Harika eşleştirme!' });

        setTimeout(async () => {
            const elapsedSeconds = Math.max(1, Math.round((Date.now() - roundStartTime) / 1000));
            const pairCount = currentCards.length / 2;

            if (sessionId) {
                await submitMemoryRoundResult(sessionId, pairCount, elapsedSeconds);
            }
            setRoundsCompleted((r) => r + 1);

            if (mode) startRound(mode);
        }, 1500);
    };

    if (!content) {
        return <div className="flex h-screen items-center justify-center text-papatya-leaf">Yükleniyor...</div>;
    }

    // --- MOD SEÇİMİ ---
    if (!isPlaying) {
        return (
            <div className="min-h-app bg-gradient-to-b from-papatya-sky/10 to-papatya-petal/10 flex flex-col items-center justify-center p-4 pb-28 gap-8">
                <h1 className="text-3xl md:text-5xl font-hand font-bold text-papatya-leaf text-center">Hafıza Kartları</h1>
                <p className="text-papatya-ink-soft text-center max-w-md">Nasıl eşleştirmek istersin?</p>
                <GameIntroCard gameId="memory-match" />

                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                    <button
                        type="button"
                        onClick={() => startRound('harf')}
                        className="flex-1 flex flex-col items-center gap-3 bg-papatya-surface border-4 border-papatya-sky/30 hover:border-papatya-sky rounded-p-lg p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <div className="bg-papatya-sky/15 text-papatya-sky p-4 rounded-full">
                            <LayoutGrid size={40} strokeWidth={2} />
                        </div>
                        <span className="text-xl font-bold text-papatya-ink">Harflerle</span>
                        <span className="text-p-sm text-papatya-ink-soft text-center">Harf ve kelime kartlarını eşleştir</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => startRound('nesne')}
                        className="flex-1 flex flex-col items-center gap-3 bg-papatya-surface border-4 border-papatya-leaf/30 hover:border-papatya-leaf rounded-p-lg p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <div className="bg-papatya-leaf/15 text-papatya-leaf p-4 rounded-full">
                            <Sparkles size={40} strokeWidth={2} />
                        </div>
                        <span className="text-xl font-bold text-papatya-ink">Nesnelerle</span>
                        <span className="text-p-sm text-papatya-ink-soft text-center">Gerçek nesne fotoğraflarını eşleştir</span>
                    </button>
                </div>

                <Link href="/" className="fixed bottom-8 left-1/2 -translate-x-1/2 min-h-tap bg-papatya-surface px-8 py-3 rounded-full shadow-xl text-papatya-leaf font-bold z-50 flex items-center gap-2 border border-papatya-rule hover:scale-105 transition">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ikonlar/home.png" alt="" className="w-5 h-5" />
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    // --- OYUN GÖRÜNÜMÜ ---
    return (
        <div className="min-h-app bg-papatya-cream flex flex-col items-center relative p-4 lg:p-8">
            <div className="w-full z-10 mb-6 lg:mb-8">
                <GameHud
                    onBack={() => setIsPlaying(false)}
                    center={
                        <div className="bg-papatya-petal/15 px-6 py-2 lg:px-8 lg:py-3 rounded-full border-2 border-papatya-petal/40">
                            <span className="text-papatya-petal-deep font-bold lg:text-lg">Tur {roundsCompleted + 1}</span>
                        </div>
                    }
                />
            </div>

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
                            className="relative aspect-square cursor-pointer group min-w-tap min-h-tap"
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
                                        <User className="text-papatya-sky opacity-60" size={32} />
                                    </div>
                                </div>

                                <div
                                    className="absolute inset-0 bg-papatya-surface rounded-2xl border-4 border-papatya-leaf/30 flex items-center justify-center shadow-inner"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <ImageWithFallback
                                        src={card.img}
                                        alt={card.label}
                                        className="w-3/4 h-3/4 object-contain drop-shadow-md"
                                        fallback={<span className="text-p-sm text-papatya-ink-soft text-center px-2">{card.label}</span>}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
