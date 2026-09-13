import { AacBoard } from '@/components/aac/AacBoard';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'İletişim Tahtası',
    description: 'Simge tabanlı iletişim tahtası — bir simgeye dokun, seslendirilsin.',
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
