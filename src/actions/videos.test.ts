import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    video: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
};

const mockGetCurrentUser = vi.fn();
const mockLogAudit = vi.fn();
const mockSaveUploadedFile = vi.fn();
const mockDeleteUploadedFile = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});
vi.mock('@/lib/auditLog', () => ({ logAudit: mockLogAudit }));
vi.mock('@/lib/mediaStorage', () => ({
    saveUploadedFile: mockSaveUploadedFile,
    deleteUploadedFile: mockDeleteUploadedFile,
}));

const { listVideos, addVideo, deleteVideo } = await import('./videos');

describe('listVideos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        expect(await listVideos()).toEqual([]);
    });
});

describe('addVideo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockSaveUploadedFile.mockResolvedValue('/uploads/videos/generated.mp4');
    });

    it('rejects when title is missing', async () => {
        const fd = new FormData();
        fd.set('file', new File(['x'], 'v.mp4', { type: 'video/mp4' }));

        const result = await addVideo(fd);

        expect(result.ok).toBe(false);
        expect(mockDb.video.create).not.toHaveBeenCalled();
    });

    it('rejects when the file is missing', async () => {
        const fd = new FormData();
        fd.set('title', 'Hikaye');

        const result = await addVideo(fd);

        expect(result.ok).toBe(false);
        expect(mockSaveUploadedFile).not.toHaveBeenCalled();
    });

    it('saves the file and creates the record, logging CONTENT_ADDED', async () => {
        const fd = new FormData();
        fd.set('title', 'Hikaye');
        fd.set('file', new File(['x'], 'v.mp4', { type: 'video/mp4' }));

        const result = await addVideo(fd);

        expect(result).toEqual({ ok: true });
        expect(mockDb.video.create).toHaveBeenCalledWith({
            data: { userId: 'user-1', title: 'Hikaye', filePath: '/uploads/videos/generated.mp4' },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('CONTENT_ADDED', 'user-1', 'Hikaye');
    });
});

describe('deleteVideo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('rejects deleting a video belonging to a different user', async () => {
        mockDb.video.findUnique.mockResolvedValue({ id: 'v1', userId: 'someone-else', title: 'X', filePath: '/uploads/videos/x.mp4' });

        const result = await deleteVideo('v1');

        expect(result.ok).toBe(false);
        expect(mockDb.video.delete).not.toHaveBeenCalled();
    });

    it('deletes the record and file, logging CONTENT_REMOVED', async () => {
        mockDb.video.findUnique.mockResolvedValue({ id: 'v1', userId: 'user-1', title: 'Hikaye', filePath: '/uploads/videos/x.mp4' });

        const result = await deleteVideo('v1');

        expect(result).toEqual({ ok: true });
        expect(mockDeleteUploadedFile).toHaveBeenCalledWith('/uploads/videos/x.mp4');
        expect(mockLogAudit).toHaveBeenCalledWith('CONTENT_REMOVED', 'user-1', 'Hikaye');
    });
});
