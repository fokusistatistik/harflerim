/**
 * Faz 1.18 — navigasyon iskeleti. Faz 1-3'te planlanacak her alan burada
 * en az bir yuva olarak tanımlıdır; henüz yazılmamış olanlar `status: 'soon'`
 * ile sakin/kilitli görünür ama tamamen görünmez değildir. Yeni bir alan
 * yazıldıkça yalnızca burada `status: 'active'` ve `href` eklenir — kart
 * bileşeninin kendisi (NavGrid) değişmez.
 */

export type NavAccent = 'petal' | 'leaf' | 'sky' | 'rose';
export type NavStatus = 'active' | 'soon' | 'parent-gate';

export interface NavArea {
    id: string;
    label: string;
    subtitle: string;
    href?: string;
    status: NavStatus;
    accent: NavAccent;
    /** Harf Avı'nın mevcut özel görseli gibi, ikon yerine bir görsel yolu. */
    imageSrc?: string;
}

export const NAV_AREAS: NavArea[] = [
    {
        id: 'letter-hunt',
        label: 'Harf Avı',
        subtitle: 'Günlük Görev',
        href: '/games/letter-hunt',
        status: 'active',
        accent: 'sky',
        // 2026-09-14 — eski static.fokusistatistik.com CDN'i ölüydü (tüm
        // harf görselleri 404 veriyordu, kullanıcı testinde bulundu).
        // Özgün ikon setinden (moduller/harf-sayi-ikon.md) yerel görsele
        // taşındı.
        imageSrc: '/ikonlar/nav_letter_hunt.png',
    },
    {
        id: 'magic-words',
        label: 'Sihirli Kelimeler',
        subtitle: 'Sesli Oyun',
        href: '/games/magic-words',
        status: 'active',
        accent: 'petal',
        imageSrc: '/ikonlar/ses_a.png',
    },
    {
        id: 'memory-match',
        label: 'Hafıza Kartları',
        subtitle: 'Eşleştirme',
        href: '/games/memory-match',
        status: 'active',
        accent: 'leaf',
        imageSrc: '/ikonlar/nav_memory_match.png',
    },
    {
        id: 'visual-match',
        label: 'Gölge Eşleştirme',
        subtitle: 'Sürükle Bırak',
        href: '/games/visual-match',
        status: 'active',
        accent: 'rose',
        imageSrc: '/ikonlar/nav_visual_match.png',
    },
    {
        id: 'music-corner',
        label: 'Müzik Köşesi',
        subtitle: 'Şarkılar',
        href: '/music-corner',
        status: 'active',
        accent: 'rose',
        imageSrc: '/ikonlar/nota.png',
    },
    {
        id: 'cartoon',
        label: 'Çizgi Filmim',
        subtitle: 'Videolar',
        href: '/cartoon',
        status: 'active',
        accent: 'sky',
        imageSrc: '/ikonlar/nav_cartoon.png',
    },
    {
        id: 'family-album',
        label: 'Aile Albümü',
        subtitle: 'Bu Kim?',
        href: '/games/family-album',
        status: 'active',
        accent: 'leaf',
        imageSrc: '/ikonlar/nav_family_album.png',
    },
    {
        id: 'drawing-board',
        label: 'Çizim Tahtası',
        subtitle: 'Serbest Çizim',
        href: '/drawing-board',
        status: 'active',
        accent: 'petal',
        imageSrc: '/ikonlar/nav_drawing_board.png',
    },
    {
        id: 'writing-practice',
        label: 'Yazı Alıştırması',
        subtitle: 'Harf Yazma',
        href: '/writing-practice',
        status: 'active',
        accent: 'rose',
        imageSrc: '/ikonlar/nav_writing_practice.png',
    },
    {
        id: 'aac-board',
        label: 'İletişim Tahtası',
        subtitle: 'Söyle Bana',
        href: '/aac-board',
        status: 'active',
        accent: 'sky',
        imageSrc: '/ikonlar/nav_aac_board.png',
    },
    {
        id: 'parent-area',
        label: 'Ebeveyn Alanı',
        subtitle: 'PIN gerekli',
        status: 'parent-gate',
        accent: 'leaf',
        imageSrc: '/ikonlar/nav_parent_area.png',
    },
];
