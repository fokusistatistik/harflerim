import { WritingPractice } from '@/components/writing/WritingPractice';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Yazı Alıştırması — Noktalı Kılavuz ile Harf Yazma',
    description:
        'Türkçe harfleri doğru yön ve sırayla parmak veya kalemle noktalı kılavuz üzerinden takip ederek yazma pratiği.',
    keywords: ['harf yazma', 'noktalı harf', 'yazı alıştırması', 'çocuk harf çizimi', 'özel eğitim okuma yazma'],
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
