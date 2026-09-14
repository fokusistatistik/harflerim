'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    /** Görsel yüklenemezse (404/ağ hatası) bunun yerine gösterilir — kırık görsel ikonu + üst üste binen alt metin yerine sakin bir yer tutucu. */
    fallback: ReactNode;
    /** onError hiç tetiklenmeyen bazı ağ hatalarına karşı güvenlik ağı (ms). Varsayılan 4000. */
    timeoutMs?: number;
    /** Native `<img loading>` — anlık gösterilen ipucu görselleri gibi yerlerde 'eager' gecikmeyi önler. */
    loading?: 'eager' | 'lazy';
}

/**
 * UX düzeltmesi (2026-09-13) — kullanıcı raporu: "görseller linkler patlak".
 * Kök neden: eski içerik CDN'i (static.fokusistatistik.com) artık 404
 * döndürüyor — bu ayrı, çok daha büyük bir içerik-yenileme işi (bkz.
 * PROMPTLAR.md). Bu bileşen o daha büyük işi ÇÖZMEZ, yalnızca kırık bir
 * görselin görünümünü (üst üste binen alt metinli, çirkin bir "kırık resim"
 * ikonu yerine) sakin bir yer tutucuya çevirir.
 *
 * Yalnızca `onError`'a güvenmiyor: gerçek testte bu CDN'e bazı ağ/DNS
 * hatalarında `onError`'un HİÇ tetiklenmediği (isteğin sessizce asılı
 * kaldığı) gözlemlendi — bu yüzden bir zaman aşımı güvenlik ağı da var.
 */
export function ImageWithFallback({ src, alt, className, fallback, timeoutMs = 4000, loading }: ImageWithFallbackProps) {
    const [failed, setFailed] = useState(false);
    const loadedRef = useRef(false);

    useEffect(() => {
        loadedRef.current = false;
        setFailed(false);
        const timer = setTimeout(() => {
            if (!loadedRef.current) setFailed(true);
        }, timeoutMs);
        return () => clearTimeout(timer);
    }, [src, timeoutMs]);

    if (failed) return <>{fallback}</>;

    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            onError={() => setFailed(true)}
            onLoad={(e) => {
                // Bazı sunucular 404 için bile 200 + HTML gövdesi döndürebilir
                // (bkz. bu proje: content-type text/html) — naturalWidth 0 ise
                // gerçek bir görsel değildir, yine de fallback'e düş.
                if (e.currentTarget.naturalWidth === 0) {
                    setFailed(true);
                } else {
                    loadedRef.current = true;
                }
            }}
        />
    );
}
