import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    event: { create: vi.fn() },
    session: { findUnique: vi.fn(), update: vi.fn() },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

const { submitLevelResult } = await import('./game');

function baseSession(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'session-1',
        gameId: 'letter-hunt',
        levelReached: 5,
        totalDuration: 100,
        completedAt: null,
        ...overrides,
    };
}

describe('submitLevelResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('advances the level on a correct answer at the current level', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());

        await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.event.create).toHaveBeenCalledWith({
            data: { sessionId: 'session-1', level: 5, targetLetter: 'A', isCorrect: true, reactionTime: 1000 },
        });
        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 6, totalDuration: 101, completedAt: null },
        });
    });

    it('does not advance the level on an incorrect answer', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession());

        await submitLevelResult('session-1', 5, false, 500, 'A');

        expect(mockDb.session.update).toHaveBeenCalledWith({
            where: { id: 'session-1' },
            data: { levelReached: 5, totalDuration: 101, completedAt: null },
        });
    });

    it('marks the day complete and caps the level when exceeding maxLevel (24)', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ levelReached: 24 }));

        await submitLevelResult('session-1', 24, true, 1000, 'Z');

        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data.levelReached).toBe(25);
        expect(call.data.completedAt).toBeInstanceOf(Date);
    });

    it('marks the day complete when total duration reaches the daily limit', async () => {
        // letter-hunt maxDuration is 1800s; a single answer can push it over.
        mockDb.session.findUnique.mockResolvedValue(baseSession({ totalDuration: 1799 }));

        await submitLevelResult('session-1', 5, false, 5000, 'A');

        const call = mockDb.session.update.mock.calls[0][0];
        expect(call.data.completedAt).toBeInstanceOf(Date);
    });

    it('does nothing further once a session is already completed', async () => {
        mockDb.session.findUnique.mockResolvedValue(baseSession({ completedAt: new Date() }));

        await submitLevelResult('session-1', 5, true, 1000, 'A');

        expect(mockDb.session.update).not.toHaveBeenCalled();
    });

    it('does nothing if the session cannot be found', async () => {
        mockDb.session.findUnique.mockResolvedValue(null);

        await submitLevelResult('missing-session', 5, true, 1000, 'A');

        expect(mockDb.session.update).not.toHaveBeenCalled();
    });
});
