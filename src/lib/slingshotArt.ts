/**
 * Renkli Sapan — Prosedürel Sanat ve Ekran-Dışı Sprite Üretimi.
 *
 * Sıfır harici görsel bağımlılığı: Güneşli meyve bahçesi manzarası,
 * ahşap sapan çatalları, hasır piknik sepeti ve parlak sulu meyveler
 * cihazda ekran-dışı canvas'larda önbelleklenir. Kare döngüsünde (60fps)
 * yalnızca ultra-hızlı `drawImage` kullanılır.
 */

import { SLINGSHOT_FRUITS, type FruitDef } from './slingshotLogic';
import { ORCHARD_FRUITS, type OrchardFruitDef } from './slingshotCollection';

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

interface Surface {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}

export function makeSurface(w: number, h: number, dpr: number): Surface {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(w * dpr));
    canvas.height = Math.max(1, Math.ceil(h * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas desteklenmiyor');
    ctx.scale(dpr, dpr);
    return { canvas, ctx };
}

// ─────────────────────────────────────────────────────────────
// 1. Meyve Bahçesi Arka Planı (Güneşli Gökyüzü, Tepeler, Çimenler)
// ─────────────────────────────────────────────────────────────

export interface OrchardBackground {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export function createOrchardBackground(width: number, height: number, dpr: number): OrchardBackground {
    const { canvas, ctx } = makeSurface(width, height, dpr);

    // Gökyüzü: Parlak gün ışığı
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGrad.addColorStop(0, '#7DD3FC');
    skyGrad.addColorStop(0.5, '#BAE6FD');
    skyGrad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Güneş parıltısı
    const sunGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, 80);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    sunGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.4)');
    sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 80, 0, Math.PI * 2);
    ctx.fill();

    // Uzak yeşil tepeler
    ctx.fillStyle = '#86EFAC';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.quadraticCurveTo(width * 0.35, height * 0.48, width * 0.7, height * 0.58);
    ctx.quadraticCurveTo(width * 0.88, height * 0.62, width, height * 0.55);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Ön bahçe çayırı (Daha canlı yeşil)
    const grassGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
    grassGrad.addColorStop(0, '#4ADE80');
    grassGrad.addColorStop(0.4, '#22C55E');
    grassGrad.addColorStop(1, '#15803D');
    ctx.fillStyle = grassGrad;

    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.quadraticCurveTo(width * 0.45, height * 0.64, width, height * 0.68);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Çayır çiçekleri (papatyalar)
    for (let x = 20; x < width; x += 45) {
        const fy = height * 0.78 + Math.sin(x * 0.05) * 20;
        ctx.beginPath();
        ctx.arc(x, fy, 5, 0, Math.PI * 2);
        ctx.fillStyle = x % 90 === 0 ? '#FDA4AF' : '#FFFFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, fy, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FACC15';
        ctx.fill();
    }

    return { canvas, width, height };
}

// ─────────────────────────────────────────────────────────────
// 2. Hasır Piknik Sepeti (Hedef) Sprite
// ─────────────────────────────────────────────────────────────

export interface BasketSprite {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export function createBasketSprite(dpr: number): BasketSprite {
    const width = 110;
    const height = 90;
    const { canvas, ctx } = makeSurface(width, height, dpr);
    const cx = width / 2;
    const cy = height / 2 + 8;

    // Zemin gölgesi
    ctx.beginPath();
    ctx.ellipse(cx, cy + 28, 44, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(21, 128, 61, 0.35)';
    ctx.fill();

    // Sepet Sapı (Kavisli ahşap/hasır)
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 34, Math.PI, 0, false);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#92400E';
    ctx.stroke();

    // Sepet Gövdesi (Trapez hasır sepet)
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy - 6);
    ctx.lineTo(cx + 42, cy - 6);
    ctx.lineTo(cx + 32, cy + 28);
    ctx.lineTo(cx - 32, cy + 28);
    ctx.closePath();

    const basketGrad = ctx.createLinearGradient(0, cy - 6, 0, cy + 28);
    basketGrad.addColorStop(0, '#FBBF24');
    basketGrad.addColorStop(0.5, '#D97706');
    basketGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = basketGrad;
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hasır örgü dokusu (Çapraz çizgiler)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let x = -35; x <= 35; x += 12) {
        ctx.beginPath();
        ctx.moveTo(cx + x - 8, cy - 4);
        ctx.lineTo(cx + x + 8, cy + 26);
        ctx.stroke();
    }

    // Kırmızı-Beyaz Pötikare Örtü (Sepetin ağzından sarkan sevimli örtü)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 6, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beyaz pötikare noktalar
    ctx.fillStyle = '#FFFFFF';
    for (let x = -28; x <= 28; x += 10) {
        ctx.fillRect(cx + x, cy - 10, 4, 8);
    }

    return { canvas, width, height };
}

