import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    auditLog: { findMany: vi.fn() },
};

const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});

const { listRecentAuditLog } = await import('./auditLogView');

describe('listRecentAuditLog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        expect(await listRecentAuditLog()).toEqual([]);
        expect(mockDb.auditLog.findMany).not.toHaveBeenCalled();
    });

    it('scopes the query to the current user, newest first, capped at 50', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.auditLog.findMany.mockResolvedValue([]);

        await listRecentAuditLog();

        expect(mockDb.auditLog.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    });

    it('maps db rows to plain entries with an ISO date string', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        const createdAt = new Date('2026-09-13T12:00:00.000Z');
        mockDb.auditLog.findMany.mockResolvedValue([
            { id: 'a1', eventType: 'PIN_CHANGED', detail: null, createdAt },
        ]);

        const result = await listRecentAuditLog();

        expect(result).toEqual([
            { id: 'a1', eventType: 'PIN_CHANGED', detail: null, createdAt: createdAt.toISOString() },
        ]);
    });
});
