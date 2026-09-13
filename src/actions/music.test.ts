import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    song: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    songPlayCount: { findUnique: vi.fn(), upsert: vi.fn() },
};

const mockGetCurrentUser = vi.fn();
const mockLogAudit = vi.fn();
const mockFetchYoutubeMeta = vi.fn();
const mockExtractYoutubeId = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});
vi.mock('@/lib/auditLog', () => ({ logAudit: mockLogAudit }));
vi.mock('@/lib/youtube', () => ({
    extractYoutubeId: mockExtractYoutubeId,
    fetchYoutubeMeta: mockFetchYoutubeMeta,
}));

const { listSongs, addSong, deleteSong, reportSongPlay } = await import('./music');

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

describe('listSongs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        expect(await listSongs()).toEqual([]);
    });

    it('maps db rows including today\'s play count', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.song.findMany.mockResolvedValue([
            {
                id: 's1',
                youtubeId: 'abc',
                title: 'Şarkı',
                thumbnailUrl: 'http://x/thumb.jpg',
                dailyLoopLimit: 3,
                playCounts: [{ playCount: 2 }],
            },
        ]);

        const result = await listSongs();

        expect(result).toEqual([
            { id: 's1', youtubeId: 'abc', title: 'Şarkı', thumbnailUrl: 'http://x/thumb.jpg', dailyLoopLimit: 3, playsToday: 2 },
        ]);
    });
});

describe('addSong', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('rejects an unrecognized YouTube URL', async () => {
        mockExtractYoutubeId.mockReturnValue(null);

        const result = await addSong('https://vimeo.com/1', 3);

        expect(result.ok).toBe(false);
        expect(mockDb.song.create).not.toHaveBeenCalled();
    });

    it('rejects a daily loop limit outside 1-20', async () => {
        mockExtractYoutubeId.mockReturnValue('abc12345678');

        const result = await addSong('https://youtu.be/abc12345678', 0);

        expect(result.ok).toBe(false);
        expect(mockDb.song.create).not.toHaveBeenCalled();
    });

    it('rejects when oEmbed metadata cannot be fetched', async () => {
        mockExtractYoutubeId.mockReturnValue('abc12345678');
        mockFetchYoutubeMeta.mockResolvedValue(null);

        const result = await addSong('https://youtu.be/abc12345678', 3);

        expect(result.ok).toBe(false);
        expect(mockDb.song.create).not.toHaveBeenCalled();
    });

    it('creates the song and logs CONTENT_ADDED on success', async () => {
        mockExtractYoutubeId.mockReturnValue('abc12345678');
        mockFetchYoutubeMeta.mockResolvedValue({ title: 'Şarkı', thumbnailUrl: 'http://x/thumb.jpg' });

        const result = await addSong('https://youtu.be/abc12345678', 3);

        expect(result).toEqual({ ok: true });
        expect(mockDb.song.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                youtubeId: 'abc12345678',
                title: 'Şarkı',
                thumbnailUrl: 'http://x/thumb.jpg',
                dailyLoopLimit: 3,
            },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('CONTENT_ADDED', 'user-1', 'Şarkı');
    });
});

describe('deleteSong', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('rejects deleting a song belonging to a different user', async () => {
        mockDb.song.findUnique.mockResolvedValue({ id: 's1', userId: 'someone-else', title: 'X' });

        const result = await deleteSong('s1');

        expect(result.ok).toBe(false);
        expect(mockDb.song.delete).not.toHaveBeenCalled();
    });

    it('deletes and logs CONTENT_REMOVED', async () => {
        mockDb.song.findUnique.mockResolvedValue({ id: 's1', userId: 'user-1', title: 'Şarkı' });

        const result = await deleteSong('s1');

        expect(result).toEqual({ ok: true });
        expect(mockLogAudit).toHaveBeenCalledWith('CONTENT_REMOVED', 'user-1', 'Şarkı');
    });
});

describe('reportSongPlay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('returns null for a song belonging to a different user', async () => {
        mockDb.song.findUnique.mockResolvedValue({ id: 's1', userId: 'someone-else', dailyLoopLimit: 3 });

        const result = await reportSongPlay('s1');

        expect(result).toBeNull();
    });

    it('increments the play count and reports limitReached: false under the limit', async () => {
        mockDb.song.findUnique.mockResolvedValue({ id: 's1', userId: 'user-1', dailyLoopLimit: 3 });
        mockDb.songPlayCount.findUnique.mockResolvedValue({ playCount: 1 });

        const result = await reportSongPlay('s1');

        expect(result).toEqual({ playsToday: 2, limitReached: false });
        expect(mockDb.songPlayCount.upsert).toHaveBeenCalledWith({
            where: { songId_date: { songId: 's1', date: todayString() } },
            create: { songId: 's1', date: todayString(), playCount: 2 },
            update: { playCount: 2 },
        });
    });

    it('reports limitReached: true once the daily loop limit is hit', async () => {
        mockDb.song.findUnique.mockResolvedValue({ id: 's1', userId: 'user-1', dailyLoopLimit: 3 });
        mockDb.songPlayCount.findUnique.mockResolvedValue({ playCount: 2 });

        const result = await reportSongPlay('s1');

        expect(result).toEqual({ playsToday: 3, limitReached: true });
    });

    it('starts at count 1 when no row exists yet today', async () => {
        mockDb.song.findUnique.mockResolvedValue({ id: 's1', userId: 'user-1', dailyLoopLimit: 3 });
        mockDb.songPlayCount.findUnique.mockResolvedValue(null);

        const result = await reportSongPlay('s1');

        expect(result).toEqual({ playsToday: 1, limitReached: false });
    });
});
