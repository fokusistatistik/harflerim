import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    skill: { findUnique: vi.fn() },
    skillAttempt: { findMany: vi.fn() },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));

const { getSkillHistory, getCrossGameValidation, detectErrorStreak } = await import('./skillAnalytics');

function attempt(overrides: Partial<{
    id: string;
    gameId: string;
    isCorrect: boolean;
    reactionTime: number | null;
    hintsUsed: number | null;
    createdAt: Date;
}> = {}) {
    return {
        id: 'attempt-1',
        gameId: 'letter-hunt',
        isCorrect: true,
        reactionTime: null,
        hintsUsed: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    };
}

describe('getSkillHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list for an unknown skill key (never throws)', async () => {
        mockDb.skill.findUnique.mockResolvedValue(null);

        await expect(getSkillHistory('user-1', 'does-not-exist')).resolves.toEqual([]);
        expect(mockDb.skillAttempt.findMany).not.toHaveBeenCalled();
    });

    it('queries chronologically (createdAt asc) scoped to the user and skill', async () => {
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });
        mockDb.skillAttempt.findMany.mockResolvedValue([attempt()]);

        await getSkillHistory('user-1', 'harf-tanima');

        expect(mockDb.skillAttempt.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', skillId: 'skill-1' },
            orderBy: { createdAt: 'asc' },
        });
    });

    it('maps raw rows to SkillAttemptRecord shape', async () => {
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });
        mockDb.skillAttempt.findMany.mockResolvedValue([
            attempt({ id: 'a1', isCorrect: true, reactionTime: 1200, hintsUsed: 1 }),
        ]);

        const result = await getSkillHistory('user-1', 'harf-tanima');

        expect(result).toEqual([
            {
                id: 'a1',
                gameId: 'letter-hunt',
                isCorrect: true,
                reactionTime: 1200,
                hintsUsed: 1,
                createdAt: new Date('2026-01-01T00:00:00Z'),
            },
        ]);
    });
});

describe('getCrossGameValidation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no history', async () => {
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });
        mockDb.skillAttempt.findMany.mockResolvedValue([]);

        await expect(getCrossGameValidation('user-1', 'harf-tanima')).resolves.toEqual([]);
    });

    it('groups attempts by gameId and computes a success rate per game', async () => {
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });
        mockDb.skillAttempt.findMany.mockResolvedValue([
            attempt({ gameId: 'letter-hunt', isCorrect: true }),
            attempt({ gameId: 'letter-hunt', isCorrect: false }),
            attempt({ gameId: 'letter-hunt', isCorrect: true }),
            attempt({ gameId: 'some-future-game', isCorrect: true }),
        ]);

        const result = await getCrossGameValidation('user-1', 'harf-tanima');

        expect(result).toEqual([
            { gameId: 'letter-hunt', totalAttempts: 3, correctCount: 2, successRate: 2 / 3 },
            { gameId: 'some-future-game', totalAttempts: 1, correctCount: 1, successRate: 1 },
        ]);
    });
});

describe('detectErrorStreak', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });
    });

    it('returns all-null/zero stats when there is no history', async () => {
        mockDb.skillAttempt.findMany.mockResolvedValue([]);

        await expect(detectErrorStreak('user-1', 'harf-tanima')).resolves.toEqual({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 0,
            sonDenemeBasariOrani: null,
            sonDenemeOrtalamaTepkiSuresi: null,
        });
    });

    it('counts consecutive wrong answers back from the most recent attempt', async () => {
        mockDb.skillAttempt.findMany.mockResolvedValue([
            attempt({ isCorrect: true }),
            attempt({ isCorrect: false }),
            attempt({ isCorrect: false }),
            attempt({ isCorrect: false }),
        ]);

        const result = await detectErrorStreak('user-1', 'harf-tanima');

        expect(result.ardisikYanlisSayisi).toBe(3);
        expect(result.sonDenemeSayisi).toBe(4);
        expect(result.sonDenemeBasariOrani).toBe(0.25);
    });

    it('resets the streak to 0 when the most recent attempt was correct', async () => {
        mockDb.skillAttempt.findMany.mockResolvedValue([
            attempt({ isCorrect: false }),
            attempt({ isCorrect: false }),
            attempt({ isCorrect: true }),
        ]);

        const result = await detectErrorStreak('user-1', 'harf-tanima');

        expect(result.ardisikYanlisSayisi).toBe(0);
    });

    it('averages reactionTime only across attempts that have it', async () => {
        mockDb.skillAttempt.findMany.mockResolvedValue([
            attempt({ reactionTime: 1000 }),
            attempt({ reactionTime: null }),
            attempt({ reactionTime: 2000 }),
        ]);

        const result = await detectErrorStreak('user-1', 'harf-tanima');

        expect(result.sonDenemeOrtalamaTepkiSuresi).toBe(1500);
    });

    it('only considers the last 10 attempts (sample window, not a threshold)', async () => {
        const history = [
            ...Array.from({ length: 11 }, () => attempt({ isCorrect: false })),
        ];
        history[0] = attempt({ isCorrect: true }); // oldest — outside the window, should not stop the streak count
        mockDb.skillAttempt.findMany.mockResolvedValue(history);

        const result = await detectErrorStreak('user-1', 'harf-tanima');

        expect(result.sonDenemeSayisi).toBe(10);
        expect(result.ardisikYanlisSayisi).toBe(10);
    });
});
