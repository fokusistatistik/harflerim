'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
    getAdaptiveVisualMatchConfig,
    BASE_VISUAL_MATCH_ADAPTIVE_CONFIG,
    type VisualMatchAdaptiveConfig,
} from '@/lib/adaptiveDifficulty';

export interface VisualMatchDailyState extends VisualMatchAdaptiveConfig {
    roundsPlayedToday: number;
    dailyVisualMatchLimit: number;
    isVisualMatchLimitReached: boolean;
}

/** Bugün bu kullanıcı için kaç SkillAttempt (=round) kaydedilmiş — Hafıza Kartları'nın `Session.roundsPlayed` sayacına denk, ayrı bir tablo gerektirmez çünkü zorluk motoru zaten her denemeyi SkillAttempt'e yazıyor. */
async function countTodaysAttempts(userId: string, skillId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return db.skillAttempt.count({
        where: { userId, skillId, gameId: 'visual-match', createdAt: { gte: startOfDay } },
    });
}

/**
 * 2026-09-15 — Faz 2.11 denetiminde bulunan "hâlâ sabit sistemde, ebeveyn
 * görünürlüğü yok" boşluğunun düzeltmesi. GameBoard.tsx'in her round başında
 * çağırdığı, oturumu olmayan durumda güvenle en kolay ayara düşen sarmalayıcı
 * — `getAdaptiveRoundConfig` (Harf Avı) ile aynı desen.
 */
export async function getVisualMatchDailyState(): Promise<VisualMatchDailyState> {
    const user = await getCurrentUser();
    if (!user) {
        return { ...BASE_VISUAL_MATCH_ADAPTIVE_CONFIG, roundsPlayedToday: 0, dailyVisualMatchLimit: 20, isVisualMatchLimitReached: false };
    }

    const skill = await db.skill.findUnique({ where: { key: 'golge-eslestirme' } });
    const dailyVisualMatchLimit = user.settings?.dailyVisualMatchLimit ?? 20;

    const [config, roundsPlayedToday] = await Promise.all([
        getAdaptiveVisualMatchConfig(user.id),
        skill ? countTodaysAttempts(user.id, skill.id) : Promise.resolve(0),
    ]);

    return {
        ...config,
        roundsPlayedToday,
        dailyVisualMatchLimit,
        isVisualMatchLimitReached: roundsPlayedToday >= dailyVisualMatchLimit,
    };
}
