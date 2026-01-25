import MemoryMatchGame from '@/components/game/MemoryMatchGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hafıza Kartları - Eşleştirme Oyunu',
    description: 'Kartları çevir, aynı olanları bul ve hafızanı güçlendir!',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
};

export default function MemoryMatchPage() {
    return <MemoryMatchGame />;
}
