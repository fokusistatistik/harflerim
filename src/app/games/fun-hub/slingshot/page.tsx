import { SlingshotGame } from '@/components/game/SlingshotGame';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sapanla Papatya — Hedefleme ve El-Göz Koordinasyonu',
    description:
        'Çek-fırlat sapan fiziğiyle hedefleri bulan, el-göz koordinasyonu ve uzamsal algıyı geliştiren eğlenceli çocuk oyunu.',
    keywords: ['sapan oyunu', 'hedefleme', 'el göz koordinasyonu', 'çocuk fizik oyunu'],
};

export default function SlingshotPage() {
    return <SlingshotGame />;
}
