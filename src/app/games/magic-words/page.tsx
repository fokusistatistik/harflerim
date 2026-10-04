import MagicWordsGame from '@/components/game/MagicWordsGame';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Sihirli Kelimeler — Sesli Konuşma Oyunu',
    description: 'Mikrofon ile konuşarak sesli sözcükleri tanıdığın, konuşma terapisi destekli sihirli çocuk oyunu.',
    keywords: ['sihirli kelimeler', 'konuşma oyunu', 'sesli harfler', 'özel eğitim konuşma', 'otizm dil gelişimi'],
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
