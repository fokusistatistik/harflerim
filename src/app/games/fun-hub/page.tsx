'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GameHud } from '@/components/game/GameHud';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { Sparkles, Clock } from 'lucide-react';

interface GameItem {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    imageSrc: string;
    accentBg: string;
    accentBorder: string;
    tag: string;
}

const ARCADE_GAMES: GameItem[] = [
    {
        id: 'water-pool',
        title: 'Neşeli Havuz',
        subtitle: 'Sulu Oyun & Yüzen Oyuncaklar',
        href: '/games/fun-hub/water-pool',
        imageSrc: '/karsilastirma/ordek.jpg',
        accentBg: 'bg-papatya-sky/10 hover:bg-papatya-sky/20',
        accentBorder: 'border-papatya-sky/30',
        tag: '🌊 Melike\'nin Havuzu',
    },
    {
        id: 'frog-jump',
        title: 'Neşeli Kurbağa',
        subtitle: 'Nilüfer Zıplama & Ritim',
        href: '/games/fun-hub/frog-jump',
        imageSrc: '/karsilastirma/kurbaga.jpg',
        accentBg: 'bg-papatya-leaf/10 hover:bg-papatya-leaf/20',
        accentBorder: 'border-papatya-leaf/30',
        tag: '🐸 Zıplama',
    },
    {
        id: 'slingshot',
        title: 'Sapanla Papatya',
        subtitle: 'Çek, Fırlat ve Sepeti Bul',
        href: '/games/fun-hub/slingshot',
        imageSrc: '/karsilastirma/top.jpg',
        accentBg: 'bg-papatya-petal/10 hover:bg-papatya-petal/20',
        accentBorder: 'border-papatya-petal/30',
        tag: '🏹 Hedefleme',
    },
    {
        id: 'bubble-pop',
        title: 'Sakin Balonlar',
        subtitle: 'Uçan Balonları Yakala',
        href: '/games/fun-hub/bubble-pop',
        imageSrc: '/karsilastirma/balon.jpg',
        accentBg: 'bg-papatya-rose/10 hover:bg-papatya-rose/20',
        accentBorder: 'border-papatya-rose/30',
        tag: '🎈 Görsel Takip',
    },
];

export default function FunHubPage() {
    const budget = useArcadeDayBudget();

    const remainingMinutes = budget
        ? Math.ceil(budget.remainingArcadeSeconds / 60)
        : 30;

    const isDayComplete = budget?.isArcadeDayComplete ?? false;

    if (isDayComplete) {
        return <ArcadeDayComplete />;
    }

    return (
        <main className="min-h-app flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full select-none">
            {/* Üst HUD */}
            <header className="w-full mb-6">
                <GameHud
                    center={
                        <div className="flex items-center gap-2 bg-papatya-surface/90 backdrop-blur px-4 py-2 rounded-full border border-papatya-ink/10 shadow-sm text-sm md:text-base font-semibold text-papatya-ink">
                            <Clock size={18} className="text-papatya-leaf" />
                            <span>Kalan Oyun Süresi: {remainingMinutes} dk</span>
                        </div>
                    }
                />
            </header>

            {/* Başlık Bölümü */}
            <section className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-papatya-petal/20 text-papatya-ink text-sm font-semibold mb-2">
                    <Sparkles size={16} className="text-papatya-petal" />
                    <span>Eğlenceli Oyunlar</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-hand font-bold text-papatya-ink">
                    Oyun Dünyası
                </h1>
                <p className="text-papatya-ink/70 mt-1 text-base md:text-lg">
                    Hadi oynamak istediğin oyunu seç!
                </p>
            </section>

            {/* 4 Oyun Izgarası */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full flex-1">
                {ARCADE_GAMES.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            href={game.href}
                            className={`group flex items-center gap-4 p-5 rounded-3xl border-2 ${game.accentBorder} ${game.accentBg} bg-papatya-surface shadow-sm hover:shadow-md transition-all h-full`}
                        >
                            {/* Oyun Görseli */}
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/80 shadow-inner flex-shrink-0 flex items-center justify-center p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={game.imageSrc}
                                    alt={game.title}
                                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        // Fallback if image fails
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                            </div>

                            {/* Metin ve Etiket */}
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <span className="text-xs font-bold text-papatya-ink/60 uppercase tracking-wider mb-1">
                                    {game.tag}
                                </span>
                                <h2 className="text-2xl font-hand font-bold text-papatya-ink truncate group-hover:text-papatya-petal transition-colors">
                                    {game.title}
                                </h2>
                                <p className="text-sm text-papatya-ink/70 line-clamp-2 mt-1">
                                    {game.subtitle}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
