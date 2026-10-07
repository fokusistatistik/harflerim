/**
 * Zıp Zıp Kurbağa (Pilot v2) — Saf Oyun Mantığı ve Fizik.
 *
 * Bilerek React/DOM/Canvas bağımsızdır: hem Vitest ile birim test edilebilir
 * hem de motor (`frogEngine.ts`) ile arayüz (`FrogJumpGame.tsx`) arasındaki
 * tek ortak sözleşmedir.
 */

export type FrogState = 'idle' | 'jumping' | 'landed' | 'missed';

export interface LilyPadState {
    x: number; // 0..1 normalize edilmiş X konumu
    y: number; // 0..1 normalize edilmiş Y konumu
    radius: number; // px
    vx: number; // px/s veya normalize hız
    minX: number;
    maxX: number;
    direction: 1 | -1;
}

export interface FrogPhysicalState {
    state: FrogState;
    jumpProgress: number; // 0..1
    jumpDuration: number; // sn (genellikle 0.65s)
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    currentX: number;
    currentY: number;
    scale: number;
    rotation: number;
    cooldown: number; // İniş sonrası bekleme süresi
}

export interface FrogSimulationConfig {
    width: number;
    height: number;
    padSpeed: number;
    reduceMotion: boolean;
}

/**
 * Başlangıç kurbağa durumunu üretir.
 */
export function createInitialFrogState(width: number, height: number): FrogPhysicalState {
    const startX = width / 2;
    const startY = height * 0.82; // Alt kıyıda hazır
    return {
        state: 'idle',
        jumpProgress: 0,
        jumpDuration: 0.65,
        startX,
        startY,
        targetX: startX,
        targetY: height * 0.42,
        currentX: startX,
        currentY: startY,
        scale: 1,
        rotation: 0,
        cooldown: 0,
    };
}

/**
 * Başlangıç nilüfer yaprağı durumunu üretir.
 */
export function createInitialPadState(width: number, height: number): LilyPadState {
    return {
        x: 0.5,
        y: 0.42,
        radius: Math.max(55, Math.min(width * 0.16, 85)),
        vx: 120, // px/s
        minX: 0.15,
        maxX: 0.85,
        direction: 1,
    };
}

/**
 * Parabolik zıplama yüksekliğini hesaplar: y(t) = -4 * maxArc * t * (1 - t)
 */
export function calculateJumpArc(progress: number, maxArc = 140): number {
    const t = Math.max(0, Math.min(1, progress));
    return -4 * maxArc * t * (1 - t);
}

/**
 * İniş denetimi (Hit test): Kurbağanın hedef noktası ile nilüfer yaprağının konumu arasındaki mesafe.
 * Otizm ve motor beceri dostu: Cömert pay (padding) içerir.
 */
export function checkFrogLanding(
    frogX: number,
    padPxX: number,
    padRadius: number,
    tolerance = 50
): boolean {
    const dist = Math.abs(frogX - padPxX);
    return dist <= padRadius + tolerance;
}

/**
 * Nilüfer yaprağını nehirde yumuşakça hareket ettirir.
 */
export function stepLilyPad(
    pad: LilyPadState,
    config: FrogSimulationConfig,
    dt: number
): LilyPadState {
    if (config.reduceMotion) {
        // Hareketi azalt modunda yaprak çok daha yavaş ve yumuşak salınır
        dt *= 0.5;
    }

    const span = pad.maxX - pad.minX;
    const normSpeed = (pad.vx / Math.max(1, config.width)) * pad.direction;
    let nextX = pad.x + normSpeed * dt;
    let nextDir = pad.direction;

    if (nextX >= pad.maxX) {
        nextX = pad.maxX;
        nextDir = -1;
    } else if (nextX <= pad.minX) {
        nextX = pad.minX;
        nextDir = 1;
    }

    return {
        ...pad,
        x: nextX,
        direction: nextDir,
    };
}

/**
 * Kurbağa durumunu bir kare ilerletir.
 */
export function stepFrogState(
    frog: FrogPhysicalState,
    pad: LilyPadState,
    config: FrogSimulationConfig,
    dt: number
): { frog: FrogPhysicalState; landedEvent: boolean; missedEvent: boolean } {
    let landedEvent = false;
    let missedEvent = false;

    if (frog.state === 'idle') {
        return { frog, landedEvent, missedEvent };
    }

    if (frog.state === 'jumping') {
        const nextProgress = frog.jumpProgress + dt / frog.jumpDuration;

        if (nextProgress >= 1) {
            // İniş anı!
            const padPxX = pad.x * config.width;
            const isHit = checkFrogLanding(frog.targetX, padPxX, pad.radius, 50);

            if (isHit) {
                landedEvent = true;
                return {
                    frog: {
                        ...frog,
                        state: 'landed',
                        jumpProgress: 1,
                        currentX: padPxX,
                        currentY: frog.targetY,
                        scale: 1.15,
                        rotation: 0,
                        cooldown: 1.2, // 1.2 sn başarı pozu
                    },
                    landedEvent,
                    missedEvent,
                };
            } else {
                missedEvent = true;
                return {
                    frog: {
                        ...frog,
                        state: 'missed',
                        jumpProgress: 1,
                        currentX: frog.targetX,
                        currentY: frog.targetY + 20, // Kıyı yosununa tutunur
                        scale: 0.95,
                        rotation: -0.15,
                        cooldown: 1.4, // 1.4 sn sonra tekrar kıyıya döner
                    },
                    landedEvent,
                    missedEvent,
                };
            }
        }

        // Zıplama devam ediyor: X doğrusal, Y parabolik
        const t = nextProgress;
        const currentX = frog.startX + (frog.targetX - frog.startX) * t;
        const baseY = frog.startY + (frog.targetY - frog.startY) * t;
        const arcY = calculateJumpArc(t, config.reduceMotion ? 90 : 160);

        return {
            frog: {
                ...frog,
                jumpProgress: nextProgress,
                currentX,
                currentY: baseY + arcY,
                scale: 1 + Math.sin(t * Math.PI) * 0.25, // Havada hafif büyüme
                rotation: Math.sin(t * Math.PI) * 0.1,
            },
            landedEvent,
            missedEvent,
        };
    }

    // Landed veya Missed durumunda cooldown geri sayımı
    if (frog.cooldown > 0) {
        const nextCooldown = frog.cooldown - dt;
        if (nextCooldown <= 0) {
            // Başlangıç kıyısına yumuşak dönüş
            return {
                frog: {
                    ...frog,
                    state: 'idle',
                    jumpProgress: 0,
                    currentX: frog.startX,
                    currentY: frog.startY,
                    scale: 1,
                    rotation: 0,
                    cooldown: 0,
                },
                landedEvent,
                missedEvent,
            };
        }

        return {
            frog: {
                ...frog,
                cooldown: nextCooldown,
                scale: frog.state === 'landed' ? 1 + Math.sin(nextCooldown * 6) * 0.05 : 1,
            },
            landedEvent,
            missedEvent,
        };
    }

    return { frog, landedEvent, missedEvent };
}
