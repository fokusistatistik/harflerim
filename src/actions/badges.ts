'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface BadgeData {
    id: string;
    emoji: string;
    label: string;
    earnedAt: string;
}

/** Faz 2.8b — Ebeveyn Yönetim Alanı'nın İlerleme sekmesindeki rozet listesi için. */
export async function listBadges(): Promise<BadgeData[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const badges = await db.badge.findMany({
        where: { userId: user.id },
        orderBy: { earnedAt: 'desc' },
    });

    return badges.map((b) => ({ id: b.id, emoji: b.emoji, label: b.label, earnedAt: b.earnedAt.toISOString() }));
}
