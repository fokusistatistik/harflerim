/**
 * Neşeli Havuz — Prosedürel Sanat ve Ekran-Dışı Sprite Üretimi.
 *
 * Sıfır harici görsel bağımlılığı: Havuz suyu dokusu, ışık kırılmaları (caustics),
 * nilüfer çiçeği, su dalgaları ve yüzen sevimli oyuncaklar (ördek, yunus, yelkenli, top, kaplumbağa)
 * tamamen cihazda ekran-dışı (offscreen) canvas'larda önceden çizilir.
 * Kare döngüsünde (60fps) yalnızca ultra-hızlı `drawImage` kullanılır.
 */

import { TOY_DEFINITIONS, type FloatingToyDef } from './waterLogic';
import { WATER_TREASURES, type WaterTreasureDef } from './waterCollection';

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
// 1. Havuz Arka Planı (Turkuaz Su, Işık Refraksiyonları ve Kenarlar)
// ─────────────────────────────────────────────────────────────

export interface PoolBackground {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export function createPoolBackground(width: number, height: number, dpr: number): PoolBackground {
    const { canvas, ctx } = makeSurface(width, height, dpr);

    // Ana su gradyanı: Yukarıdan aşağıya yumuşak turkuaz - derin akuamarin geçişi
    const waterGrad = ctx.createLinearGradient(0, 0, width * 0.3, height);
    waterGrad.addColorStop(0, '#38BDF8');   // Gökyüzü mavisi ışıltısı
    waterGrad.addColorStop(0.35, '#0EA5E9'); // Berrak deniz
    waterGrad.addColorStop(0.75, '#0284C7'); // Derin su
    waterGrad.addColorStop(1, '#0369A1');   // Havuz tabanı gölgesi
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, width, height);

    // Güneş ışığı kırılmaları (Caustic ızgarası)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Organik dalga ağı
    const step = 80;
    for (let x = -40; x < width + 60; x += step) {
        ctx.beginPath();
        for (let y = -40; y < height + 60; y += 40) {
            const offsetX = Math.sin((x + y) * 0.02) * 18 + Math.cos(y * 0.03) * 12;
            const offsetY = Math.cos(x * 0.025) * 14;
            if (y === -40) {
                ctx.moveTo(x + offsetX, y + offsetY);
            } else {
                ctx.lineTo(x + offsetX, y + offsetY);
            }
        }
        ctx.stroke();
    }

    // İkinci çapraz ışık ağı
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 10;
    for (let y = -40; y < height + 60; y += step) {
        ctx.beginPath();
        for (let x = -40; x < width + 60; x += 40) {
            const offsetX = Math.cos((x - y) * 0.02) * 16;
            const offsetY = Math.sin(x * 0.03) * 12;
            if (x === -40) {
                ctx.moveTo(x + offsetX, y + offsetY);
            } else {
                ctx.lineTo(x + offsetX, y + offsetY);
            }
        }
        ctx.stroke();
    }
    ctx.restore();

