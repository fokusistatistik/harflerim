'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addDailyUsageSeconds } from '@/lib/dailyUsage';
import { getAdaptiveMemoryConfig, BASE_MEMORY_ADAPTIVE_CONFIG, type MemoryAdaptiveConfig } from '@/lib/adaptiveDifficulty';

export interface MemoryRoundResult {
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
    /** 2026-09-14 — Hafıza Kartları'na özel günlük round limiti (Harf Avı'ndaki dailyLetterHuntLimit ile aynı desen). */
    roundsPlayedToday: number;
    dailyMemoryMatchLimit: number;
    isMemoryMatchLimitReached: boolean;
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
 *
 * 2026-09-14 — Harf Avı'ndaki günlük round limiti deseni buraya da
 * taşındı: her round tamamlanışında `Session.roundsPlayed` bir artırılır
 * (Harf Avı'nın aksine ayrı bir Event tablosu olmadığı için doğrudan
 * sayaç tutulur) ve `UserSettings.dailyMemoryMatchLimit`'e karşı denetlenir.
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
    const roundsPlayedToday = (session.roundsPlayed ?? 0) + 1;

    await db.session.update({
        where: { id: sessionId },
        data: { levelReached: pairCount, totalDuration: newTotalDuration, roundsPlayed: roundsPlayedToday },
    });

    const dailyMemoryMatchLimit = user.settings?.dailyMemoryMatchLimit ?? 20;

    return {
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
        roundsPlayedToday,
        dailyMemoryMatchLimit,
        isMemoryMatchLimitReached: roundsPlayedToday >= dailyMemoryMatchLimit,
    };
}

/** Faz 3.2 desenindeki `getAdaptiveRoundConfig` ile aynı — oturumsuz durumda güvenle en kolay ayara düşer. */
export async function getAdaptiveMemoryRoundConfig(): Promise<MemoryAdaptiveConfig> {
    const user = await getCurrentUser();
    if (!user) return BASE_MEMORY_ADAPTIVE_CONFIG;
    return getAdaptiveMemoryConfig(user.id);
}

export interface MemoryMatchDailyState {
    sessionId: string;
    roundsPlayedToday: number;
    dailyMemoryMatchLimit: number;
    isMemoryMatchLimitReached: boolean;
}

/**
 * 2026-09-14 — mod seçim ekranı açılırken (round başlamadan ÖNCE) günlük
 * limitin dolup dolmadığını bilmek gerekiyor — `submitMemoryRoundResult`
 * yalnızca bir round BİTTİKTEN sonra çağrılıyor, bu yüzden ayrı bir
 * "oturumu getir/oluştur ve mevcut durumu bildir" fonksiyonu gerekli
 * (Harf Avı'ndaki `getDailySession`'ın memory-match'e özel karşılığı —
 * `getDailySession`'ın kendi `GameState` tipini bozmamak için ayrı tutuldu).
 */
export async function getMemoryMatchDailyState(): Promise<MemoryMatchDailyState | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const session = await db.session.upsert({
        where: { userId_date_gameId: { userId: user.id, date: today, gameId: 'memory-match' } },
        create: { userId: user.id, date: today, gameId: 'memory-match', levelReached: 1, totalDuration: 0 },
        update: {},
    });

    const dailyMemoryMatchLimit = user.settings?.dailyMemoryMatchLimit ?? 20;
    const roundsPlayedToday = session.roundsPlayed ?? 0;

    return {
        sessionId: session.id,
        roundsPlayedToday,
        dailyMemoryMatchLimit,
        isMemoryMatchLimitReached: roundsPlayedToday >= dailyMemoryMatchLimit,
    };
}
