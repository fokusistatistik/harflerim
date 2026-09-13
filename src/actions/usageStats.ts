'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface UsageStats {
    todaySeconds: number;
    totalSeconds: number;
    averageSecondsPerDay: number;
    daysTracked: number;
}

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Faz 2.1 — Ebeveyn Yönetim Alanı'ndaki "İlerleme Özeti" sekmesi için.
 * `DailyUsage`'ın her satırı bir gün; toplam ve günlük ortalama bu
 * satırlar üzerinden hesaplanır. Yalnızca ebeveyne gösterilir, çocuğa değil.
 */
export async function getUsageStats(): Promise<UsageStats | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const rows = await db.dailyUsage.findMany({ where: { userId: user.id } });
    const totalSeconds = rows.reduce((sum, row) => sum + row.totalSeconds, 0);
    const daysTracked = rows.length;
    const today = rows.find((row) => row.date === todayString());

    return {
        todaySeconds: today?.totalSeconds ?? 0,
        totalSeconds,
        averageSecondsPerDay: daysTracked > 0 ? Math.round(totalSeconds / daysTracked) : 0,
        daysTracked,
    };
}
