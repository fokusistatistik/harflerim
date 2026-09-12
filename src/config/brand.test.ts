import { describe, expect, it } from 'vitest';
import { possessive, worldName } from './brand';

describe('possessive', () => {
    it.each([
        ['Melike', "Melike'nin"],
        ['Emre', "Emre'nin"],
        ['Zeynep', "Zeynep'in"],
        ['Ayşe', "Ayşe'nin"],
        ['Kuzu', "Kuzu'nun"],
        ['Ömer', "Ömer'in"],
        ['Defne', "Defne'nin"],
        ['Yusuf', "Yusuf'un"],
        ['Elif', "Elif'in"],
    ])('%s -> %s', (name, expected) => {
        expect(possessive(name)).toBe(expected);
    });

    it('returns empty string for empty input', () => {
        expect(possessive('')).toBe('');
        expect(possessive('   ')).toBe('');
    });
});

describe('worldName', () => {
    it('appends Dünyası to the possessive form', () => {
        expect(worldName('Melike')).toBe("Melike'nin Dünyası");
        expect(worldName('Yusuf')).toBe("Yusuf'un Dünyası");
    });
});
