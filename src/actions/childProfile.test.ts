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

const { getChildProfile, updateChildProfile } = await import('./childProfile');

function userWithSettings(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'user-1',
        settings: {
            age: null,
            gender: null,
            favoriteColor: null,
            interests: null,
            learningChannel: null,
            sensoryProfile: null,
            triggers: null,
            calmers: null,
            communicationLevel: null,
            ...overrides,
        },
    };
}

const FULL_PROFILE = {
    age: 7,
    gender: 'kız',
    favoriteColor: 'sarı',
    interests: ['kedi', 'gezegenler'],
    learningChannel: 'visual',
    sensoryProfile: { sound: 'high' as const },
    triggers: ['ani ses'],
    calmers: ['müzik'],
    communicationLevel: 'mixed',
};

describe('getChildProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('parses stored JSON fields back into structured data', async () => {
        mockGetCurrentUser.mockResolvedValue(
            userWithSettings({
                age: 7,
                interests: '["kedi","gezegenler"]',
                sensoryProfile: '{"sound":"high"}',
            })
        );

        const result = await getChildProfile();

        expect(result?.age).toBe(7);
        expect(result?.interests).toEqual(['kedi', 'gezegenler']);
        expect(result?.sensoryProfile).toEqual({ sound: 'high' });
    });

    it('returns null when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await getChildProfile();

        expect(result).toBeNull();
    });
});

describe('updateChildProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue(userWithSettings());
    });

    it('rejects an out-of-range age', async () => {
        const result = await updateChildProfile({ ...FULL_PROFILE, age: 40 });

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });

    it('serializes list/object fields and logs SETTINGS_CHANGED', async () => {
        const result = await updateChildProfile(FULL_PROFILE);

        expect(result).toEqual({ ok: true });
        expect(mockDb.userSettings.update).toHaveBeenCalledTimes(1);
        const call = mockDb.userSettings.update.mock.calls[0][0];
        expect(call.where).toEqual({ userId: 'user-1' });
        expect(JSON.parse(call.data.interests)).toEqual(['kedi', 'gezegenler']);
        expect(JSON.parse(call.data.sensoryProfile)).toEqual({ sound: 'high' });
        expect(call.data.age).toBe(7);
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', expect.any(String));
    });

    it('stores empty strings as null for optional text fields', async () => {
        await updateChildProfile({ ...FULL_PROFILE, gender: '', favoriteColor: '' });

        const call = mockDb.userSettings.update.mock.calls[0][0];
        expect(call.data.gender).toBeNull();
        expect(call.data.favoriteColor).toBeNull();
    });

    it('returns an error when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await updateChildProfile(FULL_PROFILE);

        expect(result.ok).toBe(false);
        expect(mockDb.userSettings.update).not.toHaveBeenCalled();
    });
});
