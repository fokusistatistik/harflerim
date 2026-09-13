import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { APP_NAME } from '@/config/brand';

export const metadata = { title: `${APP_NAME} · Giriş` };

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
        </main>
    );
}
