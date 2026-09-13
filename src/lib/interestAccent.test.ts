import { describe, expect, it } from 'vitest';
import { Cat, Rocket, Star } from 'lucide-react';
import { getInterestIcon } from './interestAccent';

describe('getInterestIcon', () => {
    it('matches a known interest case-insensitively', () => {
        expect(getInterestIcon(['Kedi'])).toBe(Cat);
    });

    it('matches the first known interest when several are given', () => {
        expect(getInterestIcon(['bilinmeyen-bir-sey', 'uzay'])).toBe(Rocket);
    });

    it('falls back to Star when nothing matches', () => {
        expect(getInterestIcon(['bilinmeyen-bir-sey'])).toBe(Star);
    });

    it('falls back to Star for an empty interest list', () => {
        expect(getInterestIcon([])).toBe(Star);
    });

    it('trims whitespace before matching', () => {
        expect(getInterestIcon(['  kedi  '])).toBe(Cat);
    });
});
