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
 *
 * 2026-09-14 — kullanıcı bulgusu düzeltmesi: `isCorrect` artık kullanılıyor.
 * `acknowledged` (bkz. calmingModeStore) true olduğu sürece (çocuk "Devam
 * Edelim" dedi ama henüz yeni bir doğru cevap vermedi) sunucuya hiç
 * sorulmuyor — geçmiş yanlış zinciri sıfırlanmadığı için her yeni tekil
 * yanlışta anında yeniden tetiklenme riskini önler. İlk doğru cevapta bayrak
 * temizlenir, normal kontrol kaldığı yerden devam eder.
 */
export function useCalmingModeMonitor(skillKey: string): (isCorrect: boolean) => void {
    const activate = useCalmingModeStore((s) => s.activate);
    const acknowledged = useCalmingModeStore((s) => s.acknowledged);
    const clearAcknowledged = useCalmingModeStore((s) => s.clearAcknowledged);
    const pushToast = useNotificationStore((s) => s.pushToast);
    const { stop } = useAudio();

    const check = useCallback(
        (isCorrect: boolean) => {
            if (isCorrect) {
                if (acknowledged) clearAcknowledged();
                return;
            }
            if (acknowledged) return;

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
        [skillKey, activate, acknowledged, clearAcknowledged, pushToast, stop]
    );

    return check;
}
