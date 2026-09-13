import { MusicCorner } from '@/components/music/MusicCorner';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Müzik Köşesi',
    description: 'Ebeveynin eklediği şarkıları kontrollü bir şekilde dinle.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function MusicCornerPage() {
    return <MusicCorner />;
}
