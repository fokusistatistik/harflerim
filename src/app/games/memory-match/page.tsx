import MemoryMatchGame from '@/components/game/MemoryMatchGame';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Hafıza Kartları — Eşleştirme Oyunu',
    description: 'Kartları çevir, aynı harf ve görselleri bul; görsel hafıza ve dikkat becerilerini güçlendir.',
    keywords: ['hafıza kartları', 'eşleştirme oyunu', 'dikkat geliştirme', 'özel eğitim görsel hafıza'],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function MemoryMatchPage() {
    return <MemoryMatchGame />;
}
