'use client';

import { useCallback, useRef } from 'react';

/**
 * Faz 1.3 — çocuğun yanlışlıkla tetiklemeyeceği bir jest. Kısa dokunuş
 * normal davranışını (ör. bir <Link>'in gezinmesini) bozmaz: yalnızca uzun
 * basma gerçekleşirse takip eden click olayı iptal edilir.
 */
export function useLongPress(onLongPress: () => void, ms: number = 700) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firedRef = useRef(false);

    const start = useCallback(() => {
        firedRef.current = false;
        timerRef.current = setTimeout(() => {
            firedRef.current = true;
            onLongPress();
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const onClick = useCallback((e: React.MouseEvent) => {
        if (firedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            firedRef.current = false;
        }
    }, []);

    return {
        onPointerDown: start,
        onPointerUp: clear,
        onPointerLeave: clear,
        onPointerCancel: clear,
        onClick,
    };
}
