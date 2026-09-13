'use server';

import { db } from '@/lib/db';
import { getChildProfile } from '@/actions/childProfile';

export interface ComparisonPairData {
    id: string;
    name: string;
    imageUrl: string;
}

function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * 2026-09-13 — Hafıza Kartları'nın harf-bağımsız "Nesneler" modu için:
 * `ComparisonItem` (88 gerçek fotoğrafik nesne, bkz. prisma/seedComparisonItems.ts)
 * havuzundan çocuğun kayıtlı ilgi alanlarına (ChildProfileTab → interests,
 * ör. "kedi, gezegenler") göre AĞIRLIKLANDIRILMIŞ rastgele bir seçim yapar.
 * Ağırlıklandırma basit ve şeffaf: ilgi alanı eşleşen nesneler önce
 * karıştırılıp önce alınır, yetmezse geri kalan havuzdan tamamlanır —
 * kesirli bir olasılık skoru yerine kasıtlı olarak "önce eşleşenler" deseni
 * (anlaşılması/test edilmesi daha kolay, sonucu daha öngörülebilir).
 */
export async function getComparisonPairsPool(pairCount: number): Promise<ComparisonPairData[]> {
    const count = Math.max(1, Math.min(12, Math.round(pairCount)));

    const [items, profile] = await Promise.all([
        db.comparisonItem.findMany({ where: { isActive: true } }),
        getChildProfile(),
    ]);

    if (items.length === 0) return [];

    const interests = (profile?.interests ?? [])
        .map((i) => i.trim().toLocaleLowerCase('tr'))
        .filter(Boolean);

    const matchesInterest = (item: (typeof items)[number]) => {
        if (interests.length === 0) return false;
        const haystack = `${item.name} ${item.category} ${item.tags}`.toLocaleLowerCase('tr');
        return interests.some((interest) => haystack.includes(interest));
    };

    const matched = shuffle(items.filter(matchesInterest));
    const unmatched = shuffle(items.filter((item) => !matchesInterest(item)));

    const selected = [...matched, ...unmatched].slice(0, count);

    return selected.map((item) => ({ id: item.id, name: item.name, imageUrl: item.imageUrl }));
}
