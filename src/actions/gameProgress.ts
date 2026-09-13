'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addDailyUsageSeconds } from '@/lib/dailyUsage';
import { getAdaptiveMemoryConfig, BASE_MEMORY_ADAPTIVE_CONFIG, type MemoryAdaptiveConfig } from '@/lib/adaptiveDifficulty';

export interface MemoryRoundResult {
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
}

/**
 * 2026-09-13 — Hafıza Kartları artık Harf Avı'yla aynı ilkeyi izliyor
 * (bkz. src/actions/game.ts'teki submitLevelResult'ın doc-comment'i):
 * sabit bir seviye merdiveni/kilit YOK, oyun "bitmez" — günlük süre
 * bütçesi içinde sınırsız devam eder. Bu fonksiyon artık bir "seviye
 * ilerletme kapısı" değil, yalnızca Session süresini günceller.
 * `Session.levelReached` o round'un çift sayısını (pairCount) bir
 * analitik alan olarak saklamaya devam eder — eski "seviye" anlamı yok.
 * Önceki `advanceGameLevel`/`LEVEL_CAPS` (24 sabit seviye) kaldırıldı.
 */
export async function submitMemoryRoundResult(
    sessionId: string,
    pairCount: number,
    addedSeconds: number
): Promise<MemoryRoundResult | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const session = await db.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== user.id) return null;

    const dailyUsage = await addDailyUsageSeconds(user.id, Math.max(0, Math.round(addedSeconds)));
    const newTotalDuration = session.totalDuration + Math.max(0, Math.round(addedSeconds));

    await db.session.update({
        where: { id: sessionId },
        data: { levelReached: pairCount, totalDuration: newTotalDuration },
    });

    return {
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
    };
}

/** Faz 3.2 desenindeki `getAdaptiveRoundConfig` ile aynı — oturumsuz durumda güvenle en kolay ayara düşer. */
export async function getAdaptiveMemoryRoundConfig(): Promise<MemoryAdaptiveConfig> {
    const user = await getCurrentUser();
    if (!user) return BASE_MEMORY_ADAPTIVE_CONFIG;
    return getAdaptiveMemoryConfig(user.id);
}
