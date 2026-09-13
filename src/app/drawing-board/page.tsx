import { DrawingBoard } from '@/components/drawing/DrawingBoard';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Çizim Tahtası',
    description: 'Parmakla veya fareyle serbest çizim yap.',
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
