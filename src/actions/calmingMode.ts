'use server';

import { getCurrentUser } from '@/lib/auth';
import { detectErrorStreak } from '@/lib/skillAnalytics';

/**
 * Faz 3.2b — Sakinleştirme Modu tetikleme eşiği. `adaptiveDifficulty.ts`
 * zaten 3 ardışık yanlışta zorluğu en kolaya düşürüyor (bkz. Faz 3.2) —
 * Sakinleştirme Modu bundan SONRA gelen, daha büyük bir müdahale.
 *
 * 2026-09-14 — kullanıcı bulgusu: 5 eşiği "agresif" — normal bir zor round
 * sırasında bile (Hafıza Kartları'nda gerçek tarayıcı testinde 2 yanlışla
 * bile tetiklendiği gözlemlendi, birikmiş geçmiş nedeniyle) kolayca
 * tetikleniyordu. 10'a çıkarıldı — Harf Avı'nın kendi adaptif zorluk düşüşü
 * zaten 3'te devreye girip round'u kolaylaştırıyor; Sakinleştirme Modu'nun
 * gerçekten belirgin bir sıkıntı paternini yakalaması için daha yüksek bir
 * eşik gerekiyordu.
 *
 * BİLİNÇLİ v1 SINIRI: Bu sabit kodlanmış — roadmap'in "eşik değerleri
 * ihtiyatlı seçilmeli ve ebeveyn geri bildirimiyle ayarlanabilir olmalıdır"
 * ilkesi (YOL-HARITASI.md risk tablosu) henüz karşılanmıyor. Ebeveyn ayarı
 * (Duyusal Ayarlar'a yeni bir alan) ayrı bir sonraki iştir.
 */
const CALMING_MODE_THRESHOLD = 10;

/**
 * `detectErrorStreak`'in ham göstergelerine bu tek, dar kuralı uygular: son
 * pencerede ardışık yanlış sayısı eşiği geçtiyse `true`. "Hızlı/rastgele
 * dokunma" paterni (roadmap'in ikinci tetikleyicisi) için ayrı bir algoritma
 * BİLİNÇLİ OLARAK yazılmadı — `sonDenemeOrtalamaTepkiSuresi` zaten
 * `detectErrorStreak`'te var, gelecekte buraya ikinci bir koşul olarak
 * eklenebilir.
 */
export async function checkCalmingModeTrigger(skillKey: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    const stats = await detectErrorStreak(user.id, skillKey);
    return stats.ardisikYanlisSayisi >= CALMING_MODE_THRESHOLD;
}
