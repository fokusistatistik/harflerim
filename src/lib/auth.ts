import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const AUTH_COOKIE = 'papatyaSession';
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

export async function createAuthSession(userId: string) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    const session = await db.authSession.create({ data: { userId, expiresAt } });

    cookies().set(AUTH_COOKIE, session.id, {
        expires: expiresAt,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

export async function destroyAuthSession() {
    const token = cookies().get(AUTH_COOKIE)?.value;
    if (token) {
        await db.authSession.deleteMany({ where: { id: token } });
    }
    cookies().delete(AUTH_COOKIE);
}

export async function getCurrentUser() {
    const token = cookies().get(AUTH_COOKIE)?.value;
    if (!token) return null;

    const session = await db.authSession.findUnique({
        where: { id: token },
        include: { user: { include: { settings: true } } },
    });

    if (!session || session.expiresAt < new Date()) return null;

    return session.user;
}
