import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    skillAttempt: { findMany: vi.fn() },
    songPlayCount: { findFirst: vi.fn() },
    drawing: { count: vi.fn() },
};

const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});

const { getTodaySummary } = await import('./todaySummary');

describe('getTodaySummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await getTodaySummary();

        expect(result).toEqual([]);
        expect(mockDb.skillAttempt.findMany).not.toHaveBeenCalled();
    });

    it('returns exactly 8 fixed activities, all undone, when nothing happened today', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skillAttempt.findMany.mockResolvedValue([]);
        mockDb.songPlayCount.findFirst.mockResolvedValue(null);
        mockDb.drawing.count.mockResolvedValue(0);

        const result = await getTodaySummary();

        expect(result).toHaveLength(8);
        expect(result.every((a) => a.done === false)).toBe(true);
    });

    it('marks a game as done when a SkillAttempt exists for it today', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skillAttempt.findMany.mockResolvedValue([{ gameId: 'memory-match' }, { gameId: 'family-album' }]);
        mockDb.songPlayCount.findFirst.mockResolvedValue(null);
        mockDb.drawing.count.mockResolvedValue(0);

        const result = await getTodaySummary();

        expect(result.find((a) => a.id === 'memory-match')?.done).toBe(true);
        expect(result.find((a) => a.id === 'family-album')?.done).toBe(true);
        expect(result.find((a) => a.id === 'letter-hunt')?.done).toBe(false);
    });

    it('marks müzik done when a SongPlayCount row exists today', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skillAttempt.findMany.mockResolvedValue([]);
        mockDb.songPlayCount.findFirst.mockResolvedValue({ id: 'spc-1' });
        mockDb.drawing.count.mockResolvedValue(0);

        const result = await getTodaySummary();

        expect(result.find((a) => a.id === 'muzik')?.done).toBe(true);
    });

    it('marks çizim done when at least one Drawing exists today', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skillAttempt.findMany.mockResolvedValue([]);
        mockDb.songPlayCount.findFirst.mockResolvedValue(null);
        mockDb.drawing.count.mockResolvedValue(2);

        const result = await getTodaySummary();

        expect(result.find((a) => a.id === 'cizim')?.done).toBe(true);
    });
});
