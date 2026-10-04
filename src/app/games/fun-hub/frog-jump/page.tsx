import { FrogJumpGame } from '@/components/game/FrogJumpGame';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Neşeli Kurbağa — Nilüfer Zıplama ve Ritim',
    description:
        'Zamanlama ve ritim duygusunu geliştiren, nilüfer yapraklarına doğru anda zıplayarak nehir boyunca ilerleyen kurbağa oyunu.',
    keywords: ['kurbağa oyunu', 'ritim oyunu', 'nilüfer zıplama', 'çocuk refleks oyunu'],
};

export default function FrogJumpPage() {
    return <FrogJumpGame />;
}
