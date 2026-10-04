import { AacBoard } from '@/components/aac/AacBoard';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'AAC İletişim Tahtası — Alternatif ve Destekleyici İletişim',
    description:
        'Konuşma güçlüğü yaşayan otizmli çocuklar için görsel sembol tabanlı Türkçe AAC iletişim panosu. Simgelere dokunarak istekleri, duyguları ve ihtiyaçları anında seslendirir.',
    keywords: [
        'aac iletişim tahtası',
        'otizm iletişim panosu',
        'destekleyici iletişim',
        'konuşma kartları',
        'türkçe aac',
        'özel eğitim iletişim',
    ],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function AacBoardPage() {
    return <AacBoard />;
}
