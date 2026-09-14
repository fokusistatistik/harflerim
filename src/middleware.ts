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
    // 2026-09-14 — kullanıcı bulgusu: giriş sayfasındaki logo kırık
    // görünüyordu. Kök neden: bu matcher yalnızca birkaç statik yolu
    // (sounds, icon-, apple-icon, manifest.json) hariç tutuyordu — ama
    // public/'teki asıl görsel klasörleri (papatya-*-logo.png, ikonlar/,
    // harfler/, sayilar/, karsilastirma/) listede yoktu. Oturum yokken bu
    // dosyalara yapılan istek bile /giris'e redirect ediliyordu — giriş
    // sayfasının KENDİ logosu dahil. Tüm bilinen statik asset yolları eklendi.
    //
    // 2026-09-14 (2. bulgu) — "SW bir türlü sıfırlanmıyor" bildirimi: sw.js
    // ve workbox-*.js de bu listede YOKTU. Tarayıcı bir SW güncellemesi
    // denediğinde middleware /sw.js isteğini de /giris'e redirect ediyordu
    // — tarayıcı bunu geçersiz bir service worker script'i olarak
    // reddediyor, güncelleme sessizce başarısız oluyordu. Bu, kayıtlı bir
    // SW'nin KENDİNİ ASLA GÜNCELLEYEMEMESİNİN kesin nedeniydi (her update
    // denemesi HTML alıp iptal ediliyordu). Eklendi.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sounds|icon-|apple-icon|manifest.json|sw\\.js|workbox-.*\\.js|swe-worker-.*\\.js|papatya-.*\\.png|ikonlar|harfler|sayilar|karsilastirma).*)',
    ],
};
