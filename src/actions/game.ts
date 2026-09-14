'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getDailyUsage, addDailyUsageSeconds } from '@/lib/dailyUsage';
import { getAdaptiveConfig, BASE_ADAPTIVE_CONFIG, type AdaptiveConfig } from '@/lib/adaptiveDifficulty';

export interface GameState {
    sessionId: string;
    levelReached: number;
    totalDuration: number;
    /** Bu oyunun kendi seviye merdiveni bitti mi (Session.completedAt). */
    isGameComplete: boolean;
    /** Tüm oyunlar genelindeki günlük süre bütçesi doldu mu (DailyUsage.completedAt). */
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
    gameId: string;
    /** Faz 1.23 — oyun bileşenlerinin kişiselleştirme için (ör. "X ile Harfleri Keşfet"). */
    firstName: string;
}

export async function getDailySession(gameId: string = 'letter-hunt'): Promise<GameState> {
    const user = await getCurrentUser();
    if (!user) redirect('/giris');

    const today = new Date().toISOString().split('T')[0];

    // Find Session
    let session = await db.session.findUnique({
        where: {
            userId_date_gameId: {
                userId: user.id,
                date: today,
                gameId: gameId
            }
        }
    });

    if (!session) {
        session = await db.session.create({
            data: {
                userId: user.id,
                date: today,
                gameId: gameId,
                levelReached: 1,
                totalDuration: 0
            }
        });
    }

    const dailyUsage = await getDailyUsage(user.id);

    return {
        sessionId: session.id,
        levelReached: session.levelReached,
        totalDuration: session.totalDuration,
        isGameComplete: !!session.completedAt,
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
        gameId: session.gameId,
        firstName: user.firstName
    };
}

export interface SubmitResult {
    isGameComplete: boolean;
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
}

/**
 * Faz 3.2 — Harf Avı artık sabit bir 24-seviye merdiveni değil, uyarlanabilir
 * bir zorluk motoruyla çalışıyor (bkz. src/lib/adaptiveDifficulty.ts). Bu
 * fonksiyon artık bir "seviye ilerletme kapısı" DEĞİL — yalnızca deneme logu
 * (Event) + Session güncellemesi yapar. `difficultyIndicator`, o anki
 * round'un optionCount'udur; `Session.levelReached` bunu bir analitik alan
 * olarak saklamaya devam eder (Faz 3.1 öncesindeki "seviye" anlamı artık
 * yok, yıkıcı bir migration'la silinmedi). Diğer oyunlar gibi bu oyun da
 * artık "bitmez" — günlük süre bütçesi içinde sınırsız devam eder.
 */
export async function submitLevelResult(
    sessionId: string,
    difficultyIndicator: number,
    isCorrect: boolean,
    reactionTime: number,
    targetLetter: string
): Promise<SubmitResult | null> {
    // 2026-09-14 — denetim bulgusu: bu fonksiyon `sessionId`nin var olup
    // olmadığına bakıyordu ama çağıranın o oturumun GERÇEK sahibi olduğunu
    // hiç doğrulamıyordu (düşük risk — sessionId tahmin edilemez bir UUID —
    // ama açık bir yetki kontrolü eksikti). Diğer action'larla (skills.ts,
    // gameProgress.ts) tutarlı hale getirildi.
    const user = await getCurrentUser();
    if (!user) return null;

    // Fetch current session
    const currentSession = await db.session.findUnique({ where: { id: sessionId } });
    if (!currentSession || currentSession.userId !== user.id) return null;

    // Log Event
    await db.event.create({
        data: {
            sessionId,
            level: difficultyIndicator,
            targetLetter,
            isCorrect,
            reactionTime
        }
    });

    // Süre her zaman global günlük bütçeye işlenir.
    const addedSeconds = Math.ceil(reactionTime / 1000);
    const dailyUsage = await addDailyUsageSeconds(currentSession.userId, addedSeconds);
    const newTotalDuration = currentSession.totalDuration + addedSeconds;

    await db.session.update({
        where: { id: sessionId },
        data: {
            levelReached: difficultyIndicator,
            totalDuration: newTotalDuration,
        }
    });

    return {
        isGameComplete: false,
        isDayComplete: dailyUsage.isDayComplete,
        dailyScreenSeconds: dailyUsage.totalSeconds,
        dailyScreenLimit: dailyUsage.dailyScreenLimit,
    };
}

// 2026-09-14 — son kaç Event incelenir (harf-bazlı zayıflık tespiti için).
// detectErrorStreak'in SON_DENEME_PENCERESI'yle aynı büyüklükte tutuldu —
// tutarlı bir "yakın geçmiş" tanımı.
const WEAK_LETTER_WINDOW = 20;
const MAX_WEAK_LETTERS = 3;

/**
 * Son WEAK_LETTER_WINDOW denemede en az bir kez yanlış yapılan, başarı
 * oranı en düşük harfleri döndürür (en fazla MAX_WEAK_LETTERS tane).
 * Yalnızca bilgi — hiçbir eşik/"kriz" yorumu yapmaz, GameBoard.tsx bunu
 * ağırlıklı rastgele seçimde kullanır (tam öncelik değil, çeşitlilik korunur).
 */
async function getWeakLetters(userId: string): Promise<string[]> {
    const recentEvents = await db.event.findMany({
        where: { session: { userId } },
        orderBy: { createdAt: 'desc' },
        take: WEAK_LETTER_WINDOW,
        select: { targetLetter: true, isCorrect: true },
    });

    if (recentEvents.length === 0) return [];

    const stats = new Map<string, { total: number; wrong: number }>();
    for (const e of recentEvents) {
        const entry = stats.get(e.targetLetter) ?? { total: 0, wrong: 0 };
        entry.total += 1;
        if (!e.isCorrect) entry.wrong += 1;
        stats.set(e.targetLetter, entry);
    }

    return Array.from(stats.entries())
        .filter(([, s]) => s.wrong > 0)
        .sort((a, b) => b[1].wrong / b[1].total - a[1].wrong / a[1].total)
        .slice(0, MAX_WEAK_LETTERS)
        .map(([letter]) => letter);
}

/** Faz 3.2 — GameBoard'ın her round başında çağırdığı, oturumu olmayan (giriş yapmamış) bir durumda güvenle en kolay ayara düşen sarmalayıcı. */
export async function getAdaptiveRoundConfig(): Promise<AdaptiveConfig> {
    const user = await getCurrentUser();
    if (!user) return BASE_ADAPTIVE_CONFIG;

    const [config, weakLetters] = await Promise.all([
        getAdaptiveConfig(user.id),
        getWeakLetters(user.id),
    ]);

    return { ...config, weakLetters };
}
