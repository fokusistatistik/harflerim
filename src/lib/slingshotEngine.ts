/**
 * Renkli Sapan / Meyve Sepeti — 60 FPS HTML5 Canvas Oyun Motoru.
 *
 * Performans & Mimari İlkeleri (Sakin Balonlar v2 & Neşeli Havuz Paritesi):
 *  - Sıfır React State Güncellemesi: Kare başına hiçbir setState çağrılmaz.
 *  - Sapan esneme fiziği, yörünge öngörüsü ve uçuş simülasyonu motor içinde yaşar.
 *  - Tek <canvas>; tüm sanat ekran-dışı canvas'a önbelleklenir.
 *  - Dahili Prosedürel Web Audio API Sentezleyici: Sıfır harici ses dosyası gecikmesi,
 *    anında lastik gerilme, 'whoosh' fırlatma ve marimba yakalama tonları.
 *  - Otomatik Performans Ölçekleme: Zayıf cihazlarda DPR 1 moduna geçer.
 *  - Otizm Dostu Nişanlama: Çekme sırasında yumuşak yörünge noktacıkları yolu gösterir.
 */

import {
    SLINGSHOT_FRUITS,
    calculatePullVector,
    calculateTrajectoryPoints,
    stepFlyingFruit,
    type FruitDef,
    type SlingshotOrigin,
    type BasketTarget,
    type FlyingFruitState,
    type SlingshotSimulationConfig,
} from './slingshotLogic';
import {
    createOrchardBackground,
    createBasketSprite,
    createSlingshotForkSprite,
    createFruitSprite,
    createOrchardBadge,
    type OrchardBackground,
    type BasketSprite,
    type SlingshotForkSprite,
    type FruitSprite,
} from './slingshotArt';
import {
    ORCHARD_FRUITS,
    type OrchardFruitDef,
} from './slingshotCollection';

export interface SlingshotEngineOptions {
    reduceMotion: boolean;
    onLaunch?: (fruit: FruitDef) => void;
    onCatch?: (score: number, fruit: FruitDef) => void;
    onMiss?: () => void;
    onFruitLand?: (fruit: OrchardFruitDef) => void;
    getBookTarget: () => { x: number; y: number };
    getCollected: () => readonly string[];
}

interface SparkleParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    life: number;
    maxLife: number;
    color: string;
}

interface FlyingFruitBadge {
    sx: number;
    sy: number;
    t: number;
    duration: number;
    fruit: OrchardFruitDef;
}

