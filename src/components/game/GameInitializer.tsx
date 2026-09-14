'use client';

import { useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import type { GameState } from '@/actions/game';

export function GameInitializer({ state }: { state: GameState }) {
    const init = useLevelStore(s => s.initSession);

    useEffect(() => {
        if (state) {
            // Faz 3.2 — levelReached/isGameComplete artık levelStore'un işi değil
            // (Harf Avı seviyesiz; bkz. src/lib/adaptiveDifficulty.ts).
            init(
                state.sessionId,
                state.totalDuration,
                state.isDayComplete,
                state.dailyScreenSeconds,
                state.dailyScreenLimit,
                state.firstName,
                state.roundsPlayedToday,
                state.dailyLetterHuntLimit,
                state.isLetterHuntLimitReached
            );
        }
    }, [state, init]);

    return null;
}
