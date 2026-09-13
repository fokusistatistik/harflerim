import { detectErrorStreak } from '@/lib/skillAnalytics';

/**
 * Faz 3.2 — Harf Avı'nın eski sabit 24-seviyeli merdiveninin yerini alan
 * uyarlanabilir zorluk motoru. Faz 3.1'in ham göstergelerini (detectErrorStreak)
 * girdi alır, bir round için çeldirici sayısı/benzerliği üretir. Kasıtlı
 * olarak SAF bir fonksiyon (DB'ye yazmaz) — algoritma burada tek bir yerde
 * izole, çağıran kod (GameBoard.tsx, src/actions/game.ts) motor/eşikler
 * değişse bile aynı kalır.
 */

export interface AdaptiveConfig {
    optionCount: number;
    distractorType: 'random' | 'similar';
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 12;

/** Hiç geçmiş yokken (ilk round) — eski Level 1 ile birebir aynı, çocuk asla sıfırdan zor bir round görmez. */
export const BASE_ADAPTIVE_CONFIG: AdaptiveConfig = { optionCount: MIN_OPTIONS, distractorType: 'random' };

export async function getAdaptiveConfig(userId: string): Promise<AdaptiveConfig> {
    const stats = await detectErrorStreak(userId, 'harf-tanima');

    if (stats.sonDenemeSayisi === 0) return BASE_ADAPTIVE_CONFIG;

    // Ardışık yanlış varsa — zorluğu ne olursa olsun hemen en kolay
    // ayara dön. Çocuğu zorlukta tutmamak, ilerlemekten daha öncelikli.
    if (stats.ardisikYanlisSayisi >= 3) {
        return { optionCount: MIN_OPTIONS, distractorType: 'random' };
    }

    const basari = stats.sonDenemeBasariOrani ?? 0;

    if (basari >= 0.8) {
        const optionCount = Math.min(MAX_OPTIONS, 6 + Math.round(basari * 6));
        return { optionCount, distractorType: 'similar' };
    }

    if (basari >= 0.5) {
        return { optionCount: 4, distractorType: 'random' };
    }

    return { optionCount: MIN_OPTIONS, distractorType: 'random' };
}

export interface MemoryAdaptiveConfig {
    pairCount: number;
}

const MIN_PAIRS = 3;
const MAX_PAIRS = 8;

/** Hiç geçmiş yokken (ilk round) — en kolay ayar, 3 çift (6 kart). */
export const BASE_MEMORY_ADAPTIVE_CONFIG: MemoryAdaptiveConfig = { pairCount: MIN_PAIRS };

/**
 * 2026-09-13 — Hafıza Kartları'nın eski sabit 24-seviyeli kilitli
 * haritasının yerini alan uyarlanabilir zorluk motoru, `getAdaptiveConfig`
 * (Harf Avı) ile aynı desen ve aynı `detectErrorStreak` altyapısı, farklı
 * beceri anahtarı (`gorsel-hafiza`) ve farklı çıktı şekli (kart sayısı
 * yerine çift sayısı).
 */
export async function getAdaptiveMemoryConfig(userId: string): Promise<MemoryAdaptiveConfig> {
    const stats = await detectErrorStreak(userId, 'gorsel-hafiza');

    if (stats.sonDenemeSayisi === 0) return BASE_MEMORY_ADAPTIVE_CONFIG;

    if (stats.ardisikYanlisSayisi >= 3) {
        return { pairCount: MIN_PAIRS };
    }

    const basari = stats.sonDenemeBasariOrani ?? 0;

    if (basari >= 0.8) {
        return { pairCount: Math.min(MAX_PAIRS, MIN_PAIRS + Math.round(basari * 5)) };
    }

    if (basari >= 0.5) {
        return { pairCount: 4 };
    }

    return { pairCount: MIN_PAIRS };
}
