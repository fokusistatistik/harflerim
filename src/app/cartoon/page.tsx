import { CartoonPlayer } from '@/components/cartoon/CartoonPlayer';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Çizgi Filmim — Güvenli ve Kontrollü Video İzleme',
    description: 'Yalnızca ebeveyn onayından geçmiş, reklamsız, dış bağlantısız ve güvenli çocuk çizgi filmleri ve hikâyeleri.',
    keywords: ['çizgi film', 'güvenli video', 'reklamsız çizgi film', 'çocuk hikayeleri', 'ebeveyn kontrollü video'],
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
