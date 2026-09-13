'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { extractYoutubeId, fetchYoutubeMeta } from '@/lib/youtube';

export interface SongData {
    id: string;
    youtubeId: string;
    title: string;
    thumbnailUrl: string;
    dailyLoopLimit: number;
    playsToday: number;
}

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Faz 2.3 — Müzik köşesi. Reklamsız/önerisiz kapalı bir oynatıcı; otomatik
 * sonraki şarkı yok. `dailyLoopLimit`, genel günlük ekran süresi bütçesine
 * (DailyUsage, useGameDayBudget) EK, şarkı bazlı ayrıntılı bir sınırdır.
 */
export async function listSongs(): Promise<SongData[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const songs = await db.song.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        include: { playCounts: { where: { date: todayString() } } },
    });

    return songs.map((s) => ({
        id: s.id,
        youtubeId: s.youtubeId,
        title: s.title,
        thumbnailUrl: s.thumbnailUrl,
        dailyLoopLimit: s.dailyLoopLimit,
        playsToday: s.playCounts[0]?.playCount ?? 0,
    }));
}

export async function addSong(
    youtubeUrl: string,
    dailyLoopLimit: number
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) return { ok: false, error: 'Geçerli bir YouTube linki değil.' };

    if (!Number.isFinite(dailyLoopLimit) || dailyLoopLimit < 1 || dailyLoopLimit > 20) {
        return { ok: false, error: 'Günlük tekrar sayısı 1-20 arasında olmalı.' };
    }

    const meta = await fetchYoutubeMeta(youtubeId);
    if (!meta) return { ok: false, error: 'Video bilgisi alınamadı. Linki kontrol edin.' };

    await db.song.create({
        data: {
            userId: user.id,
            youtubeId,
            title: meta.title,
            thumbnailUrl: meta.thumbnailUrl,
            dailyLoopLimit: Math.round(dailyLoopLimit),
        },
    });
    await logAudit('CONTENT_ADDED', user.id, meta.title);

    return { ok: true };
}

/**
 * 2026-09-13 — audit'te bulundu: eklendikten sonra `dailyLoopLimit`
 * değiştirilemiyordu, tek yol sil-yeniden ekleyip YouTube linkini tekrar
 * girmekti. Başlık/thumbnail YouTube'dan otomatik geldiği için kasıtlı
 * olarak burada düzenlenmiyor — yalnızca günlük tekrar hakkı.
 */
export async function updateSongLoopLimit(
    id: string,
    dailyLoopLimit: number
): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    if (!Number.isFinite(dailyLoopLimit) || dailyLoopLimit < 1 || dailyLoopLimit > 20) {
        return { ok: false, error: 'Günlük tekrar sayısı 1-20 arasında olmalı.' };
    }

    const song = await db.song.findUnique({ where: { id } });
    if (!song || song.userId !== user.id) return { ok: false, error: 'Kayıt bulunamadı.' };

    await db.song.update({ where: { id }, data: { dailyLoopLimit: Math.round(dailyLoopLimit) } });
    await logAudit('SETTINGS_CHANGED', user.id, `${song.title} günlük tekrar hakkı güncellendi`);

    return { ok: true };
}

export async function deleteSong(id: string): Promise<{ ok: boolean; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Oturum bulunamadı.' };

    const song = await db.song.findUnique({ where: { id } });
    if (!song || song.userId !== user.id) return { ok: false, error: 'Kayıt bulunamadı.' };

    await db.song.delete({ where: { id } });
    await logAudit('CONTENT_REMOVED', user.id, song.title);

    return { ok: true };
}

export interface SongPlayResult {
    playsToday: number;
    limitReached: boolean;
}

export async function reportSongPlay(songId: string): Promise<SongPlayResult | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const song = await db.song.findUnique({ where: { id: songId } });
    if (!song || song.userId !== user.id) return null;

    const date = todayString();
    const existing = await db.songPlayCount.findUnique({ where: { songId_date: { songId, date } } });
    const newCount = (existing?.playCount ?? 0) + 1;

    await db.songPlayCount.upsert({
        where: { songId_date: { songId, date } },
        create: { songId, date, playCount: newCount },
        update: { playCount: newCount },
    });

    return { playsToday: newCount, limitReached: newCount >= song.dailyLoopLimit };
}
