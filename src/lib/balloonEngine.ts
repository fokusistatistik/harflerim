/**
 * Sakin Balonlar (pilot v2) — canvas oyun motoru.
 *
 * Performans ilkeleri (1 çekirdek / 4 GB sunucu + düşük/orta telefon):
 *  - Tüm oyun durumu motorun içinde, React state'inde DEĞİL: kare başına
 *    sıfır yeniden render (eski sürüm 60 fps'te tüm balonları setState ediyordu).
 *  - Tek <canvas>; tüm sanat önceden ekran-dışı canvas'a çizilir, kare başına
 *    yalnızca drawImage. Nesne ayırma (allocation) kare döngüsünde minimum.
 *  - dt tabanlı hareket: 60/90/120 Hz ekranlarda aynı hız.
 *  - DPR en fazla 2; kare süresi uzarsa "düşük kalite" moduna otomatik geçer
 *    (DPR 1, daha az parçacık).
 *  - Arka plan sekmesinde rAF zaten durur; dt sıçraması 50 ms ile sınırlı.
 *
 * Duyusal ilkeler: "Hareketi azalt" açıksa bulut kayması, sallanma, parçacık
 * ve halka efektleri kapanır. Yanlış dokunuş cezasızdır (tek yumuşak büyüme
 * nabzı); titreşim/yanıp sönme yoktur.
 */
import {
    getPalette,
    hitTestBalloons,
    pickSpawnSticker,
    type BalloonColorName,
    type StickerDef,
} from './balloonLogic';
import {
    createBackground,
    createBalloonSprite,
    createCloudSprite,
    createStickerChip,
    type BalloonSprite,
    type CloudSprite,
} from './balloonArt';

export interface EngineOptions {
    reduceMotion: boolean;
    onPop: (sticker: StickerDef) => void;
    onWrong: (sticker: StickerDef) => void;
    /** Uçan sticker deftere ulaştığında. */
    onStickerLand: (sticker: StickerDef) => void;
    /** Defter düğmesinin canvas'a göre merkezi (CSS px). */
    getBookTarget: () => { x: number; y: number };
    getCollected: () => readonly string[];
}

interface Balloon {
    id: number;
    x: number;
    y: number;
    vy: number;
    amp: number;
    freq: number;
    phase: number;
    sticker: StickerDef;
    tier: 0 | 1 | 2;
    sprite: BalloonSprite;
    drawX: number;
    /** Yanlış dokunuş geri bildirimi için kalan süre (sn). */
    wobble: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    r: number;
    color: string;
}

interface Ring {
    x: number;
    y: number;
    t: number;
    max: number;
    r: number;
}

interface Fly {
    sx: number;
    sy: number;
    t: number;
    dur: number;
    sticker: StickerDef;
}

interface CloudInst {
    sprite: CloudSprite;
    y: number;
    x0: number;
    speed: number;
    alpha: number;
}

