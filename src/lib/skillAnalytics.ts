import { db } from '@/lib/db';

/**
 * Faz 3.1 — `SkillAttempt`'in (Faz 1.20) yazma katmanı üzerine kurulan
 * okuma/analiz katmanı. Burada hiçbir eşik/yorum ÜRETİLMEZ — yalnızca ham
 * sayısal göstergeler döner. Eşik seçimi ve "bu bir desen mi" yorumu bilerek
 * Faz 3.2/3.2b/3.8'e bırakıldı.
 */

export interface SkillAttemptRecord {
    id: string;
    gameId: string;
    isCorrect: boolean;
    reactionTime: number | null;
    hintsUsed: number | null;
    createdAt: Date;
}

/**
 * Bir becerinin zaman içindeki tüm deneme geçmişi, kronolojik sırayla
 * ("aynı beceri farklı tarihlerde nasıl gitti"). Faz 3.8'in (içgörü raporu)
 * ham verisi.
 */
export async function getSkillHistory(userId: string, skillKey: string): Promise<SkillAttemptRecord[]> {
    const skill = await db.skill.findUnique({ where: { key: skillKey } });
    if (!skill) return [];

    const attempts = await db.skillAttempt.findMany({
        where: { userId, skillId: skill.id },
        orderBy: { createdAt: 'asc' },
    });

    return attempts.map((a) => ({
        id: a.id,
        gameId: a.gameId,
        isCorrect: a.isCorrect,
        reactionTime: a.reactionTime,
        hintsUsed: a.hintsUsed,
        createdAt: a.createdAt,
    }));
}

export interface GamePerformance {
    gameId: string;
    totalAttempts: number;
    correctCount: number;
    successRate: number;
}

/**
 * Aynı becerinin FARKLI oyunlardaki performansı ("farklı oyunların aynı
 * beceriyi çapraz doğrulaması"). Bugün her beceri tek bir oyunla eşleşiyor
 * (bkz. `prisma/seedSkills.ts`) — bu fonksiyon, bir beceri birden fazla
 * oyunda ölçülmeye başladığında anlamlı hale gelir; şimdiden hazır duruyor.
 */
export async function getCrossGameValidation(userId: string, skillKey: string): Promise<GamePerformance[]> {
    const history = await getSkillHistory(userId, skillKey);

    const byGame = new Map<string, { total: number; correct: number }>();
    for (const attempt of history) {
        const entry = byGame.get(attempt.gameId) ?? { total: 0, correct: 0 };
        entry.total += 1;
        if (attempt.isCorrect) entry.correct += 1;
        byGame.set(attempt.gameId, entry);
    }

    return Array.from(byGame.entries()).map(([gameId, { total, correct }]) => ({
        gameId,
        totalAttempts: total,
        correctCount: correct,
        successRate: correct / total,
    }));
}

// Son kaç deneme incelenir — bir TETİKLEME eşiği değil, yalnızca örneklem
// penceresi. "Kaç ardışık yanlış bir 'desen' sayılır" kararı burada YOK.
const SON_DENEME_PENCERESI = 10;

export interface ErrorStreakStats {
    /** En son denemeden geriye doğru, ilk doğru cevaba kadar sayılan ardışık yanlış sayısı. */
    ardisikYanlisSayisi: number;
    /** Pencerede fiilen kaç deneme vardı (geçmiş SON_DENEME_PENCERESI'nden azsa daha küçük olabilir). */
    sonDenemeSayisi: number;
    sonDenemeBasariOrani: number | null;
    /** Anormal derecede düşük olması hızlı/rastgele dokunmanın bir göstergesi olabilir — yorum burada yapılmaz. */
    sonDenemeOrtalamaTepkiSuresi: number | null;
}

/**
 * "Hata deseni bilgisi olmadan uyarlanabilir zorluk mümkün değil" (Faz 3
 * girişi) — bu fonksiyon o ham bilgiyi sağlar. Hiçbir eşik uygulamaz, "kriz"
 * gibi bir etiket üretmez; yorumlama Faz 3.2b'nin işi.
 */
export async function detectErrorStreak(userId: string, skillKey: string): Promise<ErrorStreakStats> {
    const history = await getSkillHistory(userId, skillKey);
    const recent = history.slice(-SON_DENEME_PENCERESI);

    let ardisikYanlisSayisi = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
        if (recent[i].isCorrect) break;
        ardisikYanlisSayisi += 1;
    }

    const reactionTimes = recent
        .map((a) => a.reactionTime)
        .filter((t): t is number => t !== null);
    const sonDenemeOrtalamaTepkiSuresi =
        reactionTimes.length > 0 ? reactionTimes.reduce((sum, t) => sum + t, 0) / reactionTimes.length : null;

    const sonDenemeBasariOrani =
        recent.length > 0 ? recent.filter((a) => a.isCorrect).length / recent.length : null;

    return {
        ardisikYanlisSayisi,
        sonDenemeSayisi: recent.length,
        sonDenemeBasariOrani,
        sonDenemeOrtalamaTepkiSuresi,
    };
}
