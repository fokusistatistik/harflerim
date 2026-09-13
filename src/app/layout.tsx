import type { Metadata, Viewport } from 'next';
import { Andika, Patrick_Hand } from 'next/font/google';
import { AudioProvider } from '@/components/AudioProvider';
import { ParentFooter } from '@/components/ui/ParentFooter';
import { Header } from '@/components/ui/Header';
import { DayComplete } from '@/components/ui/DayComplete';
import { CalmingMode } from '@/components/ui/CalmingMode';
import { ToastHost } from '@/components/ui/ToastHost';
import { ParentGate } from '@/components/ui/ParentGate';
import { BackgroundAwareness } from '@/components/ui/BackgroundAwareness';
import { APP_NAME } from '@/config/brand';
import { getCurrentUser } from '@/lib/auth';
import './globals.css';

const andika = Andika({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-andika',
});

const patrickHand = Patrick_Hand({
    weight: ['400'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-patrick',
});

export const metadata: Metadata = {
    title: APP_NAME,
    description: 'ASD odaklı Türkçe harf tanıma ve işitsel-görsel eşleştirme uygulaması',
    manifest: '/manifest.json',
    icons: {
        icon: '/icon-192.png',
        apple: '/apple-icon.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: APP_NAME,
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#FFFDD0',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    const settings = user?.settings;

    return (
        <html
            lang="tr"
            className={`${andika.variable} ${patrickHand.variable}`}
            data-reduce-motion={settings?.reduceMotion ? 'true' : undefined}
            data-contrast={settings?.highContrast ? 'high' : undefined}
            // 2026-09-13 — gerçek bir tema anahtarı yok (bilerek Faz 5'e
            // ertelendi, bkz. YOL-HARITASI.md), ama globals.css'teki
            // `prefers-color-scheme: dark` medya sorgusu cihazın sistem
            // ayarına göre paleti sessizce koyuya çeviriyordu — test
            // edilmemiş/tasarlanmamış bir görünümdü. `data-theme="light"`
            // CSS'te zaten hazır bekleyen kaçış kapısını kullanıp paleti
            // sistem tercihinden bağımsız krem/açık modda kilitler.
            data-theme="light"
        >
            <body className={`font-sans antialiased bg-cream selection:bg-pink-200 selection:text-pink-900 ${user ? 'pb-16 pt-16 lg:pt-20' : ''}`}>
                <AudioProvider speechEnabled={settings?.speechEnabled ?? true}>
                    {user && <Header />}
                    {user && <ToastHost />}
                    {user && <ParentGate />}
                    {user && <BackgroundAwareness />}
                    {children}
                    {user && <DayComplete />}
                    {user && <CalmingMode />}
                </AudioProvider>
                {user && <ParentFooter />}
            </body>
        </html>
    );
}
