'use client';

import { useBackgroundAwareness } from '@/hooks/useBackgroundAwareness';

/** Faz 1.16 — küçük, görünmez bir bağlayıcı bileşen (bkz. GameInitializer). */
export function BackgroundAwareness() {
    useBackgroundAwareness();
    return null;
}
