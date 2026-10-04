import { GameBoard } from '@/components/games/visual-match/GameBoard';
import type { Metadata } from 'next';

import { APP_NAME } from '@/config/brand';

export const metadata: Metadata = {
    title: `Gölge ve Harf Eşleştirme`,
    description: 'Harfleri ve nesneleri doğru gölgeleriyle eşleştir; sürükle-bırak motor becerilerini ve görsel algıyı geliştir.',
    keywords: ['gölge eşleştirme', 'görsel eşleştirme', 'sürükle bırak', 'ince motor becerileri'],
};

export default function VisualMatchPage() {
    return <GameBoard />;
}
