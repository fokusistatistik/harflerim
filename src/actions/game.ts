'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getDailyUsage, addDailyUsageSeconds } from '@/lib/dailyUsage';

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

// Her oyunun kendi seviye merdiveni (Faz 1.17: süre artık burada değil,
// global günlük bütçe olarak dailyUsage.ts üzerinden yönetiliyor).
const GAME_LIMITS: Record<string, { maxLevel: number }> = {
    'letter-hunt': { maxLevel: 24 },
    // Add future games here with their own IDs
    'default': { maxLevel: 100 }
};

export interface SubmitResult {
    isGameComplete: boolean;
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
}

export async function submitLevelResult(
    sessionId: string,
    level: number,
    isCorrect: boolean,
    reactionTime: number,
    targetLetter: string
): Promise<SubmitResult | null> {
    // Log Event
    await db.event.create({
        data: {
            sessionId,
            level,
            targetLetter,
            isCorrect,
            reactionTime
        }
    });

    // Fetch current session
    const currentSession = await db.session.findUnique({ where: { id: sessionId } });
    if (!currentSession) return null;

    // Süre her zaman global günlük bütçeye işlenir — oyun kendi merdiveninde
    // kilitli olsa bile çocuk başka bir oyuna geçebilir, o yüzden bu adım
    // erken dönüşten önce çalışır.
    const addedSeconds = Math.ceil(reactionTime / 1000);
    const dailyUsage = await addDailyUsageSeconds(currentSession.userId, addedSeconds);

    if (currentSession.completedAt) {
        return {
            isGameComplete: true,
            isDayComplete: dailyUsage.isDayComplete,
            dailyScreenSeconds: dailyUsage.totalSeconds,
            dailyScreenLimit: dailyUsage.dailyScreenLimit,
        };
    }

    const limits = GAME_LIMITS[currentSession.gameId] || GAME_LIMITS['default'];
    const newTotalDuration = currentSession.totalDuration + addedSeconds;

    let nextLevel = currentSession.levelReached;
    if (isCorrect && level === currentSession.levelReached) {
        nextLevel = level + 1;
    }

    let completedAt: Date | null = null;
    if (nextLevel > limits.maxLevel) {
        completedAt = new Date();
        nextLevel = limits.maxLevel + 1; // Cap visual level
    }

    await db.session.update({
        where: { id: sessionId },
        data: {
            levelReached: nextLevel,
            totalDuration: newTotalDuration,
            completedAt: completedAt
        }
    });

    return {
        isGameComplete: !!completedAt,
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
    };
}
