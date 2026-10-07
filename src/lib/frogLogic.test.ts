import { describe, it, expect } from 'vitest';
import {
    createInitialFrogState,
    createInitialPadState,
    calculateJumpArc,
    checkFrogLanding,
    stepLilyPad,
    stepFrogState,
    type FrogSimulationConfig,
} from './frogLogic';
import {
    POND_FRIENDS,
    loadPondCollection,
    savePondCollection,
    addPondFriend,
} from './frogCollection';

describe('frogLogic — Kurbağa Zıplama Fiziği ve Kurallar', () => {
    it('createInitialFrogState geçerli bir başlangıç durumu üretir', () => {
        const frog = createInitialFrogState(800, 600);
        expect(frog.state).toBe('idle');
        expect(frog.jumpProgress).toBe(0);
        expect(frog.currentX).toBe(400);
        expect(frog.currentY).toBeGreaterThan(450); // alt kıyıda
    });

    it('createInitialPadState geçerli bir başlangıç nilüfer durumu üretir', () => {
        const pad = createInitialPadState(800, 600);
        expect(pad.x).toBe(0.5);
        expect(pad.radius).toBeGreaterThan(40);
        expect(pad.direction).toBe(1);
    });

    it('calculateJumpArc t=0 ve t=1 anında 0, t=0.5 anında en yüksek tepe noktasını verir', () => {
        expect(calculateJumpArc(0, 160)).toBeCloseTo(0);
        expect(calculateJumpArc(1, 160)).toBeCloseTo(0);
        expect(calculateJumpArc(0.5, 160)).toBeCloseTo(-160);
    });

    it('checkFrogLanding yaprak sınırları içinde ve tolerans payında true döner', () => {
        const padX = 400;
        const padRadius = 60;
        const tolerance = 25;

        // Tam merkez
        expect(checkFrogLanding(400, padX, padRadius, tolerance)).toBe(true);
        // Kenara çok yakın (400 + 60 + 20 = 480)
        expect(checkFrogLanding(480, padX, padRadius, tolerance)).toBe(true);
        // Çok uzak (400 + 60 + 50 = 510)
        expect(checkFrogLanding(510, padX, padRadius, tolerance)).toBe(false);
    });

    it('stepLilyPad yaprağı sınırlar arasında yumuşakça gezdirir ve geri döndürür', () => {
        const config: FrogSimulationConfig = {
            width: 800,
            height: 600,
            padSpeed: 120,
            reduceMotion: false,
        };

        const pad = createInitialPadState(800, 600);
        pad.x = 0.84;
        pad.direction = 1;

        const next = stepLilyPad(pad, config, 0.1);
        expect(next.x).toBeLessThanOrEqual(pad.maxX);
        // Sınıra çarptığında yön tersine dönmeli
        if (next.x >= pad.maxX) {
            expect(next.direction).toBe(-1);
        }
    });

    it('stepFrogState zıplamayı tamamlar ve başarılı inişte landedEvent üretir', () => {
        const config: FrogSimulationConfig = {
            width: 800,
            height: 600,
            padSpeed: 120,
            reduceMotion: false,
        };

        const pad = createInitialPadState(800, 600);
        pad.x = 0.5; // 400px

        const frog = createInitialFrogState(800, 600);
        frog.state = 'jumping';
        frog.jumpProgress = 0.95;
        frog.targetX = 400; // Tam nilüfere nişan alınmış

        const result = stepFrogState(frog, pad, config, 0.1);
        expect(result.landedEvent).toBe(true);
        expect(result.frog.state).toBe('landed');
        expect(result.frog.cooldown).toBeGreaterThan(0);
    });

    it('stepFrogState ıskalamada missedEvent üretir ve cezalandırıcı olmayan tutunma moduna geçer', () => {
        const config: FrogSimulationConfig = {
            width: 800,
            height: 600,
            padSpeed: 120,
            reduceMotion: false,
        };

        const pad = createInitialPadState(800, 600);
        pad.x = 0.2; // 160px (uzakta)

        const frog = createInitialFrogState(800, 600);
        frog.state = 'jumping';
        frog.jumpProgress = 0.95;
        frog.targetX = 600; // Nilüferden çok uzakta

        const result = stepFrogState(frog, pad, config, 0.1);
        expect(result.missedEvent).toBe(true);
        expect(result.frog.state).toBe('missed');
        expect(result.frog.cooldown).toBeGreaterThan(0);
    });
});

describe('frogCollection — Göl Dostları Defteri', () => {
    const memory = (init?: string) => {
        let v = init ?? null;
        return {
            getItem: () => v,
            setItem: (_k: string, val: string) => {
                v = val;
            },
        };
    };

    it('8 adet göl dostu tanımlıdır', () => {
        expect(POND_FRIENDS.length).toBe(8);
        const ids = new Set(POND_FRIENDS.map((f) => f.id));
        expect(ids.size).toBe(8);
    });

    it('boş ya da bozuk veride patlamaz ve boş liste döner', () => {
        expect(loadPondCollection(null)).toEqual([]);
        expect(loadPondCollection(memory())).toEqual([]);
        expect(loadPondCollection(memory('invalid json'))).toEqual([]);
    });

    it('dost ekleme ve tamamlama testi', () => {
        const r1 = addPondFriend([], 'frog');
        expect(r1.isNew).toBe(true);
        expect(r1.next).toEqual(['frog']);
        expect(r1.isComplete).toBe(false);

        // Tekrar ekleme
        const r2 = addPondFriend(['frog'], 'frog');
        expect(r2.isNew).toBe(false);

        // Tamamlanma
        const allIds = POND_FRIENDS.map((f) => f.id);
        const almostAll = allIds.slice(0, 7);
        const r3 = addPondFriend(almostAll, allIds[7]);
        expect(r3.isComplete).toBe(true);
    });
});
