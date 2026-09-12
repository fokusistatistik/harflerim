'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/actions/auth';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full min-h-[56px] rounded-2xl bg-amber-400 text-slate-800 text-xl font-bold shadow-md transition active:scale-[.98] hover:bg-amber-300 disabled:opacity-60"
        >
            {pending ? 'Açılıyor...' : 'Başla'}
        </button>
    );
}

export function LoginForm() {
    const [error, formAction] = useFormState(login, null);

    return (
        <form action={formAction} className="w-full max-w-sm flex flex-col gap-5">
            <label className="flex flex-col gap-2">
                <span className="text-lg text-slate-600">Adın</span>
                <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    className="min-h-[56px] rounded-2xl border-2 border-slate-200 bg-white px-5 text-xl text-slate-800 outline-none focus:border-amber-400"
                />
            </label>

            <label className="flex flex-col gap-2">
                <span className="text-lg text-slate-600">Şifren</span>
                <input
                    id="password"
                    name="password"
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    className="min-h-[56px] rounded-2xl border-2 border-slate-200 bg-white px-5 text-2xl tracking-[.4em] text-slate-800 outline-none focus:border-amber-400"
                />
            </label>

            {error && (
                <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-center text-rose-700">
                    {error}
                </p>
            )}

            <SubmitButton />
        </form>
    );
}
