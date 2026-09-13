'use client';

import { useCallback } from 'react';
import { checkCalmingModeTrigger } from '@/actions/calmingMode';
import { useCalmingModeStore } from '@/store/calmingModeStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAudio } from '@/components/AudioProvider';

/**
 * Faz 3.2b — Sakinleştirme Modu'nun oyunlara bağlandığı tek nokta
 * (useHintTimer/useRewardMoment ile aynı paylaşılan-hook deseni). Her
 * oyun, bir denemeyi kaydettikten hemen sonra dönen fonksiyonu çağırır.
 * `isCorrect` parametresi şu an kullanılmıyor (detectErrorStreak zaten tüm
 * pencereyi değerlendiriyor) — gelecekte "yalnızca yanlışta kontrol et"
 * gibi bir optimizasyon için imzada duruyor.
 */
export function useCalmingModeMonitor(skillKey: string): (isCorrect: boolean) => void {
    const activate = useCalmingModeStore((s) => s.activate);
    const pushToast = useNotificationStore((s) => s.pushToast);
    const { stop } = useAudio();

    const check = useCallback(
        (_isCorrect: boolean) => {
            checkCalmingModeTrigger(skillKey)
                .then((shouldActivate) => {
                    if (!shouldActivate) return;
                    stop();
                    activate();
                    pushToast({
                        scope: 'parent',
                        kind: 'info',
                        message: 'Bugün biraz zorlanıyor — Sakinleştirme Modu devreye girdi.',
                    });
                })
                .catch(() => {
                    // Ölçüm/tetikleme katmanındaki bir hata oyunu asla bozmamalı.
                });
        },
        [skillKey, activate, pushToast, stop]
    );

    return check;
}
