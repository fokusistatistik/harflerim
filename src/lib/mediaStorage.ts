import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

/** İzin verilen uzantılar dışındaki her şeyi reddeder — bir yükleme aracı değil, sabit bir aile arşivi. */
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'webm', 'mp3', 'wav', 'ogg']);

function safeExtension(filename: string): string {
    const ext = path.extname(filename).slice(1).toLowerCase();
    return ALLOWED_EXTENSIONS.has(ext) ? ext : 'bin';
}

/**
 * Faz 2.2 — "katı yerel işleme" ilkesi gereği (bkz. YOL-HARITASI.md
 * Yönetişim bölümü) ebeveyn tarafından yüklenen medya (fotoğraf, ses
 * kaydı, çizim) yalnızca yerel dosya sistemine yazılır — buluta, harici
 * bir CDN'e veya veritabanına (base64) hiç gitmez. Yalnızca dosya yolu
 * (örn. "/uploads/family/<uuid>.jpg") ilgili Prisma modelinde saklanır.
 * `subdir` her özelliğin kendi klasöründe kalmasını sağlar (family, voice,
 * drawings — Faz 2.6 da bunu kullanacak).
 */
export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
    const dir = path.join(UPLOADS_ROOT, subdir);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}.${safeExtension(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    return `/uploads/${subdir}/${filename}`;
}

/** Silme her zaman "en iyi çaba" (best-effort) — dosya zaten yoksa sessizce geçer, DB kaydını asla engellemez. */
export async function deleteUploadedFile(publicPath: string): Promise<void> {
    if (!publicPath.startsWith('/uploads/')) return;
    try {
        await unlink(path.join(process.cwd(), 'public', publicPath));
    } catch {
        // Dosya zaten yoksa veya silinemiyorsa görmezden gel.
    }
}
