'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCalmingModeStore } from '@/store/calmingModeStore';

const BREATH_CYCLE_MS = 8000; // 4sn al + 4sn ver

/**
 * Faz 3.2b — Sakinleştirme Modu. `DayComplete.tsx`'in tam-ekran/sakin/
 * otomatik-yönlendirmesiz deseniyle aynı, ama farklı bir an: bu "gün bitti"
 * değil, "birlikte bir nefes alalım" anı — papatya-sky/cream tonları (gece
 * teması DEĞİL). Klinik bir tanı/yorum metni İÇERMEZ — yalnızca durdurma ve
 * davet (roadmap ilkesi). Kapanış YALNIZCA çocuğun kendi "Devam Edelim"
 * dokunuşuyla olur — zorlama, süre veya ebeveyn onayı gerekmez.
 */
export function CalmingMode() {
    const isActive = useCalmingModeStore((s) => s.isActive);
    const deactivate = useCalmingModeStore((s) => s.deactivate);
    const [phase, setPhase] = useState<'in' | 'out'>('in');

    useEffect(() => {
        if (!isActive) return;
        setPhase('in');
        const interval = setInterval(() => {
            setPhase((p) => (p === 'in' ? 'out' : 'in'));
        }, BREATH_CYCLE_MS / 2);
        return () => clearInterval(interval);
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-papatya-cream flex flex-col items-center justify-center gap-10 px-6 text-center">
            <motion.div
                animate={{ scale: phase === 'in' ? 1.4 : 1 }}
                transition={{ duration: BREATH_CYCLE_MS / 2 / 1000, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full bg-papatya-sky/30 border-4 border-papatya-sky flex items-center justify-center"
            >
                <div className="w-16 h-16 rounded-full bg-papatya-sky/50" />
            </motion.div>

            <p className="text-2xl md:text-3xl font-hand font-bold text-papatya-ink" aria-live="polite">
                {phase === 'in' ? 'Nefes al...' : 'Nefes ver...'}
            </p>

            <button
                type="button"
                onClick={deactivate}
                className="min-h-tap px-10 py-4 rounded-full bg-papatya-leaf text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
                Devam Edelim
            </button>
        </div>
    );
}
