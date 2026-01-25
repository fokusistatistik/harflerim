import MagicWordsGame from '@/components/game/MagicWordsGame';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sihirli Kelimeler - Sesli Oyun',
    description: 'Konuşarak kelimeleri tanıdığın sihirli bir oyun!',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
};

export default function MagicWordsPage() {
    return <MagicWordsGame />;
}
