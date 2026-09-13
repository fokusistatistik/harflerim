'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';

const BACKGROUND_THRESHOLD_MS = 15_000;

function formatDuration(ms: number): string {
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds} saniye`;
    const minutes = Math.round(totalSeconds / 60);
    return `${minutes} dakika`;
}

/**
 * Faz 1.16 — arka plan geçiş bildirimi. Amaç gözetim değil rutin
 * farkındalığıdır: anlık konum/aktivite takibi yapılmaz, yalnızca "oturum
 * ne kadar süre durdu, ne zaman devam etti" bilgisi ebeveyne iletilir.
 *
 * Page Visibility API ile: uygulama ~15 saniyeden uzun süre arka plana
 * düşüp GERİ DÖNDÜĞÜNDE (sekme değişimi kapanırken değil, geri gelirken)
 * bildirim gönderilir — bu, "ne kadar süre uzakta kaldı" bilgisini tek
 * seferde ve doğru olarak iletir; arka plana düşer düşmez bildirmek yalnızca
 * "durdu" der ama süreyi bilemez, üstelik kısa sekme değişimlerinde gereksiz
 * gürültü üretirdi (bu yüzden eşik gerçek dönüşte uygulanıyor).
 */
export function useBackgroundAwareness() {
    const pushToast = useNotificationStore((s) => s.pushToast);
    const hiddenAtRef = useRef<number | null>(null);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                hiddenAtRef.current = Date.now();
                return;
            }

            const hiddenAt = hiddenAtRef.current;
            hiddenAtRef.current = null;
            if (hiddenAt === null) return;

            const elapsed = Date.now() - hiddenAt;
            if (elapsed < BACKGROUND_THRESHOLD_MS) return;

            pushToast({
                scope: 'parent',
                kind: 'info',
                message: `Oturum ${formatDuration(elapsed)} boyunca arka plandaydı, şimdi devam ediyor.`,
                durationMs: 5000,
            });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [pushToast]);
}
