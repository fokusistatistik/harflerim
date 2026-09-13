import { describe, expect, it } from 'vitest';
import { t, tArray, interpolate } from './i18n';

describe('i18n', () => {
    it('resolves a dot-path string value', () => {
        expect(t('app.title')).toBe('Papatya');
    });

    it('resolves a dot-path array value', () => {
        const success = tArray('feedback.success');
        expect(Array.isArray(success)).toBe(true);
        expect(success.length).toBeGreaterThan(0);
        expect(success).toContain('Harika!');
    });

    it('throws a clear error when a path does not resolve to a string', () => {
        expect(() => t('feedback.success')).toThrow(/bir dize değil/);
    });

    it('throws a clear error when a path does not resolve to an array', () => {
        expect(() => tArray('app.title')).toThrow(/bir dizi değil/);
    });

    it('throws for an unknown path', () => {
        expect(() => t('does.not.exist')).toThrow();
    });

    it('interpolates {{key}} placeholders', () => {
        expect(interpolate('Hadi {{letter}} harfini bulalım!', { letter: 'A' })).toBe(
            'Hadi A harfini bulalım!'
        );
    });

    it('leaves unmatched placeholders as empty string', () => {
        expect(interpolate('Merhaba {{name}}', {})).toBe('Merhaba ');
    });
});
