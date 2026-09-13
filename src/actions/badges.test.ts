import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    badge: { findMany: vi.fn() },
};

const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});

const { listBadges } = await import('./badges');

describe('listBadges', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        expect(await listBadges()).toEqual([]);
        expect(mockDb.badge.findMany).not.toHaveBeenCalled();
    });

    it('maps db rows to BadgeData', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        const earnedAt = new Date('2026-09-13T10:00:00.000Z');
        mockDb.badge.findMany.mockResolvedValue([
            { id: 'b1', emoji: '🔤', label: 'Harf Tanıma', earnedAt },
        ]);

        const result = await listBadges();

        expect(result).toEqual([{ id: 'b1', emoji: '🔤', label: 'Harf Tanıma', earnedAt: earnedAt.toISOString() }]);
    });
});
