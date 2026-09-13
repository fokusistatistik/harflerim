import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    dailyUsage: { findMany: vi.fn() },
};

const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});

const { getUsageStats } = await import('./usageStats');

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

describe('getUsageStats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('returns null when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await getUsageStats();

        expect(result).toBeNull();
        expect(mockDb.dailyUsage.findMany).not.toHaveBeenCalled();
    });

    it('returns zeros when no DailyUsage rows exist', async () => {
        mockDb.dailyUsage.findMany.mockResolvedValue([]);

        const result = await getUsageStats();

        expect(result).toEqual({
            todaySeconds: 0,
            totalSeconds: 0,
            averageSecondsPerDay: 0,
            daysTracked: 0,
        });
    });

    it('sums totalSeconds and computes the average across all rows', async () => {
        mockDb.dailyUsage.findMany.mockResolvedValue([
            { date: '2026-09-01', totalSeconds: 600 },
            { date: '2026-09-02', totalSeconds: 300 },
            { date: todayString(), totalSeconds: 900 },
        ]);

        const result = await getUsageStats();

        expect(result).toEqual({
            todaySeconds: 900,
            totalSeconds: 1800,
            averageSecondsPerDay: 600,
            daysTracked: 3,
        });
    });

    it('returns 0 todaySeconds when today has no row yet', async () => {
        mockDb.dailyUsage.findMany.mockResolvedValue([{ date: '2020-01-01', totalSeconds: 500 }]);

        const result = await getUsageStats();

        expect(result?.todaySeconds).toBe(0);
        expect(result?.totalSeconds).toBe(500);
    });
});
