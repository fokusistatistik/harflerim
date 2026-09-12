import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    event: { create: vi.fn() },
    session: { findUnique: vi.fn(), update: vi.fn() },
    userSettings: { findUnique: vi.fn() },
    dailyUsage: { findUnique: vi.fn(), upsert: vi.fn() },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

const { submitLevelResult } = await import('./game');

function baseSession(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'session-1',
        userId: 'user-1',
        gameId: 'letter-hunt',
        levelReached: 5,
        totalDuration: 100,
        completedAt: null,
        ...overrides,
    };
}

/** dailyScreenLimit varsayılanı 1800s; testler aksini belirtmedikçe bu kullanılır. */
function mockDailyUsage({
    dailyScreenLimit = 1800,
    existingTotalSeconds = 0,
    alreadyComplete = false,
}: { dailyScreenLimit?: number; existingTotalSeconds?: number; alreadyComplete?: boolean } = {}) {
    mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit });
    mockDb.dailyUsage.findUnique.mockResolvedValue(
        existingTotalSeconds || alreadyComplete
            ? { totalSeconds: existingTotalSeconds, completedAt: alreadyComplete ? new Date() : null }
            : null
    );
    mockDb.dailyUsage.upsert.mockImplementation(({ create, update }: any) => {
        const totalSeconds = update?.totalSeconds ?? create.totalSeconds;
        const completedAt = (update?.completedAt !== undefined ? update.completedAt : create.completedAt) ?? null;
        return Promise.resolve({ totalSeconds, completedAt });
    });
}

describe('submitLevelResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('advances the level on a correct answer at the current level', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage();

        const result = await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.event.create).toHaveBeenCalledWith({
            data: { sessionId: 'session-1', level: 5, targetLetter: 'A', isCorrect: true, reactionTime: 1000 },
        });
        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 6, totalDuration: 101, completedAt: null },
        });
        expect(result?.isGameComplete).toBe(false);
        expect(result?.isDayComplete).toBe(false);
    });

    it('does not advance the level on an incorrect answer', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage();

        await submitLevelResult('session-1', 5, false, 500, 'A');

        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 5, totalDuration: 101, completedAt: null },
        });
    });

    it('marks the game complete and caps the level when exceeding maxLevel (24)', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ levelReached: 24 }));
        mockDailyUsage();

        const result = await submitLevelResult('session-1', 24, true, 1000, 'Z');

        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data.levelReached).toBe(25);
        expect(call.data.completedAt).toBeInstanceOf(Date);
        expect(result?.isGameComplete).toBe(true);
    });

    it('marks the day complete (globally) when total screen seconds reach dailyScreenLimit', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage({ dailyScreenLimit: 1800, existingTotalSeconds: 1799 });

        const result = await submitLevelResult('session-1', 5, false, 5000, 'A');

        expect(result?.isDayComplete).toBe(true);
        // Oyunun kendi merdiveni (maxLevel) etkilenmez — global gün limiti ayrı bir kavramdır.
        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data.completedAt).toBeNull();
    });

    it('still records elapsed time once a session (game) is already completed, but does not touch the session row again', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ completedAt: new Date() }));
        mockDailyUsage();

        const result = await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.session.update).not.toHaveBeenCalled();
        expect(mockDb.dailyUsage.upsert).toHaveBeenCalled();
        expect(result?.isGameComplete).toBe(true);
    });

    it('does nothing if the session cannot be found', async () => {
        mockDb.session.findUnique.mockResolvedValue(null);

        const result = await submitLevelResult('missing-session', 5, true, 1000, 'A');

        expect(mockDb.session.update).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});
