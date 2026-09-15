'use client';

import { User } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useParentGateStore } from '@/store/parentGateStore';

interface HomeAvatarProps {
    avatarUrl: string | null;
    firstName: string;
}

/**
 * 2026-09-13 — UX denetiminde bulundu: ana sayfadaki profil fotoğrafının
 * hiçbir tıklama/yönetim işlevi yoktu. Artık dokununca ebeveyn kapısını
 * açar (Header'daki uzun-basma jestiyle aynı hedef, PIN olmadan hiçbir şey
 * göstermez) — Genel sekmesinin en üstünde profil fotoğrafı/isim yönetimi var.
 */
export function HomeAvatar({ avatarUrl, firstName }: HomeAvatarProps) {
    const openPinPrompt = useParentGateStore((s) => s.openPinPrompt);

    return (
        <button
            type="button"
            onClick={() => openPinPrompt()}
            className="w-full h-full rounded-full block"
            aria-label="Profili yönet"
            title="Profili yönet"
        >
            {avatarUrl ? (
                <ImageWithFallback
                    src={avatarUrl}
                    alt={firstName}
                    className="w-full h-full object-cover rounded-full border-8 border-white shadow-2xl"
                    fallback={
                        <div className="w-full h-full rounded-full border-8 border-white shadow-2xl bg-papatya-petal/20 flex items-center justify-center">
                            <User className="text-papatya-petal-deep" size={56} />
                        </div>
                    }
                />
            ) : (
                <div className="w-full h-full rounded-full border-8 border-white shadow-2xl bg-papatya-petal/20 flex items-center justify-center">
                    <User className="text-papatya-petal-deep" size={56} />
                </div>
            )}
        </button>
    );
}
