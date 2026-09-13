'use client';

import { useEffect, useState } from 'react';
import { getDailyUsageStatus, reportPlaySeconds } from '@/actions/dailyUsage';
import type { DailyUsageState } from '@/lib/dailyUsage';
import { useLevelStore } from '@/store/levelStore';

const REPORT_INTERVAL_MS = 10_000;

export interface GameDayBudget {
    isDayComplete: boolean;
    dailyScreenSeconds: number;
    dailyScreenLimit: number;
}

/**
 * Faz 1.8 — ortak günlük süre bütçesi raporlama. Harf Avı dışındaki oyunlar
 * (Hafıza Kartları, Sihirli Kelimeler, Görsel Eşleştirme) mount oldukları
 * sürece her 10 saniyede bir oynanan süreyi global bütçeye raporlar ve
 * güncel durumu hem kendi bileşenine (dönüş değeri) hem de merkezi
 * levelStore'a (Header/DayComplete'in okuduğu tek kaynak) yazar.
 *
 * Sekme arka plandayken (document.hidden) süre sayılmaz — çocuğun başka bir
 * uygulamada geçirdiği zaman Papatya'nın günlük bütçesine eklenmemeli.
 */
export function useGameDayBudget(): GameDayBudget | null {
    const [state, setState] = useState<GameDayBudget | null>(null);
    const syncDailyUsage = useLevelStore((s) => s.syncDailyUsage);

    useEffect(() => {
        let cancelled = false;

        const applyStatus = (status: DailyUsageState | null) => {
            if (cancelled || !status) return;
            const budget: GameDayBudget = {
                isDayComplete: status.isDayComplete,
                dailyScreenSeconds: status.totalSeconds,
                dailyScreenLimit: status.dailyScreenLimit,
            };
            setState(budget);
            syncDailyUsage(budget.dailyScreenSeconds, budget.dailyScreenLimit, budget.isDayComplete);
        };

        getDailyUsageStatus().then(applyStatus);

        const interval = setInterval(() => {
            if (document.hidden) return;
            reportPlaySeconds(REPORT_INTERVAL_MS / 1000).then(applyStatus);
        }, REPORT_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [syncDailyUsage]);

    return state;
}
