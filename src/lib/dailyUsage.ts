import { db } from '@/lib/db';

export interface DailyUsageState {
    totalSeconds: number;
    dailyScreenLimit: number;
    isDayComplete: boolean;
}

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

export async function getDailyUsage(userId: string): Promise<DailyUsageState> {
    const [usage, settings] = await Promise.all([
        db.dailyUsage.findUnique({ where: { userId_date: { userId, date: todayString() } } }),
        db.userSettings.findUnique({ where: { userId } }),
    ]);

    const dailyScreenLimit = settings?.dailyScreenLimit ?? 1800;

    return {
        totalSeconds: usage?.totalSeconds ?? 0,
        dailyScreenLimit,
        isDayComplete: !!usage?.completedAt,
    };
}

/**
 * Tüm oyunlar genelindeki günlük toplam süreye ekleme yapar ve
 * `UserSettings.dailyScreenLimit`'e karşı denetler. Limit ilk kez bu
 * çağrıda aşılırsa `completedAt` damgalanır — sonraki her oyunun günü
 * bu bayrağa göre biter (bkz. Faz 1.10).
 */
export async function addDailyUsageSeconds(userId: string, seconds: number): Promise<DailyUsageState> {
    const date = todayString();
    const settings = await db.userSettings.findUnique({ where: { userId } });
    const dailyScreenLimit = settings?.dailyScreenLimit ?? 1800;

    const existing = await db.dailyUsage.findUnique({ where: { userId_date: { userId, date } } });
    const newTotal = (existing?.totalSeconds ?? 0) + seconds;
    const alreadyComplete = !!existing?.completedAt;
    const nowComplete = alreadyComplete || newTotal >= dailyScreenLimit;

    const usage = await db.dailyUsage.upsert({
        where: { userId_date: { userId, date } },
        create: {
            userId,
            date,
            totalSeconds: newTotal,
            completedAt: nowComplete ? new Date() : null,
        },
        update: {
            totalSeconds: newTotal,
            completedAt: nowComplete && !alreadyComplete ? new Date() : undefined,
        },
    });

    return {
        totalSeconds: usage.totalSeconds,
        dailyScreenLimit,
        isDayComplete: !!usage.completedAt,
    };
}
