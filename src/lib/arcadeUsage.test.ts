import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    userSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    session: { findMany: vi.fn(), upsert: vi.fn() },
    dailyUsage: { findUnique: vi.fn(), upsert: vi.fn() },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));

const { getArcadeUsage, addArcadeUsageSeconds } = await import('./arcadeUsage');

describe('getArcadeUsage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns zero usage with default 1800s limit when no sessions exist', async () => {
        mockDb.userSettings.findUnique.mockResolvedValue(null);
        mockDb.session.findMany.mockResolvedValue([]);

        const state = await getArcadeUsage('user-1');
        expect(state).toEqual({
            totalArcadeSeconds: 0,
            dailyArcadeScreenLimit: 1800,
            isArcadeDayComplete: false,
            remainingArcadeSeconds: 1800,
        });
    });

    it('calculates total arcade seconds from multiple sessions correctly', async () => {
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyArcadeScreenLimit: 1200 });
        mockDb.session.findMany.mockResolvedValue([
            { totalDuration: 300 },
            { totalDuration: 400 },
        ]);

        const state = await getArcadeUsage('user-1');
        expect(state).toEqual({
            totalArcadeSeconds: 700,
            dailyArcadeScreenLimit: 1200,
            isArcadeDayComplete: false,
            remainingArcadeSeconds: 500,
        });
    });

    it('flags isArcadeDayComplete when total seconds reach or exceed limit', async () => {
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyArcadeScreenLimit: 600 });
        mockDb.session.findMany.mockResolvedValue([
            { totalDuration: 650 },
        ]);

        const state = await getArcadeUsage('user-1');
        expect(state.isArcadeDayComplete).toBe(true);
        expect(state.remainingArcadeSeconds).toBe(0);
    });
});

describe('addArcadeUsageSeconds', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('upserts session duration and returns updated status', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue(null);
        mockDb.dailyUsage.upsert.mockResolvedValue({ totalSeconds: 60, completedAt: null });
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyArcadeScreenLimit: 1800, dailyScreenLimit: 1800 });
        mockDb.session.upsert.mockResolvedValue({});
        mockDb.session.findMany.mockResolvedValue([{ totalDuration: 60 }]);

        const state = await addArcadeUsageSeconds('user-1', 'arcade-water-pool', 60);

        expect(mockDb.session.upsert).toHaveBeenCalledTimes(1);
        expect(state.totalArcadeSeconds).toBe(60);
        expect(state.remainingArcadeSeconds).toBe(1740);
    });
});
