'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * 2026-09-14 — denetim bulgusu (moduller/harfavi.md, blok e): `UserSettings.
 * reduceMotion` yalnızca CSS geçiş sürelerine bağlıydı (globals.css,
 * `data-reduce-motion`), tüm oyunlardaki Framer Motion animasyonları
 * (pulse/shake/scale efektleri) bu ayardan tamamen bağımsız çalışıyordu.
 * Framer Motion'ın kendi `MotionConfig reducedMotion="always"`'i tek bir
 * yerden TÜM alt `motion.*` component'lerinin animasyonlarını söndürüyor —
 * her component'i tek tek değiştirmek yerine kök layout'ta bir kez sarılır.
 */
export function MotionPreference({ reduceMotion, children }: { reduceMotion: boolean; children: ReactNode }) {
    return <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>{children}</MotionConfig>;
}
