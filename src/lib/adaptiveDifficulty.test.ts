import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDetectErrorStreak = vi.fn();

vi.mock('@/lib/skillAnalytics', () => ({ detectErrorStreak: mockDetectErrorStreak }));

const { getAdaptiveConfig, BASE_ADAPTIVE_CONFIG, getAdaptiveMemoryConfig, BASE_MEMORY_ADAPTIVE_CONFIG } = await import('./adaptiveDifficulty');

describe('getAdaptiveConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the base (easiest) config when there is no history yet', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 0,
            sonDenemeBasariOrani: null,
            sonDenemeOrtalamaTepkiSuresi: null,
        });

        await expect(getAdaptiveConfig('user-1')).resolves.toEqual(BASE_ADAPTIVE_CONFIG);
    });

    it('drops to the easiest config on 3+ consecutive wrong answers, regardless of overall success rate', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 3,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.9,
            sonDenemeOrtalamaTepkiSuresi: 1000,
        });

        await expect(getAdaptiveConfig('user-1')).resolves.toEqual({ optionCount: 2, distractorType: 'random', weakLetters: [] });
    });

    it('increases difficulty (similar distractors) on strong recent performance', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 1,
            sonDenemeOrtalamaTepkiSuresi: 1000,
        });

        const result = await getAdaptiveConfig('user-1');

        expect(result.distractorType).toBe('similar');
        expect(result.optionCount).toBeGreaterThan(BASE_ADAPTIVE_CONFIG.optionCount);
        expect(result.optionCount).toBeLessThanOrEqual(12);
    });

    it('keeps a moderate config on middling performance', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 1,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.6,
            sonDenemeOrtalamaTepkiSuresi: 1500,
        });

        await expect(getAdaptiveConfig('user-1')).resolves.toEqual({ optionCount: 4, distractorType: 'random', weakLetters: [] });
    });

    it('returns the easiest config on weak performance', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 1,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.3,
            sonDenemeOrtalamaTepkiSuresi: 1500,
        });

        await expect(getAdaptiveConfig('user-1')).resolves.toEqual({ optionCount: 2, distractorType: 'random', weakLetters: [] });
    });
});

describe('getAdaptiveMemoryConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the base (easiest) config when there is no history yet', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 0,
            sonDenemeBasariOrani: null,
            sonDenemeOrtalamaTepkiSuresi: null,
        });

        await expect(getAdaptiveMemoryConfig('user-1')).resolves.toEqual(BASE_MEMORY_ADAPTIVE_CONFIG);
    });

    it('drops to the minimum on 3+ consecutive wrong answers', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 3,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.9,
            sonDenemeOrtalamaTepkiSuresi: 1000,
        });

        await expect(getAdaptiveMemoryConfig('user-1')).resolves.toEqual({ pairCount: 3 });
    });

    it('scales up pairCount on strong recent performance, capped at 8', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 0,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 1,
            sonDenemeOrtalamaTepkiSuresi: 1000,
        });

        const result = await getAdaptiveMemoryConfig('user-1');

        expect(result.pairCount).toBeGreaterThan(BASE_MEMORY_ADAPTIVE_CONFIG.pairCount);
        expect(result.pairCount).toBeLessThanOrEqual(8);
    });

    it('keeps a moderate config (4 pairs) on middling performance', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 1,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.6,
            sonDenemeOrtalamaTepkiSuresi: 1500,
        });

        await expect(getAdaptiveMemoryConfig('user-1')).resolves.toEqual({ pairCount: 4 });
    });

    it('returns the easiest config on weak performance', async () => {
        mockDetectErrorStreak.mockResolvedValue({
            ardisikYanlisSayisi: 1,
            sonDenemeSayisi: 10,
            sonDenemeBasariOrani: 0.3,
            sonDenemeOrtalamaTepkiSuresi: 1500,
        });

        await expect(getAdaptiveMemoryConfig('user-1')).resolves.toEqual({ pairCount: 3 });
    });
});
