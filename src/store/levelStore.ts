import { create } from 'zustand';
import { submitLevelResult } from '@/actions/game';
import { recordSkillAttempt } from '@/actions/skills';

export type DayPhase = 'Morning' | 'Noon' | 'Afternoon' | 'Evening' | 'Sleep';

interface LevelState {
    totalDuration: number;
    /** Tüm oyunlar genelindeki günlük süre bütçesi doldu mu (Faz 1.17). */
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
    sessionId: string | null;
    /** Faz 1.23 — kişiselleştirme için (ör. "X ile Harfleri Keşfet"). */
    firstName: string;
    /** 2026-09-14 — Harf Avı'na özel, süre bütçesine EK günlük round limiti. */
    roundsPlayedToday: number;
    dailyLetterHuntLimit: number;
    isLetterHuntLimitReached: boolean;

    // Actions
    initSession: (
        sessionId: string,
        totalDuration: number,
        isDayComplete: boolean,
        dailyScreenSeconds: number,
        dailyScreenLimit: number,
        firstName: string,
        roundsPlayedToday: number,
        dailyLetterHuntLimit: number,
        isLetterHuntLimitReached: boolean
    ) => void;
    /**
     * Faz 3.2 — eski `advanceLevel` artık bir "seviye ilerletme" değil, yalnızca
     * bir round'un sonucunu kaydeder. `difficultyIndicator`, o round'da
     * kullanılan çeldirici sayısıdır (bkz. src/lib/adaptiveDifficulty.ts) —
     * bir sonraki round'un zorluğu GameBoard'da ayrıca, sunucudan tazece
     * sorularak belirlenir.
     */
    advanceLevel: (isCorrect: boolean, targetLetter: string, reactionTime: number, difficultyIndicator: number, hintsUsed?: number) => void;
    /**
     * Faz 1.8 — Harf Avı dışındaki oyunlar (Hafıza Kartları, Sihirli
     * Kelimeler, Görsel Eşleştirme) kendi süre raporlarını buradan, ortak
     * useGameDayBudget hook'u üzerinden bu tek kaynağa yazar. Böylece
     * Header'daki DaisyProgress ve global DayComplete ekranı hangi oyun
     * oynanırsa oynansın aynı, güncel durumu yansıtır.
     */
    syncDailyUsage: (dailyScreenSeconds: number, dailyScreenLimit: number, isDayComplete: boolean) => void;
}

export const useLevelStore = create<LevelState>((set, get) => ({
    totalDuration: 0,
    isDayComplete: false,
    dailyScreenSeconds: 0,
    dailyScreenLimit: 1800,
    sessionId: null,
    firstName: '',
    roundsPlayedToday: 0,
    dailyLetterHuntLimit: 100,
    isLetterHuntLimitReached: false,

    initSession: (sessionId, duration, isDayComplete, dailyScreenSeconds, dailyScreenLimit, firstName, roundsPlayedToday, dailyLetterHuntLimit, isLetterHuntLimitReached) => {
        set({
            sessionId,
            totalDuration: duration,
            isDayComplete,
            dailyScreenSeconds,
            dailyScreenLimit,
            firstName,
            roundsPlayedToday,
            dailyLetterHuntLimit,
            isLetterHuntLimitReached,
        });
    },

    advanceLevel: async (isCorrect, targetLetter, reactionTime, difficultyIndicator, hintsUsed) => {
        const { totalDuration, sessionId, isDayComplete, isLetterHuntLimitReached } = get();
        if (!sessionId || isDayComplete || isLetterHuntLimitReached) return;

        // Optimistically update duration; sunucu senkronu sonrası kesin değerlerle üzerine yazılır.
        const addedSec = Math.ceil(reactionTime / 1000);
        const newTotal = totalDuration + addedSec;
        set({ totalDuration: newTotal });

        const result = await submitLevelResult(sessionId, difficultyIndicator, isCorrect, reactionTime, targetLetter);
        if (result) {
            set({
                isDayComplete: result.isDayComplete,
                dailyScreenSeconds: result.dailyScreenSeconds,
                dailyScreenLimit: result.dailyScreenLimit,
                roundsPlayedToday: result.roundsPlayedToday,
                dailyLetterHuntLimit: result.dailyLetterHuntLimit,
                isLetterHuntLimitReached: result.isLetterHuntLimitReached,
            });
        }

        // Faz 1.20 — ölçüm katmanı, oyun akışını asla bloklamaz/bozmaz.
        recordSkillAttempt('harf-tanima', 'letter-hunt', isCorrect, reactionTime, hintsUsed).catch(() => {});
    },

    syncDailyUsage: (dailyScreenSeconds, dailyScreenLimit, isDayComplete) => {
        set({ dailyScreenSeconds, dailyScreenLimit, isDayComplete });
    },
}));
