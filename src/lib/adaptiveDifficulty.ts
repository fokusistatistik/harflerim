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
    /**
     * 2026-09-14 — denetim bulgusu: hedef harf seçimi tamamen rastgeleydi,
     * "hangi harflerde zorlanıyor" bilgisi hiç kullanılmıyordu. Son N
     * denemede en çok yanlış yapılan harfler (varsa) — GameBoard.tsx bu
     * listeyi ağırlıklı rastgele seçimde kullanır (tam öncelik değil,
     * çeşitlilik korunur). Boş dizi = yeterli veri yok / tüm harfler dengeli.
     */
    weakLetters: string[];
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 12;

/** Hiç geçmiş yokken (ilk round) — eski Level 1 ile birebir aynı, çocuk asla sıfırdan zor bir round görmez. */
export const BASE_ADAPTIVE_CONFIG: AdaptiveConfig = { optionCount: MIN_OPTIONS, distractorType: 'random', weakLetters: [] };

/**
 * `weakLetters` bu SAF fonksiyonun dışında hesaplanır (Event tablosuna
 * erişim gerektirir, harf-bazlı veri `SkillAttempt`'te değil yalnızca
 * Harf Avı'na özel `Event` tablosunda tutulur) — çağıran katman
 * (`src/actions/game.ts`'teki `getAdaptiveRoundConfig`) doldurur.
 */
export async function getAdaptiveConfig(userId: string): Promise<AdaptiveConfig> {
    const stats = await detectErrorStreak(userId, 'harf-tanima');

    if (stats.sonDenemeSayisi === 0) return BASE_ADAPTIVE_CONFIG;

    // Ardışık yanlış varsa — zorluğu ne olursa olsun hemen en kolay
    // ayara dön. Çocuğu zorlukta tutmamak, ilerlemekten daha öncelikli.
    if (stats.ardisikYanlisSayisi >= 3) {
        return { optionCount: MIN_OPTIONS, distractorType: 'random', weakLetters: [] };
    }

    const basari = stats.sonDenemeBasariOrani ?? 0;

    if (basari >= 0.8) {
        const optionCount = Math.min(MAX_OPTIONS, 6 + Math.round(basari * 6));
        return { optionCount, distractorType: 'similar', weakLetters: [] };
    }

    if (basari >= 0.5) {
        return { optionCount: 4, distractorType: 'random', weakLetters: [] };
    }

    return { optionCount: MIN_OPTIONS, distractorType: 'random', weakLetters: [] };
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

export interface VisualMatchAdaptiveConfig {
    /** Sürüklenebilir gölge/hedef çiftinin yanına eklenen, seçilmemesi gereken yanlış harf sayısı. */
    distractorCount: number;
}

const MIN_DISTRACTORS = 0;
const MAX_DISTRACTORS = 3;

/** Hiç geçmiş yokken (ilk round) — en kolay ayar, hiç çeldirici yok (tek hedef/tek kart). */
export const BASE_VISUAL_MATCH_ADAPTIVE_CONFIG: VisualMatchAdaptiveConfig = { distractorCount: MIN_DISTRACTORS };

/**
 * 2026-09-15 — Faz 2.11 denetimindeki "hâlâ sabit sistemde" bulgusunun
 * düzeltmesi. `getAdaptiveConfig`/`getAdaptiveMemoryConfig` ile aynı desen
 * ve aynı `detectErrorStreak` altyapısı, farklı beceri anahtarı
 * (`golge-eslestirme`) ve farklı çıktı şekli (çeldirici sayısı).
 */
export async function getAdaptiveVisualMatchConfig(userId: string): Promise<VisualMatchAdaptiveConfig> {
    const stats = await detectErrorStreak(userId, 'golge-eslestirme');

    if (stats.sonDenemeSayisi === 0) return BASE_VISUAL_MATCH_ADAPTIVE_CONFIG;

    if (stats.ardisikYanlisSayisi >= 3) {
        return { distractorCount: MIN_DISTRACTORS };
    }

    const basari = stats.sonDenemeBasariOrani ?? 0;

    if (basari >= 0.8) {
        return { distractorCount: MAX_DISTRACTORS };
    }

    if (basari >= 0.5) {
        return { distractorCount: 1 };
    }

    return { distractorCount: MIN_DISTRACTORS };
}
