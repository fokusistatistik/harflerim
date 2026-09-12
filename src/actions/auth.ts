'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createAuthSession, destroyAuthSession, verifyPassword } from '@/lib/auth';

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!username || !password) {
        return 'Kullanıcı adını ve şifreni yaz.';
    }

    const user = await db.user.findFirst({
        where: { username: { equals: username } },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return 'Kullanıcı adı veya şifre doğru değil. Tekrar dene.';
    }

    await createAuthSession(user.id);
    redirect('/');
}

export async function logout() {
    await destroyAuthSession();
    redirect('/giris');
}
