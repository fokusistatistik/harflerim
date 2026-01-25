import { GameBoard } from '@/components/games/visual-match/GameBoard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Harfleri Eşleştir - HarfArkadaşım',
    description: 'Gölgesiyle eşleşen harfi bul ve sürükle!',
};

export default function VisualMatchPage() {
    return <GameBoard />;
}
