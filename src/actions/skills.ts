'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * Faz 1.20 — dört oyunun paylaştığı, ölçüm-amaçlı beceri kaydı. Oyun akışını
 * ASLA bloklamamalı veya bir hata fırlatmamalı — bilinmeyen bir skillKey
 * (ör. henüz seed edilmemiş bir ortam) sessizce no-op olur. Zorluk ayarlama
 * mantığı burada YOK — bu, Faz 3.1/3.2'nin işi; burada yalnızca kayıt var.
 */
export async function recordSkillAttempt(
    skillKey: string,
    gameId: string,
    isCorrect: boolean,
    reactionTime?: number
): Promise<void> {
    try {
        const user = await getCurrentUser();
        if (!user) return;

        const skill = await db.skill.findUnique({ where: { key: skillKey } });
        if (!skill) return;

        await db.skillAttempt.create({
            data: {
                userId: user.id,
                skillId: skill.id,
                gameId,
                isCorrect,
                reactionTime: reactionTime ?? null,
            },
        });
    } catch {
        // Ölçüm katmanındaki bir hata oyunu asla bozmamalı.
    }
}
