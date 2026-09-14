'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

export interface ParentPreferences {
    dailyScreenLimitMinutes: number;
    /** 2026-09-14 — Harf Avı'na özel, süre bütçesine EK günlük round limiti. */
    dailyLetterHuntLimit: number;
    /** 2026-09-14 — Hafıza Kartları'na özel, süre bütçesine EK günlük round limiti. */
    dailyMemoryMatchLimit: number;
    reduceMotion: boolean;
    highContrast: boolean;
    speechEnabled: boolean;
    cameraEnabled: boolean;
}

/**
 * Faz 2.1 — Ebeveyn Yönetim Alanı'ndaki "Ekran Süresi" ve "Duyusal Ayarlar"
 * sekmeleri için. Faz 1.17'de zaten bağlanmış olan alanları (dailyScreenLimit,
 * reduceMotion, highContrast, speechEnabled, cameraEnabled) okur/yazar —
 * yeni bir alan eklemez, yalnızca artık bir UI'dan değiştirilebilir yapar.
 */
export async function getParentPreferences(): Promise<ParentPreferences | null> {
    const user = await getCurrentUser();
    if (!user?.settings) return null;

    const s = user.settings;
    return {
        dailyScreenLimitMinutes: Math.round(s.dailyScreenLimit / 60),
        dailyLetterHuntLimit: s.dailyLetterHuntLimit,
        dailyMemoryMatchLimit: s.dailyMemoryMatchLimit,
        reduceMotion: s.reduceMotion,
        highContrast: s.highContrast,
        speechEnabled: s.speechEnabled,
        cameraEnabled: s.cameraEnabled,
    };
}

export async function updateScreenTimeLimit(minutes: number): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user?.settings) return { ok: false, error: 'Oturum bulunamadı.' };

    if (!Number.isFinite(minutes) || minutes < 10 || minutes > 240) {
        return { ok: false, error: 'Ekran süresi 10-240 dakika arasında olmalı.' };
    }

    await db.userSettings.update({
        where: { userId: user.id },
        data: { dailyScreenLimit: Math.round(minutes) * 60 },
    });
    await logAudit('SETTINGS_CHANGED', user.id, 'Günlük ekran süresi limiti güncellendi');

    return { ok: true };
}

export async function updateLetterHuntLimit(rounds: number): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user?.settings) return { ok: false, error: 'Oturum bulunamadı.' };

    if (!Number.isFinite(rounds) || rounds < 25 || rounds > 250) {
        return { ok: false, error: 'Harf Avı tur limiti 25-250 arasında olmalı.' };
    }

    await db.userSettings.update({
        where: { userId: user.id },
        data: { dailyLetterHuntLimit: Math.round(rounds) },
    });
    await logAudit('SETTINGS_CHANGED', user.id, 'Harf Avı günlük tur limiti güncellendi');

    return { ok: true };
}

export async function updateMemoryMatchLimit(rounds: number): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user?.settings) return { ok: false, error: 'Oturum bulunamadı.' };

    if (!Number.isFinite(rounds) || rounds < 10 || rounds > 50) {
        return { ok: false, error: 'Hafıza Kartları tur limiti 10-50 arasında olmalı.' };
    }

    await db.userSettings.update({
        where: { userId: user.id },
        data: { dailyMemoryMatchLimit: Math.round(rounds) },
    });
    await logAudit('SETTINGS_CHANGED', user.id, 'Hafıza Kartları günlük tur limiti güncellendi');

    return { ok: true };
}

export async function updateSensoryToggles(
    partial: Partial<Omit<ParentPreferences, 'dailyScreenLimitMinutes' | 'dailyLetterHuntLimit' | 'dailyMemoryMatchLimit'>>
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user?.settings) return { ok: false, error: 'Oturum bulunamadı.' };

    await db.userSettings.update({ where: { userId: user.id }, data: partial });
    await logAudit('SETTINGS_CHANGED', user.id, 'Duyusal tercihler güncellendi');

    return { ok: true };
}
