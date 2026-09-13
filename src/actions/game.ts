'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getDailyUsage, addDailyUsageSeconds } from '@/lib/dailyUsage';
import { getAdaptiveConfig, BASE_ADAPTIVE_CONFIG, type AdaptiveConfig } from '@/lib/adaptiveDifficulty';

export interface GameState {
    sessionId: string;
    levelReached: number;
    totalDuration: number;
    /** Bu oyunun kendi seviye merdiveni bitti mi (Session.completedAt). */
    isGameComplete: boolean;
    /** Tüm oyunlar genelindeki günlük süre bütçesi doldu mu (DailyUsage.completedAt). */
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
    gameId: string;
    /** Faz 1.23 — oyun bileşenlerinin kişiselleştirme için (ör. "X ile Harfleri Keşfet"). */
    firstName: string;
}

export async function getDailySession(gameId: string = 'letter-hunt'): Promise<GameState> {
    const user = await getCurrentUser();
    if (!user) redirect('/giris');

    const today = new Date().toISOString().split('T')[0];

    // Find Session
    let session = await db.session.findUnique({
        where: {
            userId_date_gameId: {
                userId: user.id,
                date: today,
                gameId: gameId
            }
        }
    });

    if (!session) {
        session = await db.session.create({
            data: {
                userId: user.id,
                date: today,
                gameId: gameId,
                levelReached: 1,
                totalDuration: 0
            }
        });
    }

    const dailyUsage = await getDailyUsage(user.id);

    return {
        sessionId: session.id,
        levelReached: session.levelReached,
        totalDuration: session.totalDuration,
        isGameComplete: !!session.completedAt,
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
        gameId: session.gameId,
        firstName: user.firstName
    };
}

export interface SubmitResult {
    isGameComplete: boolean;
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
}

/**
 * Faz 3.2 — Harf Avı artık sabit bir 24-seviye merdiveni değil, uyarlanabilir
 * bir zorluk motoruyla çalışıyor (bkz. src/lib/adaptiveDifficulty.ts). Bu
 * fonksiyon artık bir "seviye ilerletme kapısı" DEĞİL — yalnızca deneme logu
 * (Event) + Session güncellemesi yapar. `difficultyIndicator`, o anki
 * round'un optionCount'udur; `Session.levelReached` bunu bir analitik alan
 * olarak saklamaya devam eder (Faz 3.1 öncesindeki "seviye" anlamı artık
 * yok, yıkıcı bir migration'la silinmedi). Diğer oyunlar gibi bu oyun da
 * artık "bitmez" — günlük süre bütçesi içinde sınırsız devam eder.
 */
export async function submitLevelResult(
    sessionId: string,
    difficultyIndicator: number,
    isCorrect: boolean,
    reactionTime: number,
    targetLetter: string
): Promise<SubmitResult | null> {
    // Log Event
    await db.event.create({
        data: {
            sessionId,
            level: difficultyIndicator,
            targetLetter,
            isCorrect,
            reactionTime
        }
    });

    // Fetch current session
    const currentSession = await db.session.findUnique({ where: { id: sessionId } });
    if (!currentSession) return null;

    // Süre her zaman global günlük bütçeye işlenir.
    const addedSeconds = Math.ceil(reactionTime / 1000);
    const dailyUsage = await addDailyUsageSeconds(currentSession.userId, addedSeconds);
    const newTotalDuration = currentSession.totalDuration + addedSeconds;

    await db.session.update({
        where: { id: sessionId },
        data: {
            levelReached: difficultyIndicator,
            totalDuration: newTotalDuration,
        }
    });

    return {
        isGameComplete: false,
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
    };
}

/** Faz 3.2 — GameBoard'ın her round başında çağırdığı, oturumu olmayan (giriş yapmamış) bir durumda güvenle en kolay ayara düşen sarmalayıcı. */
export async function getAdaptiveRoundConfig(): Promise<AdaptiveConfig> {
    const user = await getCurrentUser();
    if (!user) return BASE_ADAPTIVE_CONFIG;
    return getAdaptiveConfig(user.id);
}
