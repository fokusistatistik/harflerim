import { MusicCorner } from '@/components/music/MusicCorner';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Müzik Köşesi — Kontrollü Çocuk Şarkıları',
    description: 'Ebeveyn tarafından seçilen güvenli, sakinleştirici ve eğitici çocuk şarkıları köşesi.',
    keywords: ['çocuk şarkıları', 'müzik köşesi', 'güvenli müzik dinleme', 'otizm sakinleştirici müzik'],
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
