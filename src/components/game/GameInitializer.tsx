'use client';

import { useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import type { GameState } from '@/actions/game';

export function GameInitializer({ state }: { state: GameState }) {
    const init = useLevelStore(s => s.initSession);

    useEffect(() => {
        if (state) {
            init(
                state.sessionId,
                state.levelReached,
                state.totalDuration,
                state.isGameComplete,
                state.isDayComplete,
                state.dailyScreenSeconds,
                state.dailyScreenLimit
            );
        }
    }, [state, init]);

    return null;
}
