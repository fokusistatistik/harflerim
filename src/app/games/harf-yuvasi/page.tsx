import GameBoard from '@/components/game/GameBoard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Harf Yuvası - Eşleştirme',
    description: 'Görsel eşleştirme ve harf öğrenme oyunu.',
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function HarfYuvasiPage() {
    return (
        <main className="min-h-screen bg-cream overflow-hidden">
            <GameBoard />
        </main>
    );
}
