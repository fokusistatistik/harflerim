'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface GameHudProps {
    /** Verilirse geri düğmesi bir `onClick` olur (ör. harita görünümüne dön); verilmezse ana sayfaya `Link`. */
    onBack?: () => void;
    /** Ortadaki durum içeriği — seviye rozeti, skor vb. Opsiyonel. */
    center?: ReactNode;
    /** Sağ tarafa ek bir aksiyon (ör. yenile düğmesi). Opsiyonel. */
    right?: ReactNode;
}

/**
 * Faz 1.8 — ortak oyun HUD'u (GameShell'in paylaşılan altyapısı). Dört
 * oyunun da kendi başına yazdığı "geri + durum + aksiyon" satırının tek
 * kaynağı. Konumlandırma (fixed/absolute/normal akış) her oyunun kendi
 * sayfa düzenine bağlı kalır — bu bileşen yalnızca içeriği standartlaştırır.
 */
export function GameHud({ onBack, center, right }: GameHudProps) {
    return (
        <div className="w-full flex justify-between items-center gap-3">
            {onBack ? (
                <button
                    type="button"
                    onClick={onBack}
                    className="min-w-tap min-h-tap flex items-center justify-center bg-papatya-surface/90 backdrop-blur p-3 rounded-full shadow-sm hover:shadow-md transition-all"
                    aria-label="Geri"
                >
                    <Home size={22} className="text-papatya-ink-soft" />
                </button>
            ) : (
                <Link
                    href="/"
                    className="min-w-tap min-h-tap flex items-center justify-center bg-papatya-surface/90 backdrop-blur p-3 rounded-full shadow-sm hover:shadow-md transition-all"
                    aria-label="Ana Sayfa"
                >
                    <Home size={22} className="text-papatya-ink-soft" />
                </Link>
            )}

            {center}

            {right ?? <div className="min-w-tap" />}
        </div>
    );
}
