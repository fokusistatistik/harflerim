import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { APP_NAME, APP_TAGLINE } from '@/config/brand';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: `Giriş Yap`,
    description: `${APP_NAME} çocuk ve ebeveyn giriş ekranı. Güvenli, şifreli ve kişiselleştirilmiş özel eğitim alanı.`,
};

export default async function LoginPage() {
    if (await getCurrentUser()) redirect('/');

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-12">
            {/* Gerçek marka görselleri (2026-09-13) — Faz 1.9'daki placeholder'ın
                yerini aldı. Yatay logo açık/beyaz renkte tasarlandığı için
                (bkz. PROMPTLAR.md) düz bir marka rengi zemin üzerine oturtuldu —
                aksi halde kirli/krem sayfa zemininde neredeyse görünmez olurdu. */}
            <div className="bg-papatya-leaf rounded-p-lg px-8 py-6 md:px-12 md:py-8 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/papatya-yatay-logo.png"
                    alt={APP_NAME}
                    className="w-64 md:w-80 h-auto"
                />
            </div>

            <LoginForm />

            <div className="max-w-md text-center text-slate-600 space-y-2 mt-2">
                <h1 className="text-xl md:text-2xl font-bold font-hand text-papatya-ink">
                    {APP_NAME} — {APP_TAGLINE}
                </h1>
                <p className="text-sm text-papatya-ink-soft leading-relaxed">
                    Otizm spektrumundaki ve özel eğitim gereksinimi olan çocuklara yönelik Türkçe fonetik harf eğitimi, AAC alternatif iletişim tahtası ve duyusal sakinleştirici oyunlar.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs font-semibold text-papatya-ink-soft">
                    <span className="bg-white/80 border border-papatya-rule rounded-full px-3 py-1 shadow-sm">🌸 Harf Avı</span>
                    <span className="bg-white/80 border border-papatya-rule rounded-full px-3 py-1 shadow-sm">🗣️ AAC İletişim</span>
                    <span className="bg-white/80 border border-papatya-rule rounded-full px-3 py-1 shadow-sm">🎮 Duyu Dostu Oyunlar</span>
                    <span className="bg-white/80 border border-papatya-rule rounded-full px-3 py-1 shadow-sm">🔒 Ebeveyn Korumalı</span>
                </div>
            </div>
        </main>
    );
}
