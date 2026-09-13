'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/mediaStorage';

export interface FamilyMemberData {
    id: string;
    name: string;
    relation: string;
    photoPath: string;
    voicePath: string | null;
}

/**
 * Faz 2.2 — aile bireyleri kaydı. Yalnızca ebeveyn ekler/düzenler/siler;
 * çocuk hiçbir aile bilgisini giremez (bu yüzden bu action'lar yalnızca
 * ParentGate'in kilit-açık paneli içinden çağrılır). Fotoğraf zorunlu, ses
 * kaydı isteğe bağlıdır (bkz. YOL-HARITASI.md 2.2).
 */
export async function listFamilyMembers(): Promise<FamilyMemberData[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const members = await db.familyMember.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
        id: m.id,
        name: m.name,
        relation: m.relation,
        photoPath: m.photoPath,
        voicePath: m.voicePath,
    }));
}

export async function createFamilyMember(
    formData: FormData
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const name = String(formData.get('name') ?? '').trim();
    const relation = String(formData.get('relation') ?? '').trim();
    const photo = formData.get('photo');
    const voice = formData.get('voice');

    if (!name) return { ok: false, error: 'İsim gerekli.' };
    if (!relation) return { ok: false, error: 'Yakınlık derecesi gerekli.' };
    if (!(photo instanceof File) || photo.size === 0) {
        return { ok: false, error: 'Fotoğraf gerekli.' };
    }

    const photoPath = await saveUploadedFile(photo, 'family');
    const voicePath = voice instanceof File && voice.size > 0 ? await saveUploadedFile(voice, 'voice') : null;

    await db.familyMember.create({
        data: { userId: user.id, name, relation, photoPath, voicePath },
    });
    await logAudit('FAMILY_MEMBER_ADDED', user.id, name);

    return { ok: true };
}

export async function deleteFamilyMember(id: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const member = await db.familyMember.findUnique({ where: { id } });
    if (!member || member.userId !== user.id) {
        return { ok: false, error: 'Kayıt bulunamadı.' };
    }

    await db.familyMember.delete({ where: { id } });
    await deleteUploadedFile(member.photoPath);
    if (member.voicePath) await deleteUploadedFile(member.voicePath);
    await logAudit('FAMILY_MEMBER_REMOVED', user.id, member.name);

    return { ok: true };
}
