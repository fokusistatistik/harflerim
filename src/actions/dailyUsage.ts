'use server';

import { getCurrentUser } from '@/lib/auth';
import { addDailyUsageSeconds, getDailyUsage, type DailyUsageState } from '@/lib/dailyUsage';

/**
 * Faz 1.8 — Harf Avı'nın dışındaki oyunlar (Hafıza Kartları, Sihirli
 * Kelimeler, Görsel Eşleştirme) kendi seviye/ilerleme mantıklarını korur,
 * ama hepsi bu tek, hafif mekanizma üzerinden global günlük süre bütçesine
 * katkı yapar (bkz. Faz 1.10'daki açık bulgu — bu oyunlar hiç rapor
 * vermiyordu). Harf Avı bunu kullanmaz; kendi submitLevelResult akışında
 * zaten her cevap için tam reaksiyon süresini raporluyor.
 */
export async function getDailyUsageStatus(): Promise<DailyUsageState | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    return getDailyUsage(user.id);
}

export async function reportPlaySeconds(seconds: number): Promise<DailyUsageState | null> {
    if (seconds <= 0) return null;
    const user = await getCurrentUser();
    if (!user) return null;
    return addDailyUsageSeconds(user.id, Math.round(seconds));
}
