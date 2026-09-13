import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    session: { findUnique: vi.fn(), update: vi.fn() },
    userSettings: { findUnique: vi.fn() },
    dailyUsage: { findUnique: vi.fn(), upsert: vi.fn() },
};

const mockGetCurrentUser = vi.fn();
const mockDetectErrorStreak = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock('@/lib/skillAnalytics', () => ({ detectErrorStreak: mockDetectErrorStreak }));

const { submitMemoryRoundResult, getAdaptiveMemoryRoundConfig } = await import('./gameProgress');

function baseSession(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'session-1',
        userId: 'user-1',
        gameId: 'memory-match',
        levelReached: 3,
        totalDuration: 100,
        completedAt: null,
        ...overrides,
    };
}

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

describe('submitMemoryRoundResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('updates Session.levelReached (pairCount) and duration, no cap/completion logic', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage();

        const result = await submitMemoryRoundResult('session-1', 6, 20);

        expect(result).toEqual({ isDayComplete: false, dailyScreenSeconds: 20, dailyScreenLimit: 1800 });
        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 6, totalDuration: 120 },
        });
    });

    it('never sets completedAt, even after many rounds (game no longer "finishes")', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ levelReached: 8, totalDuration: 5000 }));
        mockDailyUsage();

        await submitMemoryRoundResult('session-1', 8, 30);

        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data).not.toHaveProperty('completedAt');
    });

    it('reports isDayComplete from the shared daily usage budget', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());
        mockDailyUsage({ dailyScreenLimit: 100, existingTotalSeconds: 90 });

        const result = await submitMemoryRoundResult('session-1', 4, 20);

        expect(result?.isDayComplete).toBe(true);
    });

    it('returns null when the session belongs to a different user', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ userId: 'someone-else' }));

        const result = await submitMemoryRoundResult('session-1', 4, 10);

        expect(result).toBeNull();
        expect(mockDb.session.update).not.toHaveBeenCalled();
    });

    it('returns null when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await submitMemoryRoundResult('session-1', 4, 10);

        expect(result).toBeNull();
        expect(mockDb.session.findUnique).not.toHaveBeenCalled();
    });

    it('returns null when the session cannot be found', async () => {
        mockDb.session.findUnique.mockResolvedValue(null);

        const result = await submitMemoryRoundResult('missing-session', 4, 10);

        expect(result).toBeNull();
    });
});

describe('getAdaptiveMemoryRoundConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the base config (3 pairs) when there is no session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await getAdaptiveMemoryRoundConfig();

        expect(result).toEqual({ pairCount: 3 });
        expect(mockDetectErrorStreak).not.toHaveBeenCalled();
    });

    it('drops to the minimum on 3+ consecutive wrong answers', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 3,
            sonDenemeSayisi: 5,
            sonDenemeBasariOrani: 0.9,
            sonDenemeOrtalamaTepkiSuresi: 1000,
        });

        const result = await getAdaptiveMemoryRoundConfig();

        expect(result).toEqual({ pairCount: 3 });
    });

    it('scales up pairCount with a high success rate', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 1,
            sonDenemeOrtalamaTepkiSuresi: 800,
        });

        const result = await getAdaptiveMemoryRoundConfig();

        expect(result).toEqual({ pairCount: 8 });
    });
});
