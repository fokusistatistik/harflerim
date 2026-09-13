import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    user: { update: vi.fn(), findUnique: vi.fn() },
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

const { getIdentity, updateIdentity, updateUsername, updateAvatar } = await import('./identity');

describe('getIdentity', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('returns null when there is no session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        expect(await getIdentity()).toBeNull();
    });

    it('returns the identity fields from the current user', async () => {
        mockGetCurrentUser.mockResolvedValue({ firstName: 'Melike', lastName: 'X', username: 'Melike', avatarUrl: '/uploads/avatar/a.jpg' });
        expect(await getIdentity()).toEqual({ firstName: 'Melike', lastName: 'X', username: 'Melike', avatarUrl: '/uploads/avatar/a.jpg' });
    });
});

describe('updateIdentity', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('rejects an empty first name without touching the DB', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        const result = await updateIdentity('   ', 'Soyad');
        expect(result.ok).toBe(false);
        expect(mockDb.user.update).not.toHaveBeenCalled();
    });

    it('trims and saves first/last name, logs SETTINGS_CHANGED', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        const result = await updateIdentity('  Melike ', ' Bostanoğlu ');
        expect(result.ok).toBe(true);
        expect(mockDb.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { firstName: 'Melike', lastName: 'Bostanoğlu' },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', 'İsim güncellendi');
    });

    it('fails when there is no session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const result = await updateIdentity('Melike', 'X');
        expect(result.ok).toBe(false);
    });
});

describe('updateUsername', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('rejects a too-short username', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', username: 'Melike' });
        const result = await updateUsername('a');
        expect(result.ok).toBe(false);
        expect(mockDb.user.update).not.toHaveBeenCalled();
    });

    it('rejects a username already taken by someone else', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', username: 'Melike' });
        mockDb.user.findUnique.mockResolvedValue({ id: 'user-2', username: 'Ayse' });
        const result = await updateUsername('Ayse');
        expect(result.ok).toBe(false);
        expect(mockDb.user.update).not.toHaveBeenCalled();
    });

    it('allows keeping the same username unchanged without a uniqueness lookup', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', username: 'Melike' });
        const result = await updateUsername('Melike');
        expect(result.ok).toBe(true);
        expect(mockDb.user.findUnique).not.toHaveBeenCalled();
        expect(mockDb.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { username: 'Melike' } });
    });

    it('trims and saves a new, available username, logs SETTINGS_CHANGED', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', username: 'Melike' });
        mockDb.user.findUnique.mockResolvedValue(null);
        const result = await updateUsername('  MelikeYeni ');
        expect(result.ok).toBe(true);
        expect(mockDb.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { username: 'MelikeYeni' } });
        expect(mockLogAudit).toHaveBeenCalledWith('SETTINGS_CHANGED', 'user-1', 'Kullanıcı adı güncellendi');
    });

    it('fails when there is no session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const result = await updateUsername('Melike');
        expect(result.ok).toBe(false);
    });
});

describe('updateAvatar', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('rejects when no file is provided', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', avatarUrl: null });
        const result = await updateAvatar(new FormData());
        expect(result.ok).toBe(false);
        expect(mockSaveUploadedFile).not.toHaveBeenCalled();
    });

    it('saves the file, updates the user, and deletes the previous avatar', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', avatarUrl: '/uploads/avatar/old.jpg' });
        mockSaveUploadedFile.mockResolvedValue('/uploads/avatar/new.jpg');

        const fd = new FormData();
        fd.set('avatar', new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
        const result = await updateAvatar(fd);

        expect(result).toEqual({ ok: true, avatarUrl: '/uploads/avatar/new.jpg' });
        expect(mockDb.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { avatarUrl: '/uploads/avatar/new.jpg' },
        });
        expect(mockDeleteUploadedFile).toHaveBeenCalledWith('/uploads/avatar/old.jpg');
    });

    it('does not try to delete a previous avatar when there was none', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', avatarUrl: null });
        mockSaveUploadedFile.mockResolvedValue('/uploads/avatar/new.jpg');

        const fd = new FormData();
        fd.set('avatar', new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
        await updateAvatar(fd);

        expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
    });
});
