/**
 * Sakin Balonlar (pilot v2) — prosedürel sanat.
 *
 * İndirilecek TEK BİR görsel dosya yok: tüm grafikler (gökyüzü, dağlar,
 * papatyalı çayır, bulutlar, balonlar, sticker rozetleri) cihazda, oyun
 * açılırken bir kez ekran-dışı canvas'lara çizilir ve sonra kare başına
 * yalnızca `drawImage` ile basılır. Sunucuya yük sıfır, ağ trafiği sıfır;
 * maliyet cihazın GPU/CPU'sunda tek seferlik birkaç milisaniyedir.
 */
import type { BalloonPalette, StickerDef } from './balloonLogic';

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

interface Surface {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}

function makeSurface(w: number, h: number, dpr: number): Surface {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(w * dpr));
    canvas.height = Math.max(1, Math.ceil(h * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas desteklenmiyor');
    ctx.scale(dpr, dpr);
    return { canvas, ctx };
}

/** Tekrarlanabilir (deterministik) sahte rastgelelik: her açılışta aynı manzara. */
function lcg(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

// ───────────────────────────── Balonlar ─────────────────────────────

export interface BalloonSprite {
    canvas: HTMLCanvasElement;
    /** Sprite'ın CSS piksel boyutu (canvas içi piksel = × dpr). */
    width: number;
    height: number;
    /** Gövde merkezinin sprite içindeki konumu. */
    cx: number;
    cy: number;
    bodyW: number;
    bodyH: number;
    /** İpin başladığı nokta (düğümün altı), sprite koordinatında. */
    knotY: number;
}

export function createBalloonSprite(
    palette: BalloonPalette,
    sticker: StickerDef,
    bodyW: number,
    dpr: number
): BalloonSprite {
    const bodyH = bodyW * 1.18;
    const pad = 4;
    const knotH = bodyW * 0.13;
    const width = bodyW + pad * 2;
    const height = bodyH + knotH + pad * 2;
    const { canvas, ctx } = makeSurface(width, height, dpr);
    const cx = width / 2;
    const cy = pad + bodyH / 2;

    // Gövde: üstte yuvarlak, altta hafif sivrilen gerçek balon silueti.
    ctx.beginPath();
    ctx.moveTo(cx, cy - bodyH / 2);
    ctx.bezierCurveTo(cx + bodyW * 0.62, cy - bodyH * 0.5, cx + bodyW * 0.58, cy + bodyH * 0.32, cx, cy + bodyH / 2);
    ctx.bezierCurveTo(cx - bodyW * 0.58, cy + bodyH * 0.32, cx - bodyW * 0.62, cy - bodyH * 0.5, cx, cy - bodyH / 2);
    ctx.closePath();

    // Hacim hissi (sahte 3B): ışık sol-üstten, kenarlar koyulaşır.
    const g = ctx.createRadialGradient(
        cx - bodyW * 0.18, cy - bodyH * 0.24, bodyW * 0.04,
        cx, cy, bodyH * 0.64
    );
    g.addColorStop(0, palette.light);
    g.addColorStop(0.32, palette.base);
    g.addColorStop(1, palette.dark);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();

    // Parlama (specular) vurguları.
    ctx.save();
    ctx.translate(cx - bodyW * 0.2, cy - bodyH * 0.26);
    ctx.rotate(-0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW * 0.085, bodyH * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx - bodyW * 0.06, cy - bodyH * 0.4, bodyW * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();

    // Düğüm.
    const bottom = cy + bodyH / 2;
    ctx.beginPath();
    ctx.moveTo(cx, bottom - 1);
    ctx.lineTo(cx - knotH * 0.6, bottom + knotH);
    ctx.lineTo(cx + knotH * 0.6, bottom + knotH);
    ctx.closePath();
    ctx.fillStyle = palette.dark;
    ctx.fill();

    // Sticker rozeti: balonun içinde, "içinden ne çıkacağı" baştan görünür —
    // sürpriz/korku yok, tamamen tahmin edilebilir.
    ctx.beginPath();
    ctx.arc(cx, cy + bodyH * 0.02, bodyW * 0.27, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    ctx.font = `${Math.round(bodyW * 0.34)}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(sticker.emoji, cx, cy + bodyH * 0.04);

    return { canvas, width, height, cx, cy, bodyW, bodyH, knotY: bottom + knotH };
}

/** Balondan çıkıp deftere uçan yuvarlak sticker rozeti. */
export function createStickerChip(emoji: string, size: number, dpr: number): HTMLCanvasElement {
    const pad = 6;
    const total = size + pad * 2;
    const { canvas, ctx } = makeSurface(total, total, dpr);
    const c = total / 2;
    ctx.shadowColor = 'rgba(80,60,140,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(c, c, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FBCFE8';
    ctx.stroke();
    ctx.font = `${Math.round(size * 0.58)}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(emoji, c, c + size * 0.03);
    return canvas;
}

// ───────────────────────────── Bulutlar ─────────────────────────────

export interface CloudSprite {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export function createCloudSprite(width: number, dpr: number, seed: number): CloudSprite {
    const rand = lcg(seed);
    const height = width * 0.46;
    const { canvas, ctx } = makeSurface(width, height, dpr);
    const baseY = height * 0.68;
    const puffs = 6 + Math.floor(rand() * 2);
    for (let i = 0; i < puffs; i++) {
        const t = i / (puffs - 1);
        const px = width * (0.14 + t * 0.72);
        const arch = Math.sin(t * Math.PI); // ortada daha yüksek, kenarda alçak
        const r = height * (0.2 + arch * 0.2 + rand() * 0.05);
        const py = baseY - arch * height * 0.2 - rand() * height * 0.05;
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.75)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
    }
    return { canvas, width, height };
}

// ───────────────────────────── Manzara ─────────────────────────────

function drawRidge(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    baseY: number,
    amp: number,
    f1: number,
    f2: number,
    phase: number,
    fill: string | CanvasGradient
): void {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) {
        const y = baseY - amp * (0.6 * Math.sin(x * f1 + phase) + 0.4 * Math.sin(x * f2 + phase * 1.7));
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

function drawDaisy(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.save();
    ctx.translate(x, y);
    // Sap
    ctx.strokeStyle = 'rgba(52,150,96,0.85)';
    ctx.lineWidth = Math.max(1.5, r * 0.18);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.6);
    ctx.lineTo(0, r * 2.6);
    ctx.stroke();
    // Taç yapraklar
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    for (let i = 0; i < 9; i++) {
        ctx.save();
        ctx.rotate((i / 9) * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.82, r * 0.26, r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    // Göbek
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.restore();
}

/** Sabit arka plan: pastel gün batımı, uzak dağlar, papatyalı çayır. Tek canvas, tek drawImage. */
export function createBackground(w: number, h: number, dpr: number): HTMLCanvasElement {
    const { canvas, ctx } = makeSurface(w, h, dpr);
    const rand = lcg(20261004);

    // Gökyüzü
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#8EA9F7');
    sky.addColorStop(0.45, '#C9B6F7');
    sky.addColorStop(0.75, '#FBCFE8');
    sky.addColorStop(1, '#FED7AA');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Çok sönük, sabit yıldızlar (titremez — duyusal olarak sakin).
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h * 0.32, 0.8 + rand() * 1.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Güneş parıltısı
    const sx = w * 0.74;
    const sy = h * 0.7;
    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.42);
    sun.addColorStop(0, 'rgba(255,243,196,0.95)');
    sun.addColorStop(0.18, 'rgba(255,224,170,0.6)');
    sun.addColorStop(1, 'rgba(255,214,170,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

    // Uzak dağlar (3 katman, derinlik için giderek koyulaşan)
    drawRidge(ctx, w, h, h * 0.72, h * 0.1, 0.006, 0.013, 1.1, 'rgba(176,150,240,0.55)');
    drawRidge(ctx, w, h, h * 0.8, h * 0.08, 0.009, 0.02, 2.6, 'rgba(142,118,214,0.62)');
    drawRidge(ctx, w, h, h * 0.87, h * 0.055, 0.012, 0.027, 4.2, 'rgba(110,98,190,0.7)');

    // Ön plan çayırı
    const meadow = ctx.createLinearGradient(0, h * 0.88, 0, h);
    meadow.addColorStop(0, '#7BD389');
    meadow.addColorStop(1, '#4FB06D');
    drawRidge(ctx, w, h, h * 0.935, h * 0.03, 0.01, 0.024, 0.4, meadow);

    // Papatyalar (markanın çiçeği)
    const daisies = Math.max(8, Math.round(w / 55));
    for (let i = 0; i < daisies; i++) {
        const x = ((i + 0.3 + rand() * 0.5) / daisies) * w;
        const y = h * (0.945 + rand() * 0.035);
        drawDaisy(ctx, x, y, 6 + rand() * 5);
    }

    return canvas;
}
