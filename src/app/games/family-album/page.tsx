import FamilyAlbumGame from '@/components/game/FamilyAlbumGame';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Aile Albümü - Bu Kim?',
    description: 'Aile bireylerinin fotoğraflarıyla tanıma oyunu.',
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
