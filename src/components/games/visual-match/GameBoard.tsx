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
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { recordSkillAttempt } from '@/actions/skills';
import { getVisualMatchDailyState, getVisualMatchRoundPool, type VisualMatchCard } from '@/actions/visualMatch';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { useAudio } from '@/components/AudioProvider';
import { GameHud } from '@/components/game/GameHud';
import { GameIntroCard } from '@/components/ui/GameIntroCard';

/**
 * Renkli fotoğrafı düz renkli bir siluete çeviren SVG filtresi — ayrı bir
 * siluet görseli üretmeden mevcut ComparisonItem fotoğraflarını kullanır.
 * Önceki iki deneme başarısızdı: (1) `brightness(0)` + basit filtre
 * kombinasyonu nesnenin KENDİ renginden bağımsız değildi (koyu nesnelerde
 * arka planla birleşip düz siyah blok, açık nesnelerde siluet hiç belli
 * olmuyordu); (2) `mask-image`/`mask-mode: luminance` JPEG'lerde tarayıcı
 * bazında güvenilmez çalıştı (görsel maskelenmeden renkli kaldı). Kesin
 * çözüm: standart bir SVG `<filter>` — `feColorMatrix` ile gri tonlamaya
 * çevirip `feComponentTransfer`/`feFuncA` ile bir eşik (threshold)
 * uyguluyor: luminance %70'in altındaki her piksel tam opak koyu siluet,
 * üstündeki (fotoğrafın açık zemini) şeffaf oluyor — ilk denemedeki %50
 * eşik bazı fotoğraflarda (orta tonlu nesneler) siluetin neredeyse
 * kaybolmasına yol açıyordu, %70'e çekilince tutarlı hale geldi. SVG
 * filtreleri tüm modern tarayıcılarda tutarlı çalışır, nesnenin rengi ne
 * olursa olsun aynı sonucu verir.
 */
function SilhouetteFilterDefs() {
    return (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <filter id="visual-match-silhouette">
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.299 0.587 0.114 0 0" result="luminance" />
                <feComponentTransfer in="luminance" result="alphaMask">
                    <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 0 0 0" />
                </feComponentTransfer>
                <feFlood floodColor="rgb(var(--papatya-ink-soft))" result="fillColor" />
                <feComposite in="fillColor" in2="alphaMask" operator="in" />
            </filter>
        </svg>
    );
}

const SILHOUETTE_STYLE: React.CSSProperties = { filter: 'url(#visual-match-silhouette)' };

