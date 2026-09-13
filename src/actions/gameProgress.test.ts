import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    session: { findUnique: vi.fn(), update: vi.fn() },
};

const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mockGetCurrentUser }));

const { advanceGameLevel } = await import('./gameProgress');

function baseSession(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'session-1',
        userId: 'user-1',
        gameId: 'memory-match',
        levelReached: 5,
        totalDuration: 100,
        completedAt: null,
        ...overrides,
    };
}

describe('advanceGameLevel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('increments levelReached when leveledUp is true', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());

        const result = await advanceGameLevel('session-1', true, 20);

        expect(result).toEqual({ levelReached: 6, totalDuration: 120, isGameComplete: false });
        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 6, totalDuration: 120, completedAt: null },
        });
    });

    it('does not increment levelReached when leveledUp is false, but still adds duration', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());

        const result = await advanceGameLevel('session-1', false, 15);

        expect(result).toEqual({ levelReached: 5, totalDuration: 115, isGameComplete: false });
    });

    it('marks the game complete and caps the level when exceeding the known cap (memory-match: 24)', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ levelReached: 24 }));

        const result = await advanceGameLevel('session-1', true, 10);

        expect(result?.isGameComplete).toBe(true);
        expect(result?.levelReached).toBe(24);
        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data.completedAt).toBeInstanceOf(Date);
    });

    it('uses the default cap (100) for an unknown gameId', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ gameId: 'some-future-game', levelReached: 100 }));

        const result = await advanceGameLevel('session-1', true, 5);

        expect(result?.isGameComplete).toBe(true);
        expect(result?.levelReached).toBe(100);
    });

    it('returns the already-completed state without touching the session again', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ completedAt: new Date() }));

        const result = await advanceGameLevel('session-1', true, 10);

        expect(result).toEqual({ levelReached: 5, totalDuration: 100, isGameComplete: true });
        expect(mockDb.session.update).not.toHaveBeenCalled();
    });

    it('returns null when the session belongs to a different user', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ userId: 'someone-else' }));

        const result = await advanceGameLevel('session-1', true, 10);

        expect(result).toBeNull();
        expect(mockDb.session.update).not.toHaveBeenCalled();
    });

    it('returns null when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await advanceGameLevel('session-1', true, 10);

        expect(result).toBeNull();
        expect(mockDb.session.findUnique).not.toHaveBeenCalled();
    });

    it('returns null when the session cannot be found', async () => {
        mockDb.session.findUnique.mockResolvedValue(null);

        const result = await advanceGameLevel('missing-session', true, 10);

        expect(result).toBeNull();
    });
});
