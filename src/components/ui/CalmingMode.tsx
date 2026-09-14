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
 * davet (roadmap ilkesi). Kapanış YALNIZCA çocuğun kendi dokunuşuyla olur —
 * zorlama, süre veya ebeveyn onayı gerekmez; otomatik zaman aşımı YOK.
 *
 * 2026-09-14 — kullanıcı bulgusu: tek çıkışın "çıkışsız/zorunlu" hissettiği
 * bildirildi. İkinci bir buton eklendi — ikisi de AYNI eylemi (deactivate)
 * tetikler, yalnızca farklı bir duygusal çerçeve sunar: "Devam Edelim" nefes
 * egzersizini bitirmiş hissiyle, "Oynamaya devam et" doğrudan oyuna dönme
 * isteğiyle. Roadmap ilkesi bozulmuyor — hâlâ yalnızca çocuğun kendi
 * dokunuşu, süre/zorlama yok.
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

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={deactivate}
                    className="min-h-tap px-10 py-4 rounded-full bg-papatya-leaf text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                    Devam Edelim
                </button>
                <button
                    type="button"
                    onClick={deactivate}
                    className="min-h-tap px-10 py-4 rounded-full bg-papatya-surface border-2 border-papatya-leaf text-papatya-leaf text-xl font-bold shadow-sm hover:shadow-md transition-all"
                >
                    Oynamaya devam et
                </button>
            </div>
        </div>
    );
}
