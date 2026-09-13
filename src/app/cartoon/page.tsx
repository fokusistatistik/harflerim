import { CartoonPlayer } from '@/components/cartoon/CartoonPlayer';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Çizgi Filmim',
    description: 'Ebeveynin eklediği videoları ve resimli hikâyeleri kontrollü bir şekilde izle.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function CartoonPage() {
    return <CartoonPlayer />;
}
