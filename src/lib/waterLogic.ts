/**
 * Neşeli Havuz (v2) — Saf oyun mantığı ve su fiziği.
 *
 * Bilerek React/DOM/Canvas bağımsızdır: hem Vitest ile birim test edilebilir
 * hem de motor (`waterEngine.ts`) ile arayüz (`WaterPoolGame.tsx`) arasındaki
 * tek ortak sözleşmedir.
 */

export interface FloatingToyDef {
    id: string;
    name: string;
    emoji: string;
    color: string;
    radius: number; // css px cinsinden taban yarıçap
    weight: number; // 0.8 - 1.5 arası (ağır nesneler daha yavaş sürüklenir)
}

export const TOY_DEFINITIONS: readonly FloatingToyDef[] = [
    { id: 'duck', name: 'Sarı Ördek', emoji: '🦆', color: '#FBBF24', radius: 42, weight: 0.9 },
    { id: 'dolphin', name: 'Sevimli Yunus', emoji: '🐬', color: '#60A5FA', radius: 46, weight: 1.1 },
    { id: 'boat', name: 'Küçük Yelkenli', emoji: '⛵', color: '#F87171', radius: 44, weight: 1.2 },
    { id: 'ball', name: 'Deniz Topu', emoji: '🏐', color: '#C084FC', radius: 38, weight: 0.8 },
    { id: 'turtle', name: 'Deniz Kaplumbağası', emoji: '🐢', color: '#34D399', radius: 42, weight: 1.0 },
] as const;

export interface TargetBuoy {
    id: string;
    name: string;
    x: number; // 0..1 normalize koordinat
    y: number; // 0..1 normalize koordinat
    radius: number; // px
    targetToyId: string; // Hangi oyuncağın gelmesi gerektiği
    reached: boolean;
}

export interface WaterToyState {
    id: string;
    x: number; // piksel koordinatı
    y: number; // piksel koordinatı
    vx: number; // px/s
    vy: number; // px/s
    rotation: number; // radyan
    angularVelocity: number; // rad/s
    bobPhase: number; // su üstünde inip çıkma fazı
    isGrabbed: boolean;
}

export interface WaterRipple {
    id: number;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    strength: number; // 0..1
    life: number; // kalan süre (sn)
    maxLife: number;
}

export interface WaterSimulationConfig {
    width: number;
    height: number;
    waterDamping: number; // sürtünme katsayısı (0.96 - 0.98)
    rippleForce: number; // dalgaların oyuncakları itme gücü
    reduceMotion: boolean;
}

/**
 * Başlangıç oyuncak durumlarını üretir.
 */
export function createInitialToyStates(
    width: number,
    height: number,
    defs = TOY_DEFINITIONS
): WaterToyState[] {
    const margin = 80;
    const availableW = Math.max(100, width - margin * 2);
    const availableH = Math.max(100, height - margin * 2);

    return defs.map((def, index) => {
        const stepX = (availableW / (defs.length + 1)) * (index + 1) + margin;
        const stepY = (availableH / 2) + Math.sin(index * 1.5) * (availableH * 0.25) + margin;

        return {
            id: def.id,
            x: stepX,
            y: stepY,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            rotation: (Math.random() - 0.5) * 0.2,
            angularVelocity: 0,
            bobPhase: index * (Math.PI / 2.5),
            isGrabbed: false,
        };
    });
}

/**
 * Yeni bir hedef şamandırası / nilüfer oluşturur.
 */
export function createRandomTarget(
    width: number,
    height: number,
    availableToys = TOY_DEFINITIONS,
    currentToyId?: string
): TargetBuoy {
    // Mevcut oyuncaktan farklı bir hedef seçmeye çalış
    const pool = availableToys.filter((t) => t.id !== currentToyId);
    const selectedToy = pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : availableToys[Math.floor(Math.random() * availableToys.length)];

    // Şamandırayı kenarlara çok yakın olmayan güvenli bir konuma yerleştir
    const padX = width * 0.2;
    const padY = height * 0.2;
    const normX = (padX + Math.random() * (width - padX * 2)) / width;
    const normY = (padY + Math.random() * (height - padY * 2)) / height;

    return {
        id: `target-${Date.now()}`,
        name: selectedToy.name,
        x: normX,
        y: normY,
        radius: 65,
        targetToyId: selectedToy.id,
        reached: false,
    };
}

/**
 * Dokunma noktasına göre hangi oyuncağa tıklandığını bulur.
 */
export function hitTestToy(
    clickX: number,
    clickY: number,
    toys: readonly WaterToyState[],
    defs = TOY_DEFINITIONS
): WaterToyState | null {
    // Son tıklanan üstte olsun diye tersten dolaş
    for (let i = toys.length - 1; i >= 0; i--) {
        const toy = toys[i];
        const def = defs.find((d) => d.id === toy.id);
        const radius = def?.radius ?? 40;
        const distSq = (toy.x - clickX) ** 2 + (toy.y - clickY) ** 2;
        if (distSq <= (radius * 1.2) ** 2) {
            return toy;
        }
    }
    return null;
}

/**
 * Bir oyuncağın hedef şamandıraya ulaşıp ulaşmadığını kontrol eder.
 */
