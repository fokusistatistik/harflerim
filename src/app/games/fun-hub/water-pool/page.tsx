import { WaterPoolGame } from '@/components/game/WaterPoolGame';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Neşeli Havuz — Sulu Oyun ve Yüzen Oyuncaklar',
    description:
        'Su fiziği, dalgalar ve yüzen sevimli oyuncaklarla sakinleştirici dokunma ve su havuzu simülasyonu oyunu.',
    keywords: ['su oyunu', 'sulu havuz', 'sakinleştirici duyusal oyun', 'yüzen ördek oyunu'],
};

export default function WaterPoolPage() {
    return <WaterPoolGame />;
}
