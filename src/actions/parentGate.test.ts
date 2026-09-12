import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

const mockDb = {
    userSettings: { update: vi.fn() },
};

const mockGetCurrentUser = vi.fn();
const mockLogAudit = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});
vi.mock('@/lib/auditLog', () => ({ logAudit: mockLogAudit }));

const { verifyParentPin, changeParentPin } = await import('./parentGate');

async function userWithPin(pin: string) {
    return {
        id: 'user-1',
        settings: { parentPin: await bcrypt.hash(pin, 10) },
    };
}

describe('verifyParentPin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns true and logs PARENT_GATE_UNLOCKED for the correct PIN', async () => {
        mockGetCurrentUser.mockResolvedValue(await userWithPin('0000'));

        const result = await verifyParentPin('0000');

        expect(result).toBe(true);
        expect(mockLogAudit).toHaveBeenCalledWith('PARENT_GATE_UNLOCKED', 'user-1');
    });

    it('returns false and logs PARENT_GATE_DENIED for the wrong PIN', async () => {
        mockGetCurrentUser.mockResolvedValue(await userWithPin('0000'));

        const result = await verifyParentPin('9999');

        expect(result).toBe(false);
        expect(mockLogAudit).toHaveBeenCalledWith('PARENT_GATE_DENIED', 'user-1');
    });

    it('returns false when there is no current user/session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await verifyParentPin('0000');

        expect(result).toBe(false);
        expect(mockLogAudit).not.toHaveBeenCalled();
    });
});

describe('changeParentPin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects when the current PIN is wrong', async () => {
        mockGetCurrentUser.mockResolvedValue(await userWithPin('0000'));

        const result = await changeParentPin('9999', '1234');

        expect(result).toEqual({ ok: false, error: 'Mevcut PIN yanlış.' });
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('rejects a malformed new PIN', async () => {
        mockGetCurrentUser.mockResolvedValue(await userWithPin('0000'));

        const result = await changeParentPin('0000', 'abcd');

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('hashes and stores a valid new PIN, and logs PIN_CHANGED', async () => {
        mockGetCurrentUser.mockResolvedValue(await userWithPin('0000'));

        const result = await changeParentPin('0000', '4321');

        expect(result).toEqual({ ok: true });
        expect(mockDb.userSettings.update).toHaveBeenCalledTimes(1);
        const call = mockDb.userSettings.update.mock.calls[0][0];
        expect(call.where).toEqual({ userId: 'user-1' });
        expect(call.data.parentPin).not.toBe('4321'); // hashlenmiş olmalı, düz metin değil
        expect(await bcrypt.compare('4321', call.data.parentPin)).toBe(true);
        expect(mockLogAudit).toHaveBeenCalledWith('PIN_CHANGED', 'user-1');
    });
});
