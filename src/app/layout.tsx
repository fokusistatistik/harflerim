import type { Metadata, Viewport } from 'next';
import { Andika, Patrick_Hand } from 'next/font/google';
import { AudioProvider } from '@/components/AudioProvider';
import { ParentFooter } from '@/components/ui/ParentFooter';
import { Header } from '@/components/ui/Header';
import { DayComplete } from '@/components/ui/DayComplete';
import { ToastHost } from '@/components/ui/ToastHost';
import { ParentGate } from '@/components/ui/ParentGate';
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
        >
            <body className={`font-sans antialiased bg-cream selection:bg-pink-200 selection:text-pink-900 ${user ? 'pb-16 pt-16 lg:pt-20' : ''}`}>
                <AudioProvider speechEnabled={settings?.speechEnabled ?? true}>
                    {user && <Header />}
                    {user && <ToastHost />}
                    {user && <ParentGate />}
                    {children}
                    {user && <DayComplete />}
                </AudioProvider>
                {user && <ParentFooter />}
            </body>
        </html>
    );
}
