// 2026-09-14 — kullanıcı bulgusu: "SW bir türlü sıfırlanmıyor, hard refresh
// yapsam bile eski ikonlar geliyor". Kök neden zinciri: next-pwa SW'yi
// yalnızca prod build'de üretir/aktifleştirir (next.config.js'teki
// disable: NODE_ENV==="development"), ama `public/sw.js` bir kez
// üretildikten sonra dosya sistemde KALIR — sonraki `npm run dev`
// çalıştırmaları bu dosyayı silmez. Eğer tarayıcı bu dosyayı bir noktada
// (yanlışlıkla ya da bir önceki prod denemesinde) kaydettiyse, o SW artık
// dev server'ın servis ettiği güncel içeriğe rağmen eskiyi döndürmeye
// devam edebilir — tarayıcı API'lerine (unregister/reload event'leri)
// güvenen çözümler yarış durumu riski taşıyordu (bkz. ServiceWorkerUpdater
// geçmişi). Bu script `predev` hook'u ile HER `npm run dev` başlangıcında
// çalışır: kaynağı (dosyanın kendisini) ortadan kaldırır, hiçbir tarayıcı
// event'ine ya da zamanlamaya bağlı değildir — garantili, senkron, basit.
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const publicDir = join(import.meta.dirname, '..', 'public');

if (!existsSync(publicDir)) process.exit(0);

const patterns = [/^sw\.js(\.map)?$/, /^workbox-.*\.js(\.map)?$/, /^swe-worker-.*\.js(\.map)?$/];

const removed = [];
for (const file of readdirSync(publicDir)) {
    if (patterns.some((p) => p.test(file))) {
        rmSync(join(publicDir, file));
        removed.push(file);
    }
}

if (removed.length > 0) {
    console.log(`[predev] Eski service worker dosyaları temizlendi: ${removed.join(', ')}`);
}
