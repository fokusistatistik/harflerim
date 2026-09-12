import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { APP_NAME } from '@/config/brand';

export const metadata = { title: `${APP_NAME} · Giriş` };

export default async function LoginPage() {
    if (await getCurrentUser()) redirect('/');

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-12">
            <div className="flex flex-col items-center gap-4">
                <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-28 md:h-28" aria-hidden="true">
                    <g fill="#E8B33C">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                            <ellipse key={deg} cx="60" cy="26" rx="10.5" ry="22" transform={`rotate(${deg} 60 60)`} />
                        ))}
                    </g>
                    <circle cx="60" cy="60" r="16" fill="#5F7A52" />
                </svg>
                <h1 className="font-display text-4xl md:text-5xl text-slate-700">{APP_NAME}</h1>
            </div>

            <LoginForm />
        </main>
    );
}
