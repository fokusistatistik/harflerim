'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export interface GameState {
    sessionId: string;
    levelReached: number;
    totalDuration: number;
    isDayComplete: boolean;
    gameId: string;
}

export async function getDailySession(gameId: string = 'letter-hunt'): Promise<GameState> {
    const cookieStore = cookies();
    let deviceId = cookieStore.get('deviceId')?.value;

    if (!deviceId) {
        console.warn("Device ID missing. Using ephemeral.");
        deviceId = 'guest-' + crypto.randomUUID();
    }

    // Ensure User exists
    let user = await db.user.findUnique({ where: { id: deviceId } });
    if (!user) {
        user = await db.user.create({ data: { id: deviceId } });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find Session
    let session = await db.session.findUnique({
        where: {
            userId_date_gameId: {
                userId: deviceId,
                date: today,
                gameId: gameId
            }
        }
    });

    if (!session) {
        session = await db.session.create({
            data: {
                userId: deviceId,
                date: today,
                gameId: gameId,
                levelReached: 1,
                totalDuration: 0
            }
        });
    }

    return {
        sessionId: session.id,
        levelReached: session.levelReached,
        totalDuration: session.totalDuration,
        isDayComplete: !!session.completedAt,
        gameId: session.gameId
    };
}

// Game Configuration for Limits
const GAME_LIMITS: Record<string, { maxLevel: number; maxDuration: number }> = {
    'letter-hunt': { maxLevel: 24, maxDuration: 1800 }, // 30 mins
    // Add future games here with their own IDs and limits
    'default': { maxLevel: 100, maxDuration: 3600 }
};

export async function submitLevelResult(
    sessionId: string,
    level: number,
    isCorrect: boolean,
    reactionTime: number,
    targetLetter: string
) {
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
    if (!currentSession) return;
    if (currentSession.completedAt) return; // Already locked

    // Get Limits
    const limits = GAME_LIMITS[currentSession.gameId] || GAME_LIMITS['default'];

    // Calculate new duration
    const addedSeconds = Math.ceil(reactionTime / 1000);
    const newTotalDuration = currentSession.totalDuration + addedSeconds;

    let nextLevel = currentSession.levelReached;
    if (isCorrect && level === currentSession.levelReached) {
        nextLevel = level + 1;
    }

    let completedAt: Date | null = null;

    // Check against retrieved limits
    if (nextLevel > limits.maxLevel || newTotalDuration >= limits.maxDuration) {
        completedAt = new Date();
        // Cap visual level
        if (nextLevel > limits.maxLevel) nextLevel = limits.maxLevel + 1;
    }

    await db.session.update({
        where: { id: sessionId },
        data: {
            levelReached: nextLevel,
            totalDuration: newTotalDuration,
            completedAt: completedAt
        }
    });
}
