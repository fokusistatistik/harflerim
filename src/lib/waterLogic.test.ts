import { describe, it, expect } from 'vitest';
import {
    TOY_DEFINITIONS,
    createInitialToyStates,
    createRandomTarget,
    hitTestToy,
    isToyAtTarget,
    applyRippleForce,
    stepWaterSimulation,
    type WaterToyState,
    type WaterRipple,
    type WaterSimulationConfig,
    type TargetBuoy,
} from './waterLogic';
import {
    WATER_TREASURES,
    WATER_COLLECTION_STORAGE_KEY,
    loadWaterCollection,
    saveWaterCollection,
    addWaterTreasure,
} from './waterCollection';

describe('waterLogic — Oyuncaklar ve Kurallar', () => {
    it('tüm oyuncak tanımları benzersiz id ve geçerli parametrelere sahiptir', () => {
        expect(TOY_DEFINITIONS.length).toBe(5);
        const ids = new Set(TOY_DEFINITIONS.map((t) => t.id));
        expect(ids.size).toBe(5);

        for (const toy of TOY_DEFINITIONS) {
            expect(toy.radius).toBeGreaterThan(20);
            expect(toy.weight).toBeGreaterThan(0.5);
            expect(toy.emoji).toBeTruthy();
            expect(toy.name).toBeTruthy();
        }
    });

    it('createInitialToyStates ekran sınırları içinde oyuncak konumları üretir', () => {
        const states = createInitialToyStates(800, 600);
        expect(states.length).toBe(5);

        for (const s of states) {
            expect(s.x).toBeGreaterThan(0);
            expect(s.x).toBeLessThan(800);
            expect(s.y).toBeGreaterThan(0);
            expect(s.y).toBeLessThan(600);
            expect(s.isGrabbed).toBe(false);
        }
    });

    it('createRandomTarget geçerli bir hedef şamandırası üretir', () => {
        const target = createRandomTarget(800, 600, TOY_DEFINITIONS, 'duck');
        expect(target.targetToyId).toBeTruthy();
        expect(target.reached).toBe(false);
        expect(target.x).toBeGreaterThan(0);
        expect(target.x).toBeLessThan(1);
        expect(target.y).toBeGreaterThan(0);
        expect(target.y).toBeLessThan(1);
        // Önceki hedeften farklı bir oyuncak seçilmesini tercih eder
        expect(target.targetToyId).not.toBe('duck');
    });

    it('hitTestToy oyuncak yarıçapı içine tıklandığında oyuncağı bulur', () => {
        const toys: WaterToyState[] = [
            { id: 'duck', x: 200, y: 200, vx: 0, vy: 0, rotation: 0, angularVelocity: 0, bobPhase: 0, isGrabbed: false },
            { id: 'dolphin', x: 400, y: 300, vx: 0, vy: 0, rotation: 0, angularVelocity: 0, bobPhase: 0, isGrabbed: false },
        ];

        // Ördeğin tam üstü
        const hit1 = hitTestToy(205, 198, toys);
        expect(hit1?.id).toBe('duck');

        // Yunusun tam üstü
        const hit2 = hitTestToy(395, 302, toys);
        expect(hit2?.id).toBe('dolphin');

        // Boş su alanı
        const miss = hitTestToy(50, 50, toys);
        expect(miss).toBeNull();
    });

    it('isToyAtTarget doğru oyuncak nilüfere yaklaştığında true döner', () => {
        const target: TargetBuoy = {
            id: 't-1',
            name: 'Sarı Ördek',
            x: 0.5, // 800 * 0.5 = 400px
            y: 0.5, // 600 * 0.5 = 300px
            radius: 65,
            targetToyId: 'duck',
            reached: false,
        };

        const matchingToyNear: WaterToyState = {
            id: 'duck',
            x: 410,
            y: 305,
            vx: 0,
            vy: 0,
            rotation: 0,
            angularVelocity: 0,
            bobPhase: 0,
            isGrabbed: false,
        };

        const matchingToyFar: WaterToyState = {
            id: 'duck',
            x: 100,
            y: 100,
            vx: 0,
            vy: 0,
            rotation: 0,
            angularVelocity: 0,
            bobPhase: 0,
            isGrabbed: false,
        };

        const wrongToyNear: WaterToyState = {
            id: 'dolphin',
            x: 410,
            y: 305,
            vx: 0,
            vy: 0,
            rotation: 0,
            angularVelocity: 0,
            bobPhase: 0,
            isGrabbed: false,
        };

        expect(isToyAtTarget(matchingToyNear, target, 800, 600)).toBe(true);
        expect(isToyAtTarget(matchingToyFar, target, 800, 600)).toBe(false);
        expect(isToyAtTarget(wrongToyNear, target, 800, 600)).toBe(false);
    });

    it('applyRippleForce dalga cephesine yakın oyuncağı dışarı doğru iter', () => {
        const toy: WaterToyState = {
            id: 'duck',
            x: 150,
            y: 100,
            vx: 0,
            vy: 0,
            rotation: 0,
            angularVelocity: 0,
            bobPhase: 0,
            isGrabbed: false,
        };

        // Dalga merkezi (100, 100), dx = 50, dy = 0, dist = 50
        const ripple: WaterRipple = {
            id: 1,
            x: 100,
            y: 100,
            radius: 48, // dalga cephesine çok yakın (|50 - 48| = 2px)
            maxRadius: 100,
            strength: 0.8,
            life: 1,
            maxLife: 1.5,
        };

        const force = applyRippleForce(toy, ripple, 0.016, 120);
        // Sağa doğru itilmeli (vx > 0, vy ≈ 0)
        expect(force.vx).toBeGreaterThan(0);
        expect(Math.abs(force.vy)).toBeLessThan(0.001);
    });

    it('stepWaterSimulation havuz sınırlarından yumuşakça seker ve dalgaları sönümler', () => {
        const toys: WaterToyState[] = [
            {
                id: 'duck',
                x: 790, // Sağ duvara çarpmak üzere
                y: 300,
                vx: 100,
                vy: 0,
                rotation: 0,
                angularVelocity: 0,
                bobPhase: 0,
                isGrabbed: false,
            },
        ];

        const ripples: WaterRipple[] = [
            { id: 1, x: 200, y: 200, radius: 20, maxRadius: 100, strength: 0.5, life: 0.1, maxLife: 1.0 },
        ];

        const config: WaterSimulationConfig = {
            width: 800,
            height: 600,
            waterDamping: 0.98,
            rippleForce: 120,
            reduceMotion: false,
        };

        const next = stepWaterSimulation(toys, ripples, config, 0.05);
        // Hızı tersine dönmeli (sekme)
        expect(next.toys[0].vx).toBeLessThan(0);
        expect(next.toys[0].x).toBeLessThanOrEqual(800);
    });
});

