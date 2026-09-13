'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface GameProgressResult {
    levelReached: number;
    totalDuration: number;
    isGameComplete: boolean;
}

/**
 * Faz 1.22 — Harf Avı dışında, ama yine de bir seviye merdiveni olan oyunlar
 * (şu an yalnızca Hafıza Kartları) için hafif bir ilerleme kaydedicisi.
 * `submitLevelResult`'tan (Harf Avı'na özel) farklı olarak Event tablosuna
 * dokunmaz — her denemenin ayrıntılı kaydı artık SkillAttempt'te (Faz 1.20).
 * Bu yalnızca Session.levelReached/totalDuration/completedAt günceller.
 */
const LEVEL_CAPS: Record<string, number> = {
    'memory-match': 24,
};
const DEFAULT_LEVEL_CAP = 100;

export async function advanceGameLevel(
    sessionId: string,
    leveledUp: boolean,
    addedSeconds: number
): Promise<GameProgressResult | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const session = await db.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== user.id) return null;

    if (session.completedAt) {
        return {
            levelReached: session.levelReached,
            totalDuration: session.totalDuration,
            isGameComplete: true,
        };
    }

    const cap = LEVEL_CAPS[session.gameId] ?? DEFAULT_LEVEL_CAP;
    let nextLevel = session.levelReached;
    if (leveledUp) nextLevel += 1;

    let completedAt: Date | null = null;
    if (nextLevel > cap) {
        completedAt = new Date();
        nextLevel = cap; // Görsel üst sınır — merdiven bitince en üst seviyede kalır
    }

    const newTotalDuration = session.totalDuration + Math.max(0, Math.round(addedSeconds));

    await db.session.update({
        where: { id: sessionId },
        data: { levelReached: nextLevel, totalDuration: newTotalDuration, completedAt },
    });

    return {
        levelReached: nextLevel,
        totalDuration: newTotalDuration,
        isGameComplete: !!completedAt,
    };
}