// ─────────────────────────────────────────────────────────────
// 3. Ahşap Sapan Çatalı Sprite
// ─────────────────────────────────────────────────────────────

export interface SlingshotForkSprite {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    prongLeft: { x: number; y: number };
    prongRight: { x: number; y: number };
}

export function createSlingshotForkSprite(dpr: number): SlingshotForkSprite {
    const width = 80;
    const height = 120;
    const { canvas, ctx } = makeSurface(width, height, dpr);
    const cx = width / 2;

    // Ahşap Gövde & Sap
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Sol Çatal
    ctx.beginPath();
    ctx.moveTo(cx, height - 10);
    ctx.lineTo(cx, height * 0.45);
    ctx.lineTo(cx - 24, 18);
    ctx.strokeStyle = '#78350F';
    ctx.stroke();

    // Sağ Çatal
    ctx.beginPath();
    ctx.moveTo(cx, height * 0.45);
    ctx.lineTo(cx + 24, 18);
    ctx.stroke();

    // Ahşap damarı açık renk vurgusu
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#B45309';
    ctx.beginPath();
    ctx.moveTo(cx - 1, height - 14);
    ctx.lineTo(cx - 1, height * 0.44);
    ctx.stroke();

    // Çatal uçlarında deri bağlantı bantları
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.arc(cx - 24, 18, 6, 0, Math.PI * 2);
    ctx.arc(cx + 24, 18, 6, 0, Math.PI * 2);
    ctx.fill();

    return {
        canvas,
        width,
        height,
        prongLeft: { x: cx - 24, y: 18 },
        prongRight: { x: cx + 24, y: 18 },
    };
}

// ─────────────────────────────────────────────────────────────
// 4. Meyve Sprite'ları (Vektörel Parlak Meyveler)
// ─────────────────────────────────────────────────────────────

export interface FruitSprite {
    canvas: HTMLCanvasElement;
    size: number;
    radius: number;
    def: FruitDef;
}

export function createFruitSprite(def: FruitDef, dpr: number): FruitSprite {
    const r = def.radius;
    const size = r * 2 + 20;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    // Meyve altı gölgesi
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.7, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    switch (def.id) {
        case 'elma': {
            // Kırmızı Elma
            ctx.beginPath();
            ctx.arc(cx, cy + 2, r * 0.85, 0, Math.PI * 2);
            const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 3, cx, cy, r * 0.85);
            g.addColorStop(0, '#FCA5A5');
            g.addColorStop(0.4, '#EF4444');
            g.addColorStop(1, '#B91C1C');
            ctx.fillStyle = g;
            ctx.fill();

            // Sap
            ctx.beginPath();
            ctx.moveTo(cx, cy - r * 0.8);
            ctx.quadraticCurveTo(cx + 4, cy - r * 1.15, cx + 8, cy - r * 1.25);
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Yeşil Yaprak
            ctx.beginPath();
            ctx.ellipse(cx + 8, cy - r * 0.95, 8, 4, -0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#22C55E';
            ctx.fill();
            break;
        }

        case 'portakal': {
            // Portakal
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
            const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 3, cx, cy, r * 0.85);
            g.addColorStop(0, '#FED7AA');
            g.addColorStop(0.4, '#F97316');
            g.addColorStop(1, '#C2410C');
            ctx.fillStyle = g;
            ctx.fill();

            // Küçük yaprak
            ctx.beginPath();
            ctx.ellipse(cx + 4, cy - r * 0.85, 6, 3, -0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#16A34A';
            ctx.fill();
            break;
        }

        default: {
            // Emoji Fallback
            ctx.font = `${Math.floor(r * 1.3)}px ${EMOJI_FONT}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(def.emoji, cx, cy);
            break;
        }
    }

    return { canvas, size, radius: r, def };
}

// ─────────────────────────────────────────────────────────────
// 5. Meyve Bahçesi Rozet Kartı (Defter & Uçan Rozet Sprite'ı)
// ─────────────────────────────────────────────────────────────

export function createOrchardBadge(fruit: OrchardFruitDef, dpr: number): HTMLCanvasElement {
    const size = 64;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 30);
    glow.addColorStop(0, 'rgba(251, 146, 60, 0.9)');
    glow.addColorStop(1, 'rgba(234, 88, 12, 0.4)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 27, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F97316';
    ctx.stroke();

    ctx.font = `30px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fruit.emoji, cx, cy + 2);

    return canvas;
}
