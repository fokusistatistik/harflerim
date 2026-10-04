'use client';

import { useEffect, useState } from 'react';
import { getArcadeStatus, reportArcadePlay } from '@/actions/arcade';
import type { ArcadeUsageState, ArcadeGameId } from '@/lib/arcadeUsage';

const REPORT_INTERVAL_MS = 10_000;

export interface ArcadeDayBudget extends ArcadeUsageState {
    /** Kalan sürenin bittiğini ancak aktif turun bitmesine izin verildiğini belirtir */
    isLastRound: boolean;
}

/**
 * Oyun Dünyası oyunları için özel süre bütçesi hook'u.
 * Sayfa açık kaldığı sürece her 10 saniyede bir oynanan süreyi raporlar ve güncel bütçeyi döndürür.
 * Sekme arka plandayken (document.hidden) süre sayılmaz.
 */
export function useArcadeDayBudget(gameId?: ArcadeGameId): ArcadeDayBudget | null {
    const [budget, setBudget] = useState<ArcadeDayBudget | null>(null);

    useEffect(() => {
        let cancelled = false;

        const applyStatus = (status: ArcadeUsageState | null) => {
            if (cancelled || !status) return;
            setBudget({
                ...status,
                isLastRound: status.isArcadeDayComplete,
            });
        };

        getArcadeStatus().then(applyStatus);

        if (!gameId) return;

        const interval = setInterval(() => {
            if (document.hidden) return;
            reportArcadePlay(gameId, REPORT_INTERVAL_MS / 1000).then(applyStatus);
        }, REPORT_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [gameId]);

    return budget;
}
