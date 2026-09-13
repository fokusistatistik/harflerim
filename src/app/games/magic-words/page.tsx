import MagicWordsGame from '@/components/game/MagicWordsGame';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Sihirli Kelimeler - Sesli Oyun',
    description: 'Konuşarak kelimeleri tanıdığın sihirli bir oyun!',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function MagicWordsPage() {
    return <MagicWordsGame />;
}
