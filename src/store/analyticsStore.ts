import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// import { supabase } from '@/lib/supabaseClient';

interface GameEventPayload {
    session_id: string;
    level_number: number;
    target_letter: string;
    distractors: string[];
    chosen_item: string;
    is_correct: boolean;
    reaction_time_ms: number;
}

interface AnalyticsState {
    currentSessionId: string | null;
    totalPlayTimeSeconds: number;
    dailyPlayTime: Record<string, number>;
    totalGamesPlayed: number;
    totalCorrect: number;
    totalWrong: number;

    // Actions
    setSessionId: (id: string) => void;
    tick: () => void;
    logAttempt: (isCorrect: boolean) => void;
    logSupabaseEvent: (payload: Omit<GameEventPayload, 'session_id'>) => Promise<void>;
    getSuccessRate: () => string;
    getTodayTime: () => string;
    getTotalTimeFormatted: () => string;
}

export const useAnalyticsStore = create<AnalyticsState>()(
    persist(
        (set, get) => ({
            currentSessionId: null,
            totalPlayTimeSeconds: 0,
            dailyPlayTime: {},
            totalGamesPlayed: 0,
            totalCorrect: 0,
            totalWrong: 0,

            setSessionId: (id) => set({ currentSessionId: id }),

            tick: () => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => ({
                    totalPlayTimeSeconds: state.totalPlayTimeSeconds + 1,
                    dailyPlayTime: {
                        ...state.dailyPlayTime,
                        [today]: (state.dailyPlayTime[today] || 0) + 1,
                    },
                }));
            },

            logAttempt: (isCorrect) => {
                set((state) => ({
                    totalGamesPlayed: state.totalGamesPlayed + 1,
                    totalCorrect: state.totalCorrect + (isCorrect ? 1 : 0),
                    totalWrong: state.totalWrong + (isCorrect ? 0 : 1),
                }));
            },

            logSupabaseEvent: async (payload) => {
                const { currentSessionId } = get();
                if (!currentSessionId) return;

                // Fire and forget (Local for now, or replace with Server Action call)
                console.log('Event logged:', payload);
            },

            getSuccessRate: () => {
                const { totalCorrect, totalWrong } = get();
                const total = totalCorrect + totalWrong;
                if (total === 0) return '0%';
                return `${Math.round((totalCorrect / total) * 100)}%`;
            },

            getTodayTime: () => {
                const today = new Date().toISOString().split('T')[0];
                const seconds = get().dailyPlayTime[today] || 0;
                const m = Math.floor(seconds / 60);
                const s = seconds % 60;
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            },

            getTotalTimeFormatted: () => {
                const seconds = get().totalPlayTimeSeconds;
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                return `${h}s ${m}dk`;
            },
        }),
        {
            name: 'melike-analytics-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
