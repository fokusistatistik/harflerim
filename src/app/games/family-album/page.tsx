import FamilyAlbumGame from '@/components/game/FamilyAlbumGame';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Aile Albümü — Bu Kim?',
    description: 'Aile bireylerinin fotoğrafları ve kendi gerçek sesleriyle güvenli sosyal tanıma ve bağ kurma oyunu.',
    keywords: ['aile albümü', 'bu kim', 'sosyal iletişim', 'otizm aile tanıma', 'özel eğitim bağ kurma'],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function FamilyAlbumPage() {
    return <FamilyAlbumGame />;
}
