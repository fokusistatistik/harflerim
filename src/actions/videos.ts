'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/mediaStorage';

export interface VideoData {
    id: string;
    title: string;
    filePath: string;
}

/**
 * Faz 2.4 (kapsamı daraltılmış, bkz. YOL-HARITASI.md notu) — ebeveynin
 * yüklediği hazır video/resimli hikâye. Gerçek AI üretimi yok, Faz 4.2'ye
 * ertelendi. Aynı içerik kontrol listesi onayı (2.3'teki gibi) UI'da zorunlu.
 */
export async function listVideos(): Promise<VideoData[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const videos = await db.video.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
    return videos.map((v) => ({ id: v.id, title: v.title, filePath: v.filePath }));
}

export async function addVideo(formData: FormData): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const title = String(formData.get('title') ?? '').trim();
    const file = formData.get('file');

    if (!title) return { ok: false, error: 'Başlık gerekli.' };
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, error: 'Bir video dosyası seçin.' };
    }

    const filePath = await saveUploadedFile(file, 'videos');

    await db.video.create({ data: { userId: user.id, title, filePath } });
    await logAudit('CONTENT_ADDED', user.id, title);

    return { ok: true };
}

export async function deleteVideo(id: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const video = await db.video.findUnique({ where: { id } });
    if (!video || video.userId !== user.id) return { ok: false, error: 'Kayıt bulunamadı.' };

    await db.video.delete({ where: { id } });
    await deleteUploadedFile(video.filePath);
    await logAudit('CONTENT_REMOVED', user.id, video.title);

    return { ok: true };
}
