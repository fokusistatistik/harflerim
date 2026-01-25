import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for deviceId cookie
    let deviceId = request.cookies.get('deviceId')?.value;
    let response = NextResponse.next();

    if (!deviceId) {
        const newId = crypto.randomUUID();

        // 1. Update request cookies so Server Components see it immediately
        request.cookies.set('deviceId', newId);

        // Create new response with updated request
        response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        // 2. Set cookie on response so Browser stores it
        response.cookies.set('deviceId', newId, {
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sounds).*)',
    ],
};
