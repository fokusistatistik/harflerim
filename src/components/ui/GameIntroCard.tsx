'use client';

import { useEffect, useState } from 'react';
import { X, Info } from 'lucide-react';
import { GAME_INTROS } from '@/config/gameIntros';

interface GameIntroCardProps {
    gameId: keyof typeof GAME_INTROS;
    /**
     * 'inline' — bir başlangıç/mod-seçim ekranının İÇİNE oturan sabit kart
     * (letter-hunt, memory-match, magic-words). 'banner' — oyun/araç direkt
     * açıldığı için başlığın altına konan, kapatılabilir ince bir şerit.
     * 'tooltip' — oyun tahtası sabit yer ayıramayacak kadar dolu olduğunda
     * (ör. visual-match'in sürükle-bırak alanı): küçük bir info düğmesi,
     * tıklanınca açılıp kapanan bir balon; hiçbir zaman sabit yer kaplamaz.
     */
    variant?: 'inline' | 'banner' | 'tooltip';
}

const STORAGE_PREFIX = 'papatya-intro-dismissed-';

/**
 * 2026-09-14 — kullanıcı isteğiyle her oyun/araç ekranına eklenen sade
 * tanıtım kartı. Metin kaynağı `src/config/gameIntros.ts`. 'banner' varyantı
 * kapatma tercihini localStorage'da tutar (kritik/paylaşılan veri değil,
 * salt cihaza özel bir UI tercihi — projenin "her şey DB'de" ilkesini
 * bozmaz, bkz. Faz 1 kapanış notları).
 */
export function GameIntroCard({ gameId, variant = 'inline' }: GameIntroCardProps) {
    const intro = GAME_INTROS[gameId];
    const storageKey = `${STORAGE_PREFIX}${gameId}`;
    const [dismissed, setDismissed] = useState(variant === 'banner');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (variant !== 'banner') return;
        try {
            setDismissed(window.localStorage.getItem(storageKey) === '1');
        } catch {
            setDismissed(false);
        }
    }, [variant, storageKey]);

    if (!intro) return null;

    if (variant === 'tooltip') {
        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="min-w-tap min-h-tap flex items-center justify-center bg-papatya-surface/90 backdrop-blur p-3 rounded-full shadow-sm hover:shadow-md transition-all text-papatya-sky"
                    aria-label="Bu oyun hakkında"
                    aria-expanded={open}
                >
                    <Info size={20} />
                </button>
                {open && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-papatya-surface border border-papatya-rule rounded-p-md px-4 py-3 shadow-lg z-20 text-left">
                        <p className="text-sm text-papatya-ink-soft">{intro.description}</p>
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'banner') {
        if (dismissed) return null;
        return (
            <div className="w-full max-w-2xl flex items-start gap-3 bg-papatya-surface/80 border border-papatya-rule rounded-p-md px-4 py-3 text-left">
                <Info size={18} className="text-papatya-sky shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-papatya-ink-soft">{intro.description}</p>
                <button
                    type="button"
                    onClick={() => {
                        try {
                            window.localStorage.setItem(storageKey, '1');
                        } catch {
                            /* localStorage yoksa sessizce yalnızca bu oturumda kapat */
                        }
                        setDismissed(true);
                    }}
                    className="min-w-tap min-h-tap flex items-center justify-center shrink-0 text-papatya-ink-soft/60 hover:text-papatya-ink-soft"
                    aria-label="Kapat"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md bg-papatya-surface/70 border border-papatya-rule rounded-p-md px-5 py-4 text-center">
            <p className="text-sm text-papatya-ink-soft">{intro.description}</p>
        </div>
    );
}
