'use client';

import { useState } from 'react';
import { GameHud } from '@/components/game/GameHud';
import { useAudio } from '@/components/AudioProvider';
import { AAC_CATEGORIES, type AacSymbol } from '@/store/aacData';
import { GameIntroCard } from '@/components/ui/GameIntroCard';

/**
 * Faz 3.7 — İletişim Tahtası. Tek dokunuş → seslendirme (bkz. YOL-HARITASI.md
 * 3.7 — "tahmin oyunu olmadan"). Kasıtlı olarak bir OYUN DEĞİL: doğru/yanlış
 * yok, SkillAttempt'e hiç yazılmaz, günlük ekran süresi bütçesine (diğer tüm
 * oyunların aksine) KATKI YAPMAZ — bu bir iletişim aracı, ebeveyn "gün bitti"
 * ekranı çocuğun ihtiyacını ifade etme yeteneğini kilitlememeli (bilinçli
 * ürün kararı, 2026-09-13).
 */
export function AacBoard() {
    const { speak } = useAudio();
    const [activeWord, setActiveWord] = useState<string | null>(null);

    const handleTap = (symbol: AacSymbol) => {
        setActiveWord(symbol.word);
        speak(symbol.word).finally(() => {
            setActiveWord((current) => (current === symbol.word ? null : current));
        });
    };

    return (
        <div className="min-h-app bg-papatya-cream p-4 flex flex-col gap-4 pt-20">
            <GameHud />

            <h1 className="text-p-2xl font-bold text-center text-papatya-ink">İletişim Tahtası</h1>
            <p className="text-center text-papatya-ink-soft">Söylemek istediğin bir simgeye dokun</p>
            <div className="flex justify-center">
                <GameIntroCard gameId="aac-board" variant="banner" />
            </div>

            <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
                {AAC_CATEGORIES.map((category) => (
                    <section key={category.id} className="flex flex-col gap-3">
                        <h2 className="text-p-lg font-bold text-papatya-leaf">{category.label}</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {category.symbols.map((symbol) => (
                                <button
                                    key={symbol.arasaacId}
                                    type="button"
                                    onClick={() => handleTap(symbol)}
                                    className={`flex flex-col items-center gap-2 bg-papatya-surface rounded-p-lg p-3 shadow-sm min-h-tap min-w-tap transition-transform
                                        ${activeWord === symbol.word ? 'scale-95 ring-4 ring-papatya-petal' : 'hover:scale-105'}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={symbol.imageUrl}
                                        alt={symbol.word}
                                        className="w-full aspect-square object-contain"
                                    />
                                    <span className="text-p-sm font-bold text-papatya-ink text-center">{symbol.word}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <p className="text-center text-xs text-papatya-ink-soft/70 mt-4">
                İletişim tahtası simgeleri ARASAAC (arasaac.org) tarafından CC BY-NC-SA 4.0 lisansıyla sağlanmıştır.
            </p>
        </div>
    );
}
