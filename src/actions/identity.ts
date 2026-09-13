'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/mediaStorage';

export interface IdentityData {
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl: string | null;
}

/**
 * 2026-09-13 — UX denetiminde bulundu: ChildProfileTab yalnızca ikincil
 * UserSettings alanlarını (yaş/renk/duyusal profil) düzenliyordu, `User`
 * tablosundaki asıl kimlik alanlarını (firstName/lastName/avatarUrl)
 * DEĞİL — hiçbir UI'dan değiştirilemiyorlardı. Bu, ParentGate'in Genel
 * sekmesindeki yeni "Kimlik" bölümünün sunucu tarafı.
 */
export async function getIdentity(): Promise<IdentityData | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    return { firstName: user.firstName, lastName: user.lastName, username: user.username, avatarUrl: user.avatarUrl };
}

export async function updateIdentity(
    firstName: string,
    lastName: string
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const trimmedFirst = firstName.trim();
    if (!trimmedFirst) return { ok: false, error: 'Ad boş olamaz.' };

    await db.user.update({
        where: { id: user.id },
        data: { firstName: trimmedFirst, lastName: lastName.trim() },
    });
    await logAudit('SETTINGS_CHANGED', user.id, 'İsim güncellendi');

    return { ok: true };
}

/**
 * 2026-09-13 — audit'te bulundu: `username` (giriş adı) hiçbir UI'dan
 * değiştirilemiyordu. Bu, giriş için kullanılan alan olduğu için tek
 * başına bırakılmadı — benzersizlik `User.username`'in zaten sahip olduğu
 * `@unique` kısıtına dayanır (SQLite'ta büyük/küçük harf duyarlı, giriş
 * formuyla aynı davranış).
 */
export async function updateUsername(newUsername: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const trimmed = newUsername.trim();
    if (trimmed.length < 2) return { ok: false, error: 'Kullanıcı adı en az 2 karakter olmalı.' };

    if (trimmed !== user.username) {
        const existing = await db.user.findUnique({ where: { username: trimmed } });
        if (existing) return { ok: false, error: 'Bu kullanıcı adı zaten kullanılıyor.' };
    }

    await db.user.update({ where: { id: user.id }, data: { username: trimmed } });
    await logAudit('SETTINGS_CHANGED', user.id, 'Kullanıcı adı güncellendi');

    return { ok: true };
}

export async function updateAvatar(formData: FormData): Promise<{ ok: boolean; error?: string; avatarUrl?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const file = formData.get('avatar');
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, error: 'Bir fotoğraf seçin.' };
    }

    const previousAvatarUrl = user.avatarUrl;
    const avatarUrl = await saveUploadedFile(file, 'avatar');

    await db.user.update({ where: { id: user.id }, data: { avatarUrl } });
    if (previousAvatarUrl) await deleteUploadedFile(previousAvatarUrl);
    await logAudit('SETTINGS_CHANGED', user.id, 'Profil fotoğrafı güncellendi');

    return { ok: true, avatarUrl };
}
