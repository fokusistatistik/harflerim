'use client';

import { useEffect, useState } from 'react';
import { getGameContent, type GameContent } from '@/actions/content';

/**
 * Faz 1.4 — oyun içeriğini (harf/kelime/görsel) veritabanından çeker.
 * Üç oyun bileşeni de (client component oldukları için) bunu mount
 * sırasında bir kez çağırır; `data` gelene kadar `null` döner.
 */
export function useGameContent(): { data: GameContent | null; isLoading: boolean } {
    const [data, setData] = useState<GameContent | null>(null);

    useEffect(() => {
        let cancelled = false;
        getGameContent().then((content) => {
            if (!cancelled) setData(content);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return { data, isLoading: data === null };
}
