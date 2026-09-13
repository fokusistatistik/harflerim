'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface TodayActivity {
    id: string;
    label: string;
    done: boolean;
}

const SKILL_ATTEMPT_GAME_IDS = [
    { gameId: 'letter-hunt', label: 'Harf Avı' },
    { gameId: 'memory-match', label: 'Hafıza Kartları' },
    { gameId: 'magic-words', label: 'Sihirli Kelimeler' },
    { gameId: 'visual-match', label: 'Gölge Eşleştirme' },
    { gameId: 'family-album', label: 'Aile Albümü' },
    { gameId: 'writing-practice', label: 'Yazı Alıştırması' },
];

function todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Faz 2.8 — günlük rutin özeti. Sekiz yapraklı papatya metaforuyla
 * (Faz 1.9) bilerek örtüşen sekiz sabit etkinlik — her gün aynı liste,
 * yalnızca "yapıldı/yapılmadı" durumu değişir. Puan/sıralama/seri yok
 * (anti-bağımlılık ilkesi); bu yalnızca sakin bir "bugün ne yaptım" özeti.
 */
export async function getTodaySummary(): Promise<TodayActivity[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const { start, end } = todayRange();
    const date = todayString();

    const [attemptRows, songPlays, drawingCount] = await Promise.all([
        db.skillAttempt.findMany({
            where: { userId: user.id, createdAt: { gte: start, lt: end } },
            select: { gameId: true },
            distinct: ['gameId'],
        }),
        db.songPlayCount.findFirst({
            where: { date, playCount: { gt: 0 }, song: { userId: user.id } },
        }),
        db.drawing.count({
            where: { userId: user.id, createdAt: { gte: start, lt: end } },
        }),
    ]);

    const playedGameIds = new Set(attemptRows.map((a) => a.gameId));

    const activities: TodayActivity[] = SKILL_ATTEMPT_GAME_IDS.map(({ gameId, label }) => ({
        id: gameId,
        label,
        done: playedGameIds.has(gameId),
    }));

    activities.push({ id: 'muzik', label: 'Müzik Köşesi', done: !!songPlays });
    activities.push({ id: 'cizim', label: 'Çizim Tahtası', done: drawingCount > 0 });

    return activities;
}
