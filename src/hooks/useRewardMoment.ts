'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAudio } from '@/components/AudioProvider';
import { useNotificationStore } from '@/store/notificationStore';

/** Papatya paleti — konfeti rengi de marka kimliğiyle tutarlı olsun. */
const CONFETTI_COLORS = ['#E8B33C', '#5F7A52', '#6B87A8', '#C4756A'];

interface RewardOptions {
    /** Toast metni. Varsayılan: "Harika!". */
    message?: string;
    /** Oyuna özel ses efekti (ör. `playMatch`, `playCorrect`). Verilmezse yalnızca konuşma+konfeti+toast olur. */
    playSound?: () => void;
    confettiOptions?: Parameters<typeof confetti>[0];
}

/**
 * Faz 1.8 — ortak "ödül anı" (GameShell'in paylaşılan altyapısı). Dört
 * oyunun da tekrar tekrar yazdığı konfeti + ses + konuşma + toast
 * kombinasyonunu tek bir çağrıya indirger; konfeti rengi papatya paletiyle
 * tutarlı hale getirilir (önceden her oyun kendi ad-hoc renklerini kullanıyordu).
 */
export function useRewardMoment() {
    const { celebrateSuccess } = useAudio();
    const pushToast = useNotificationStore((s) => s.pushToast);

    return useCallback(
        (options: RewardOptions = {}) => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: CONFETTI_COLORS,
                ...options.confettiOptions,
            });
            options.playSound?.();
            celebrateSuccess().catch(() => {});
            pushToast({ scope: 'child', kind: 'success', message: options.message ?? 'Harika!' });
        },
        [celebrateSuccess, pushToast]
    );
}
