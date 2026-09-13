'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import {
    parseStringList,
    serializeStringList,
    parseSensoryProfile,
    serializeSensoryProfile,
    type SensoryProfile,
} from '@/lib/childProfile';

export interface ChildProfileData {
    age: number | null;
    gender: string;
    favoriteColor: string;
    interests: string[];
    learningChannel: string;
    sensoryProfile: SensoryProfile;
    triggers: string[];
    calmers: string[];
    communicationLevel: string;
}

/**
 * Faz 2.1 — Ebeveyn Yönetim Alanı'ndaki "Çocuk Profili" sekmesi için.
 * Faz 1.4b'de eklenen ama hiçbir UI'dan doldurulamayan alanların ilk gerçek
 * okuma/yazma yolu. Tanı aracı değildir — yalnızca kişiselleştirme verisi
 * (Klinik Sınır Sözleşmesi'ne tabi), henüz hiçbir oyun bu veriyi okumuyor
 * (Faz 2.10'u bekliyor).
 */
export async function getChildProfile(): Promise<ChildProfileData | null> {
    const user = await getCurrentUser();
    if (!user?.settings) return null;

    const s = user.settings;
    return {
        age: s.age,
        gender: s.gender ?? '',
        favoriteColor: s.favoriteColor ?? '',
        interests: parseStringList(s.interests),
        learningChannel: s.learningChannel ?? '',
        sensoryProfile: parseSensoryProfile(s.sensoryProfile),
        triggers: parseStringList(s.triggers),
        calmers: parseStringList(s.calmers),
        communicationLevel: s.communicationLevel ?? '',
    };
}

export async function updateChildProfile(
    data: ChildProfileData
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user?.settings) return { ok: false, error: 'Oturum bulunamadı.' };

    if (data.age !== null && (!Number.isFinite(data.age) || data.age < 0 || data.age > 25)) {
        return { ok: false, error: 'Yaş geçersiz.' };
    }

    await db.userSettings.update({
        where: { userId: user.id },
        data: {
            age: data.age,
            gender: data.gender || null,
            favoriteColor: data.favoriteColor || null,
            interests: serializeStringList(data.interests),
            learningChannel: data.learningChannel || null,
            sensoryProfile: serializeSensoryProfile(data.sensoryProfile),
            triggers: serializeStringList(data.triggers),
            calmers: serializeStringList(data.calmers),
            communicationLevel: data.communicationLevel || null,
        },
    });
    await logAudit('SETTINGS_CHANGED', user.id, 'Çocuk profili güncellendi');

    return { ok: true };
}