export function GameBoard() {
    const [playSuccess] = useSound('/sounds/success.wav', { volume: 0.5 });
    const [playPop] = useSound('/sounds/pop.wav', { volume: 0.25 });
    const { encourageRetry } = useAudio();
    const dayBudget = useGameDayBudget(); // Faz 1.8: bu oyun da global süre bütçesine katkı yapar
    const checkCalmingMode = useCalmingModeMonitor('golge-eslestirme'); // Faz 3.2b
    const prefersReducedMotion = useReducedMotion();

    const [target, setTarget] = useState<VisualMatchCard | null>(null);
    const [cards, setCards] = useState<VisualMatchCard[]>([]);
    const previousTargetIdRef = useRef<string | null>(null);
    const [isMatched, setIsMatched] = useState(false);
    const [activeCard, setActiveCard] = useState<VisualMatchCard | null>(null);
    const [shakeToken, setShakeToken] = useState(0);
    const [dailyLimit, setDailyLimit] = useState<{ roundsPlayedToday: number; dailyVisualMatchLimit: number; isVisualMatchLimitReached: boolean } | null>(null);
    const [loaded, setLoaded] = useState(false);

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
        if (state?.isVisualMatchLimitReached) {
            setLoaded(true);
            return;
        }

        const cardCount = 1 + (state?.distractorCount ?? 0);
        // Havuzdan bir round'luk kartı çek — ardışık aynı hedef gelmesin diye
        // gerekirse bir kez daha çekilir (Harf Avı'ndaki kesin korumanın aynısı).
        let pool = await getVisualMatchRoundPool(cardCount).catch(() => []);
        for (let attempt = 0; attempt < 3 && pool[0]?.id === previousTargetIdRef.current && pool.length > 0; attempt++) {
            pool = await getVisualMatchRoundPool(cardCount).catch(() => []);
        }

        if (pool.length === 0) {
            setLoaded(true);
            return;
        }

        const newTarget = pool[0];
        previousTargetIdRef.current = newTarget.id;
        setTarget(newTarget);
        setCards([...pool].sort(() => Math.random() - 0.5));
        setIsMatched(false);
        setShakeToken(0);
        setLoaded(true);
    }, []);

    useEffect(() => {
        startNewLevel();
    }, [startNewLevel]);

    const handleDragStart = (event: DragStartEvent) => {
        if (dayBudget?.isDayComplete || dailyLimit?.isVisualMatchLimitReached) return;
        const card = cards.find((c) => c.id === event.active.id) ?? null;
        setActiveCard(card);
        playPop();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveCard(null);
        if (dayBudget?.isDayComplete || dailyLimit?.isVisualMatchLimitReached) return;
        const { over, active } = event;
        const isCorrectCard = target && active.id === target.id;

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
            <SilhouetteFilterDefs />

            {/* Success Confetti — reduceMotion açıkken hiç gösterilmez (Faz 2.11 denetimi) */}
            {isMatched && !prefersReducedMotion && (
                <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={80} colors={['#E8B33C', '#5F7A52', '#6B87A8', '#C4756A']} />
            )}

            {/* Header / Nav — Faz 1.8: paylaşılan GameHud, Harf Avı'ndaki desenin aynısı (normal akışta, absolute değil) */}
            <div className="w-full p-4 lg:p-8 pb-0 shrink-0">
                <GameHud
                    center={
                        dailyLimit && !isLimitReached ? (
                            <div className="bg-papatya-petal/15 px-6 py-2 lg:px-8 lg:py-3 rounded-full border-2 border-papatya-petal/40">
                                <span className="text-papatya-petal-deep font-bold text-p-sm lg:text-p-base whitespace-nowrap">
                                    Bugün {dailyLimit.roundsPlayedToday}/{dailyLimit.dailyVisualMatchLimit}
                                </span>
                            </div>
                        ) : undefined
                    }
                    right={<GameIntroCard gameId="visual-match" variant="tooltip" />}
                />
            </div>

            {!loaded ? (
                <p className="flex-1 flex items-center justify-center text-p-base text-papatya-ink-soft">Yükleniyor...</p>
            ) : isLimitReached ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 text-center">
                    <p className="text-p-lg font-bold text-papatya-ink">Bugünkü {dailyLimit?.dailyVisualMatchLimit} turluk hakkın doldu</p>
                    <p className="text-p-base text-papatya-ink-soft">Yarın devam edebilirsin!</p>
                </div>
            ) : !target ? (
                <p className="flex-1 flex items-center justify-center text-p-base text-papatya-ink-soft text-center px-4">
                    Şu an gösterilecek nesne bulunamadı.
                </p>
            ) : (
                <DndContext
                    id="visual-match-dnd"
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToWindowEdges]}
                >
                    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 xl:gap-20 w-full">
                            {/* Target Zone (Silhouette) — masaüstünde solda */}
                            <div className="relative shrink-0">
                                <Droppable id="target-zone" isMatched={isMatched}>
                                    <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 flex items-center justify-center p-6 select-none bg-papatya-cream rounded-3xl">
                                        <ImageWithFallback
                                            src={target.imageUrl}
                                            alt={`${target.name} gölgesi`}
                                            className="w-full h-full object-contain"
                                            fallback={<span className="text-p-lg font-bold text-papatya-ink-soft">{target.name}</span>}
                                            style={SILHOUETTE_STYLE}
                                        />
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

                            {/* Draggable nesne kartları — masaüstünde sağda, en az 3 alternatif (Faz 2.11 adaptif zorluk) */}
                            {!isMatched && (
                                <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 lg:max-w-md xl:max-w-lg">
                                    {cards.map((card) => (
                                        <motion.div
                                            key={card.id}
                                            animate={shakeToken > 0 && card.id !== target.id ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <Draggable id={card.id} label={`${card.name}, sürüklenebilir`} disabled={dayBudget?.isDayComplete}>
                                                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-36 lg:h-36 xl:w-44 xl:h-44 bg-papatya-surface rounded-3xl flex items-center justify-center p-3 shadow-xl cursor-grab active:cursor-grabbing border-4 border-white select-none overflow-hidden">
                                                    <ImageWithFallback
                                                        src={card.imageUrl}
                                                        alt={card.name}
                                                        className="w-full h-full object-cover rounded-2xl"
                                                        fallback={<span className="text-p-base font-bold text-papatya-ink text-center px-2">{card.name}</span>}
                                                    />
                                                </div>
                                            </Draggable>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drag Overlay (What follows the cursor) */}
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeCard ? (
                            <div className="w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 xl:w-64 xl:h-64 bg-papatya-surface rounded-3xl flex items-center justify-center p-3 shadow-2xl opacity-90 border-4 border-white select-none scale-110 rotate-3 overflow-hidden">
                                <ImageWithFallback
                                    src={activeCard.imageUrl}
                                    alt={activeCard.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                    fallback={<span className="text-p-base font-bold text-papatya-ink text-center px-2">{activeCard.name}</span>}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}
