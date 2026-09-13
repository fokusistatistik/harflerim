import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    familyMember: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
    },
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

const { listFamilyMembers, createFamilyMember, deleteFamilyMember } = await import('./familyMembers');

function photoFile(name = 'foto.jpg') {
    return new File(['x'], name, { type: 'image/jpeg' });
}

describe('listFamilyMembers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns an empty list when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const result = await listFamilyMembers();

        expect(result).toEqual([]);
        expect(mockDb.familyMember.findMany).not.toHaveBeenCalled();
    });

    it('maps db rows to FamilyMemberData', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockDb.familyMember.findMany.mockResolvedValue([
            { id: 'm1', name: 'Anne', relation: 'Anne', photoPath: '/uploads/family/a.jpg', voicePath: null },
        ]);

        const result = await listFamilyMembers();

        expect(result).toEqual([
            { id: 'm1', name: 'Anne', relation: 'Anne', photoPath: '/uploads/family/a.jpg', voicePath: null },
        ]);
    });
});

describe('createFamilyMember', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockSaveUploadedFile.mockImplementation(async (_file: File, subdir: string) => `/uploads/${subdir}/generated.jpg`);
    });

    it('rejects when name is missing', async () => {
        const fd = new FormData();
        fd.set('relation', 'Anne');
        fd.set('photo', photoFile());

        const result = await createFamilyMember(fd);

        expect(result.ok).toBe(false);
        expect(mockDb.familyMember.create).not.toHaveBeenCalled();
    });

    it('rejects when photo is missing', async () => {
        const fd = new FormData();
        fd.set('name', 'Anne');
        fd.set('relation', 'Anne');

        const result = await createFamilyMember(fd);

        expect(result.ok).toBe(false);
        expect(mockSaveUploadedFile).not.toHaveBeenCalled();
    });

    it('saves the photo and creates the record, without a voice file', async () => {
        const fd = new FormData();
        fd.set('name', 'Baba');
        fd.set('relation', 'Baba');
        fd.set('photo', photoFile());

        const result = await createFamilyMember(fd);

        expect(result).toEqual({ ok: true });
        expect(mockSaveUploadedFile).toHaveBeenCalledTimes(1);
        expect(mockDb.familyMember.create).toHaveBeenCalledWith({
            data: { userId: 'user-1', name: 'Baba', relation: 'Baba', photoPath: '/uploads/family/generated.jpg', voicePath: null },
        });
        expect(mockLogAudit).toHaveBeenCalledWith('FAMILY_MEMBER_ADDED', 'user-1', 'Baba');
    });

    it('also saves an optional voice recording', async () => {
        const fd = new FormData();
        fd.set('name', 'Abla');
        fd.set('relation', 'Kardeş');
        fd.set('photo', photoFile());
        fd.set('voice', new File(['x'], 'ses.webm', { type: 'audio/webm' }));

        const result = await createFamilyMember(fd);

        expect(result).toEqual({ ok: true });
        expect(mockSaveUploadedFile).toHaveBeenCalledTimes(2);
        const call = mockDb.familyMember.create.mock.calls[0][0];
        expect(call.data.voicePath).toBe('/uploads/voice/generated.jpg');
    });

    it('returns an error when there is no current user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const fd = new FormData();
        fd.set('name', 'Anne');
        fd.set('relation', 'Anne');
        fd.set('photo', photoFile());

        const result = await createFamilyMember(fd);

        expect(result.ok).toBe(false);
        expect(mockDb.familyMember.create).not.toHaveBeenCalled();
    });
});

describe('deleteFamilyMember', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('deletes the record and both files, logging FAMILY_MEMBER_REMOVED', async () => {
        mockDb.familyMember.findUnique.mockResolvedValue({
            id: 'm1',
            userId: 'user-1',
            name: 'Anne',
            photoPath: '/uploads/family/a.jpg',
            voicePath: '/uploads/voice/a.webm',
        });

        const result = await deleteFamilyMember('m1');

        expect(result).toEqual({ ok: true });
        expect(mockDb.familyMember.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
        expect(mockDeleteUploadedFile).toHaveBeenCalledWith('/uploads/family/a.jpg');
        expect(mockDeleteUploadedFile).toHaveBeenCalledWith('/uploads/voice/a.webm');
        expect(mockLogAudit).toHaveBeenCalledWith('FAMILY_MEMBER_REMOVED', 'user-1', 'Anne');
    });

    it('rejects deleting a record belonging to a different user', async () => {
        mockDb.familyMember.findUnique.mockResolvedValue({
            id: 'm1',
            userId: 'someone-else',
            name: 'Anne',
            photoPath: '/uploads/family/a.jpg',
            voicePath: null,
        });

        const result = await deleteFamilyMember('m1');

        expect(result.ok).toBe(false);
        expect(mockDb.familyMember.delete).not.toHaveBeenCalled();
    });

    it('returns an error when the record does not exist', async () => {
        mockDb.familyMember.findUnique.mockResolvedValue(null);

        const result = await deleteFamilyMember('missing');

        expect(result.ok).toBe(false);
    });
});
