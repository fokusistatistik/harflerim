/**
 * Zıp Zıp Kurbağa — 60 FPS HTML5 Canvas Oyun Motoru.
 *
 * Performans & Mimari İlkeleri (Sakin Balonlar v2 & Neşeli Havuz Paritesi):
 *  - Sıfır React State Güncellemesi: Kare başına hiçbir setState çağrılmaz.
 *  - Kurbağa fiziği, parabolik zıplama ve nilüfer salınımı motor içinde yaşar.
 *  - Tek <canvas>; tüm sanat öğeleri ekran-dışı canvas'a önbelleklenir.
 *  - Dahili Prosedürel Web Audio API Sentezleyici: Sıfır harici ses dosyası gecikmesi,
 *    anında yaylanma ('boing'), su sıçraması ve ödül zili tonları.
 *  - Otomatik Performans Ölçekleme: Zayıf cihazlarda DPR 1 ve düşük parçacık moduna geçer.
 *  - Otizm Duyusal Güvenliği: Kaçırma durumunda ceza/kayıp yok, kıyı yosununa tutunup yumuşakça döner.
 */

import {
    createInitialFrogState,
    createInitialPadState,
    stepFrogState,
    stepLilyPad,
    type FrogPhysicalState,
    type LilyPadState,
    type FrogSimulationConfig,
} from './frogLogic';
import {
    createPondBackground,
    createLilyPadTargetSprite,
    createFrogSpriteSet,
    createPondBadge,
    type PondBackground,
    type LilyPadTargetSprite,
    type FrogSpriteSet,
} from './frogArt';
import {
    POND_FRIENDS,
    type PondFriendDef,
} from './frogCollection';

export interface FrogEngineOptions {
    reduceMotion: boolean;
    onJump?: () => void;
    onLand?: (score: number, friend: PondFriendDef) => void;
    onMiss?: () => void;
    onFriendLand?: (friend: PondFriendDef) => void;
    getBookTarget: () => { x: number; y: number };
    getCollected: () => readonly string[];
}

interface WaterParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    life: number;
    maxLife: number;
    color: string;
}

interface PondRipple {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    strength: number;
    life: number;
    maxLife: number;
}

interface FlyingFriend {
    sx: number;
    sy: number;
    t: number;
    duration: number;
    friend: PondFriendDef;
}

