import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    userSettings: { upsert: vi.fn(), findUnique: vi.fn() },
    session: { findMany: vi.fn(), upsert: vi.fn() },
    auditLog: { create: vi.fn() },
    skill: { findUnique: vi.fn() },
    skillAttempt: { create: vi.fn() },
    badge: { create: vi.fn() },
};

const mockAuth = {
    getCurrentUser: vi.fn(),
};

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mockAuth.getCurrentUser }));

const { updateArcadeLimit } = await import('./arcade');

describe('updateArcadeLimit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects when not logged in', async () => {
        mockAuth.getCurrentUser.mockResolvedValue(null);
        const result = await updateArcadeLimit(30);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Oturum');
    });

    it('rejects values below 10 minutes', async () => {
        mockAuth.getCurrentUser.mockResolvedValue({ id: 'user-1' });
        const result = await updateArcadeLimit(5);
        expect(result.success).toBe(false);
        expect(result.error).toContain('10 ile 60');
    });

    it('rejects values above 60 minutes', async () => {
        mockAuth.getCurrentUser.mockResolvedValue({ id: 'user-1' });
        const result = await updateArcadeLimit(75);
        expect(result.success).toBe(false);
        expect(result.error).toContain('10 ile 60');
    });

    it('updates userSettings with converted seconds and creates audit log', async () => {
        mockAuth.getCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.userSettings.upsert.mockResolvedValue({});
        mockDb.auditLog.create.mockResolvedValue({});

        const result = await updateArcadeLimit(45);
        expect(result.success).toBe(true);

        expect(mockDb.userSettings.upsert).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            create: { userId: 'user-1', dailyArcadeScreenLimit: 45 * 60 },
            update: { dailyArcadeScreenLimit: 45 * 60 },
        });

        expect(mockDb.auditLog.create).toHaveBeenCalledWith({
            data: {
                eventType: 'SETTINGS_CHANGED',
                userId: 'user-1',
                detail: expect.stringContaining('45 dakika'),
            },
        });
    });
});
