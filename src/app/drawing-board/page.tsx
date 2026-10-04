import { DrawingBoard } from '@/components/drawing/DrawingBoard';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Çizim Tahtası — Serbest Çizim ve Boyama',
    description: 'Pastel renkler, yumuşak fırçalar ve sakinleştirici seslerle çocuklara özel duyusal serbest çizim tahtası.',
    keywords: ['çizim tahtası', 'çocuk çizim', 'duyusal boyama', 'ince motor beceri', 'otizm sanat'],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function DrawingBoardPage() {
    return <DrawingBoard />;
}
