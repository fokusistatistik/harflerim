/**
 * Renkli Sapan / Meyve Sepeti (Pilot v2) — Saf Oyun Mantığı ve Uçuş Fiziği.
 *
 * Bilerek React/DOM/Canvas bağımsızdır: hem Vitest ile birim test edilebilir
 * hem de motor (`slingshotEngine.ts`) ile arayüz (`SlingshotGame.tsx`) arasındaki
 * tek ortak sözleşmedir.
 */

export interface FruitDef {
    id: string;
    name: string;
    emoji: string;
    radius: number;
    color: string;
}

export const SLINGSHOT_FRUITS: readonly FruitDef[] = [
    { id: 'elma', name: 'Kırmızı Elma', emoji: '🍎', radius: 32, color: '#EF4444' },
    { id: 'armut', name: 'Yeşil Armut', emoji: '🍐', radius: 32, color: '#84CC16' },
    { id: 'portakal', name: 'Portakal', emoji: '🍊', radius: 32, color: '#F97316' },
    { id: 'muz', name: 'Muz', emoji: '🍌', radius: 30, color: '#FACC15' },
    { id: 'uzum', name: 'Mor Üzüm', emoji: '🍇', radius: 30, color: '#A855F7' },
    { id: 'cilek', name: 'Çilek', emoji: '🍓', radius: 28, color: '#FB7185' },
    { id: 'seftali', name: 'Şeftali', emoji: '🍑', radius: 32, color: '#F472B6' },
    { id: 'karpuz', name: 'Karpuz', emoji: '🍉', radius: 34, color: '#22C55E' },
] as const;

export interface SlingshotOrigin {
    x: number; // px
    y: number; // px
}

export interface BasketTarget {
    x: number; // 0..1 normalize edilmiş X
    y: number; // 0..1 normalize edilmiş Y
    width: number; // px
    height: number; // px
    bobPhase: number;
}

export interface FlyingFruitState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    angularVelocity: number;
    fruit: FruitDef;
    isFlying: boolean;
    landedInBasket: boolean;
}

export interface SlingshotSimulationConfig {
    width: number;
    height: number;
    gravity: number;
    maxPull: number;
    powerMultiplier: number;
    reduceMotion: boolean;
}

/**
 * Sapan gerilme mesafesini ve çekme vektörünü sınırlandırarak hesaplar.
 */
export function calculatePullVector(
    origin: SlingshotOrigin,
    touchX: number,
    touchY: number,
    maxPull = 100
): { pullX: number; pullY: number; pullDistance: number; clampedX: number; clampedY: number } {
    const dx = touchX - origin.x;
    const dy = touchY - origin.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxPull) {
        return {
            pullX: origin.x - touchX,
            pullY: origin.y - touchY,
            pullDistance: dist,
            clampedX: touchX,
            clampedY: touchY,
        };
    }

    const angle = Math.atan2(dy, dx);
    const clampedX = origin.x + Math.cos(angle) * maxPull;
    const clampedY = origin.y + Math.sin(angle) * maxPull;

    return {
        pullX: origin.x - clampedX,
        pullY: origin.y - clampedY,
        pullDistance: maxPull,
        clampedX,
        clampedY,
    };
}

/**
 * Çocuklar için yörünge öngörü noktaları üretir (Görsel Rehberlik).
 */
export function calculateTrajectoryPoints(
    startX: number,
    startY: number,
    initVx: number,
    initVy: number,
    gravity: number,
    stepCount = 12,
    stepDt = 0.045
): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    let curX = startX;
    let curY = startY;
    let curVx = initVx;
    let curVy = initVy;

    for (let i = 0; i < stepCount; i++) {
        curX += curVx * stepDt * 60;
        curY += curVy * stepDt * 60;
        curVy += gravity * stepDt * 60;
        points.push({ x: curX, y: curY });
    }

    return points;
}

/**
 * Meyvenin sepete girip girmediğini denetler (Cömert hedef alanı).
 */
export function checkBasketCatch(
    fruitX: number,
    fruitY: number,
    basketPxX: number,
    basketPxY: number,
    basketW: number,
    basketH: number,
    tolerance = 25
): boolean {
    const minX = basketPxX - basketW / 2 - tolerance;
    const maxX = basketPxX + basketW / 2 + tolerance;
    const minY = basketPxY - basketH / 2 - tolerance;
    const maxY = basketPxY + basketH / 2 + tolerance;

    return fruitX >= minX && fruitX <= maxX && fruitY >= minY && fruitY <= maxY;
}

/**
 * Uçuş fiziği adımı.
 */
export function stepFlyingFruit(
    fruit: FlyingFruitState,
    basket: BasketTarget,
    config: SlingshotSimulationConfig,
    dt: number
): { nextFruit: FlyingFruitState; caught: boolean; groundHit: boolean } {
    if (!fruit.isFlying) {
        return { nextFruit: fruit, caught: false, groundHit: false };
    }

    const clampedDt = Math.min(dt, 0.05);
    const basketPxX = basket.x * config.width;
    const basketPxY = basket.y * config.height;

    // 1. Sepet kontrolü
    if (checkBasketCatch(fruit.x, fruit.y, basketPxX, basketPxY, basket.width, basket.height)) {
        return {
            nextFruit: {
                ...fruit,
                isFlying: false,
                landedInBasket: true,
                x: basketPxX,
                y: basketPxY,
                vx: 0,
                vy: 0,
            },
            caught: true,
            groundHit: false,
        };
    }

    // 2. Hareket güncellemesi
    const nextVx = fruit.vx * 0.995; // Hafif hava direnci
    const nextVy = fruit.vy + config.gravity * clampedDt * 60;
    const nextX = fruit.x + nextVx * clampedDt * 60;
    const nextY = fruit.y + nextVy * clampedDt * 60;
    const nextRot = fruit.rotation + fruit.angularVelocity * clampedDt;

    // 3. Ekran dışı veya çimene düşüş (yumuşak iniş)
    const groundY = config.height * 0.88;
    if (nextY >= groundY || nextX > config.width + 80 || nextX < -80) {
        return {
            nextFruit: {
                ...fruit,
                isFlying: false,
                landedInBasket: false,
                y: groundY,
                vx: 0,
                vy: 0,
            },
            caught: false,
            groundHit: true,
        };
    }

    return {
        nextFruit: {
            ...fruit,
            x: nextX,
            y: nextY,
            vx: nextVx,
            vy: nextVy,
            rotation: nextRot,
        },
        caught: false,
        groundHit: false,
    };
}
