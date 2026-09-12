'use server';

import { db } from '@/lib/db';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

const PIN_PATTERN = /^\d{4,6}$/;

/**
 * Faz 1.3 — ebeveyn kapısı. Çocuk tek girişle uygulamanın tamamını kullanır;
 * ayarlar/yönetim alanı bu PIN ile ayrıca korunur. Başarısız denemeler de
 * audit log'a düşer (bkz. AuditLog.PARENT_GATE_DENIED).
 */
export async function verifyParentPin(pin: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user?.settings) return false;

    const isValid = await verifyPassword(pin, user.settings.parentPin);
    await logAudit(isValid ? 'PARENT_GATE_UNLOCKED' : 'PARENT_GATE_DENIED', user.id);

    return isValid;
}

export async function changeParentPin(
    currentPin: string,
    newPin: string
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user?.settings) return { ok: false, error: 'Oturum bulunamadı.' };

    const isValid = await verifyPassword(currentPin, user.settings.parentPin);
    if (!isValid) {
        await logAudit('PARENT_GATE_DENIED', user.id, 'PIN değiştirme denemesi');
        return { ok: false, error: 'Mevcut PIN yanlış.' };
    }

    if (!PIN_PATTERN.test(newPin)) {
        return { ok: false, error: 'Yeni PIN 4-6 haneli bir rakam olmalı.' };
    }

    const newHash = await hashPassword(newPin);
    await db.userSettings.update({ where: { userId: user.id }, data: { parentPin: newHash } });
    await logAudit('PIN_CHANGED', user.id);

    return { ok: true };
}
