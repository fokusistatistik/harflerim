import { describe, expect, it } from 'vitest';
import letterPaths from './letterPaths.json';

const EXPECTED_LETTERS = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N',
    'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
];

describe('letterPaths.json', () => {
    it('contains exactly the 28-letter set used by gameData.ts', () => {
        expect(Object.keys(letterPaths).sort()).toEqual([...EXPECTED_LETTERS].sort());
    });

    it('gives every letter a non-empty SVG path and a valid viewBox', () => {
        for (const letter of EXPECTED_LETTERS) {
            const entry = (letterPaths as Record<string, { path: string; viewBox: string }>)[letter];
            expect(entry.path.length).toBeGreaterThan(0);
            expect(entry.viewBox.split(' ')).toHaveLength(4);
        }
    });
});
