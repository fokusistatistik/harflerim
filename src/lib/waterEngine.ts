/**
 * Neşeli Havuz — 60 FPS HTML5 Canvas Su ve Fizik Motoru.
 *
 * Performans & Mimari İlkeleri (Sakin Balonlar v2 Paritesi):
 *  - Sıfır React State Güncellemesi: Kare başına hiçbir setState çağrılmaz.
 *  - Tüm su fiziği, dalgalar ve oyuncaklar motor içinde yaşar.
 *  - Tek <canvas>; tüm sanat öğeleri (su, nilüfer, oyuncaklar) ekran-dışı canvas'a önbelleklenir.
 *  - Dahili Prosedürel Web Audio API Sentezleyici: Sıfır harici ses dosyası gecikmesi,
 *    anında yumuşak su sıçraması, kabarcık ve ödül zili tonları.
 *  - Otomatik Performans Ölçekleme: Zayıf cihazlarda DPR 1 ve düşük parçacık moduna geçer.
 *  - Otizm Duyusal Güvenliği: Ani patlamalar, rahatsız edici frekanslar veya cezalandırıcı durumlar yoktur.
 */

import {
    TOY_DEFINITIONS,
    createInitialToyStates,
    createRandomTarget,
    hitTestToy,
    isToyAtTarget,
    stepWaterSimulation,
    type FloatingToyDef,
    type TargetBuoy,
    type WaterRipple,
    type WaterToyState,
    type WaterSimulationConfig,
} from './waterLogic';
import {
    createPoolBackground,
    createLilyPadSprite,
    createToySprite,
    createTreasureBadge,
    type PoolBackground,
    type LilyPadSprite,
    type ToySprite,
} from './waterArt';
import {
    WATER_TREASURES,
    type WaterTreasureDef,
} from './waterCollection';

export interface WaterEngineOptions {
    reduceMotion: boolean;
    onSplash?: (toy: FloatingToyDef | null) => void;
    onTargetReached?: (toy: FloatingToyDef, treasure: WaterTreasureDef) => void;
    onTargetChanged?: (newTarget: FloatingToyDef) => void;
    onTreasureLand?: (treasure: WaterTreasureDef) => void;
    getBookTarget: () => { x: number; y: number };
    getCollected: () => readonly string[];
}

interface SplashParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    life: number;
    maxLife: number;
    color: string;
}

interface FlyingTreasure {
    sx: number;
    sy: number;
    t: number;
    duration: number;
    treasure: WaterTreasureDef;
}

interface ActivePointer {
    id: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    currentX: number;
    currentY: number;
    draggedToyId: string | null;
    lastTime: number;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class WaterEngine {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly opts: WaterEngineOptions;

    // Boyutlar ve Ölçekleme
    private W = 0;
    private H = 0;
    private dpr = 1;
    private bg: PoolBackground | null = null;
    private lilyPadSprite: LilyPadSprite | null = null;

    // Önbellekler
    private readonly toySprites = new Map<string, ToySprite>();
    private readonly treasureBadges = new Map<string, HTMLCanvasElement>();

    // Fizik ve Simülasyon Durumu
    private toys: WaterToyState[] = [];
    private ripples: WaterRipple[] = [];
    private particles: SplashParticle[] = [];
    private flyingTreasures: FlyingTreasure[] = [];
    private target: TargetBuoy | null = null;
    private mode: 'free' | 'target' = 'free';

    // Etkileşim Durumu
    private activePointers = new Map<number, ActivePointer>();
    private rippleIdCounter = 0;
    private freeInteractions = 0;

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

    constructor(canvas: HTMLCanvasElement, opts: WaterEngineOptions) {
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
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.audioCtx = new AudioContextClass();
        } catch {
            // Web Audio desteklenmiyorsa sessiz devam et
        }
    }

    public setMuted(muted: boolean): void {
        this.soundMuted = muted;
    }