const TIER_SCALE = [0.9, 1, 1.12] as const;
const WOBBLE_DURATION = 0.45;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class BalloonEngine {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly opts: EngineOptions;

    private W = 0;
    private H = 0;
    private dpr = 1;
    private base = 90;
    private bg: HTMLCanvasElement | null = null;
    private clouds: CloudInst[] = [];
    private balloons: Balloon[] = [];
    private particles: Particle[] = [];
    private rings: Ring[] = [];
    private flies: Fly[] = [];
    private readonly spriteCache = new Map<string, BalloonSprite>();
    private readonly chipCache = new Map<string, HTMLCanvasElement>();

    private raf = 0;
    private last = 0;
    private time = 0;
    private spawnTimer = 0;
    private idCounter = 0;
    private running = false;
    private paused = false;
    private targetColor: BalloonColorName | null = null;

    private emaDt = 1 / 60;
    private slowSeconds = 0;
    private lowQuality = false;

    constructor(canvas: HTMLCanvasElement, opts: EngineOptions) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D canvas desteklenmiyor');
        this.canvas = canvas;
        this.ctx = ctx;
        this.opts = opts;
    }

    // ───────────── Genel API ─────────────

    start(): void {
        if (this.running) return;
        this.running = true;
        this.last = 0;
        if (this.W > 0 && this.balloons.length === 0) {
            // Ekran boş başlamasın: farklı yüksekliklerde birkaç balonla açılış.
            [0.88, 0.66, 0.46, 0.28].forEach((f) => this.spawn(this.H * f));
        }
        this.raf = requestAnimationFrame(this.frame);
    }

    destroy(): void {
        this.running = false;
        cancelAnimationFrame(this.raf);
        this.spriteCache.clear();
        this.chipCache.clear();
        this.balloons = [];
        this.particles = [];
        this.rings = [];
        this.flies = [];
        this.bg = null;
    }

    /** Defter açıkken çizim/güncelleme durur (pil + CPU). */
    setPaused(paused: boolean): void {
        this.paused = paused;
    }

    setTarget(color: BalloonColorName | null): void {
        this.targetColor = color;
        this.ensureTargetPresent();
    }

    resize(width: number, height: number): void {
        if (width <= 0 || height <= 0) return;
        const first = this.W === 0;
        this.W = width;
        this.H = height;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.lowQuality ? 1 : 2);
        this.canvas.width = Math.round(width * this.dpr);
        this.canvas.height = Math.round(height * this.dpr);
        this.base = clamp(Math.min(width, height) * 0.2, 68, 124);
        this.spriteCache.clear();
        this.chipCache.clear();
        this.bg = createBackground(width, height, this.dpr);
        this.buildClouds();
        for (const b of this.balloons) {
            b.sprite = this.getSprite(b.sticker, b.tier);
            b.x = clamp(b.x, b.sprite.bodyW * 0.6, Math.max(b.sprite.bodyW * 0.6, width - b.sprite.bodyW * 0.6));
        }
        if (first && this.running && this.balloons.length === 0) {
            [0.88, 0.66, 0.46, 0.28].forEach((f) => this.spawn(this.H * f));
        }
    }

    /** Canvas'a göre CSS px koordinatı. */
    pointerDown(x: number, y: number): void {
        if (this.paused || this.balloons.length === 0) return;
        const idx = hitTestBalloons(
            this.balloons.map((b) => ({
                x: b.drawX,
                y: b.y,
                rx: b.sprite.bodyW * 0.46,
                ry: b.sprite.bodyH * 0.5,
            })),
            x,
            y
        );
        if (idx < 0) return;
        const b = this.balloons[idx];
        if (this.targetColor && b.sticker.color !== this.targetColor) {
            // Cezasız geri bildirim: tek, yumuşak büyüme nabzı.
            b.wobble = WOBBLE_DURATION;
            this.opts.onWrong(b.sticker);
            return;
        }
        this.pop(idx);
    }

    // ───────────── Kurulum yardımcıları ─────────────

    private getSprite(sticker: StickerDef, tier: 0 | 1 | 2): BalloonSprite {
        const key = `${sticker.id}-${tier}`;
        let sprite = this.spriteCache.get(key);
        if (!sprite) {
            sprite = createBalloonSprite(getPalette(sticker.color), sticker, this.base * TIER_SCALE[tier], this.dpr);
            this.spriteCache.set(key, sprite);
        }
        return sprite;
    }

    private getChip(sticker: StickerDef): HTMLCanvasElement {
        let chip = this.chipCache.get(sticker.id);
        if (!chip) {
            chip = createStickerChip(sticker.emoji, this.base * 0.62, this.dpr);
            this.chipCache.set(sticker.id, chip);
        }
        return chip;
    }

    private buildClouds(): void {
        const rm = this.opts.reduceMotion;
        const defs = [
            { w: 2.6, y: 0.07, speed: 9, alpha: 0.85 },
            { w: 3.4, y: 0.2, speed: 6, alpha: 0.7 },
            { w: 2.2, y: 0.34, speed: 13, alpha: 0.8 },
            { w: 3.0, y: 0.5, speed: 7, alpha: 0.55 },
            { w: 2.4, y: 0.61, speed: 11, alpha: 0.5 },
        ];
        this.clouds = defs.map((d, i) => {
            const sprite = createCloudSprite(this.base * d.w, this.dpr, 1000 + i * 37);
            return {
                sprite,
                y: this.H * d.y,
                x0: ((i * 0.37) % 1) * (this.W + sprite.width),
                speed: rm ? 0 : d.speed,
                alpha: d.alpha,
            };
        });
    }

    private spawn(initialY?: number): void {
        if (this.W <= 0) return;
        const sticker = pickSpawnSticker({
            targetColor: this.targetColor,
            onScreenColors: this.balloons.map((b) => b.sticker.color),
            collected: this.opts.getCollected(),
        });
        const tier = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        const sprite = this.getSprite(sticker, tier);
        const margin = sprite.bodyW * 0.6 + 6;
        const span = Math.max(1, this.W - margin * 2);

        // Alt kısımdaki balonlarla üst üste binmesin diye birkaç deneme.
        let x = margin + Math.random() * span;
        for (let attempt = 0; attempt < 5; attempt++) {
            const cand = margin + Math.random() * span;
            const crowded = this.balloons.some(
                (b) => b.y > this.H * 0.6 && Math.abs(b.x - cand) < this.base * 0.95
            );
            x = cand;
            if (!crowded) break;
        }

        const rm = this.opts.reduceMotion;
        this.balloons.push({
            id: ++this.idCounter,
            x,
            y: initialY ?? this.H + sprite.height * 0.5,
            vy: this.H * (0.085 + Math.random() * 0.04) * (rm ? 0.7 : 1),
            amp: rm ? 0 : 8 + Math.random() * 10,
            freq: 0.6 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            sticker,
            tier,
            sprite,
            drawX: x,
            wobble: 0,
        });
    }

    private ensureTargetPresent(): void {
        if (!this.targetColor || this.W <= 0) return;
        if (!this.balloons.some((b) => b.sticker.color === this.targetColor)) {
            this.spawn();
        }
    }

    private pop(index: number): void {
        const b = this.balloons[index];
        this.balloons.splice(index, 1);
        const rm = this.opts.reduceMotion;
        const palette = getPalette(b.sticker.color);
        const cy = b.y;

        if (!rm) {
            const count = this.lowQuality ? 5 : 11;
            for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
                const sp = 70 + Math.random() * 80;
                this.particles.push({
                    x: b.drawX,
                    y: cy,
                    vx: Math.cos(a) * sp,
                    vy: Math.sin(a) * sp - 30,
                    life: 0,
                    max: 0.6 + Math.random() * 0.3,
                    r: 3 + Math.random() * 3.5,
                    color: i % 2 === 0 ? palette.base : palette.light,
                });
            }
            this.rings.push({ x: b.drawX, y: cy, t: 0, max: 0.38, r: b.sprite.bodyW * 0.75 });
        }

        this.flies.push({ sx: b.drawX, sy: cy, t: 0, dur: rm ? 0.5 : 1.05, sticker: b.sticker });
        this.opts.onPop(b.sticker);
        this.ensureTargetPresent();
    }

    // ───────────── Döngü ─────────────

    private readonly frame = (ts: number): void => {
        if (!this.running) return;
        this.raf = requestAnimationFrame(this.frame);

        if (this.paused || this.W <= 0) {
            this.last = ts;
            return;
        }

        let dt = this.last === 0 ? 1 / 60 : (ts - this.last) / 1000;
        this.last = ts;
        const rawDt = dt;
        dt = Math.min(dt, 0.05);

        this.trackPerformance(rawDt);
        this.update(dt);
        this.render();
    };

    /** Kare süresi uzun sürerse (zayıf telefon) sessizce hafifler. */
    private trackPerformance(rawDt: number): void {
        if (this.lowQuality || rawDt > 0.25) return; // sekme dönüşü gibi sıçramaları yok say
        this.emaDt = this.emaDt * 0.95 + rawDt * 0.05;
        if (this.emaDt > 0.03) {
            this.slowSeconds += rawDt;
            if (this.slowSeconds > 3) {
                this.lowQuality = true;
                this.resize(this.W, this.H); // DPR'ı 1'e indirir, sanatı yeniden kurar
            }
        } else {
            this.slowSeconds = Math.max(0, this.slowSeconds - rawDt);
        }
    }

    private update(dt: number): void {
        this.time += dt;

        const rm = this.opts.reduceMotion;
        const maxBalloons = rm ? 5 : 7;
        this.spawnTimer += dt;
        if (this.spawnTimer >= (rm ? 2 : 1.5)) {
            this.spawnTimer = 0;
            if (this.balloons.length < maxBalloons) this.spawn();
        }

        let removed = false;
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            b.y -= b.vy * dt;
            b.drawX = b.x + Math.sin(this.time * b.freq + b.phase) * b.amp;
            if (b.wobble > 0) b.wobble = Math.max(0, b.wobble - dt);
            if (b.y < -b.sprite.height) {
                this.balloons.splice(i, 1);
                removed = true;
            }
        }
        if (removed) this.ensureTargetPresent();

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += dt;
            if (p.life >= p.max) {
                this.particles.splice(i, 1);
                continue;
            }
            p.vy += 120 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
        for (let i = this.rings.length - 1; i >= 0; i--) {
            this.rings[i].t += dt;
            if (this.rings[i].t >= this.rings[i].max) this.rings.splice(i, 1);
        }
        for (let i = this.flies.length - 1; i >= 0; i--) {
            const f = this.flies[i];
            f.t += dt;
            if (f.t >= f.dur) {
                this.flies.splice(i, 1);
                this.opts.onStickerLand(f.sticker);
            }
        }
    }

    private render(): void {
        const { ctx, W, H } = this;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        if (this.bg) ctx.drawImage(this.bg, 0, 0, W, H);

        // Bulutlar (paralaks: farklı hız/saydamlık)
        for (const c of this.clouds) {
            const span = W + c.sprite.width;
            const x = ((c.x0 + c.speed * this.time) % span) - c.sprite.width;
            ctx.globalAlpha = c.alpha;
            ctx.drawImage(c.sprite.canvas, x, c.y, c.sprite.width, c.sprite.height);
        }
        ctx.globalAlpha = 1;

        // Balonlar (ip + gövde aynı dönüşümde)
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        for (const b of this.balloons) {
            const s = b.sprite;
            const tilt = this.opts.reduceMotion ? 0 : Math.sin(this.time * b.freq + b.phase) * 0.06;
            const pulse = b.wobble > 0 ? 1 + 0.07 * Math.sin(Math.PI * (1 - b.wobble / WOBBLE_DURATION)) : 1;

            ctx.save();
            ctx.translate(b.drawX, b.y);
            ctx.rotate(tilt);
            ctx.scale(pulse, pulse);

            const stringStart = s.knotY - s.cy;
            const sway = this.opts.reduceMotion ? 0 : Math.sin(this.time * 1.3 + b.phase) * 7;
            ctx.beginPath();
            ctx.moveTo(0, stringStart);
            ctx.quadraticCurveTo(sway, stringStart + s.bodyH * 0.28, sway * 0.4, stringStart + s.bodyH * 0.58);
            ctx.stroke();

            ctx.drawImage(s.canvas, -s.cx, -s.cy, s.width, s.height);
            ctx.restore();
        }

        // Patlama halkaları + parçacıklar
        for (const r of this.rings) {
            const p = r.t / r.max;
            ctx.globalAlpha = 0.55 * (1 - p);
            ctx.lineWidth = 3 - 2 * p;
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r * (0.35 + 0.65 * p), 0, Math.PI * 2);
            ctx.stroke();
        }
        for (const p of this.particles) {
            const k = 1 - p.life / p.max;
            ctx.globalAlpha = k;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * (0.5 + 0.5 * k), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Deftere uçan sticker'lar
        if (this.flies.length > 0) {
            const target = this.opts.getBookTarget();
            for (const f of this.flies) {
                const chip = this.getChip(f.sticker);
                const size = chip.width / this.dpr;
                const p = f.t / f.dur;
                let x: number;
                let y: number;
                let scale: number;
                if (p < 0.3) {
                    // Belir: balonun olduğu yerde yumuşakça büyür.
                    x = f.sx;
                    y = f.sy;
                    scale = 0.3 + (p / 0.3) * 0.9;
                } else {
                    const q = easeInOut((p - 0.3) / 0.7);
                    const cx = (f.sx + target.x) / 2;
                    const cy = Math.min(f.sy, target.y) - 70;
                    const u = 1 - q;
                    x = u * u * f.sx + 2 * u * q * cx + q * q * target.x;
                    y = u * u * f.sy + 2 * u * q * cy + q * q * target.y;
                    scale = 1.2 - 0.7 * q;
                }
                ctx.globalAlpha = p > 0.92 ? (1 - p) / 0.08 : 1;
                ctx.drawImage(chip, x - (size * scale) / 2, y - (size * scale) / 2, size * scale, size * scale);
            }
            ctx.globalAlpha = 1;
        }
    }
}
