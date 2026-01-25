import type { Metadata, Viewport } from 'next';
import { Andika, Patrick_Hand } from 'next/font/google';
// import { AudioProvider } from '@/components/AudioProvider';
import { ParentFooter } from '@/components/ui/ParentFooter';
import { Header } from '@/components/ui/Header';
import { DayComplete } from '@/components/ui/DayComplete';
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
    title: 'Harf Yuvası',
    description: 'ASD odaklı Türkçe harf tanıma ve işitsel-görsel eşleştirme uygulaması',
    manifest: '/manifest.json',
    icons: {
        icon: '/icon-192.png',
        apple: '/apple-icon.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Harf Yuvası',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#FFFDD0',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className={`${andika.variable} ${patrickHand.variable}`}>
            <body className="font-sans antialiased bg-cream selection:bg-pink-200 selection:text-pink-900 pb-16 pt-16">
                {/* <AudioProvider> */}
                <Header />
                {children}
                <DayComplete />
                {/* </AudioProvider> */}
                <ParentFooter />
            </body>
        </html>
    );
}
