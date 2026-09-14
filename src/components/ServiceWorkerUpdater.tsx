'use client';

import { useEffect } from 'react';

/**
 * 2026-09-14 — kullanıcı bulgusu: "SW bir türlü sıfırlanmıyor, hard refresh
 * yapsam bile eski ikonlar geliyor" (dev modda, `npm run dev`).
 *
 * Kalıcı asıl çözüm `scripts/cleanDevServiceWorker.mjs`'tir — `predev` npm
 * hook'u üzerinden HER `npm run dev` başlangıcında `public/sw.js` ve
 * türevlerini dosya sisteminden siler, böylece dev server hiçbir zaman
 * eski bir SW script'ini servis edemez. Bu, tarayıcı event'lerine/zamanlamaya
 * bağlı olmayan, garantili bir kaynak-seviyesi çözümdür.
 *
 * Bu component yalnızca İKİNCİL bir güvenlik ağıdır: kullanıcının
 * tarayıcısında dosya-temizliğinden ÖNCE (örn. geçmiş bir prod denemesinden)
 * zaten kayıtlı kalmış bir SW olabilir — dosya artık sunucuda yoksa bile
 * tarayıcıdaki kayıt kendiliğinden silinmez. Burada dev modda basitçe
 * unregister edilir. BİLEREK reload YOK — önceki bir sürüm unregister
 * sonrası otomatik reload() çağırıyordu, bu da "birkaç saniyede bir
 * kendiliğinden yenilenme" şeklinde bir döngü riskiydi (kullanıcı
 * bildirdi). Kullanıcı normal navigasyonla devam eder.
 */
export function ServiceWorkerUpdater() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
        if (process.env.NODE_ENV !== 'development') return;

        navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
        });
        if ('caches' in window) {
            caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
        }
    }, []);

    return null;
}
