'use client';

import { useEffect, useState } from 'react';

const TOTAL_PETALS = 8;

interface DaisyProgressProps {
    /** 0-8 arası dolu yaprak sayısı (üstte clamp edilir). */
    filledCount: number;
    size?: number;
    className?: string;
}

/**
 * Faz 1.9 — sekiz yapraklı Papatya ilerleme göstergesi (teknik iskele).
 * Yapraklar ZAMAN ORANINA göre dolar (bkz. Header.tsx'teki hesap):
 * dailyScreenSeconds / dailyScreenLimit oranının 8'e bölünmesi. Faz 2.8'in
 * gerçek "günün sekiz etkinliği" mantığı bunun yerini alana kadar geçici bir
 * çözümdür (bkz. kalıcı hafıza notu).
 *
 * Açılış animasyonu: bileşen mount olduğunda yapraklar sırayla (40ms
 * kademeli gecikmeyle) açılır — toplam süre --papatya-duration-base'e bağlı,
 * bu da prefers-reduced-motion / UserSettings.reduceMotion açıkken otomatik
 * olarak 0ms'e düşer (bkz. globals.css) ve gösterge tek karede belirir.
 */
export function DaisyProgress({ filledCount, size = 40, className }: DaisyProgressProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const clamped = Math.max(0, Math.min(TOTAL_PETALS, filledCount));
    const center = size / 2;
    const petalLength = size * 0.38;
    const petalWidth = size * 0.2;
    const petalCenterY = center - petalLength / 2 - size * 0.05;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            role="img"
            aria-label={`Bugünün papatyası: ${clamped}/${TOTAL_PETALS} yaprak dolu`}
        >
            {Array.from({ length: TOTAL_PETALS }).map((_, i) => {
                const angle = (360 / TOTAL_PETALS) * i;
                const isFilled = i < clamped;
                return (
                    <ellipse
                        key={i}
                        cx={center}
                        cy={petalCenterY}
                        rx={petalWidth / 2}
                        ry={petalLength / 2}
                        style={{
                            fill: isFilled ? 'rgb(var(--papatya-petal))' : 'rgb(var(--papatya-rule))',
                            transformBox: 'fill-box',
                            transformOrigin: 'center',
                            transform: `rotate(${angle}deg) scale(${mounted ? 1 : 0})`,
                            transitionProperty: 'transform, fill',
                            transitionDuration: 'var(--papatya-duration-base)',
                            transitionTimingFunction: 'ease-out',
                            transitionDelay: `${i * 40}ms`,
                        }}
                    />
                );
            })}
            <circle cx={center} cy={center} r={size * 0.15} fill="rgb(var(--papatya-petal-deep))" />
        </svg>
    );
}
