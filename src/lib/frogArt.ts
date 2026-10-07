/**
 * Zıp Zıp Kurbağa — Prosedürel Sanat ve Ekran-Dışı Sprite Üretimi.
 *
 * Sıfır harici görsel bağımlılığı: Gölet manzarası, nilüfer yaprakları,
 * sevimli kurbağa karakteri ve göl dostları rozetleri cihazda ekran-dışı canvas'larda
 * önbelleklenir. Kare döngüsünde (60fps) yalnızca ultra-hızlı `drawImage` kullanılır.
 */

import { POND_FRIENDS, type PondFriendDef } from './frogCollection';

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
// 1. Gölet Arka Planı (Karşı Kıyı, Nehir Suyu, Sazlıklar ve Başlangıç İskelesi)
// ─────────────────────────────────────────────────────────────

export interface PondBackground {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export function createPondBackground(width: number, height: number, dpr: number): PondBackground {
    const { canvas, ctx } = makeSurface(width, height, dpr);

    // 1. Gölet Suyu (Turkuaz-Yeşil Doğal Göl Gradyanı)
    const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
    waterGrad.addColorStop(0, '#6EE7B7');   // Karşı kıyıda ışıltılı su
    waterGrad.addColorStop(0.35, '#2DD4BF'); // Berrak nilüfer göleti
    waterGrad.addColorStop(0.7, '#0D9488');  // Derin su akıntısı
    waterGrad.addColorStop(1, '#115E59');   // Kıyı gölgesi
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, width, height);

    // Su akıntısı dalgacıkları
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let y = height * 0.15; y < height * 0.75; y += 42) {
        ctx.beginPath();
        for (let x = -20; x < width + 40; x += 30) {
            const waveY = y + Math.sin((x + y) * 0.03) * 6;
            if (x === -20) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }

    // 2. Karşı Kıyı (Üst Kısım - Çimenler, Papatyalar ve Çiçekler)
    const bankHeight = height * 0.16;
    const bankGrad = ctx.createLinearGradient(0, 0, 0, bankHeight);
    bankGrad.addColorStop(0, '#15803D');
    bankGrad.addColorStop(1, '#16A34A');
    ctx.fillStyle = bankGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, bankHeight);
    // Doğal kıvrımlı kıyı hattı
    for (let x = width; x >= 0; x -= 40) {
        ctx.lineTo(x, bankHeight + Math.sin(x * 0.04) * 8);
    }
    ctx.closePath();
    ctx.fill();

    // Kıyı kenarında sazlıklar ve papatyalar
    for (let x = 30; x < width; x += 65) {
        // Çiçek gövdesi
        ctx.beginPath();
        ctx.arc(x, bankHeight - 12 + Math.sin(x) * 6, 8, 0, Math.PI * 2);
        ctx.fillStyle = x % 130 === 0 ? '#FDA4AF' : '#FEF08A';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, bankHeight - 12 + Math.sin(x) * 6, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#EA580C';
        ctx.fill();
    }

    // 3. Alt Kıyı (Kurbağanın Zıplama İskelesi / Yosunlu Kütük)
    const dockY = height * 0.78;
    const dockHeight = height - dockY;
    const dockGrad = ctx.createLinearGradient(0, dockY, 0, height);
    dockGrad.addColorStop(0, '#78350F');
    dockGrad.addColorStop(0.3, '#92400E');
    dockGrad.addColorStop(1, '#451A03');
    ctx.fillStyle = dockGrad;

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, dockY + 12);
    // Kütük kıvrımı
    for (let x = 0; x <= width; x += 30) {
        ctx.lineTo(x, dockY + Math.sin(x * 0.035) * 6);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Ahşap çıta çizgileri
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2.5;
    for (let x = 40; x < width; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, dockY);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Kütük üstü yumuşak yosun katmanı
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    for (let x = 0; x <= width; x += 25) {
        ctx.arc(x, dockY + 2, 7, 0, Math.PI);
    }
    ctx.fill();

    return { canvas, width, height };
}

// ─────────────────────────────────────────────────────────────
// 2. Nilüfer Yaprağı (Hedef) Sprite
// ─────────────────────────────────────────────────────────────

