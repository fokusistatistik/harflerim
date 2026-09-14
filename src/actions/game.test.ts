import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    event: { create: vi.fn(), findMany: vi.fn() },
    session: { findUnique: vi.fn(), update: vi.fn() },
    userSettings: { findUnique: vi.fn() },
    dailyUsage: { findUnique: vi.fn(), upsert: vi.fn() },
    skill: { findUnique: vi.fn() },
    skillAttempt: { findMany: vi.fn() },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

const { submitLevelResult, getAdaptiveRoundConfig } = await import('./game');
const { getCurrentUser } = await import('@/lib/auth');

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
        // 2026-09-14 — denetim bulgusu düzeltmesi: submitLevelResult artık
        // getCurrentUser() ile çağıranın oturum sahibi olduğunu doğruluyor.
        // baseSession()'ın userId'siyle ('user-1') eşleşen varsayılan mock.
        vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
    });

    it('logs the attempt as an Event with the given difficulty indicator', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage();

        await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.event.create).toHaveBeenCalledWith({
            data: { sessionId: 'session-1', level: 5, targetLetter: 'A', isCorrect: true, reactionTime: 1000 },
        });
    });

    it('stores the difficulty indicator into Session.levelReached regardless of correctness (Faz 3.2 — no more level-gating)', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage();

        await submitLevelResult('session-1', 8, false, 500, 'A');

        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 8, totalDuration: 101 },
        });
    });

    it('never marks the game complete anymore (Faz 3.2 — Harf Avı no longer "finishes")', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ levelReached: 24 }));
        mockDailyUsage();

        const result = await submitLevelResult('session-1', 12, true, 1000, 'Z');

        expect(result?.isGameComplete).toBe(false);
        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data).not.toHaveProperty('completedAt');
    });

    it('marks the day complete (globally) when total screen seconds reach dailyScreenLimit', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage({ dailyScreenLimit: 1800, existingTotalSeconds: 1799 });

        const result = await submitLevelResult('session-1', 5, false, 5000, 'A');

        expect(result?.isDayComplete).toBe(true);
    });

    it('still updates the session even if it was already completed under the old system (legacy completedAt is now inert)', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ completedAt: new Date() }));
        mockDailyUsage();

        const result = await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.session.update).toHaveBeenCalled();
        expect(result?.isGameComplete).toBe(false);
    });

    it('does nothing if the session cannot be found', async () => {
        mockDb.session.findUnique.mockResolvedValue(null);

        const result = await submitLevelResult('missing-session', 5, true, 1000, 'A');

        expect(mockDb.session.update).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('returns null and writes nothing if there is no current user', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null as any);
        mockDb.session.findUnique.mockResolvedValue(baseSession());

        const result = await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.event.create).not.toHaveBeenCalled();
        expect(mockDb.session.update).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('returns null and writes nothing if the session belongs to a different user', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ userId: 'someone-else' }));

        const result = await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.event.create).not.toHaveBeenCalled();
        expect(mockDb.session.update).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});

describe('getAdaptiveRoundConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('falls back to the base config when there is no current user', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null as any);

        const result = await getAdaptiveRoundConfig();

        expect(result).toEqual({ optionCount: 2, distractorType: 'random', weakLetters: [] });
    });

    it('returns no weak letters when there is no Event history yet', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
        mockDb.skillAttempt.findMany.mockResolvedValue([]);
        mockDb.event.findMany.mockResolvedValue([]);

        const result = await getAdaptiveRoundConfig();

        expect(result.weakLetters).toEqual([]);
    });

    it('surfaces the letters with the highest wrong-rate in the recent window, worst first', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as any);
        mockDb.skillAttempt.findMany.mockResolvedValue([]);
        mockDb.event.findMany.mockResolvedValue([
            { targetLetter: 'B', isCorrect: false },
            { targetLetter: 'B', isCorrect: false },
            { targetLetter: 'A', isCorrect: true },
            { targetLetter: 'A', isCorrect: false },
            { targetLetter: 'C', isCorrect: true },
        ]);

        const result = await getAdaptiveRoundConfig();

        // B: 2/2 yanlış (%100), A: 1/2 yanlış (%50), C: hiç yanlış yok — dahil değil.
        expect(result.weakLetters).toEqual(['B', 'A']);
    });
});
