import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractYoutubeId, fetchYoutubeMeta } from './youtube';

describe('extractYoutubeId', () => {
    it('extracts the id from a standard watch URL', () => {
        expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts the id from a watch URL with extra query params', () => {
        expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=xyz')).toBe('dQw4w9WgXcQ');
    });

    it('extracts the id from a youtu.be short link', () => {
        expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extracts the id from a shorts URL', () => {
        expect(extractYoutubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('handles m.youtube.com', () => {
        expect(extractYoutubeId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('returns null for a non-YouTube URL', () => {
        expect(extractYoutubeId('https://vimeo.com/12345')).toBeNull();
    });

    it('returns null for a malformed URL', () => {
        expect(extractYoutubeId('not a url')).toBeNull();
    });

    it('returns null when the video id looks invalid', () => {
        expect(extractYoutubeId('https://www.youtube.com/watch?v=short')).toBeNull();
    });
});

describe('fetchYoutubeMeta', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns title/thumbnail on a successful oEmbed response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ title: 'Test Video', thumbnail_url: 'https://img/thumb.jpg' }),
            })
        );

        const result = await fetchYoutubeMeta('dQw4w9WgXcQ');

        expect(result).toEqual({ title: 'Test Video', thumbnailUrl: 'https://img/thumb.jpg' });
    });

    it('returns null when the response is not ok', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

        const result = await fetchYoutubeMeta('invalid');

        expect(result).toBeNull();
    });

    it('returns null when fetch throws', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

        const result = await fetchYoutubeMeta('dQw4w9WgXcQ');

        expect(result).toBeNull();
    });
});
