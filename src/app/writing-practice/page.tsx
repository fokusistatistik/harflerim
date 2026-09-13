import { WritingPractice } from '@/components/writing/WritingPractice';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Yazı Alıştırması',
    description: 'Noktalı kılavuz üzerinden harf yazma alıştırması.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function WritingPracticePage() {
    return <WritingPractice />;
}
