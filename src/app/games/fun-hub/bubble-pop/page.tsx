import { BubblePopGame } from '@/components/game/BubblePopGame';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sakin Balonlar — Uçan Balon Patlatma ve Çıkartma Albümü',
    description:
        'Yavaş süzülen pastel balonları patlatarak duyusal sakinleşme, görsel takip ve 10 parçalık çıkartma albümü koleksiyonu oyunu.',
    keywords: ['sakin balonlar', 'balon patlatma', 'duyusal sakinleşme', 'çıkartma albümü', 'otizm duyusal oyun'],
};

export default function BubblePopPage() {
    return <BubblePopGame />;
}
