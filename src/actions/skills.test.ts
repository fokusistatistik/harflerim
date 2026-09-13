import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    skill: { findUnique: vi.fn() },
    skillAttempt: { create: vi.fn() },
    badge: { create: vi.fn() },
};

const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mockGetCurrentUser }));

const { recordSkillAttempt } = await import('./skills');

describe('recordSkillAttempt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a SkillAttempt row for a known skill key', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });

        await recordSkillAttempt('harf-tanima', 'letter-hunt', true, 1200);

        expect(mockDb.skillAttempt.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                skillId: 'skill-1',
                gameId: 'letter-hunt',
                isCorrect: true,
                reactionTime: 1200,
            },
        });
    });

    it('defaults reactionTime to null when not provided', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-2', key: 'gorsel-hafiza', label: 'Görsel Hafıza' });

        await recordSkillAttempt('gorsel-hafiza', 'memory-match', false);

        const call = mockDb.skillAttempt.create.mock.calls[0][0];
        expect(call.data.reactionTime).toBeNull();
    });

    it('silently no-ops for an unknown skill key (never throws)', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockResolvedValue(null);

        await expect(recordSkillAttempt('does-not-exist', 'letter-hunt', true)).resolves.toBeUndefined();
        expect(mockDb.skillAttempt.create).not.toHaveBeenCalled();
    });

    it('silently no-ops when there is no current user (never throws)', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await expect(recordSkillAttempt('harf-tanima', 'letter-hunt', true)).resolves.toBeUndefined();
        expect(mockDb.skill.findUnique).not.toHaveBeenCalled();
        expect(mockDb.skillAttempt.create).not.toHaveBeenCalled();
    });

    it('swallows unexpected db errors instead of throwing (never breaks the game flow)', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockRejectedValue(new Error('db unavailable'));

        await expect(recordSkillAttempt('harf-tanima', 'letter-hunt', true)).resolves.toBeUndefined();
    });

    it('awards a badge with the mapped emoji when isCorrect is true', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });

        await recordSkillAttempt('harf-tanima', 'letter-hunt', true);

        expect(mockDb.badge.create).toHaveBeenCalledWith({
            data: { userId: 'user-1', skillId: 'skill-1', emoji: '🔤', label: 'Harf Tanıma' },
        });
    });

    it('does not attempt to award a badge when isCorrect is false', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });

        await recordSkillAttempt('harf-tanima', 'letter-hunt', false);

        expect(mockDb.badge.create).not.toHaveBeenCalled();
    });

    it('silently ignores an already-earned badge (unique constraint) without throwing', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.skill.findUnique.mockResolvedValue({ id: 'skill-1', key: 'harf-tanima', label: 'Harf Tanıma' });
        mockDb.badge.create.mockRejectedValue(new Error('Unique constraint failed'));

        await expect(recordSkillAttempt('harf-tanima', 'letter-hunt', true)).resolves.toBeUndefined();
    });
});