describe('waterCollection — Deniz Hazine Defteri', () => {
    const createMemoryStorage = (initial?: string) => {
        let val = initial ?? null;
        return {
            getItem: () => val,
            setItem: (_k: string, v: string) => {
                val = v;
            },
        };
    };

    it('8 adet deniz hazinesi tanımlıdır', () => {
        expect(WATER_TREASURES.length).toBe(8);
        const ids = new Set(WATER_TREASURES.map((t) => t.id));
        expect(ids.size).toBe(8);
    });

    it('boş ya da bozuk veride patlamaz ve boş dizi döner', () => {
        expect(loadWaterCollection(null)).toEqual([]);
        expect(loadWaterCollection(createMemoryStorage(undefined))).toEqual([]);
        expect(loadWaterCollection(createMemoryStorage('bozuk json'))).toEqual([]);
        expect(loadWaterCollection(createMemoryStorage('{"gecersiz": true}'))).toEqual([]);
    });

    it('kaydedilen ve yüklenen verileri başarıyla senkronize eder', () => {
        const storage = createMemoryStorage();
        saveWaterCollection(['duck', 'dolphin'], storage);
        expect(loadWaterCollection(storage)).toEqual(['duck', 'dolphin']);
    });

    it('addWaterTreasure tekrarlayan eklemeleri önler ve isComplete hesaplar', () => {
        const r1 = addWaterTreasure([], 'duck');
        expect(r1.isNew).toBe(true);
        expect(r1.next).toEqual(['duck']);
        expect(r1.isComplete).toBe(false);

        // Tekrar ekleme
        const r2 = addWaterTreasure(['duck'], 'duck');
        expect(r2.isNew).toBe(false);
        expect(r2.next).toEqual(['duck']);

        // Tümünü tamamlama
        const allIds = WATER_TREASURES.map((t) => t.id);
        const almostDone = allIds.slice(0, 7);
        const lastId = allIds[7];
        const rComplete = addWaterTreasure(almostDone, lastId);
        expect(rComplete.isNew).toBe(true);
        expect(rComplete.isComplete).toBe(true);
    });
});
