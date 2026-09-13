import { describe, expect, it } from 'vitest';
import { AAC_CATEGORIES } from './aacData';

describe('AAC_CATEGORIES', () => {
    it('has at least 3 categories', () => {
        expect(AAC_CATEGORIES.length).toBeGreaterThanOrEqual(3);
    });

    it('has between 15 and 20 symbols in total (Faz 3.7 v1 kapsamı)', () => {
        const total = AAC_CATEGORIES.reduce((sum, c) => sum + c.symbols.length, 0);
        expect(total).toBeGreaterThanOrEqual(15);
        expect(total).toBeLessThanOrEqual(20);
    });

    it('gives every category a non-empty id and label', () => {
        for (const category of AAC_CATEGORIES) {
            expect(category.id.length).toBeGreaterThan(0);
            expect(category.label.length).toBeGreaterThan(0);
        }
    });

    it('gives every symbol a positive arasaacId, a non-empty word, and a matching ARASAAC image URL', () => {
        for (const category of AAC_CATEGORIES) {
            for (const symbol of category.symbols) {
                expect(symbol.arasaacId).toBeGreaterThan(0);
                expect(symbol.word.length).toBeGreaterThan(0);
                expect(symbol.imageUrl).toBe(`https://static.arasaac.org/pictograms/${symbol.arasaacId}/${symbol.arasaacId}_500.png`);
            }
        }
    });

    it('never repeats the same arasaacId across the whole board', () => {
        const ids = AAC_CATEGORIES.flatMap((c) => c.symbols.map((s) => s.arasaacId));
        expect(new Set(ids).size).toBe(ids.length);
    });
});
