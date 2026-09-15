'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/mediaStorage';
import { enrollFamilyMemberVoiceSample } from '@/actions/speaker';
import { getAdaptiveFamilyAlbumConfig, BASE_FAMILY_ALBUM_ADAPTIVE_CONFIG, type FamilyAlbumAdaptiveConfig } from '@/lib/adaptiveDifficulty';

export interface FamilyMemberData {
    id: string;
    name: string;
    relation: string;
    photoPath: string;
    voicePath: string | null;
}

/** 2026-09-15 — fotoğraf yükleme boyut sınırı (kullanıcı isteği). Sunucu tarafı gerçek sınır — client (FamilyMembersTab.tsx) yalnızca hızlı geri bildirim için aynı değeri ayrıca kontrol eder. */
const MAX_PHOTO_SIZE_BYTES = 1 * 1024 * 1024;

export interface FamilyAlbumDailyState extends FamilyAlbumAdaptiveConfig {
    roundsPlayedToday: number;
    dailyFamilyAlbumLimit: number;
    isFamilyAlbumLimitReached: boolean;
}

/** Bugün bu kullanıcı için kaç SkillAttempt (=round) kaydedilmiş — visualMatch.ts'teki countTodaysAttempts ile aynı desen. */
async function countTodaysFamilyAlbumAttempts(userId: string, skillId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return db.skillAttempt.count({
        where: { userId, skillId, gameId: 'family-album', createdAt: { gte: startOfDay } },
    });
}

/**
 * 2026-09-15 — Faz 2.11 denetiminde bulunan "adaptif zorluğa hiç bağlı
 * değil, günlük limiti yok" boşluğunun düzeltmesi. `getVisualMatchDailyState`
 * (Gölge Eşleştirme) ile aynı desen — oturumu olmayan durumda güvenle en
 * kolay ayara düşer.
 */
export async function getFamilyAlbumDailyState(): Promise<FamilyAlbumDailyState> {
    const user = await getCurrentUser();
    if (!user) {
        return { ...BASE_FAMILY_ALBUM_ADAPTIVE_CONFIG, roundsPlayedToday: 0, dailyFamilyAlbumLimit: 20, isFamilyAlbumLimitReached: false };
    }

    const skill = await db.skill.findUnique({ where: { key: 'sosyal-tanima' } });
    const dailyFamilyAlbumLimit = user.settings?.dailyFamilyAlbumLimit ?? 20;

    const [config, roundsPlayedToday] = await Promise.all([
        getAdaptiveFamilyAlbumConfig(user.id),
        skill ? countTodaysFamilyAlbumAttempts(user.id, skill.id) : Promise.resolve(0),
    ]);

    return {
        ...config,
        roundsPlayedToday,
        dailyFamilyAlbumLimit,
        isFamilyAlbumLimitReached: roundsPlayedToday >= dailyFamilyAlbumLimit,
    };
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
    if (photo.size > MAX_PHOTO_SIZE_BYTES) {
        return { ok: false, error: 'Fotoğraf 1 MB sınırını aşıyor.' };
    }

    const photoPath = await saveUploadedFile(photo, 'family');
    const voicePath = voice instanceof File && voice.size > 0 ? await saveUploadedFile(voice, 'voice') : null;

    const member = await db.familyMember.create({
        data: { userId: user.id, name, relation, photoPath, voicePath },
    });
    await logAudit('FAMILY_MEMBER_ADDED', user.id, name);

    // Faz 3.3 — ses örneği varsa konuşmacı tanıma için embedding çıkar.
    // Best-effort, aile bireyi ekleme akışını asla bloklamaz/bozmaz.
    if (voicePath) enrollFamilyMemberVoiceSample(member.id).catch(() => {});

    return { ok: true };
}

/**
 * 2026-09-13 — UX denetiminde bulundu: dosya başındaki yorum "ekler/
 * düzenler/siler" diyordu ama düzenleme hiç yazılmamıştı — bir ismi
 * düzeltmek veya fotoğrafı değiştirmek için silip yeniden eklemek
 * gerekiyordu. Fotoğraf/ses YALNIZCA yeni bir dosya seçilirse değişir
 * (boş bırakılırsa mevcut dosya korunur) — createFamilyMember'daki
 * "fotoğraf zorunlu" kuralı burada geçerli değil, zaten bir dosya var.
 */
export async function updateFamilyMember(
    id: string,
    formData: FormData
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const member = await db.familyMember.findUnique({ where: { id } });
    if (!member || member.userId !== user.id) {
        return { ok: false, error: 'Kayıt bulunamadı.' };
    }

    const name = String(formData.get('name') ?? '').trim();
    const relation = String(formData.get('relation') ?? '').trim();
    const photo = formData.get('photo');
    const voice = formData.get('voice');

    if (!name) return { ok: false, error: 'İsim gerekli.' };
    if (!relation) return { ok: false, error: 'Yakınlık derecesi gerekli.' };

    let photoPath = member.photoPath;
    if (photo instanceof File && photo.size > 0) {
        if (photo.size > MAX_PHOTO_SIZE_BYTES) {
            return { ok: false, error: 'Fotoğraf 1 MB sınırını aşıyor.' };
        }
        photoPath = await saveUploadedFile(photo, 'family');
        await deleteUploadedFile(member.photoPath);
    }

    let voicePath = member.voicePath;
    let voiceChanged = false;
    if (voice instanceof File && voice.size > 0) {
        voicePath = await saveUploadedFile(voice, 'voice');
        if (member.voicePath) await deleteUploadedFile(member.voicePath);
        voiceChanged = true;
    }

    const updated = await db.familyMember.update({
        where: { id },
        data: { name, relation, photoPath, voicePath },
    });
    await logAudit('FAMILY_MEMBER_UPDATED', user.id, name);

    if (voiceChanged) enrollFamilyMemberVoiceSample(updated.id).catch(() => {});

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
