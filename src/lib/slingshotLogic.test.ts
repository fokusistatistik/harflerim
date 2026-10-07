import { describe, it, expect } from 'vitest';
import {
    SLINGSHOT_FRUITS,
    calculatePullVector,
    calculateTrajectoryPoints,
    checkBasketCatch,
    stepFlyingFruit,
    type SlingshotOrigin,
    type BasketTarget,
    type FlyingFruitState,
    type SlingshotSimulationConfig,
} from './slingshotLogic';
import {
    ORCHARD_FRUITS,
    loadOrchardCollection,
    saveOrchardCollection,
    addOrchardFruit,
} from './slingshotCollection';

describe('slingshotLogic — Sapan Fiziği ve Kurallar', () => {
    it('meyve tanımları benzersiz id ve geçerli parametrelere sahiptir', () => {
        expect(SLINGSHOT_FRUITS.length).toBeGreaterThanOrEqual(5);
        const ids = new Set(SLINGSHOT_FRUITS.map((f) => f.id));
        expect(ids.size).toBe(SLINGSHOT_FRUITS.length);
    });

    it('calculatePullVector mesafeyi maxPull ile sınırlar', () => {
        const origin: SlingshotOrigin = { x: 100, y: 100 };

        // Kısa çekme (mesafe 50 <= 100)
        const pull1 = calculatePullVector(origin, 60, 100, 100);
        expect(pull1.pullDistance).toBeCloseTo(40);
        expect(pull1.clampedX).toBe(60);

        // Aşırı çekme (mesafe 150 > 100)
        const pull2 = calculatePullVector(origin, -50, 100, 100);
        expect(pull2.pullDistance).toBe(100);
        expect(pull2.clampedX).toBe(0); // 100 - 100 = 0
    });

    it('calculateTrajectoryPoints yerçekimi eğrisini hesaplar', () => {
        const points = calculateTrajectoryPoints(100, 100, 10, -5, 0.5, 5, 0.05);
        expect(points.length).toBe(5);
        // X ileri gitmeli
        expect(points[4].x).toBeGreaterThan(points[0].x);
    });

    it('checkBasketCatch tolerans alanı içinde true döner', () => {
        const basketX = 500;
        const basketY = 300;
        const basketW = 80;
        const basketH = 60;
        const tolerance = 20;

        // Tam merkez
        expect(checkBasketCatch(500, 300, basketX, basketY, basketW, basketH, tolerance)).toBe(true);
        // Kenar sınırında
        expect(checkBasketCatch(500 + 40 + 10, 300, basketX, basketY, basketW, basketH, tolerance)).toBe(true);
        // Çok uzakta
        expect(checkBasketCatch(500 + 100, 300, basketX, basketY, basketW, basketH, tolerance)).toBe(false);
    });

    it('stepFlyingFruit sepete girince caught = true döner', () => {
        const basket: BasketTarget = { x: 0.75, y: 0.5, width: 90, height: 70, bobPhase: 0 };
        const config: SlingshotSimulationConfig = {
            width: 800,
            height: 600,
            gravity: 0.5,
            maxPull: 100,
            powerMultiplier: 0.35,
            reduceMotion: false,
        };

        const fruit: FlyingFruitState = {
            x: 600, // 800 * 0.75 = 600
            y: 300, // 600 * 0.5 = 300
            vx: 5,
            vy: 2,
            rotation: 0,
            angularVelocity: 0,
            fruit: SLINGSHOT_FRUITS[0],
            isFlying: true,
            landedInBasket: false,
        };

        const result = stepFlyingFruit(fruit, basket, config, 0.016);
        expect(result.caught).toBe(true);
        expect(result.nextFruit.landedInBasket).toBe(true);
    });

    it('stepFlyingFruit yere düşünce groundHit = true döner', () => {
        const basket: BasketTarget = { x: 0.75, y: 0.5, width: 90, height: 70, bobPhase: 0 };
        const config: SlingshotSimulationConfig = {
            width: 800,
            height: 600,
            gravity: 0.5,
            maxPull: 100,
            powerMultiplier: 0.35,
            reduceMotion: false,
        };

        const fruit: FlyingFruitState = {
            x: 300,
            y: 540, // 600 * 0.88 = 528px (zemine ulaştı)
            vx: 5,
            vy: 10,
            rotation: 0,
            angularVelocity: 0,
            fruit: SLINGSHOT_FRUITS[0],
            isFlying: true,
            landedInBasket: false,
        };

        const result = stepFlyingFruit(fruit, basket, config, 0.05);
        expect(result.groundHit).toBe(true);
        expect(result.nextFruit.isFlying).toBe(false);
    });
});

describe('slingshotCollection — Meyve Bahçesi Defteri', () => {
    const memory = (init?: string) => {
        let v = init ?? null;
        return {
            getItem: () => v,
            setItem: (_k: string, val: string) => {
                v = val;
            },
        };
    };

    it('8 adet meyve tanımlıdır', () => {
        expect(ORCHARD_FRUITS.length).toBe(8);
        const ids = new Set(ORCHARD_FRUITS.map((f) => f.id));
        expect(ids.size).toBe(8);
    });

    it('boş ya da bozuk veride patlamaz ve boş liste döner', () => {
        expect(loadOrchardCollection(null)).toEqual([]);
        expect(loadOrchardCollection(memory())).toEqual([]);
        expect(loadOrchardCollection(memory('invalid json'))).toEqual([]);
    });

    it('meyve ekleme ve tamamlama testi', () => {
        const r1 = addOrchardFruit([], 'elma');
        expect(r1.isNew).toBe(true);
        expect(r1.next).toEqual(['elma']);
        expect(r1.isComplete).toBe(false);

        // Tekrar ekleme
        const r2 = addOrchardFruit(['elma'], 'elma');
        expect(r2.isNew).toBe(false);

        // Tamamlanma
        const allIds = ORCHARD_FRUITS.map((f) => f.id);
        const almostAll = allIds.slice(0, 7);
        const r3 = addOrchardFruit(almostAll, allIds[7]);
        expect(r3.isComplete).toBe(true);
    });
});
