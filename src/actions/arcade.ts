'use server';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/auditLog';
import { recordSkillAttempt } from '@/actions/skills';
import {
    getArcadeUsage,
    addArcadeUsageSeconds,
    type ArcadeUsageState,
    type ArcadeGameId,
} from '@/lib/arcadeUsage';

/**
 * Oyun Dünyası'nın güncel süre ve bütçe durumunu döner.
 */
export async function getArcadeStatus(): Promise<ArcadeUsageState | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    return getArcadeUsage(user.id);
}

/**
 * Oyun Dünyası'nda oynanan süreyi (saniye cinsinden) hem oyuna hem global bütçeye raporlar.
 */
export async function reportArcadePlay(
    gameId: ArcadeGameId,
    seconds: number
): Promise<ArcadeUsageState | null> {
    if (seconds <= 0) return null;
    const user = await getCurrentUser();
    if (!user) return null;
    return addArcadeUsageSeconds(user.id, gameId, seconds);
}

/**
 * Ebeveyn panelinden Oyun Dünyası günlük süre limitini günceller (dakika olarak alınır, saniyeye çevrilir).
 * İzin verilen aralık: 10 - 60 dakika.
 */
export async function updateArcadeLimit(limitMinutes: number): Promise<{ success: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Oturum açılmamış.' };

    const cleanMinutes = Math.round(limitMinutes);
    if (cleanMinutes < 10 || cleanMinutes > 60) {
        return { success: false, error: 'Süre limiti 10 ile 60 dakika arasında olmalıdır.' };
    }

    const limitSeconds = cleanMinutes * 60;

    await db.userSettings.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            dailyArcadeScreenLimit: limitSeconds,
        },
        update: {
            dailyArcadeScreenLimit: limitSeconds,
        },
    });

    await logAudit(
        'SETTINGS_CHANGED',
        user.id,
        `Oyun Dünyası günlük süre limiti ${cleanMinutes} dakika olarak güncellendi.`
    );

    return { success: true };
}

/**
 * Oyun Dünyası'nda tamamlanan bir denemeyi SkillAttempt tablosuna işler ve rozet kontrolü yapar.
 */
export async function recordArcadeSkill(
    skillKey: string,
    gameId: string,
    isCorrect: boolean,
    reactionTime?: number
): Promise<void> {
    await recordSkillAttempt(skillKey, gameId, isCorrect, reactionTime);
}