    // Havuz kenar yumuşak çerçeve gölgesi (Vignette)
    const vignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.4,
        width / 2, height / 2, Math.max(width, height) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(3, 40, 70, 0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    return { canvas, width, height };
}

// ─────────────────────────────────────────────────────────────
// 2. Nilüfer Çiçeği / Hedef Şamandırası Sprite
// ─────────────────────────────────────────────────────────────

export interface LilyPadSprite {
    canvas: HTMLCanvasElement;
    size: number;
}

export function createLilyPadSprite(radius: number, dpr: number): LilyPadSprite {
    const size = radius * 2 + 16;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    // 1. Su altı yaprak gölgesi
    ctx.beginPath();
    ctx.arc(cx, cy + 4, radius * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(2, 60, 90, 0.35)';
    ctx.fill();

    // 2. Büyük yeşil nilüfer yaprağı (küçük çentikli doğal form)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0.18 * Math.PI, 1.95 * Math.PI, false);
    ctx.lineTo(cx, cy);
    ctx.closePath();

    const leafGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 5, cx, cy, radius);
    leafGrad.addColorStop(0, '#4ADE80');
    leafGrad.addColorStop(0.7, '#22C55E');
    leafGrad.addColorStop(1, '#15803D');
    ctx.fillStyle = leafGrad;
    ctx.fill();

    // Yaprak damarları
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let a = 0.4; a < 1.8; a += 0.3) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a * Math.PI) * radius * 0.85, cy + Math.sin(a * Math.PI) * radius * 0.85);
        ctx.stroke();
    }

    // 3. Ortada pembe nilüfer çiçeği (Lotus)
    const flowerRadius = radius * 0.45;
    const petalCount = 8;
    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < petalCount; i++) {
        ctx.rotate((Math.PI * 2) / petalCount);
        ctx.beginPath();
        ctx.ellipse(0, -flowerRadius * 0.6, flowerRadius * 0.35, flowerRadius * 0.6, 0, 0, Math.PI * 2);
        const petalGrad = ctx.createLinearGradient(0, 0, 0, -flowerRadius);
        petalGrad.addColorStop(0, '#FDA4AF');
        petalGrad.addColorStop(1, '#FB7185');
        ctx.fillStyle = petalGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Çiçek göbeği (altın sarısı polenler)
    ctx.beginPath();
    ctx.arc(0, 0, flowerRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, flowerRadius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#EAB308';
    ctx.fill();

    ctx.restore();

    return { canvas, size };
}

// ─────────────────────────────────────────────────────────────
// 3. Yüzen Oyuncak Sprite'ları (Vektörel & Zengin Detaylı)
// ─────────────────────────────────────────────────────────────

export interface ToySprite {
    canvas: HTMLCanvasElement;
    size: number;
    cx: number;
    cy: number;
    def: FloatingToyDef;
}

export function createToySprite(def: FloatingToyDef, dpr: number): ToySprite {
    const r = def.radius;
    const size = r * 2 + 32;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    // Su altı gölgesi (oval)
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.55, r * 0.85, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(2, 45, 75, 0.38)';
    ctx.fill();

    // Su halkası (ıslaklık hissi)
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.5, r * 0.92, r * 0.42, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Oyuncak tipine göre özel vektörel çizim
    switch (def.id) {
        case 'duck': {
            // Sarı Ördek
            // Gövde
            ctx.beginPath();
            ctx.ellipse(cx, cy + r * 0.15, r * 0.75, r * 0.55, 0, 0, Math.PI * 2);
            const bodyGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.1, 5, cx, cy + r * 0.1, r * 0.8);
            bodyGrad.addColorStop(0, '#FEF08A');
            bodyGrad.addColorStop(0.5, '#FACC15');
            bodyGrad.addColorStop(1, '#CA8A04');
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // Kafa
            ctx.beginPath();
            ctx.arc(cx + r * 0.32, cy - r * 0.25, r * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // Gaga (Turuncu)
            ctx.beginPath();
            ctx.moveTo(cx + r * 0.65, cy - r * 0.28);
            ctx.quadraticCurveTo(cx + r * 1.05, cy - r * 0.22, cx + r * 0.72, cy - r * 0.12);
            ctx.closePath();
            ctx.fillStyle = '#F97316';
            ctx.fill();

            // Göz
            ctx.beginPath();
            ctx.arc(cx + r * 0.45, cy - r * 0.32, r * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = '#0F172A';
            ctx.fill();
            // Göz parıltısı
            ctx.beginPath();
            ctx.arc(cx + r * 0.47, cy - r * 0.34, r * 0.03, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Kanat detayı
            ctx.beginPath();
            ctx.ellipse(cx - r * 0.15, cy + r * 0.12, r * 0.4, r * 0.26, -0.2, 0, Math.PI * 2);
            ctx.strokeStyle = '#EAB308';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            break;
        }

        case 'dolphin': {
            // Sevimli Mavi Yunus
            ctx.beginPath();
            ctx.ellipse(cx, cy + r * 0.1, r * 0.8, r * 0.5, 0.1, 0, Math.PI * 2);
            const dolGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 4, cx, cy, r * 0.8);
            dolGrad.addColorStop(0, '#BAE6FD');
            dolGrad.addColorStop(0.4, '#38BDF8');
            dolGrad.addColorStop(1, '#0284C7');
            ctx.fillStyle = dolGrad;
            ctx.fill();

            // Sırt yüzgeci
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.15, cy - r * 0.35);
            ctx.quadraticCurveTo(cx - r * 0.05, cy - r * 0.75, cx + r * 0.2, cy - r * 0.25);
            ctx.closePath();
            ctx.fillStyle = '#0284C7';
            ctx.fill();

            // Kuyruk
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.7, cy + r * 0.15);
            ctx.lineTo(cx - r * 1.05, cy - r * 0.1);
            ctx.lineTo(cx - r * 0.9, cy + r * 0.2);
            ctx.lineTo(cx - r * 1.05, cy + r * 0.45);
            ctx.closePath();
            ctx.fillStyle = '#0284C7';
            ctx.fill();

            // Gülen göz
            ctx.beginPath();
            ctx.arc(cx + r * 0.5, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = '#0F172A';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + r * 0.52, cy - r * 0.07, r * 0.03, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Beyaz karın bölgesi
            ctx.beginPath();
            ctx.ellipse(cx + r * 0.1, cy + r * 0.32, r * 0.5, r * 0.22, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fill();
            break;
        }

        case 'boat': {
            // Küçük Ahşap Yelkenli
            // Tekne gövdesi
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.75, cy + r * 0.15);
            ctx.lineTo(cx + r * 0.85, cy + r * 0.15);
            ctx.lineTo(cx + r * 0.55, cy + r * 0.55);
            ctx.lineTo(cx - r * 0.55, cy + r * 0.55);
            ctx.closePath();
            const hullGrad = ctx.createLinearGradient(0, cy + r * 0.15, 0, cy + r * 0.55);
            hullGrad.addColorStop(0, '#F87171');
            hullGrad.addColorStop(1, '#DC2626');
            ctx.fillStyle = hullGrad;
            ctx.fill();
            ctx.strokeStyle = '#991B1B';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Direk
            ctx.beginPath();
            ctx.moveTo(cx, cy + r * 0.15);
            ctx.lineTo(cx, cy - r * 0.8);
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // Ana Yelken (Beyaz / Sarımtırak)
            ctx.beginPath();
            ctx.moveTo(cx + 2, cy - r * 0.75);
            ctx.lineTo(cx + r * 0.65, cy + r * 0.05);
            ctx.lineTo(cx + 2, cy + r * 0.05);
            ctx.closePath();
            const sailGrad = ctx.createLinearGradient(cx, cy - r * 0.75, cx + r * 0.65, cy);
            sailGrad.addColorStop(0, '#FEF9C3');
            sailGrad.addColorStop(1, '#FDE047');
            ctx.fillStyle = sailGrad;
            ctx.fill();

            // Küçük Ön Yelken (Açık Mavi)
            ctx.beginPath();
            ctx.moveTo(cx - 3, cy - r * 0.65);
            ctx.lineTo(cx - r * 0.55, cy + r * 0.05);
            ctx.lineTo(cx - 3, cy + r * 0.05);
            ctx.closePath();
            ctx.fillStyle = '#BAE6FD';
            ctx.fill();

            // Direk tepesinde bayrak
            ctx.beginPath();
            ctx.moveTo(cx, cy - r * 0.8);
            ctx.lineTo(cx + r * 0.3, cy - r * 0.7);
            ctx.lineTo(cx, cy - r * 0.6);
            ctx.closePath();
            ctx.fillStyle = '#EF4444';
            ctx.fill();
            break;
        }

        case 'ball': {
            // Renkli Deniz Topu (Şişme Top)
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = '#C084FC';
            ctx.fill();

            // Renkli dilimler
            const colors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#C084FC'];
            const sliceAngle = (Math.PI * 2) / colors.length;
            for (let i = 0; i < colors.length; i++) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r * 0.8, i * sliceAngle, (i + 1) * sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[i];
                ctx.fill();
            }

            // Top tepesi ve altı beyaz dairesel kapak
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Küresel 3D parlama efekti
            const sphereGlow = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r * 0.82);
            sphereGlow.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
            sphereGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
            sphereGlow.addColorStop(0.9, 'rgba(0, 0, 0, 0.25)');
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = sphereGlow;
            ctx.fill();
            break;
        }

        case 'turtle': {
            // Deniz Kaplumbağası
            // Kabuk
            ctx.beginPath();
            ctx.ellipse(cx, cy, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
            const shellGrad = ctx.createRadialGradient(cx, cy - r * 0.1, 4, cx, cy, r * 0.65);
            shellGrad.addColorStop(0, '#86EFAC');
            shellGrad.addColorStop(0.5, '#22C55E');
            shellGrad.addColorStop(1, '#15803D');
            ctx.fillStyle = shellGrad;
            ctx.fill();
            ctx.strokeStyle = '#14532D';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Kabuk desenleri
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
            ctx.stroke();

            // Kafa
            ctx.beginPath();
            ctx.ellipse(cx, cy - r * 0.68, r * 0.24, r * 0.28, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#4ADE80';
            ctx.fill();

            // Gözler
            ctx.beginPath();
            ctx.arc(cx - r * 0.12, cy - r * 0.75, r * 0.05, 0, Math.PI * 2);
            ctx.arc(cx + r * 0.12, cy - r * 0.75, r * 0.05, 0, Math.PI * 2);
            ctx.fillStyle = '#0F172A';
            ctx.fill();

            // Ön yüzgeçler
            ctx.beginPath();
            ctx.ellipse(cx - r * 0.65, cy - r * 0.25, r * 0.35, r * 0.16, -0.6, 0, Math.PI * 2);
            ctx.ellipse(cx + r * 0.65, cy - r * 0.25, r * 0.35, r * 0.16, 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#22C55E';
            ctx.fill();

            // Arka yüzgeçler
            ctx.beginPath();
            ctx.ellipse(cx - r * 0.45, cy + r * 0.45, r * 0.22, r * 0.14, 0.4, 0, Math.PI * 2);
            ctx.ellipse(cx + r * 0.45, cy + r * 0.45, r * 0.22, r * 0.14, -0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#22C55E';
            ctx.fill();
            break;
        }

        default: {
            // Genel simge fallback
            ctx.font = `${Math.floor(r * 1.2)}px ${EMOJI_FONT}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(def.emoji, cx, cy);
            break;
        }
    }

    return { canvas, size, cx, cy, def };
}

// ─────────────────────────────────────────────────────────────
// 4. Koleksiyon Rozet Kartı (Defter & Uçan Hazine Sprite'ı)
// ─────────────────────────────────────────────────────────────

export function createTreasureBadge(treasure: WaterTreasureDef, dpr: number): HTMLCanvasElement {
    const size = 64;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    // Dairesel parıltı
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 30);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    glow.addColorStop(1, 'rgba(14, 165, 233, 0.4)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    // Beyaz altın çerçeve
    ctx.beginPath();
    ctx.arc(cx, cy, 27, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38BDF8';
    ctx.stroke();

    // Emoji
    ctx.font = `30px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(treasure.emoji, cx, cy + 2);

    return canvas;
}
