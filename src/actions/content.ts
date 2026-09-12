'use server';

import { db } from '@/lib/db';

export interface GameContent {
    alphabetOrder: string[];
    letterObjects: Record<string, { word: string; img: string }[]>;
    letterImages: Record<string, string>;
}

/**
 * Faz 1.4 — `gameData.ts`'teki statik içeriğin veritabanı karşılığı.
 * Üç oyun da (Harf Avı, Hafıza Kartları, Sihirli Kelimeler) bu tek
 * kaynaktan beslenir. Yeni bir kelime eklemek artık kod değişikliği değil,
 * bu tablolara veri girişi (bkz. prisma/seedContent.ts).
 */
export async function getGameContent(): Promise<GameContent> {
    const sets = await db.contentSet.findMany({
        orderBy: { order: 'asc' },
        include: { items: { orderBy: { order: 'asc' } } },
    });

    const alphabetOrder: string[] = [];
    const letterObjects: Record<string, { word: string; img: string }[]> = {};
    const letterImages: Record<string, string> = {};

    for (const set of sets) {
        alphabetOrder.push(set.letter);
        letterImages[set.letter] = set.imageUrl;
        letterObjects[set.letter] = set.items.map((item) => ({ word: item.word, img: item.imageUrl }));
    }

    return { alphabetOrder, letterObjects, letterImages };
}
