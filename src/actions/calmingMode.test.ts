import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetCurrentUser = vi.fn();
const mockDetectErrorStreak = vi.fn();

vi.mock('@/lib/auth', () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock('@/lib/skillAnalytics', () => ({ detectErrorStreak: mockDetectErrorStreak }));

const { checkCalmingModeTrigger } = await import('./calmingMode');

describe('checkCalmingModeTrigger', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns false when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await expect(checkCalmingModeTrigger('harf-tanima')).resolves.toBe(false);
        expect(mockDetectErrorStreak).not.toHaveBeenCalled();
    });

    it('returns false when the consecutive-wrong streak is below the threshold (5)', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 4,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.3,
            sonDenemeOrtalamaTepkiSuresi: 1000,
        });

        await expect(checkCalmingModeTrigger('harf-tanima')).resolves.toBe(false);
    });

    it('returns true when the consecutive-wrong streak reaches the threshold (5)', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 5,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.1,
            sonDenemeOrtalamaTepkiSuresi: 500,
        });

        await expect(checkCalmingModeTrigger('harf-tanima')).resolves.toBe(true);
    });

    it('passes the given skillKey and the current user id through to detectErrorStreak', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-42' });
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 0,
            sonDenemeBasariOrani: null,
            sonDenemeOrtalamaTepkiSuresi: null,
        });

        await checkCalmingModeTrigger('gorsel-hafiza');

        expect(mockDetectErrorStreak).toHaveBeenCalledWith('user-42', 'gorsel-hafiza');
    });
});
