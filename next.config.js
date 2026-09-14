/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    // Faz 1.11 — gerçek çevrimdışı çalışma. next-pwa'nın kendi varsayılan
    // runtimeCaching kuralları zaten uzantıya göre (.png, .mp3 vb.) eşleşiyor,
    // ama görsel önbelleği yalnızca 64 kayıtla sınırlı — bizim ~260+ içerik
    // görselimiz (harf + kelime) bunu aşıyor ve eski girişler silinirdi.
    // extendDefaultRuntimeCaching: true ile bu kurallar ÖNCE denenir (daha
    // yüksek öncelik, daha yüksek kapasite), varsayılanlar (fontlar, JS/CSS,
    // next/image vb.) hâlâ otomatik olarak eklenir.
    extendDefaultRuntimeCaching: true,
    workboxOptions: {
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/cdn\.freesound\.org\/.*/i,
                handler: "CacheFirst",
                options: {
                    cacheName: "papatya-ui-audio",
                    rangeRequests: true,
                    expiration: {
                        maxEntries: 16, // sabit oyun ses efektleri (~5), büyüme payı
                        maxAgeSeconds: 60 * 60 * 24 * 90,
                    },
                },
            },
        ],
    },
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.freesound.org',
            },
        ],
    },
};

module.exports = withPWA(nextConfig);