const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class FrogEngine {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly opts: FrogEngineOptions;

    // Boyutlar ve Ölçekleme
    private W = 0;
    private H = 0;
    private dpr = 1;
    private bg: PondBackground | null = null;
    private padSprite: LilyPadTargetSprite | null = null;
    private frogSprites: FrogSpriteSet | null = null;
    private readonly badgeCache = new Map<string, HTMLCanvasElement>();

    // Fizik ve Simülasyon Durumu
    private frog: FrogPhysicalState | null = null;
    private pad: LilyPadState | null = null;
    private particles: WaterParticle[] = [];
    private ripples: PondRipple[] = [];
    private flyingFriends: FlyingFriend[] = [];
    private score = 0;

    // Döngü Kontrolü
    private raf = 0;
    private lastTimestamp = 0;
    private running = false;
    private paused = false;

    // Performans İzleme
    private emaDt = 1 / 60;
    private slowSeconds = 0;
    private lowQuality = false;

    // Dahili Web Audio Sentezleyici
    private audioCtx: AudioContext | null = null;
    private soundMuted = false;

    constructor(canvas: HTMLCanvasElement, opts: FrogEngineOptions) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D canvas desteklenmiyor');
        this.canvas = canvas;
        this.ctx = ctx;
        this.opts = opts;
    }

    // ─────────────────────────────────────────────────────────────
    // Web Audio Prosedürel Ses Sentezleyici
    // ─────────────────────────────────────────────────────────────

    private initAudio(): void {
        if (this.audioCtx) return;
        try {
            const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.audioCtx = new AudioContextClass();
        } catch {
            // Web Audio desteklenmiyorsa sessizce devam et
        }
    }

    public setMuted(muted: boolean): void {
        this.soundMuted = muted;
    }

    private playJumpBoing(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx || this.audioCtx.state === 'suspended') {
            this.audioCtx?.resume().catch(() => {});
        }
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            // Yaylanma sesi: 160Hz -> 380Hz ramp
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(380, t + 0.18);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.14, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.24);
        } catch {
            // sessiz geç
        }
    }

    private playWaterSplash(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.14);
        } catch {
            // sessiz geç
        }
    }

    private playCelebrationChime(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            // Pentatonik zengin tonlar: F5 (698.46), A5 (880.00), C6 (1046.50)
            const notes = [698.46, 880.00, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.audioCtx!.createOscillator();
                const gain = this.audioCtx!.createGain();

                osc.type = 'sine';
                const start = t + idx * 0.07;
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.001, start);
                gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);

                osc.connect(gain);
                gain.connect(this.audioCtx!.destination);

                osc.start(start);
                osc.stop(start + 0.4);
            });
        } catch {
            // sessiz geç
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Genel Motor Yaşam Döngüsü ve API
    // ─────────────────────────────────────────────────────────────

    public start(): void {
        if (this.running) return;
        this.running = true;
        this.lastTimestamp = 0;
        this.raf = requestAnimationFrame(this.frame);
    }

    public destroy(): void {
        this.running = false;
        cancelAnimationFrame(this.raf);
        this.badgeCache.clear();
        this.bg = null;
        this.padSprite = null;
        this.frogSprites = null;
        this.particles = [];
        this.ripples = [];
        this.flyingFriends = [];
        if (this.audioCtx && this.audioCtx.state !== 'closed') {
            this.audioCtx.close().catch(() => {});
            this.audioCtx = null;
        }
    }

    public setPaused(paused: boolean): void {
        this.paused = paused;
    }

    public resize(width: number, height: number): void {
        if (width <= 0 || height <= 0) return;
        const first = this.W === 0;
        this.W = width;
        this.H = height;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.lowQuality ? 1 : 2);

        this.canvas.width = Math.round(width * this.dpr);
        this.canvas.height = Math.round(height * this.dpr);

        // Ekran dışı önbellekleri yeniden oluştur
        this.bg = createPondBackground(width, height, this.dpr);
        const padR = Math.max(50, Math.min(width * 0.15, 80));
        this.padSprite = createLilyPadTargetSprite(padR, this.dpr);
        this.frogSprites = createFrogSpriteSet(Math.max(68, Math.min(width * 0.16, 96)), this.dpr);

        if (first || !this.frog || !this.pad) {
            this.frog = createInitialFrogState(width, height);
            this.pad = createInitialPadState(width, height);
        } else {
            // Yeniden boyutlandırmada konumları güncelle
            this.frog.startX = width / 2;
            this.frog.startY = height * 0.82;
            this.frog.targetY = height * 0.42;
            if (this.frog.state === 'idle') {
                this.frog.currentX = this.frog.startX;
                this.frog.currentY = this.frog.startY;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Etkileşim: Zıplama Eylemi
    // ─────────────────────────────────────────────────────────────

    public jump(): void {
        if (this.paused || !this.frog || !this.pad) return;
        if (this.frog.state !== 'idle') return;

        this.initAudio();
        this.playJumpBoing();

        // Nilüfer yaprağının hareket yönüne göre hafif öncü hedefleme (lead aim)
        const leadTime = this.frog.jumpDuration * 0.45;
        const normSpeed = (this.pad.vx / Math.max(1, this.W)) * this.pad.direction;
        const predictedNormX = Math.min(this.pad.maxX, Math.max(this.pad.minX, this.pad.x + normSpeed * leadTime));
        const targetX = predictedNormX * this.W;

        this.frog.state = 'jumping';
        this.frog.jumpProgress = 0;
        this.frog.targetX = targetX;
        this.frog.startX = this.frog.currentX;
        this.frog.startY = this.frog.currentY;

        // Kıyıdan su sıçraması ve kalkış dalgası
        this.createRipples(this.frog.startX, this.frog.startY, 1, 60);
        this.createSplash(this.frog.startX, this.frog.startY, 8, 35);

        this.opts.onJump?.();
    }

    private createRipples(x: number, y: number, strength: number, maxRadius: number): void {
        this.ripples.push({
            x,
            y,
            radius: 8,
            maxRadius,
            strength,
            life: 1.4,
            maxLife: 1.4,
        });
        if (this.ripples.length > 16) this.ripples.shift();
    }

    private createSplash(x: number, y: number, count: number, speed: number): void {
        if (this.opts.reduceMotion) return;
        const actualCount = this.lowQuality ? Math.ceil(count / 2) : count;

        for (let i = 0; i < actualCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (0.4 + Math.random() * 0.6) * speed;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 25,
                radius: 2 + Math.random() * 2.5,
                life: 0,
                maxLife: 0.4 + Math.random() * 0.25,
                color: i % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(167,243,208,0.75)',
            });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Kare Döngüsü & Fizik Güncellemesi (60 FPS)
    // ─────────────────────────────────────────────────────────────

    private readonly frame = (ts: number): void => {
        if (!this.running) return;
        this.raf = requestAnimationFrame(this.frame);

        if (this.paused || this.W <= 0 || this.H <= 0 || !this.frog || !this.pad) {
            this.lastTimestamp = ts;
            return;
        }

        let dt = this.lastTimestamp === 0 ? 1 / 60 : (ts - this.lastTimestamp) / 1000;
        this.lastTimestamp = ts;
        const rawDt = dt;
        dt = Math.min(dt, 0.05);

        this.trackPerformance(rawDt);
        this.update(dt);
        this.render();
    };

    private trackPerformance(rawDt: number): void {
        if (this.lowQuality || rawDt > 0.25) return;
        this.emaDt = this.emaDt * 0.95 + rawDt * 0.05;
        if (this.emaDt > 0.032) {
            this.slowSeconds += rawDt;
            if (this.slowSeconds > 3) {
                this.lowQuality = true;
                this.resize(this.W, this.H);
            }
        } else {
            this.slowSeconds = Math.max(0, this.slowSeconds - rawDt);
        }
    }

    private update(dt: number): void {
        if (!this.frog || !this.pad) return;

        const config: FrogSimulationConfig = {
            width: this.W,
            height: this.H,
            padSpeed: 120,
            reduceMotion: this.opts.reduceMotion,
        };

        // 1. Nilüfer salınımı
        this.pad = stepLilyPad(this.pad, config, dt);

        // 2. Kurbağa simülasyonu
        const result = stepFrogState(this.frog, this.pad, config, dt);
        this.frog = result.frog;

        if (result.landedEvent) {
            this.score += 1;
            this.playCelebrationChime();
            this.createRipples(this.frog.currentX, this.frog.currentY, 1.2, 90);
            this.createSplash(this.frog.currentX, this.frog.currentY, 16, 55);

            // Henüz keşfedilmemiş göl dostlarını önceliklendir
            const collected = this.opts.getCollected();
            const uncollected = POND_FRIENDS.filter((f) => !collected.includes(f.id));
            const friend = uncollected.length > 0 ? uncollected[0] : POND_FRIENDS[(this.score - 1) % POND_FRIENDS.length];

            // Uçan rozet başlat
            this.flyingFriends.push({
                sx: this.frog.currentX,
                sy: this.frog.currentY,
                t: 0,
                duration: this.opts.reduceMotion ? 0.6 : 1.1,
                friend,
            });

            this.opts.onLand?.(this.score, friend);
        } else if (result.missedEvent) {
            this.playWaterSplash();
            this.createRipples(this.frog.currentX, this.frog.currentY, 0.8, 65);
            this.createSplash(this.frog.currentX, this.frog.currentY, 8, 30);
            this.opts.onMiss?.();
        }

        // 3. Su damlaları parçacık güncellemesi
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += dt;
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }
            p.vy += 110 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        // 4. Dalgalar güncellemesi
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.life -= dt;
            if (r.life <= 0) {
                this.ripples.splice(i, 1);
                continue;
            }
            const prog = 1 - r.life / r.maxLife;
            r.radius = 8 + (r.maxRadius - 8) * prog;
            r.strength = (1 - prog) * (1 - prog);
        }

        // 5. Uçan göl dostları
        for (let i = this.flyingFriends.length - 1; i >= 0; i--) {
            const f = this.flyingFriends[i];
            f.t += dt;
            if (f.t >= f.duration) {
                this.flyingFriends.splice(i, 1);
                this.opts.onFriendLand?.(f.friend);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Çizim (Render)
    // ─────────────────────────────────────────────────────────────

    private render(): void {
        const { ctx, W, H } = this;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        // 1. Gölet Arka Planı
        if (this.bg) {
            ctx.drawImage(this.bg.canvas, 0, 0, W, H);
        }

        // 2. Nilüfer Yaprağı
        if (this.pad && this.padSprite) {
            const px = this.pad.x * W;
            const py = this.pad.y * H;
            const size = this.padSprite.size;

            ctx.save();
            ctx.translate(px, py);

            if (!this.opts.reduceMotion) {
                const sway = Math.sin(performance.now() * 0.0025) * 0.04;
                ctx.rotate(sway);
            }

            ctx.drawImage(this.padSprite.canvas, -size / 2, -size / 2, size, size);
            ctx.restore();
        }

        // 3. Dalgalar
        for (const rip of this.ripples) {
            const alpha = rip.strength * 0.65;
            if (alpha <= 0.01) continue;

            ctx.save();
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.lineWidth = Math.max(1.5, 3 * rip.strength);
            ctx.stroke();
            ctx.restore();
        }

        // 4. Kurbağa
        if (this.frog && this.frogSprites) {
            const { currentX, currentY, scale, rotation, state } = this.frog;
            const spriteCanvas =
                state === 'jumping'
                    ? this.frogSprites.jump
                    : state === 'landed'
                    ? this.frogSprites.land
                    : this.frogSprites.idle;

            const size = this.frogSprites.size;

            ctx.save();
            ctx.translate(currentX, currentY);
            ctx.rotate(rotation);
            ctx.scale(scale, scale);

            ctx.drawImage(spriteCanvas, -size / 2, -size / 2, size, size);
            ctx.restore();
        }

        // 5. Su Sıçrama Parçacıkları
        for (const p of this.particles) {
            const k = 1 - p.life / p.maxLife;
            ctx.save();
            ctx.globalAlpha = k;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (0.6 + 0.4 * k), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 6. Uçan Göl Dostları
        if (this.flyingFriends.length > 0) {
            const bookTarget = this.opts.getBookTarget();
            for (const f of this.flyingFriends) {
                let badge = this.badgeCache.get(f.friend.id);
                if (!badge) {
                    badge = createPondBadge(f.friend, this.dpr);
                    this.badgeCache.set(f.friend.id, badge);
                }

                const size = badge.width / this.dpr;
                const p = f.t / f.duration;

                let x: number;
                let y: number;
                let sc: number;

                if (p < 0.25) {
                    x = f.sx;
                    y = f.sy;
                    sc = 0.4 + (p / 0.25) * 0.8;
                } else {
                    const q = easeInOut((p - 0.25) / 0.75);
                    const cx = (f.sx + bookTarget.x) / 2;
                    const cy = Math.min(f.sy, bookTarget.y) - 80;
                    const u = 1 - q;
                    x = u * u * f.sx + 2 * u * q * cx + q * q * bookTarget.x;
                    y = u * u * f.sy + 2 * u * q * cy + q * q * bookTarget.y;
                    sc = 1.2 - 0.65 * q;
                }

                ctx.save();
                ctx.globalAlpha = p > 0.9 ? (1 - p) / 0.1 : 1;
                ctx.drawImage(badge, x - (size * sc) / 2, y - (size * sc) / 2, size * sc, size * sc);
                ctx.restore();
            }
        }
    }
}
