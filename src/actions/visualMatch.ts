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

export interface VisualMatchCard {
    id: string;
    name: string;
    imageUrl: string;
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

/**
 * 2026-09-15 (2. tur) — kullanıcı bulgusu: harf tabanlı mekanik "Gölge
 * Eşleştirme" adına hiç yakışmıyordu (Harf Avı'yla aynı mantık, isimle
 * alakasız). Gerçek bir siluet/gölge görevi için `ComparisonItem` havuzunu
 * (Hafıza Kartları'nın "Nesnelerle" moduyla aynı kaynak, 100 gerçek
 * nesne fotoğrafı) kullanıyoruz — hedef bir nesnenin SİLUETİ (client
 * tarafında CSS filtresiyle üretilir, bkz. GameBoard.tsx), doğru kart o
 * nesnenin renkli fotoğrafı.
 */
export async function getVisualMatchRoundPool(cardCount: number): Promise<VisualMatchCard[]> {
    const count = Math.max(1, Math.min(4, Math.round(cardCount)));

    const items = await db.comparisonItem.findMany({
        where: { isActive: true },
        select: { id: true, name: true, imageUrl: true },
    });
    if (items.length === 0) return [];

    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