export interface LilyPadTargetSprite {
    canvas: HTMLCanvasElement;
    size: number;
    radius: number;
}

export function createLilyPadTargetSprite(radius: number, dpr: number): LilyPadTargetSprite {
    const size = radius * 2 + 30;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    // 1. Su altı gölgesi
    ctx.beginPath();
    ctx.arc(cx, cy + 6, radius * 0.96, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 78, 59, 0.38)';
    ctx.fill();

    // 2. Ana yaprak (Çentikli doğal nilüfer formu)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0.16 * Math.PI, 1.96 * Math.PI, false);
    ctx.lineTo(cx, cy);
    ctx.closePath();

    const leafGrad = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, 4, cx, cy, radius);
    leafGrad.addColorStop(0, '#4ADE80');
    leafGrad.addColorStop(0.65, '#22C55E');
    leafGrad.addColorStop(1, '#15803D');
    ctx.fillStyle = leafGrad;
    ctx.fill();

    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Yaprak damarları
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2;
    for (let a = 0.35; a < 1.85; a += 0.25) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a * Math.PI) * radius * 0.85, cy + Math.sin(a * Math.PI) * radius * 0.85);
        ctx.stroke();
    }

    // 3. Nilüfer Çiçeği (Lotus)
    const flowerR = radius * 0.42;
    const petals = 8;
    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < petals; i++) {
        ctx.rotate((Math.PI * 2) / petals);
        ctx.beginPath();
        ctx.ellipse(0, -flowerR * 0.55, flowerR * 0.32, flowerR * 0.55, 0, 0, Math.PI * 2);
        const pGrad = ctx.createLinearGradient(0, 0, 0, -flowerR);
        pGrad.addColorStop(0, '#FBCFE8');
        pGrad.addColorStop(1, '#EC4899');
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Çiçek göbeği
    ctx.beginPath();
    ctx.arc(0, 0, flowerR * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, flowerR * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#EAB308';
    ctx.fill();
    ctx.restore();

    return { canvas, size, radius };
}

// ─────────────────────────────────────────────────────────────
// 3. Neşeli Kurbağa Sprite (Pozlar: Bekleme, Zıplama, Başarı)
// ─────────────────────────────────────────────────────────────

export interface FrogSpriteSet {
    idle: HTMLCanvasElement;
    jump: HTMLCanvasElement;
    land: HTMLCanvasElement;
    size: number;
}

export function createFrogSpriteSet(baseSize: number, dpr: number): FrogSpriteSet {
    const size = baseSize + 28;

    // --- IDLE POZU (Sakin Oturan Kurbağa) ---
    const idleSurf = makeSurface(size, size, dpr);
    {
        const { ctx } = idleSurf;
        const cx = size / 2;
        const cy = size / 2 + 4;
        const r = baseSize * 0.42;

        // Su altı / kütük gölgesi
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.72, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fill();

        // Arka bacaklar (katlı)
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.75, cy + r * 0.4, r * 0.38, r * 0.26, -0.4, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.75, cy + r * 0.4, r * 0.38, r * 0.26, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Gövde
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.1, r * 0.8, r * 0.65, 0, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(cx, cy - r * 0.1, 4, cx, cy, r * 0.85);
        bodyGrad.addColorStop(0, '#86EFAC');
        bodyGrad.addColorStop(0.5, '#22C55E');
        bodyGrad.addColorStop(1, '#15803D');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Sarımsı göbek
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.22, r * 0.52, r * 0.42, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF08A';
        ctx.fill();

        // Göz yuvaları (Kafanın üstünde iki tepe)
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(cx - r * 0.42, cy - r * 0.5, r * 0.32, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.42, cy - r * 0.5, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Beyaz göz küreleri
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.42, cy - r * 0.5, r * 0.24, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.42, cy - r * 0.5, r * 0.24, 0, Math.PI * 2);
        ctx.fill();

        // Göz bebekleri (Meraklı ve sevimli)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(cx - r * 0.4, cy - r * 0.48, r * 0.14, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.4, cy - r * 0.48, r * 0.14, 0, Math.PI * 2);
        ctx.fill();

        // Göz ışıltısı
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.38, cy - r * 0.52, r * 0.05, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.42, cy - r * 0.52, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Pembe sevimli yanaklar
        ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.52, cy - r * 0.05, r * 0.14, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.52, cy - r * 0.05, r * 0.14, 0, Math.PI * 2);
        ctx.fill();

        // Mutlu tebessüm
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.05, r * 0.32, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // --- JUMP POZU (Zıplayan, Uzanan Bacaklar) ---
    const jumpSurf = makeSurface(size, size, dpr);
    {
        const { ctx } = jumpSurf;
        const cx = size / 2;
        const cy = size / 2;
        const r = baseSize * 0.38;

        // Uzanan arka bacaklar (aşağı doğru açık)
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.65, cy + r * 0.8, r * 0.22, r * 0.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.65, cy + r * 0.8, r * 0.22, r * 0.5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Uzanan ön kollar (yukarı doğru heyecanlı)
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.8, cy - r * 0.2, r * 0.18, r * 0.42, -0.7, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.8, cy - r * 0.2, r * 0.18, r * 0.42, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Gövde (aerodinamik oval)
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.75, r * 0.85, 0, 0, Math.PI * 2);
        const bGrad = ctx.createRadialGradient(cx, cy - r * 0.2, 4, cx, cy, r * 0.9);
        bGrad.addColorStop(0, '#86EFAC');
        bGrad.addColorStop(0.5, '#22C55E');
        bGrad.addColorStop(1, '#15803D');
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Göbek
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.1, r * 0.45, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF08A';
        ctx.fill();

        // Gözler
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(cx - r * 0.38, cy - r * 0.65, r * 0.28, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.38, cy - r * 0.65, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.38, cy - r * 0.65, r * 0.2, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.38, cy - r * 0.65, r * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(cx - r * 0.38, cy - r * 0.68, r * 0.12, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.38, cy - r * 0.68, r * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Açık mutlu ağız "Vaaa!"
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.25, r * 0.22, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fillStyle = '#991B1B';
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // --- LAND POZU (Yaprakta Başarılı Gururlu Poz) ---
    const landSurf = makeSurface(size, size, dpr);
    {
        const { ctx } = landSurf;
        const cx = size / 2;
        const cy = size / 2 + 2;
        const r = baseSize * 0.45;

        // Idle ile benzer ama daha büyük gülümseme ve kutlama yıldızları
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.8, cy + r * 0.42, r * 0.42, r * 0.28, -0.4, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.8, cy + r * 0.42, r * 0.42, r * 0.28, 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.08, r * 0.85, r * 0.68, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#22C55E';
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.2, r * 0.55, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF08A';
        ctx.fill();

        // Gözler (Kocaman neşeli yıldız gözler)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.42, cy - r * 0.5, r * 0.26, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.42, cy - r * 0.5, r * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(cx - r * 0.42, cy - r * 0.5, r * 0.15, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.42, cy - r * 0.5, r * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Gülen geniş ağız
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.05, r * 0.38, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 3.5;
        ctx.stroke();
    }

    return {
        idle: idleSurf.canvas,
        jump: jumpSurf.canvas,
        land: landSurf.canvas,
        size,
    };
}

// ─────────────────────────────────────────────────────────────
// 4. Göl Dostu Rozet Kartı (Defter & Uçan Rozet Sprite'ı)
// ─────────────────────────────────────────────────────────────

export function createPondBadge(friend: PondFriendDef, dpr: number): HTMLCanvasElement {
    const size = 64;
    const { canvas, ctx } = makeSurface(size, size, dpr);
    const cx = size / 2;
    const cy = size / 2;

    // Dairesel parıltı
    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 30);
    glow.addColorStop(0, 'rgba(74, 222, 128, 0.9)');
    glow.addColorStop(1, 'rgba(34, 197, 94, 0.4)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    // Beyaz zemin
    ctx.beginPath();
    ctx.arc(cx, cy, 27, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22C55E';
    ctx.stroke();

    // Emoji
    ctx.font = `30px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(friend.emoji, cx, cy + 2);

    return canvas;
}
