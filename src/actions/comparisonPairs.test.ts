import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    comparisonItem: { findMany: vi.fn() },
};

const mockGetChildProfile = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/actions/childProfile', () => ({ getChildProfile: mockGetChildProfile }));

const { getComparisonPairsPool } = await import('./comparisonPairs');

function item(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        id: 'item-1',
        name: 'Araba',
        category: 'oyuncak',
        color: 'kırmızı',
        tags: 'oyuncak,taşıt,kırmızı',
        imageUrl: '/karsilastirma/araba.jpg',
        isActive: true,
        ...overrides,
    };
}

describe('getComparisonPairsPool', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetChildProfile.mockResolvedValue(null);
    });

    it('returns an empty list when the pool is empty', async () => {
        mockDb.comparisonItem.findMany.mockResolvedValue([]);
        expect(await getComparisonPairsPool(5)).toEqual([]);
    });

    it('queries only active items', async () => {
        mockDb.comparisonItem.findMany.mockResolvedValue([]);
        await getComparisonPairsPool(5);
        expect(mockDb.comparisonItem.findMany).toHaveBeenCalledWith({ where: { isActive: true } });
    });

    it('clamps pairCount into [1, 12] and returns that many items when available', async () => {
        const items = Array.from({ length: 20 }, (_, i) => item({ id: `item-${i}`, name: `Nesne ${i}` }));
        mockDb.comparisonItem.findMany.mockResolvedValue(items);

        expect(await getComparisonPairsPool(15)).toHaveLength(12);
        expect(await getComparisonPairsPool(0)).toHaveLength(1);
    });

    it('returns fewer items than requested when the pool is smaller', async () => {
        mockDb.comparisonItem.findMany.mockResolvedValue([item({ id: 'a' }), item({ id: 'b' })]);
        expect(await getComparisonPairsPool(5)).toHaveLength(2);
    });

    it('prioritizes items matching the child profile interests', async () => {
        const cat = item({ id: 'kedi', name: 'Kedi', category: 'hayvan', tags: 'hayvan,evcil,turuncu' });
        const others = Array.from({ length: 10 }, (_, i) => item({ id: `other-${i}`, name: `Nesne ${i}`, category: 'esya', tags: 'esya' }));
        mockDb.comparisonItem.findMany.mockResolvedValue([...others, cat]);
        mockGetChildProfile.mockResolvedValue({ interests: ['kedi'] });

        const result = await getComparisonPairsPool(1);

        expect(result).toEqual([{ id: 'kedi', name: 'Kedi', imageUrl: cat.imageUrl }]);
    });

    it('is case/locale-insensitive when matching interests (Turkish İ/ı)', async () => {
        const cat = item({ id: 'kedi', name: 'Kedi', category: 'hayvan', tags: 'hayvan' });
        mockDb.comparisonItem.findMany.mockResolvedValue([item({ id: 'other' }), cat]);
        mockGetChildProfile.mockResolvedValue({ interests: ['KEDİ'] });

        const result = await getComparisonPairsPool(1);

        expect(result[0].id).toBe('kedi');
    });

    it('falls back to the general pool when no interests match', async () => {
        mockDb.comparisonItem.findMany.mockResolvedValue([item({ id: 'a' })]);
        mockGetChildProfile.mockResolvedValue({ interests: ['dinozor'] });

        const result = await getComparisonPairsPool(1);

        expect(result).toEqual([{ id: 'a', name: 'Araba', imageUrl: item().imageUrl }]);
    });

    it('maps returned items to the {id, name, imageUrl} shape', async () => {
        mockDb.comparisonItem.findMany.mockResolvedValue([item()]);
        const result = await getComparisonPairsPool(1);
        expect(result[0]).toEqual({ id: 'item-1', name: 'Araba', imageUrl: '/karsilastirma/araba.jpg' });
    });
});
