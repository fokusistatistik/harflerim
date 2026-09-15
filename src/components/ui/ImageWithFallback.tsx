'use client';

import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    /** Görsel yüklenemezse (404/ağ hatası) bunun yerine gösterilir — kırık görsel ikonu + üst üste binen alt metin yerine sakin bir yer tutucu. */
    fallback: ReactNode;
    /** Native `<img loading>` — anlık gösterilen ipucu görselleri gibi yerlerde 'eager' gecikmeyi önler. */
    loading?: 'eager' | 'lazy';
    /** Ek inline stil — ör. görseli siluete çeviren bir CSS filtresi (bkz. visual-match). */
    style?: CSSProperties;
}

/**
 * Kırık bir görselin görünümünü (üst üste binen alt metinli çirkin bir "kırık
 * resim" ikonu yerine) sakin bir yer tutucuya çevirir.
 *
 * 2026-09-14 — buradaki zaman aşımı "güvenlik ağı" kaldırıldı. Sağlam
 * görselleri öldürüyordu: görsel tarayıcı cache'inden hydration'dan ÖNCE
 * yüklendiğinde React'in onLoad'u hiç tetiklenmiyor, 4 sn sonra zamanlayıcı
 * çalışan PNG'yi "başarısız" sayıp yedek ikona düşüyordu (ana sayfadaki tüm
 * kart görselleri ikinci ziyarette birden ikona dönüyordu). Zaman aşımının
 * var oluş sebebi olan ölü dış CDN artık hiç kullanılmıyor — tüm görseller
 * aynı origin'den (/public) geliyor, asılı kalan istek senaryosu yok.
 *
 * Cache'ten gelen görselin kaçırılmaması için onLoad yerine ref callback'i
 * kullanılıyor: element bağlandığı anda `complete` zaten true ise yükleme
 * React devreye girmeden bitmiş demektir, sonucu oradan okuyoruz.
 */
export function ImageWithFallback({ src, alt, className, fallback, loading, style }: ImageWithFallbackProps) {
    const [failed, setFailed] = useState(false);

    // Bazı sunucular 404 için bile 200 + HTML gövdesi döndürebilir —
    // naturalWidth 0 ise gerçek bir görsel değildir.
    const bozukMu = (img: HTMLImageElement) => img.complete && img.naturalWidth === 0;

    const ref = useCallback((img: HTMLImageElement | null) => {
        if (img && bozukMu(img)) setFailed(true);
    }, []);

    if (failed) return <>{fallback}</>;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={ref}
            src={src}
            alt={alt}
            className={className}
            style={style}
            loading={loading}
            onError={() => setFailed(true)}
            onLoad={(e) => {
                if (bozukMu(e.currentTarget)) setFailed(true);
            }}
        />
    );
}
