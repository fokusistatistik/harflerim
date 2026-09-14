import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const { getParentPreferences, updateScreenTimeLimit, updateLetterHuntLimit, updateMemoryMatchLimit, updateSensoryToggles } = await import('./parentSettings');

function userWithSettings(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'user-1',
        settings: {
            dailyScreenLimit: 1800,
            dailyLetterHuntLimit: 100,
            dailyMemoryMatchLimit: 20,
            reduceMotion: false,
            highContrast: false,
            speechEnabled: true,
            cameraEnabled: false,
            ...overrides,
        },
    };
}

describe('getParentPreferences', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('converts dailyScreenLimit seconds to minutes', async () => {
        mockGetCurrentUser.mockResolvedValue(userWithSettings({ dailyScreenLimit: 2400 }));

        const result = await getParentPreferences();

        expect(result?.dailyScreenLimitMinutes).toBe(40);
    });

    it('returns null when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await getParentPreferences();

        expect(result).toBeNull();
    });
});

describe('updateScreenTimeLimit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(userWithSettings());
    });

    it('rejects a value below the minimum', async () => {
        const result = await updateScreenTimeLimit(2);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('rejects a value above the maximum', async () => {
        const result = await updateScreenTimeLimit(1000);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('stores a valid value converted to seconds and logs SETTINGS_CHANGED', async () => {
        const result = await updateScreenTimeLimit(45);

        expect(result).toEqual({ ok: true });
        expect(mockDb.userSettings.update).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            data: { dailyScreenLimit: 2700 },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', expect.any(String));
    });
});

describe('updateLetterHuntLimit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(userWithSettings());
    });

    it('rejects a value below the minimum', async () => {
        const result = await updateLetterHuntLimit(10);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('rejects a value above the maximum', async () => {
        const result = await updateLetterHuntLimit(1000);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('stores a valid value and logs SETTINGS_CHANGED', async () => {
        const result = await updateLetterHuntLimit(150);

        expect(result).toEqual({ ok: true });
        expect(mockDb.userSettings.update).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            data: { dailyLetterHuntLimit: 150 },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', expect.any(String));
    });
});

describe('updateMemoryMatchLimit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(userWithSettings());
    });

    it('rejects a value below the minimum', async () => {
        const result = await updateMemoryMatchLimit(5);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('rejects a value above the maximum', async () => {
        const result = await updateMemoryMatchLimit(60);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('stores a valid value and logs SETTINGS_CHANGED', async () => {
        const result = await updateMemoryMatchLimit(30);

        expect(result).toEqual({ ok: true });
        expect(mockDb.userSettings.update).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            data: { dailyMemoryMatchLimit: 30 },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', expect.any(String));
    });
});

describe('updateSensoryToggles', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(userWithSettings());
    });

    it('writes only the provided fields and logs SETTINGS_CHANGED', async () => {
        const result = await updateSensoryToggles({ reduceMotion: true });

        expect(result).toEqual({ ok: true });
        expect(mockDb.userSettings.update).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            data: { reduceMotion: true },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', expect.any(String));
    });

    it('returns an error when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await updateSensoryToggles({ highContrast: true });

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });
});