const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class SlingshotEngine {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly opts: SlingshotEngineOptions;

    // Boyutlar ve Ölçekleme
    private W = 0;
    private H = 0;
    private dpr = 1;
    private bg: OrchardBackground | null = null;
    private basketSprite: BasketSprite | null = null;
    private slingSprite: SlingshotForkSprite | null = null;
    private readonly fruitSprites = new Map<string, FruitSprite>();
    private readonly badgeCache = new Map<string, HTMLCanvasElement>();

    // Sapan & Meyve Durumu
    private origin: SlingshotOrigin = { x: 120, y: 350 };
    private basket: BasketTarget = { x: 0.78, y: 0.58, width: 90, height: 75, bobPhase: 0 };
    private currentFruitDef: FruitDef = SLINGSHOT_FRUITS[0];
    private activeFruit: FlyingFruitState = {
        x: 120,
        y: 350,
        vx: 0,
        vy: 0,
        rotation: 0,
        angularVelocity: 0,
        fruit: SLINGSHOT_FRUITS[0],
        isFlying: false,
        landedInBasket: false,
    };

    // Sürükleme (Lastik Esneme) Durumu
    private isDragging = false;
    private dragX = 120;
    private dragY = 350;

    // Efektler ve Koleksiyon
    private particles: SparkleParticle[] = [];
    private flyingBadges: FlyingFruitBadge[] = [];
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

    constructor(canvas: HTMLCanvasElement, opts: SlingshotEngineOptions) {
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
            // sessiz geç
        }
    }

    public setMuted(muted: boolean): void {
        this.soundMuted = muted;
    }

    private playWhooshSound(): void {
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
            const filter = this.audioCtx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, t);
            osc.frequency.exponentialRampToValueAtTime(160, t + 0.16);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, t);
            filter.frequency.linearRampToValueAtTime(300, t + 0.16);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.2);
        } catch {
            // sessiz geç
        }
    }

    private playBasketChime(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            // Sıcak marimba akoru: 587.33 (D5), 739.99 (F#5), 880.00 (A5), 1174.66 (D6)
            const freqs = [587.33, 739.99, 880.00, 1174.66];
            freqs.forEach((freq, idx) => {
                const osc = this.audioCtx!.createOscillator();
                const gain = this.audioCtx!.createGain();

                osc.type = 'triangle';
                const start = t + idx * 0.055;
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.001, start);
                gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

                osc.connect(gain);
                gain.connect(this.audioCtx!.destination);

                osc.start(start);
                osc.stop(start + 0.42);
            });
        } catch {
            // sessiz geç
        }
    }

    private playSoftThud(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.15);
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
        this.fruitSprites.clear();
        this.bg = null;
        this.basketSprite = null;
        this.slingSprite = null;
        this.particles = [];
        this.flyingBadges = [];
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
        this.W = width;
        this.H = height;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.lowQuality ? 1 : 2);

        this.canvas.width = Math.round(width * this.dpr);
        this.canvas.height = Math.round(height * this.dpr);

        // Ekran dışı önbellekler
        this.bg = createOrchardBackground(width, height, this.dpr);
        this.basketSprite = createBasketSprite(this.dpr);
        this.slingSprite = createSlingshotForkSprite(this.dpr);

        this.fruitSprites.clear();
        for (const f of SLINGSHOT_FRUITS) {
            this.fruitSprites.set(f.id, createFruitSprite(f, this.dpr));
        }

        // Sapan başlangıç konumu (Ekran boyutuna göre orantılı)
        this.origin = {
            x: Math.max(90, Math.min(width * 0.22, 180)),
            y: height * 0.62,
        };

        // Sepet konumu
        this.basket = {
            x: Math.max(0.65, Math.min(0.8, 0.76)),
            y: 0.58,
            width: 90,
            height: 75,
            bobPhase: 0,
        };

        if (!this.activeFruit.isFlying) {
            this.resetFruit();
        }
    }

    private resetFruit(): void {
        const collected = this.opts.getCollected();
        const uncollected = SLINGSHOT_FRUITS.filter((f) => !collected.includes(f.id));
        const pool = uncollected.length > 0 && Math.random() < 0.75 ? uncollected : SLINGSHOT_FRUITS;
        const nextFruit = pool[Math.floor(Math.random() * pool.length)];
        this.currentFruitDef = nextFruit;
        this.dragX = this.origin.x;
        this.dragY = this.origin.y;
        this.activeFruit = {
            x: this.origin.x,
            y: this.origin.y,
            vx: 0,
            vy: 0,
            rotation: 0,
            angularVelocity: 0,
            fruit: nextFruit,
            isFlying: false,
            landedInBasket: false,
        };
    }

    // ─────────────────────────────────────────────────────────────
    // Pointer / Dokunma ve Fırlatma Etkileşimi
    // ─────────────────────────────────────────────────────────────

    public pointerDown(x: number, y: number): void {
        if (this.paused || this.activeFruit.isFlying) return;
        this.initAudio();

        // Sapan orijinine veya meyveye yeterince yakın mı?
        const dist = Math.hypot(x - this.origin.x, y - this.origin.y);
        if (dist <= 90) {
            this.isDragging = true;
            this.updateDrag(x, y);
        }
    }

    public pointerMove(x: number, y: number): void {
        if (!this.isDragging) return;
        this.updateDrag(x, y);
    }

    public pointerUp(): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        const pull = calculatePullVector(this.origin, this.dragX, this.dragY, 110);
        if (pull.pullDistance < 20) {
            // Yetersiz gerilme: geri yaylan
            this.dragX = this.origin.x;
            this.dragY = this.origin.y;
            return;
        }

        // Fırlatma!
        this.playWhooshSound();

        // Hız vektörü: Çekilen yönün tersine
        const power = 0.36;
        const vx = pull.pullX * power;
        const vy = pull.pullY * power;

        this.activeFruit = {
            x: pull.clampedX,
            y: pull.clampedY,
            vx,
            vy,
            rotation: 0,
            angularVelocity: (Math.random() - 0.5) * 6,
            fruit: this.currentFruitDef,
            isFlying: true,
            landedInBasket: false,
        };

        this.dragX = this.origin.x;
        this.dragY = this.origin.y;
        this.opts.onLaunch?.(this.currentFruitDef);
    }

    public pointerCancel(): void {
        this.pointerUp();
    }

    private updateDrag(x: number, y: number): void {
        const pull = calculatePullVector(this.origin, x, y, 110);
        this.dragX = pull.clampedX;
        this.dragY = pull.clampedY;
    }

    // ─────────────────────────────────────────────────────────────
    // Kare Döngüsü & Fizik Güncellemesi (60 FPS)
    // ─────────────────────────────────────────────────────────────

    private readonly frame = (ts: number): void => {
        if (!this.running) return;
        this.raf = requestAnimationFrame(this.frame);

        if (this.paused || this.W <= 0 || this.H <= 0) {
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
        // 1. Sepet hafif salınım
        if (!this.opts.reduceMotion) {
            this.basket.bobPhase += dt * 1.5;
        }

        // 2. Meyve uçuş fiziği
        if (this.activeFruit.isFlying) {
            const config: SlingshotSimulationConfig = {
                width: this.W,
                height: this.H,
                gravity: 0.52,
                maxPull: 110,
                powerMultiplier: 0.36,
                reduceMotion: this.opts.reduceMotion,
            };

            const result = stepFlyingFruit(this.activeFruit, this.basket, config, dt);
            this.activeFruit = result.nextFruit;

            if (result.caught) {
                this.score += 1;
                this.playBasketChime();
                this.createFruitSparkles(this.activeFruit.x, this.activeFruit.y, 20);

                // Koleksiyon eşleşmesi
                const matchingOrchard =
                    ORCHARD_FRUITS.find((f) => f.id === this.currentFruitDef.id) ?? ORCHARD_FRUITS[0];

                this.flyingBadges.push({
                    sx: this.activeFruit.x,
                    sy: this.activeFruit.y,
                    t: 0,
                    duration: this.opts.reduceMotion ? 0.6 : 1.1,
                    fruit: matchingOrchard,
                });

                this.opts.onCatch?.(this.score, this.currentFruitDef);

                // 1.2s sonra yeni meyve yükle
                setTimeout(() => {
                    if (this.running) this.resetFruit();
                }, 1200);
            } else if (result.groundHit) {
                this.playSoftThud();
                this.opts.onMiss?.();

                // 1.2s sonra yeni meyve yükle
                setTimeout(() => {
                    if (this.running) this.resetFruit();
                }, 1200);
            }
        }

        // 3. Parçacıklar
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += dt;
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }
            p.vy += 80 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        // 4. Uçan rozetler
        for (let i = this.flyingBadges.length - 1; i >= 0; i--) {
            const f = this.flyingBadges[i];
            f.t += dt;
            if (f.t >= f.duration) {
                this.flyingBadges.splice(i, 1);
                this.opts.onFruitLand?.(f.fruit);
            }
        }
    }

    private createFruitSparkles(x: number, y: number, count: number): void {
        if (this.opts.reduceMotion) return;
        const actualCount = this.lowQuality ? Math.ceil(count / 2) : count;
        const colors = ['#FBBF24', '#F87171', '#34D399', '#60A5FA', '#FFFFFF'];

        for (let i = 0; i < actualCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 30 + Math.random() * 80;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 30,
                radius: 2 + Math.random() * 3,
                life: 0,
                maxLife: 0.5 + Math.random() * 0.3,
                color: colors[i % colors.length],
            });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Çizim (Render)
    // ─────────────────────────────────────────────────────────────

    private render(): void {
        const { ctx, W, H } = this;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        // 1. Meyve Bahçesi Arka Planı
        if (this.bg) {
            ctx.drawImage(this.bg.canvas, 0, 0, W, H);
        }

        // 2. Piknik Sepeti (Hedef)
        if (this.basketSprite) {
            const bx = this.basket.x * W;
            const bobY = Math.sin(this.basket.bobPhase) * 3;
            const by = this.basket.y * H + bobY;
            const bw = this.basketSprite.width;
            const bh = this.basketSprite.height;

            ctx.drawImage(this.basketSprite.canvas, bx - bw / 2, by - bh / 2, bw, bh);
        }

        // 3. Nişan Alma Yörüngesi (Dotted Trajectory Guidance)
        if (this.isDragging) {
            const pull = calculatePullVector(this.origin, this.dragX, this.dragY, 110);
            const power = 0.36;
            const trajPoints = calculateTrajectoryPoints(
                pull.clampedX,
                pull.clampedY,
                pull.pullX * power,
                pull.pullY * power,
                0.52,
                14
            );

            ctx.save();
            trajPoints.forEach((pt, idx) => {
                const alpha = (1 - idx / trajPoints.length) * 0.65;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4 - idx * 0.15, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        // 4. Sapan Lastikleri (Sol & Sağ Çatal ile Meyve Arası Esneme)
        const fruitPos = this.activeFruit.isFlying
            ? { x: this.activeFruit.x, y: this.activeFruit.y }
            : { x: this.dragX, y: this.dragY };

        const slingLeftProng = { x: this.origin.x - 18, y: this.origin.y - 32 };
        const slingRightProng = { x: this.origin.x + 18, y: this.origin.y - 32 };

        ctx.save();
        ctx.strokeStyle = '#B91C1C';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';

        // Arka lastik (Sol çataldan meyveye)
        ctx.beginPath();
        ctx.moveTo(slingLeftProng.x, slingLeftProng.y);
        ctx.lineTo(fruitPos.x - 12, fruitPos.y);
        ctx.stroke();

        // 5. Ahşap Sapan Çatalı (Gövde)
        if (this.slingSprite) {
            const sw = this.slingSprite.width;
            const sh = this.slingSprite.height;
            ctx.drawImage(this.slingSprite.canvas, this.origin.x - sw / 2, this.origin.y - sh * 0.45, sw, sh);
        }

        // Ön lastik (Sağ çataldan meyveye)
        ctx.beginPath();
        ctx.moveTo(slingRightProng.x, slingRightProng.y);
        ctx.lineTo(fruitPos.x + 12, fruitPos.y);
        ctx.stroke();
        ctx.restore();

        // 6. Meyve (Sapan üstünde veya havada uçarken)
        const fruitDef = this.activeFruit.fruit;
        const sprite = this.fruitSprites.get(fruitDef.id);
        if (sprite) {
            ctx.save();
            ctx.translate(fruitPos.x, fruitPos.y);
            ctx.rotate(this.activeFruit.rotation);

            if (this.isDragging) {
                ctx.scale(1.12, 1.12);
            }

            ctx.drawImage(sprite.canvas, -sprite.size / 2, -sprite.size / 2, sprite.size, sprite.size);
            ctx.restore();
        }

        // 7. Parçacıklar
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

        // 8. Uçan Rozetler
        if (this.flyingBadges.length > 0) {
            const bookTarget = this.opts.getBookTarget();
            for (const f of this.flyingBadges) {
                let badge = this.badgeCache.get(f.fruit.id);
                if (!badge) {
                    badge = createOrchardBadge(f.fruit, this.dpr);
                    this.badgeCache.set(f.fruit.id, badge);
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
