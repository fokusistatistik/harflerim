import type { Metadata } from 'next';
import { APP_NAME } from '@/config/brand';

export const metadata: Metadata = {
    title: `Oyun Dünyası — ${APP_NAME}`,
    description:
        'Melike ve otizmli çocuklar için özel tasarlanmış 4 sakinleştirici ve duyusal mini-oyun: Neşeli Havuz, Neşeli Kurbağa, Sapanla Papatya ve Sakin Balonlar.',
    keywords: [
        'çocuk oyunları',
        'otizm oyun dünyası',
        'duyusal mini oyunlar',
        'neşeli havuz',
        'sakin balonlar',
        'neşeli kurbağa',
        'sapanla papatya',
        'otizmli çocuklar için güvenli oyunlar',
    ],
    openGraph: {
        title: `Oyun Dünyası — ${APP_NAME}`,
        description: 'Duyusal sakinleştirici, zaman kısıtlamalı ve ödüllü 4 harika mini-oyun.',
    },
};

export default function FunHubLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
