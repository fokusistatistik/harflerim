'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/mediaStorage';

export interface DrawingData {
    id: string;
    filePath: string;
    createdAt: string;
}

/**
 * Faz 2.6 — çizim tahtası. Bir başarı/puan ölçütü değil, ebeveyn için
 * zaman içindeki gelişimin görünür bir kaydı (bkz. YOL-HARITASI.md 2.6).
 */
export async function listDrawings(): Promise<DrawingData[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const drawings = await db.drawing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    return drawings.map((d) => ({ id: d.id, filePath: d.filePath, createdAt: d.createdAt.toISOString() }));
}

export async function saveDrawing(formData: FormData): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const image = formData.get('image');
    if (!(image instanceof File) || image.size === 0) {
        return { ok: false, error: 'Çizim bulunamadı.' };
    }

    const filePath = await saveUploadedFile(image, 'drawings');
    await db.drawing.create({ data: { userId: user.id, filePath } });

    return { ok: true };
}

export async function deleteDrawing(id: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const drawing = await db.drawing.findUnique({ where: { id } });
    if (!drawing || drawing.userId !== user.id) return { ok: false, error: 'Kayıt bulunamadı.' };

    await db.drawing.delete({ where: { id } });
    await deleteUploadedFile(drawing.filePath);

    return { ok: true };
}