    private playSplashSound(pitchMod = 1): void {
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

            // Yumuşak su 'plop' sesi (frekansı hızla düşen sinüs dalgası)
            osc.type = 'sine';
            const baseFreq = 340 * pitchMod;
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(120 * pitchMod, t + 0.14);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, t);
            filter.frequency.linearRampToValueAtTime(200, t + 0.14);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.16);
        } catch {
            // sessiz geç
        }
    }

    private playBubbleSound(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            const startFreq = 400 + Math.random() * 200;
            osc.frequency.setValueAtTime(startFreq, t);
            osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, t + 0.08);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.1);
        } catch {
            // sessiz geç
        }
    }

    private playTargetChime(): void {
        if (this.soundMuted) return;
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const t = this.audioCtx.currentTime;
            // Pentatonik zengin akor: 523.25 (C5), 659.25 (E5), 783.99 (G5), 1046.50 (C6)
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((freq, idx) => {
                const osc = this.audioCtx!.createOscillator();
                const gain = this.audioCtx!.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + idx * 0.06);

                const startTime = t + idx * 0.06;
                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.09, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

                osc.connect(gain);
                gain.connect(this.audioCtx!.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.5);
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
        this.toySprites.clear();
        this.treasureBadges.clear();
        this.bg = null;
        this.lilyPadSprite = null;
        this.toys = [];
        this.ripples = [];
        this.particles = [];
        this.flyingTreasures = [];
        this.activePointers.clear();
        if (this.audioCtx && this.audioCtx.state !== 'closed') {
            this.audioCtx.close().catch(() => {});
            this.audioCtx = null;
        }
    }

    public setPaused(paused: boolean): void {
        this.paused = paused;
    }

    public setMode(mode: 'free' | 'target'): void {
        this.mode = mode;
        if (mode === 'target') {
            this.pickNewTarget();
        } else {
            this.target = null;
        }
    }

    public pickNewTarget(): void {
        if (this.W <= 0 || this.H <= 0) return;
        this.target = createRandomTarget(this.W, this.H, TOY_DEFINITIONS, this.target?.targetToyId);
        const nextDef = this.getTargetToy();
        if (nextDef) {
            this.opts.onTargetChanged?.(nextDef);
        }
    }

    public getTargetToy(): FloatingToyDef | null {
        if (!this.target) return null;
        return TOY_DEFINITIONS.find((t) => t.id === this.target?.targetToyId) ?? null;
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
        this.bg = createPoolBackground(width, height, this.dpr);
        this.lilyPadSprite = createLilyPadSprite(58, this.dpr);

        this.toySprites.clear();
        for (const def of TOY_DEFINITIONS) {
            this.toySprites.set(def.id, createToySprite(def, this.dpr));
        }

        // İlk kurulumda oyuncak durumlarını üret
        if (first || this.toys.length === 0) {
            this.toys = createInitialToyStates(width, height);
            if (this.mode === 'target') {
                this.pickNewTarget();
            }
        } else {
            // Ekran boyutu değiştiğinde oyuncakları sınırların içine taşı
            this.toys = this.toys.map((t) => ({
                ...t,
                x: clamp(t.x, 60, width - 60),
                y: clamp(t.y, 80, height - 80),
            }));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Pointer / Dokunma Etkileşimleri
    // ─────────────────────────────────────────────────────────────

    public pointerDown(id: number, x: number, y: number): void {
        if (this.paused) return;
        this.initAudio();

        // Tıklanan bir oyuncak var mı kontrol et
        const hitToy = hitTestToy(x, y, this.toys);

        if (hitToy) {
            // Oyuncağı yakala
            this.toys = this.toys.map((t) =>
                t.id === hitToy.id ? { ...t, isGrabbed: true, vx: 0, vy: 0 } : t
            );

            this.activePointers.set(id, {
                id,
                startX: x,
                startY: y,
                lastX: x,
                lastY: y,
                currentX: x,
                currentY: y,
                draggedToyId: hitToy.id,
                lastTime: performance.now(),
            });

            const def = TOY_DEFINITIONS.find((d) => d.id === hitToy.id);
            this.opts.onSplash?.(def ?? null);
            this.playSplashSound(1.1);
            this.createWaterSplash(x, y, 14, 45);
        } else {
            // Su yüzeyine dokunuldu: dalga oluştur
            this.activePointers.set(id, {
                id,
                startX: x,
                startY: y,
                lastX: x,
                lastY: y,
                currentX: x,
                currentY: y,
                draggedToyId: null,
                lastTime: performance.now(),
            });

            this.createRipple(x, y, 0.9, 90);
            this.playSplashSound(0.9);
            this.opts.onSplash?.(null);
        }
    }

    public pointerMove(id: number, x: number, y: number): void {
        const ptr = this.activePointers.get(id);
        if (!ptr) return;

        const now = performance.now();
        const dt = Math.max(0.001, (now - ptr.lastTime) / 1000);
        const vx = (x - ptr.lastX) / dt;
        const vy = (y - ptr.lastY) / dt;

        ptr.lastX = ptr.currentX;
        ptr.lastY = ptr.currentY;
        ptr.currentX = x;
        ptr.currentY = y;
        ptr.lastTime = now;

        if (ptr.draggedToyId) {
            // Sürüklenen oyuncağı konuma taşı
            this.toys = this.toys.map((t) => {
                if (t.id !== ptr.draggedToyId) return t;

                // Hareket yönüne göre hafif rotasyon eğimi
                const targetRot = clamp(vx * 0.0015, -0.35, 0.35);
                return {
                    ...t,
                    x,
                    y,
                    vx: vx * 0.75, // Fırlatma için anlık hızı kaydet
                    vy: vy * 0.75,
                    rotation: t.rotation * 0.7 + targetRot * 0.3,
                };
            });

            // Hareket ederken su izi dalgaları bırak
            const dist = Math.hypot(x - ptr.lastX, y - ptr.lastY);
            if (dist > 16) {
                this.createRipple(x, y, 0.45, 55);
            }
        } else {
            // Parmak su üzerinde gezdiriliyor: dalga izi üret
            const dist = Math.hypot(x - ptr.lastX, y - ptr.lastY);
            if (dist > 22) {
                this.createRipple(x, y, 0.6, 75);
                if (Math.random() < 0.25) {
                    this.playBubbleSound();
                }
            }
        }
    }

    public pointerUp(id: number): void {
        const ptr = this.activePointers.get(id);
        if (!ptr) return;

        if (ptr.draggedToyId) {
            // Oyuncağı bırak ve fırlatma hızını aktar
            this.toys = this.toys.map((t) => {
                if (t.id !== ptr.draggedToyId) return t;
                return {
                    ...t,
                    isGrabbed: false,
                    angularVelocity: (Math.random() - 0.5) * 1.5,
                };
            });

            // Hedef veya serbest mod etkileşimi
            if (this.mode === 'target') {
                this.checkToyArrival(ptr.draggedToyId);
            } else {
                this.freeInteractions += 1;
                if (this.freeInteractions >= 5) {
                    this.freeInteractions = 0;
                    this.triggerFreeTreasureDiscovery(ptr.currentX, ptr.currentY, ptr.draggedToyId);
                }
            }
            this.playSplashSound(1.0);
            this.createWaterSplash(ptr.currentX, ptr.currentY, 12, 40);
        }

        this.activePointers.delete(id);
    }

    public pointerCancel(id: number): void {
        this.pointerUp(id);
    }

    // ─────────────────────────────────────────────────────────────
    // Dalgalar, Sıçramalar ve Hedef Denetimi
    // ─────────────────────────────────────────────────────────────

    private createRipple(x: number, y: number, strength: number, maxRadius: number): void {
        const life = 1.6;
        this.ripples.push({
            id: ++this.rippleIdCounter,
            x,
            y,
            radius: 8,
            maxRadius,
            strength,
            life,
            maxLife: life,
        });

        // En fazla 24 eşzamanlı dalga (bellek koruması)
        if (this.ripples.length > 24) {
            this.ripples.shift();
        }
    }

    private createWaterSplash(x: number, y: number, count: number, speed: number): void {
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
                radius: 2.5 + Math.random() * 3,
                life: 0,
                maxLife: 0.45 + Math.random() * 0.3,
                color: i % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(186,230,253,0.75)',
            });
        }
    }

    private checkToyArrival(toyId: string): void {
        if (this.mode !== 'target' || !this.target || this.target.reached) return;
        if (this.target.targetToyId !== toyId) return;

        const toy = this.toys.find((t) => t.id === toyId);
        if (!toy) return;

        if (isToyAtTarget(toy, this.target, this.W, this.H)) {
            this.onTargetSuccess(toy);
        }
    }

    private triggerFreeTreasureDiscovery(x: number, y: number, toyId: string): void {
        const collected = this.opts.getCollected();
        const uncollected = WATER_TREASURES.filter((t) => !collected.includes(t.id));
        if (uncollected.length === 0) return;

        const def = TOY_DEFINITIONS.find((d) => d.id === toyId) ?? TOY_DEFINITIONS[0];
        const treasure = uncollected.find((t) => t.id === def.id) ?? uncollected[0];

        this.playTargetChime();
        this.createWaterSplash(x, y, 18, 55);

        this.flyingTreasures.push({
            sx: x,
            sy: y,
            t: 0,
            duration: this.opts.reduceMotion ? 0.6 : 1.1,
            treasure,
        });

        this.opts.onTargetReached?.(def, treasure);
    }

    private onTargetSuccess(toy: WaterToyState): void {
        if (!this.target || this.target.reached) return;
        this.target.reached = true;

        const def = TOY_DEFINITIONS.find((d) => d.id === toy.id) ?? TOY_DEFINITIONS[0];
        // Henüz toplanmamış deniz hazinelerini önceliklendir (starfish, pearl, clownfish vb. dahil)
        const collected = this.opts.getCollected();
        const uncollected = WATER_TREASURES.filter((t) => !collected.includes(t.id));
        const treasure = uncollected.length > 0
            ? (uncollected.find((t) => t.id === def.id) ?? uncollected[0])
            : (WATER_TREASURES.find((t) => t.id === def.id) ?? WATER_TREASURES[0]);

        this.playTargetChime();
        this.createWaterSplash(toy.x, toy.y, 22, 70);

        // Uçan hazine animasyonunu başlat
        this.flyingTreasures.push({
            sx: toy.x,
            sy: toy.y,
            t: 0,
            duration: this.opts.reduceMotion ? 0.6 : 1.1,
            treasure,
        });

        this.opts.onTargetReached?.(def, treasure);

        // Yeni hedef için kısa sakinleştirici bekleme
        setTimeout(() => {
            if (this.mode === 'target' && this.running) {
                this.pickNewTarget();
            }
        }, 1200);
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
        // 1. Saf fizik simülasyonu adımı
        const config: WaterSimulationConfig = {
            width: this.W,
            height: this.H,
            waterDamping: 0.975,
            rippleForce: 130,
            reduceMotion: this.opts.reduceMotion,
        };

        const simResult = stepWaterSimulation(this.toys, this.ripples, config, dt);
        this.toys = simResult.toys;
        this.ripples = simResult.ripples;

        // Hedef modunda sürüklenmeden de nilüfere çarparsa algıla
        if (this.mode === 'target' && this.target && !this.target.reached) {
            for (const toy of this.toys) {
                if (toy.id === this.target.targetToyId && isToyAtTarget(toy, this.target, this.W, this.H)) {
                    this.onTargetSuccess(toy);
                    break;
                }
            }
        }

        // 2. Su damlacığı parçacıkları
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += dt;
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
                continue;
            }
            p.vy += 110 * dt; // yerçekimi
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        // 3. Uçan hazineler
        for (let i = this.flyingTreasures.length - 1; i >= 0; i--) {
            const f = this.flyingTreasures[i];
            f.t += dt;
            if (f.t >= f.duration) {
                this.flyingTreasures.splice(i, 1);
                this.opts.onTreasureLand?.(f.treasure);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Çizim (Render)
    // ─────────────────────────────────────────────────────────────

    private render(): void {
        const { ctx, W, H } = this;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        // 1. Havuz Arka Planı
        if (this.bg) {
            ctx.drawImage(this.bg.canvas, 0, 0, W, H);
        }

        // 2. Hedef Nilüfer Çiçeği (Varsa)
        if (this.target && this.lilyPadSprite) {
            const tx = this.target.x * W;
            const ty = this.target.y * H;
            const size = this.lilyPadSprite.size;

            ctx.save();
            ctx.translate(tx, ty);

            // Hafif salınım
            if (!this.opts.reduceMotion) {
                const padSway = Math.sin(performance.now() * 0.002) * 0.05;
                ctx.rotate(padSway);
            }

            ctx.drawImage(this.lilyPadSprite.canvas, -size / 2, -size / 2, size, size);

            // Hedeflenen oyuncağın küçük rehber ikonu
            const targetDef = TOY_DEFINITIONS.find((d) => d.id === this.target?.targetToyId);
            if (targetDef) {
                ctx.font = '24px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(targetDef.emoji, 0, 1);
            }
            ctx.restore();
        }

        // 3. Su Dalgaları (Ripples)
        for (const rip of this.ripples) {
            const alpha = rip.strength * 0.65;
            if (alpha <= 0.01) continue;

            ctx.save();
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.lineWidth = Math.max(1.5, 3.5 * rip.strength);
            ctx.stroke();

            // İkincil yumuşak iç halka
            if (rip.radius > 16) {
                ctx.beginPath();
                ctx.arc(rip.x, rip.y, rip.radius * 0.65, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(186, 230, 253, ${(alpha * 0.45).toFixed(3)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();
        }

        // 4. Yüzen Oyuncaklar
        for (const toy of this.toys) {
            const sprite = this.toySprites.get(toy.id);
            if (!sprite) continue;

            const bobOffset = Math.sin(toy.bobPhase) * (this.opts.reduceMotion ? 2 : 5);

            ctx.save();
            ctx.translate(toy.x, toy.y + bobOffset);
            ctx.rotate(toy.rotation);

            if (toy.isGrabbed) {
                ctx.scale(1.12, 1.12);
            }

            ctx.drawImage(sprite.canvas, -sprite.cx, -sprite.cy, sprite.size, sprite.size);
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

        // 6. Uçan Hazineler (Koleksiyon Defterine Yumuşak Bézier Hareketi)
        if (this.flyingTreasures.length > 0) {
            const bookTarget = this.opts.getBookTarget();
            for (const f of this.flyingTreasures) {
                let badge = this.treasureBadges.get(f.treasure.id);
                if (!badge) {
                    badge = createTreasureBadge(f.treasure, this.dpr);
                    this.treasureBadges.set(f.treasure.id, badge);
                }

                const size = badge.width / this.dpr;
                const p = f.t / f.duration;

                let x: number;
                let y: number;
                let scale: number;

                if (p < 0.25) {
                    x = f.sx;
                    y = f.sy;
                    scale = 0.4 + (p / 0.25) * 0.8;
                } else {
                    const q = easeInOut((p - 0.25) / 0.75);
                    const cx = (f.sx + bookTarget.x) / 2;
                    const cy = Math.min(f.sy, bookTarget.y) - 80;
                    const u = 1 - q;
                    x = u * u * f.sx + 2 * u * q * cx + q * q * bookTarget.x;
                    y = u * u * f.sy + 2 * u * q * cy + q * q * bookTarget.y;
                    scale = 1.2 - 0.65 * q;
                }

                ctx.save();
                ctx.globalAlpha = p > 0.9 ? (1 - p) / 0.1 : 1;
                ctx.drawImage(badge, x - (size * scale) / 2, y - (size * scale) / 2, size * scale, size * scale);
                ctx.restore();
            }
        }
    }
}
