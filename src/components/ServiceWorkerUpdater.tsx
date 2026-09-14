'use client';

import { useEffect } from 'react';

/**
 * 2026-09-14 — kullanıcı bulgusu: "SW bir türlü sıfırlanmıyor, hard refresh
 * yapsam bile eski ikonlar geliyor". Kök neden: next-pwa'nın varsayılan
 * `window.workbox.register()` çağrısı yalnızca sayfa ilk yüklenirken bir
 * kontrol yapar; yeni bir SW versiyonu "waiting" durumuna geçse bile
 * (skipWaiting zaten aktif, ama bu yalnızca SW'nin KENDİSİNİ günceller —
 * sayfa `controllerchange` event'ini dinleyip yenilenmedikçe açık sekme
 * eski SW'nin kontrolünde kalmaya devam eder). Tarayıcının "otomatik
 * düzelir" varsayımına güvenmek yerine burada elle üç şey yapılıyor:
 *
 * 1. Sayfa her odaklandığında (`visibilitychange`) SW'ye "güncel misin?"
 *    diye sorulur (`registration.update()`) — tarayıcının kendi periyodik
 *    kontrolünü beklemeden.
 * 2. Yeni bir SW `installed` (yani `waiting`) durumuna geçtiği anda ona
 *    doğrudan `SKIP_WAITING` mesajı gönderilir — teorik olarak zaten
 *    `next.config.js`'teki skipWaiting:true bunu yapıyor olmalı, ama bu
 *    çift güvence, tek bir yerde bir gecikme/yarış durumu olursa devreye
 *    girer.
 * 3. Yeni SW devralınca (`controllerchange`) sayfa TEK SEFER otomatik
 *    yenilenir — çocuğun/ebeveynin manuel "hard refresh" yapmasına hiç
 *    gerek kalmaz.
 */
export function ServiceWorkerUpdater() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        // 2026-09-14 (2. bulgu) — kullanıcı `npm run dev` ile çalıştırıyor,
        // next.config.js'de SW yalnızca prod build'de aktif (disable:
        // NODE_ENV==="development"). Yani dev modda SW HİÇ kayıt olmuyor —
        // ama kullanıcının tarayıcısında (muhtemelen geçmişte bir prod
        // denemesinden kalma) bir SW hâlâ kayıtlı duruyorsa, o eski SW
        // dev server'ın servis ettiği isteklere bile müdahale edip eski
        // cache'lenmiş görselleri döndürmeye devam eder. Dev modda hiç SW
        // olmaması gerektiği için, burada varsa ZORLA temizlenir — güvenli,
        // çünkü doğru davranışta (dev) zaten hiç SW kaydı olmamalı.
        if (process.env.NODE_ENV === 'development') {
            navigator.serviceWorker.getRegistrations().then((regs) => {
                if (regs.length === 0) return;
                Promise.all(regs.map((r) => r.unregister())).then(() => {
                    if ('caches' in window) {
                        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
                    }
                    window.location.reload();
                });
            });
            return;
        }

        let reloaded = false;
        const reloadOnce = () => {
            if (reloaded) return;
            reloaded = true;
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);

        let registration: ServiceWorkerRegistration | null = null;

        const attachUpdateFoundListener = (reg: ServiceWorkerRegistration) => {
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            });
        };

        navigator.serviceWorker.getRegistration().then((reg) => {
            if (!reg) return;
            registration = reg;
            attachUpdateFoundListener(reg);
            // Zaten bekleyen bir SW varsa (sayfa açılmadan önce yeni build
            // yayına alınmış olabilir) onu hemen devral.
            if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        });

        const checkForUpdate = () => {
            if (document.visibilityState === 'visible') registration?.update().catch(() => {});
        };
        document.addEventListener('visibilitychange', checkForUpdate);
        window.addEventListener('focus', checkForUpdate);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', reloadOnce);
            document.removeEventListener('visibilitychange', checkForUpdate);
            window.removeEventListener('focus', checkForUpdate);
        };
    }, []);

    return null;
}