export function isToyAtTarget(
    toy: WaterToyState,
    target: TargetBuoy | null,
    width: number,
    height: number,
    defs = TOY_DEFINITIONS
): boolean {
    if (!target || target.reached) return false;
    if (toy.id !== target.targetToyId) return false;

    const targetPxX = target.x * width;
    const targetPxY = target.y * height;
    const def = defs.find((d) => d.id === toy.id);
    const threshold = (target.radius + (def?.radius ?? 40)) * 0.65;

    const distSq = (toy.x - targetPxX) ** 2 + (toy.y - targetPxY) ** 2;
    return distSq <= threshold ** 2;
}

/**
 * Su dalgasının bir oyuncağı itme kuvvetini hesaplar.
 */
export function applyRippleForce(
    toy: WaterToyState,
    ripple: WaterRipple,
    dt: number,
    forceMultiplier = 120
): { vx: number; vy: number } {
    const dx = toy.x - ripple.x;
    const dy = toy.y - ripple.y;
    const dist = Math.hypot(dx, dy);

    // Dalga cephesinin oyuncağa olan mesafesi
    const waveDist = Math.abs(dist - ripple.radius);
    if (waveDist > 60 || dist < 1) {
        return { vx: 0, vy: 0 };
    }

    // Dalga gücüyle orantılı dışarı doğru itme
    const factor = (1 - waveDist / 60) * ripple.strength * (dt * forceMultiplier);
    const nx = dx / dist;
    const ny = dy / dist;

    return {
        vx: nx * factor,
        vy: ny * factor,
    };
}

/**
 * Fizik adımı (tek kare simülasyonu - saf fonksiyon).
 */
export function stepWaterSimulation(
    toys: readonly WaterToyState[],
    ripples: readonly WaterRipple[],
    config: WaterSimulationConfig,
    dt: number,
    defs = TOY_DEFINITIONS
): { toys: WaterToyState[]; ripples: WaterRipple[] } {
    const clampedDt = Math.min(dt, 0.05); // Sekme donmalarına karşı üst sınır

    // 1. Dalgaları ilerlet
    const nextRipples: WaterRipple[] = [];
    for (const r of ripples) {
        const nextLife = r.life - clampedDt;
        if (nextLife > 0) {
            const progress = 1 - nextLife / r.maxLife;
            nextRipples.push({
                ...r,
                life: nextLife,
                radius: r.maxRadius * progress,
                strength: (1 - progress) * (1 - progress), // kuadratik sönümlenme
            });
        }
    }

    // 2. Oyuncakları güncelle
    const nextToys = toys.map((toy) => {
        if (toy.isGrabbed) {
            return {
                ...toy,
                bobPhase: toy.bobPhase + clampedDt * 2,
            };
        }

        const def = defs.find((d) => d.id === toy.id);
        const radius = def?.radius ?? 40;
        const weight = def?.weight ?? 1.0;

        let vx = toy.vx;
        let vy = toy.vy;

        // Dalgalardan gelen itme kuvvetlerini topla
        for (const rip of ripples) {
            const f = applyRippleForce(toy, rip, clampedDt, (config.rippleForce / weight));
            vx += f.vx;
            vy += f.vy;
        }

        // Su sürtünmesi sönümlenmesi
        const damping = Math.pow(config.waterDamping, clampedDt * 60);
        vx *= damping;
        vy *= damping;

        // Çok küçük hızları durdur (titremeyi önler)
        if (Math.abs(vx) < 0.5) vx = 0;
        if (Math.abs(vy) < 0.5) vy = 0;

        let nextX = toy.x + vx * clampedDt;
        let nextY = toy.y + vy * clampedDt;
        let rot = toy.rotation;
        let angVel = toy.angularVelocity * damping;

        // Havuz kenarı yumuşak sekme
        const minX = radius + 10;
        const maxX = config.width - radius - 10;
        const minY = radius + 60; // Üst HUD payı
        const maxY = config.height - radius - 10;

        if (nextX < minX) {
            nextX = minX;
            vx = -vx * 0.6;
            angVel += (Math.random() - 0.5) * 2;
        } else if (nextX > maxX) {
            nextX = maxX;
            vx = -vx * 0.6;
            angVel += (Math.random() - 0.5) * 2;
        }

        if (nextY < minY) {
            nextY = minY;
            vy = -vy * 0.6;
            angVel += (Math.random() - 0.5) * 2;
        } else if (nextY > maxY) {
            nextY = maxY;
            vy = -vy * 0.6;
            angVel += (Math.random() - 0.5) * 2;
        }

        // Yumuşak dönüş
        rot += angVel * clampedDt;
        // Açıyı 0'a doğru sakinleştir
        rot *= Math.pow(0.95, clampedDt * 60);

        return {
            ...toy,
            x: nextX,
            y: nextY,
            vx,
            vy,
            rotation: rot,
            angularVelocity: angVel,
            bobPhase: toy.bobPhase + (config.reduceMotion ? clampedDt * 0.8 : clampedDt * 2.2),
        };
    });

    return {
        toys: nextToys,
        ripples: nextRipples,
    };
}
