'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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
