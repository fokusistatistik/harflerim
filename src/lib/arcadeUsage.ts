import { db } from '@/lib/db';
import { addDailyUsageSeconds } from '@/lib/dailyUsage';

export interface ArcadeUsageState {
    totalArcadeSeconds: number;
    dailyArcadeScreenLimit: number;
    isArcadeDayComplete: boolean;
    remainingArcadeSeconds: number;
}

export const ARCADE_GAME_IDS = [
    'arcade-water-pool',
    'arcade-frog-jump',
    'arcade-slingshot',
    'arcade-bubble-pop',
] as const;

export type ArcadeGameId = (typeof ARCADE_GAME_IDS)[number];

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Kullanıcının bugünkü Oyun Dünyası süre durumunu döndürür.
 * Toplam süre, bugünün tüm arcade Session satırlarının totalDuration toplamıdır.
 */
export async function getArcadeUsage(userId: string): Promise<ArcadeUsageState> {
    const date = todayString();
    const [settings, sessions] = await Promise.all([
        db.userSettings.findUnique({ where: { userId } }),
        db.session.findMany({
            where: {
                userId,
                date,
                gameId: { in: [...ARCADE_GAME_IDS] },
            },
            select: { totalDuration: true },
        }),
    ]);

    const dailyArcadeScreenLimit = settings?.dailyArcadeScreenLimit ?? 1800;
    const totalArcadeSeconds = sessions.reduce((acc, s) => acc + (s.totalDuration || 0), 0);
    const isArcadeDayComplete = totalArcadeSeconds >= dailyArcadeScreenLimit;
    const remainingArcadeSeconds = Math.max(0, dailyArcadeScreenLimit - totalArcadeSeconds);

    return {
        totalArcadeSeconds,
        dailyArcadeScreenLimit,
        isArcadeDayComplete,
        remainingArcadeSeconds,
    };
}

/**
 * Oyun Dünyası'ndaki bir oyunda geçirilen süreyi raporlar.
 * Hem ilgili Session satırına hem de global günlük süre bütçesine (DailyUsage) eklenir.
 */
export async function addArcadeUsageSeconds(
    userId: string,
    gameId: ArcadeGameId,
    seconds: number
): Promise<ArcadeUsageState> {
    const date = todayString();
    const cleanSeconds = Math.max(0, Math.round(seconds));

    if (cleanSeconds > 0) {
        // Global ekran süresine de ekle
        await addDailyUsageSeconds(userId, cleanSeconds);

        // İlgili arcade oyun seansını güncelle / oluştur
        await db.session.upsert({
            where: {
                userId_date_gameId: {
                    userId,
                    date,
                    gameId,
                },
            },
            create: {
                userId,
                date,
                gameId,
                totalDuration: cleanSeconds,
            },
            update: {
                totalDuration: {
                    increment: cleanSeconds,
                },
            },
        });
    }

    return getArcadeUsage(userId);
}
