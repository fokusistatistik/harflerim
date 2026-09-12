import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'papatyaSession';
const PUBLIC_PATHS = ['/giris'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

    if (!hasSession && !PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.redirect(new URL('/giris', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sounds|icon-|apple-icon|manifest.json).*)'],
};
