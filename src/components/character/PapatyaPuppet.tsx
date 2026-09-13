'use client';

import { motion } from 'framer-motion';
import type { CharacterPose } from '@/lib/poseToCharacter';

interface PapatyaPuppetProps {
    pose: CharacterPose;
    size?: number;
}

const SPRING = { type: 'spring', stiffness: 120, damping: 14 } as const;

/**
 * Faz 3.4 — "kendi çizgi film karakteri". Kasıtlı olarak basit: SVG + Framer
 * Motion ile kodla çizilmiş, birkaç parçalı (kafa/gövde/iki kol) programatik
 * bir kukla — dış bir sanat/illüstrasyon varlığı gerektirmez, düşük RAM/CPU'da
 * akıcı çalışır. Marka maskotuyla (papatya çiçeği) aynı renk paletini
 * kullanır (bkz. PROMPTLAR.md logo bölümü).
 */
export function PapatyaPuppet({ pose, size = 240 }: PapatyaPuppetProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            role="img"
            aria-label="Papatya karakteri"
        >
            {/* Gövde — omuz eğimine göre hafifçe döner */}
            <motion.g
                animate={{ rotate: pose.bodyLeanDeg }}
                transition={SPRING}
                style={{ originX: '100px', originY: '140px' }}
            >
                <ellipse cx={100} cy={140} rx={38} ry={44} fill="rgb(232 179 60)" />

                {/* Sol kol — omuzdan sarkar, kalkıklık oranına göre yukarı döner */}
                <motion.g
                    animate={{ rotate: -pose.leftArmRaise * 140 }}
                    transition={SPRING}
                    style={{ originX: '66px', originY: '118px' }}
                >
                    <rect x={58} y={116} width={16} height={56} rx={8} fill="rgb(232 179 60)" />
                </motion.g>

                {/* Sağ kol */}
                <motion.g
                    animate={{ rotate: pose.rightArmRaise * 140 }}
                    transition={SPRING}
                    style={{ originX: '134px', originY: '118px' }}
                >
                    <rect x={126} y={116} width={16} height={56} rx={8} fill="rgb(232 179 60)" />
                </motion.g>
            </motion.g>

            {/* Kafa — kulak çizgisine göre eğilir */}
            <motion.g
                animate={{ rotate: pose.headTiltDeg }}
                transition={SPRING}
                style={{ originX: '100px', originY: '80px' }}
            >
                <circle cx={100} cy={80} r={46} fill="rgb(255 255 255)" stroke="rgb(232 179 60)" strokeWidth={6} />
                {/* Yüz — sakin, nötr ifade (bkz. GENEL PRENSİP: aşırı uyarıcı olmayan tasarım) */}
                <circle cx={84} cy={76} r={4} fill="rgb(42 39 34)" />
                <circle cx={116} cy={76} r={4} fill="rgb(42 39 34)" />
                <path d="M 84 96 Q 100 104 116 96" stroke="rgb(42 39 34)" strokeWidth={3} strokeLinecap="round" fill="none" />
            </motion.g>
        </svg>
    );
}
