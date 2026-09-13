import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    drawing: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
};

const mockGetCurrentUser = vi.fn();
const mockSaveUploadedFile = vi.fn();
const mockDeleteUploadedFile = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', async () => {
    const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
    return { ...actual, getCurrentUser: mockGetCurrentUser };
});
vi.mock('@/lib/mediaStorage', () => ({
    saveUploadedFile: mockSaveUploadedFile,
    deleteUploadedFile: mockDeleteUploadedFile,
}));

const { listDrawings, saveDrawing, deleteDrawing } = await import('./drawings');

describe('listDrawings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        expect(await listDrawings()).toEqual([]);
    });
});

describe('saveDrawing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockSaveUploadedFile.mockResolvedValue('/uploads/drawings/generated.png');
    });

    it('rejects when the image is missing', async () => {
        const fd = new FormData();
        const result = await saveDrawing(fd);

        expect(result.ok).toBe(false);
        expect(mockDb.drawing.create).not.toHaveBeenCalled();
    });

    it('saves the file and creates the record', async () => {
        const fd = new FormData();
        fd.set('image', new File(['x'], 'd.png', { type: 'image/png' }));

        const result = await saveDrawing(fd);

        expect(result).toEqual({ ok: true });
        expect(mockDb.drawing.create).toHaveBeenCalledWith({
            data: { userId: 'user-1', filePath: '/uploads/drawings/generated.png' },
        });
    });

    it('returns an error when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const fd = new FormData();
        fd.set('image', new File(['x'], 'd.png', { type: 'image/png' }));

        const result = await saveDrawing(fd);

        expect(result.ok).toBe(false);
        expect(mockSaveUploadedFile).not.toHaveBeenCalled();
    });
});

describe('deleteDrawing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('rejects deleting a drawing belonging to a different user', async () => {
        mockDb.drawing.findUnique.mockResolvedValue({ id: 'd1', userId: 'someone-else', filePath: '/uploads/drawings/x.png' });

        const result = await deleteDrawing('d1');

        expect(result.ok).toBe(false);
        expect(mockDb.drawing.delete).not.toHaveBeenCalled();
    });

    it('deletes the record and file', async () => {
        mockDb.drawing.findUnique.mockResolvedValue({ id: 'd1', userId: 'user-1', filePath: '/uploads/drawings/x.png' });

        const result = await deleteDrawing('d1');

        expect(result).toEqual({ ok: true });
        expect(mockDeleteUploadedFile).toHaveBeenCalledWith('/uploads/drawings/x.png');
    });
});
