import { GameBoard } from '@/components/games/visual-match/GameBoard';
import type { Metadata } from 'next';

import { APP_NAME } from '@/config/brand';

export const metadata: Metadata = {
    title: `Harfleri Eşleştir - ${APP_NAME}`,
    description: 'Gölgesiyle eşleşen harfi bul ve sürükle!',
};

export default function VisualMatchPage() {
    return <GameBoard />;
}
