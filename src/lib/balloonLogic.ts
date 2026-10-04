/**
 * Sakin Balonlar (pilot v2) — saf oyun mantığı.
 *
 * Bilerek React/DOM/canvas'tan bağımsız: hem birim test edilebilir hem de
 * motor (`balloonEngine.ts`) ile arayüz (`BubblePopGame.tsx`) arasındaki
 * tek ortak sözleşme. Burada hiçbir sunucu çağrısı veya depolama yoktur.
 */

export type BalloonColorName = 'Kırmızı' | 'Mavi' | 'Sarı' | 'Yeşil' | 'Mor';

export interface BalloonPalette {
    /** TTS kayıtlarıyla birebir aynı ad (ör. "Sarı balonu bulabilecek misin?"). */
    name: BalloonColorName;
    base: string;
    light: string;
    dark: string;
}

export const BALLOON_PALETTES: readonly BalloonPalette[] = [
    { name: 'Kırmızı', base: '#F87171', light: '#FECACA', dark: '#DC2626' },
    { name: 'Mavi', base: '#60A5FA', light: '#DBEAFE', dark: '#2563EB' },
    { name: 'Sarı', base: '#FBBF24', light: '#FEF3C7', dark: '#D97706' },
    { name: 'Yeşil', base: '#34D399', light: '#D1FAE5', dark: '#059669' },
    { name: 'Mor', base: '#C084FC', light: '#F3E8FF', dark: '#9333EA' },
];

export interface StickerDef {
    id: string;
    emoji: string;
    label: string;
    /** Sticker'ın içinde çıktığı balonun rengi — hedef (renk) modu bunu kullanır. */
    color: BalloonColorName;
}

/**
 * Sabit, sıralı koleksiyon: her renkten 2 sticker, toplam 10. Küçük ve
 * sonlu olması bilinçli — çocuk "bitirebildiğini" görür, sonsuz bir
 * toplama baskısı yoktur.
 */
export const STICKERS: readonly StickerDef[] = [
    { id: 'elma', emoji: '🍎', label: 'Elma', color: 'Kırmızı' },
    { id: 'ugurbocegi', emoji: '🐞', label: 'Uğur böceği', color: 'Kırmızı' },
    { id: 'yunus', emoji: '🐬', label: 'Yunus', color: 'Mavi' },
    { id: 'balina', emoji: '🐳', label: 'Balina', color: 'Mavi' },
    { id: 'yildiz', emoji: '⭐', label: 'Yıldız', color: 'Sarı' },
    { id: 'civciv', emoji: '🐥', label: 'Civciv', color: 'Sarı' },
    { id: 'kurbaga', emoji: '🐸', label: 'Kurbağa', color: 'Yeşil' },
    { id: 'kaplumbaga', emoji: '🐢', label: 'Kaplumbağa', color: 'Yeşil' },
    { id: 'uzum', emoji: '🍇', label: 'Üzüm', color: 'Mor' },
    { id: 'kelebek', emoji: '🦋', label: 'Kelebek', color: 'Mor' },
];

export function getPalette(color: BalloonColorName): BalloonPalette {
    return BALLOON_PALETTES.find((p) => p.name === color) ?? BALLOON_PALETTES[0];
}

export interface SpawnPickOptions {
    /** Renk hedefi modunda aranan renk; serbest modda null. */
    targetColor: BalloonColorName | null;
    /** Şu an ekrandaki balonların renkleri. */
    onScreenColors: readonly BalloonColorName[];
    /** Koleksiyonda zaten bulunan sticker id'leri. */
    collected: readonly string[];
    /** Test için enjekte edilebilir rastgelelik (0..1). */
    rand?: () => number;
}

/** Yeni çıkacak balonun sticker'ını seçer. */
export function pickSpawnSticker(opts: SpawnPickOptions): StickerDef {
    const rand = opts.rand ?? Math.random;

    // Hedef renk ekranda yoksa, çocuğu asla "bulunamayan" bir hedefle bırakmayız.
    let pool: readonly StickerDef[] = STICKERS;
    if (opts.targetColor && !opts.onScreenColors.includes(opts.targetColor)) {
        pool = STICKERS.filter((s) => s.color === opts.targetColor);
    }

    // Henüz koleksiyonda olmayanlar öncelikli (çoğunlukla, her zaman değil):
    // ilerleme hissi verir ama sonuç tamamen tahmin edilebilir kalmaz.
    const missing = pool.filter((s) => !opts.collected.includes(s.id));
    const source = missing.length > 0 && rand() < 0.65 ? missing : pool;
    return source[Math.min(source.length - 1, Math.floor(rand() * source.length))];
}

export interface HitShape {
    x: number;
    y: number;
    /** Yatay yarıçap (px). */
    rx: number;
    /** Dikey yarıçap (px). */
    ry: number;
}

/** Parmak için en az bu yarıçap (≈ 48px dokunma hedefi) garanti edilir. */
export const MIN_HIT_RADIUS = 24;

/**
 * Dokunulan en üstteki (dizide en sonda çizilen) balonun indeksini döner;
 * yoksa -1. Elips testi + cömert bir pay: küçük parmaklar ıskalamasın.
 */
export function hitTestBalloons(
    shapes: readonly HitShape[],
    px: number,
    py: number,
    padding = 14
): number {
    for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        const rx = Math.max(s.rx, MIN_HIT_RADIUS) + padding;
        const ry = Math.max(s.ry, MIN_HIT_RADIUS) + padding;
        const dx = (px - s.x) / rx;
        const dy = (py - s.y) / ry;
        if (dx * dx + dy * dy <= 1) return i;
    }
    return -1;
}
