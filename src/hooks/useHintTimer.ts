'use client';

import { useEffect, useState, type DependencyList } from 'react';

const DEFAULT_DELAY_MS = 5000;

/**
 * Faz 1.8 — ortak ipucu zamanlayıcısı (GameShell'in paylaşılan altyapısı).
 * `deps` değiştiğinde (yeni round/hedef) sayaç sıfırlanır; `delayMs` sonra
 * `showHint` true olur. Harf Avı'nın önceden kendi bileşeninde tuttuğu
 * mantığın birebir aynısı — burada, gerektiğinde başka oyunların da
 * kullanabileceği paylaşılan bir hook olarak durur. Bir oyunun ipucu
 * mekaniği yoksa bu hook'u hiç çağırmaması yeterlidir.
 */
export function useHintTimer(deps: DependencyList, delayMs: number = DEFAULT_DELAY_MS): [boolean, () => void] {
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        setShowHint(false);
        const timer = setTimeout(() => setShowHint(true), delayMs);
        return () => clearTimeout(timer);
        // `deps` çağıran tarafından belirlenir (ör. [targetLetter, status]) —
        // exhaustive-deps burada uygulanamaz, bu hook'un tasarım amacı bu.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // Round zamanlayıcıyı beklemeden, bir etkileşim (ör. sürüklemeye başlama)
    // ipucunu erken gizlemek isterse (bkz. Harf Avı'nın handleDragStart'ı).
    const dismiss = () => setShowHint(false);

    return [showHint, dismiss];
}
