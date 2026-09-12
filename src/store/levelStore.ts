import { create } from 'zustand';
import { submitLevelResult } from '@/actions/game';

export type DayPhase = 'Morning' | 'Noon' | 'Afternoon' | 'Evening' | 'Sleep';

interface LevelState {
    currentLevel: number;
    totalDuration: number;
    /** Bu oyunun kendi 24 seviyelik merdiveni bitti mi. */
    isGameComplete: boolean;
    /** Tüm oyunlar genelindeki günlük süre bütçesi doldu mu (Faz 1.17). */
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
    sessionId: string | null;

    // Actions
    initSession: (
        sessionId: string,
        level: number,
        duration: number,
        isGameComplete: boolean,
        isDayComplete: boolean,
        dailyScreenSeconds: number,
        dailyScreenLimit: number
    ) => void;
    advanceLevel: (isCorrect: boolean, targetLetter: string, reactionTime: number) => void;

    getLevelConfig: (level: number) => {
        optionCount: number;
        phase: DayPhase;
        distractorType: 'random' | 'similar'
    };
}

const TOTAL_LEVELS = 24;

export const useLevelStore = create<LevelState>((set, get) => ({
    currentLevel: 1,
    totalDuration: 0,
    isGameComplete: false,
    isDayComplete: false,
    dailyScreenSeconds: 0,
    dailyScreenLimit: 1800,
    sessionId: null,

    initSession: (sessionId, level, duration, isGameComplete, isDayComplete, dailyScreenSeconds, dailyScreenLimit) => {
        const gameDone = isGameComplete || level > TOTAL_LEVELS;
        set({
            sessionId,
            currentLevel: gameDone ? TOTAL_LEVELS : level,
            totalDuration: duration,
            isGameComplete: gameDone,
            isDayComplete,
            dailyScreenSeconds,
            dailyScreenLimit,
        });
    },

    advanceLevel: async (isCorrect, targetLetter, reactionTime) => {
        const { currentLevel, totalDuration, sessionId, isGameComplete, isDayComplete } = get();
        if (!sessionId || isGameComplete || isDayComplete) return;

        // Optimistically update duration; sunucu senkronu sonrası kesin değerlerle üzerine yazılır.
        const addedSec = Math.ceil(reactionTime / 1000);
        const newTotal = totalDuration + addedSec;

        if (isCorrect) {
            let next = currentLevel + 1;
            let gameDone = false;

            if (next > TOTAL_LEVELS) {
                next = 24; // Visual cap
                gameDone = true;
            }

            set({ currentLevel: next, totalDuration: newTotal, isGameComplete: gameDone });

            const result = await submitLevelResult(sessionId, currentLevel, true, reactionTime, targetLetter);
            if (result) {
                set({
                    isDayComplete: result.isDayComplete,
                    dailyScreenSeconds: result.dailyScreenSeconds,
                    dailyScreenLimit: result.dailyScreenLimit,
                });
            }
        } else {
            set({ totalDuration: newTotal });
            const result = await submitLevelResult(sessionId, currentLevel, false, reactionTime, targetLetter);
            if (result) {
                set({
                    isDayComplete: result.isDayComplete,
                    dailyScreenSeconds: result.dailyScreenSeconds,
                    dailyScreenLimit: result.dailyScreenLimit,
                });
            }
        }
    },

    getLevelConfig: (level) => {
        let optionCount = 2;
        let distractorType: 'random' | 'similar' = 'random';
        let phase: DayPhase = 'Morning';

        // Day Phase (Atmosphere)
        if (level > 6) phase = 'Noon';
        if (level > 12) phase = 'Afternoon';
        if (level > 18) phase = 'Evening';

        // Progression Logic
        // Levels 1-6: Learning (Low count, random)
        if (level <= 2) { optionCount = 2; }
        else if (level <= 4) { optionCount = 3; }
        else if (level <= 6) { optionCount = 4; }

        // Levels 7-12: Expansion (Higher count)
        else if (level <= 8) { optionCount = 5; }
        else if (level <= 10) { optionCount = 6; }
        else if (level <= 12) { optionCount = 6; distractorType = 'similar'; } // First taste of similarity

        // Levels 13-18: Focus (Similarity challenges)
        else if (level <= 14) { optionCount = 5; distractorType = 'similar'; }
        else if (level <= 16) { optionCount = 6; distractorType = 'similar'; }
        else if (level <= 18) { optionCount = 8; distractorType = 'random'; } // Breather with high count

        // Levels 19-24: Mastery (High count + Similarity)
        else if (level <= 20) { optionCount = 8; distractorType = 'similar'; }
        else if (level <= 22) { optionCount = 9; distractorType = 'similar'; } // 3x3
        else { optionCount = 12; distractorType = 'similar'; } // 3x4 Final Challenge

        return { optionCount, phase, distractorType };
    }
}));
