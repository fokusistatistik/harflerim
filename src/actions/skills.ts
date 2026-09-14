'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { detectErrorStreak } from '@/lib/skillAnalytics';

/** Faz 2.8b — rozet emojileri. Yeni bir skillKey eklendiğinde buraya da bir satır eklenir. */
const BADGE_EMOJI: Record<string, string> = {
    'harf-tanima': '🔤',
    'gorsel-hafiza': '🧠',
    'sesli-kelime-tanima': '🎤',
    'golge-eslestirme': '🌗',
    'sosyal-tanima': '👪',
    'el-yazisi': '✍️',
};

/**
 * Faz 1.20 — dört oyunun paylaştığı, ölçüm-amaçlı beceri kaydı. Oyun akışını
 * ASLA bloklamamalı veya bir hata fırlatmamalı — bilinmeyen bir skillKey
 * (ör. henüz seed edilmemiş bir ortam) sessizce no-op olur. Zorluk ayarlama
 * mantığı burada YOK — bu, Faz 3.1/3.2'nin işi; burada yalnızca kayıt var.
 *
 * Faz 2.8b — bir beceri bir kullanıcı için ilk kez `isCorrect: true` ile
 * tamamlandığında sabit bir rozet kazanılır (bkz. Badge modeli). Puan,
 * sıralama veya seri YOKTUR; rozet yalnızca bir kez ve her zaman aynı
 * koşulda kazanılır — bu yüzden `@@unique([userId, skillId])` ihlali
 * (rozet zaten var) sessizce yutulur, bu bir hata değildir.
 */
export async function recordSkillAttempt(
    skillKey: string,
    gameId: string,
    isCorrect: boolean,
    reactionTime?: number,
    hintsUsed?: number
): Promise<void> {
    try {
        const user = await getCurrentUser();
        if (!user) return;

        const skill = await db.skill.findUnique({ where: { key: skillKey } });
        if (!skill) return;

        await db.skillAttempt.create({
            data: {
                userId: user.id,
                skillId: skill.id,
                gameId,
                isCorrect,
                reactionTime: reactionTime ?? null,
                hintsUsed: hintsUsed ?? null,
            },
        });

        if (isCorrect) {
            await db.badge.create({
                data: {
                    userId: user.id,
                    skillId: skill.id,
                    emoji: BADGE_EMOJI[skillKey] ?? '⭐',
                    label: skill.label,
                },
            });
        }
    } catch {
        // Ölçüm katmanındaki bir hata oyunu asla bozmamalı. Rozet zaten
        // kazanılmışsa `db.badge.create` burada @@unique ihlaliyle atar —
        // bu da beklenen, zararsız bir durumdur.
    }
}

export interface TodaySkillStats {
    correct: number;
    total: number;
}

/**
 * 2026-09-14 — kullanıcı isteğiyle: oyunun başlangıç ekranında "bugün kaç
 * doğru/yanlış yaptım" özeti gösterebilmek için. Puan/sıralama değildir —
 * yalnızca o günkü SkillAttempt sayımı, todaySummary.ts'teki aynı
 * `todayRange()` deseniyle tutarlı.
 */
export async function getTodaySkillStats(skillKey: string): Promise<TodaySkillStats> {
    try {
        const user = await getCurrentUser();
        if (!user) return { correct: 0, total: 0 };

        const skill = await db.skill.findUnique({ where: { key: skillKey } });
        if (!skill) return { correct: 0, total: 0 };

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const [total, correct] = await Promise.all([
            db.skillAttempt.count({
                where: { userId: user.id, skillId: skill.id, createdAt: { gte: start, lt: end } },
            }),
            db.skillAttempt.count({
                where: { userId: user.id, skillId: skill.id, isCorrect: true, createdAt: { gte: start, lt: end } },
            }),
        ]);

        return { correct, total };
    } catch {
        return { correct: 0, total: 0 };
    }
}

export interface SkillProgressSummary {
    skillKey: string;
    label: string;
    /** Son 10 denemedeki başarı oranı (0-1), hiç deneme yoksa null. */
    successRate: number | null;
    /** Son 10 denemede kaç deneme fiilen vardı (10'dan az olabilir). */
    attemptCount: number;
}

/**
 * 2026-09-14 — denetim bulgusu (moduller/harfavi.md, blok b): ebeveyn
 * panelinde beceri bazlı ilerleme hiç görünmüyordu, yalnızca genel süre +
 * rozet vardı. `detectErrorStreak`'in zaten hesapladığı ham göstergeyi
 * (son 10 deneme başarı oranı) ProgressTab.tsx için toparlar — Faz 3.8'in
 * ("içgörü raporu") ilk, sade adımı. Yorum/etiket üretmez, ham oran döner.
 */
export async function getAllSkillProgress(): Promise<SkillProgressSummary[]> {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const skills = await db.skill.findMany({ orderBy: { label: 'asc' } });

        const results = await Promise.all(
            skills.map(async (skill) => {
                const stats = await detectErrorStreak(user.id, skill.key);
                return {
                    skillKey: skill.key,
                    label: skill.label,
                    successRate: stats.sonDenemeBasariOrani,
                    attemptCount: stats.sonDenemeSayisi,
                };
            })
        );

        return results;
    } catch {
        return [];
    }
}
