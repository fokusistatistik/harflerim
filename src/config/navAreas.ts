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
        imageSrc: 'https://static.fokusistatistik.com/melike/harfler/harf_m.png',
    },
    {
        id: 'magic-words',
        label: 'Sihirli Kelimeler',
        subtitle: 'Sesli Oyun',
        href: '/games/magic-words',
        status: 'active',
        accent: 'petal',
    },
    {
        id: 'memory-match',
        label: 'Hafıza Kartları',
        subtitle: 'Eşleştirme',
        href: '/games/memory-match',
        status: 'active',
        accent: 'leaf',
    },
    {
        id: 'visual-match',
        label: 'Gölge Eşleştirme',
        subtitle: 'Sürükle Bırak',
        href: '/games/visual-match',
        status: 'active',
        accent: 'rose',
    },
    {
        id: 'music-corner',
        label: 'Müzik Köşesi',
        subtitle: 'Şarkılar',
        href: '/music-corner',
        status: 'active',
        accent: 'rose',
    },
    { id: 'cartoon', label: 'Çizgi Filmim', subtitle: 'Videolar', href: '/cartoon', status: 'active', accent: 'sky' },
    {
        id: 'family-album',
        label: 'Aile Albümü',
        subtitle: 'Bu Kim?',
        href: '/games/family-album',
        status: 'active',
        accent: 'leaf',
    },
    {
        id: 'drawing-board',
        label: 'Çizim Tahtası',
        subtitle: 'Serbest Çizim',
        href: '/drawing-board',
        status: 'active',
        accent: 'petal',
    },
    {
        id: 'writing-practice',
        label: 'Yazı Alıştırması',
        subtitle: 'Harf Yazma',
        href: '/writing-practice',
        status: 'active',
        accent: 'rose',
    },
    { id: 'aac-board', label: 'İletişim Tahtası', subtitle: 'Yakında', status: 'soon', accent: 'sky' },
    { id: 'parent-area', label: 'Ebeveyn Alanı', subtitle: 'PIN gerekli', status: 'parent-gate', accent: 'leaf' },
];
