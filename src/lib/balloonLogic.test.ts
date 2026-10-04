import { describe, it, expect } from 'vitest';
import {
    BALLOON_PALETTES,
    STICKERS,
    hitTestBalloons,
    pickSpawnSticker,
    getPalette,
} from './balloonLogic';
import {
    COLLECTION_STORAGE_KEY,
    addSticker,
    loadCollection,
    saveCollection,
} from './balloonCollection';

describe('balloonLogic', () => {
    it('her renk paletinde en az bir sticker var ve id\'ler benzersiz', () => {
        for (const p of BALLOON_PALETTES) {
            expect(STICKERS.some((s) => s.color === p.name)).toBe(true);
        }
        expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    });

    it('hedef renk ekranda yoksa mutlaka o renkten balon seçilir', () => {
        for (let i = 0; i < 50; i++) {
            const s = pickSpawnSticker({
                targetColor: 'Mor',
                onScreenColors: ['Kırmızı', 'Mavi'],
                collected: [],
            });
            expect(s.color).toBe('Mor');
        }
    });

    it('hedef renk zaten ekrandaysa tüm havuzdan seçilir', () => {
        const seen = new Set<string>();
        let r = 0;
        const rand = () => {
            r = (r + 0.137) % 1;
            return r;
        };
        for (let i = 0; i < 80; i++) {
            seen.add(
                pickSpawnSticker({ targetColor: 'Mor', onScreenColors: ['Mor'], collected: [], rand }).color
            );
        }
        expect(seen.size).toBeGreaterThan(1);
    });

    it('koleksiyonda olmayanlar öncelikli seçilebilir', () => {
        const all = STICKERS.map((s) => s.id);
        const missingId = all[3];
        const collected = all.filter((id) => id !== missingId);
        // rand ilk çağrıda 0 → "eksikleri tercih et" dalı; ikinci çağrıda 0 → ilk eksik.
        const s = pickSpawnSticker({ targetColor: null, onScreenColors: [], collected, rand: () => 0 });
        expect(s.id).toBe(missingId);
    });

    it('getPalette bilinmeyen durumda ilk palete düşer, bilinende doğrusunu verir', () => {
        expect(getPalette('Sarı').name).toBe('Sarı');
    });

    it('hitTest: en üstteki (dizide sonda) balonu seçer', () => {
        const shapes = [
            { x: 100, y: 100, rx: 40, ry: 48 },
            { x: 110, y: 100, rx: 40, ry: 48 },
        ];
        expect(hitTestBalloons(shapes, 105, 100)).toBe(1);
    });

    it('hitTest: payı sayesinde kenara yakın dokunuş isabet sayılır, uzak dokunuş sayılmaz', () => {
        const shapes = [{ x: 100, y: 100, rx: 40, ry: 48 }];
        expect(hitTestBalloons(shapes, 100 + 40 + 10, 100)).toBe(0); // pay (14) içinde
        expect(hitTestBalloons(shapes, 100 + 40 + 40, 100)).toBe(-1);
    });

    it('hitTest: çok küçük balon için de asgari dokunma hedefi vardır', () => {
        const shapes = [{ x: 50, y: 50, rx: 4, ry: 4 }];
        expect(hitTestBalloons(shapes, 50 + 20, 50)).toBe(0);
    });
});

describe('balloonCollection', () => {
    const memory = (initial?: string) => {
        let value = initial ?? null;
        return {
            getItem: () => value,
            setItem: (_k: string, v: string) => {
                value = v;
            },
            read: () => value,
        };
    };

    it('boş/bozuk/yanlış tipli veride patlamaz, boş döner', () => {
        expect(loadCollection(memory())).toEqual([]);
        expect(loadCollection(memory('{bozuk json'))).toEqual([]);
        expect(loadCollection(memory('{"a":1}'))).toEqual([]);
        expect(loadCollection(null)).toEqual([]);
    });

    it('bilinmeyen id\'leri ve tekrarları eler', () => {
        const raw = JSON.stringify(['elma', 'elma', 'yok-boyle-bir-sey', 42, 'yunus']);
        expect(loadCollection(memory(raw))).toEqual(['elma', 'yunus']);
    });

    it('kaydet → yükle gidiş dönüş', () => {
        const store = memory();
        saveCollection(['elma', 'kelebek'], store);
        expect(loadCollection(store)).toEqual(['elma', 'kelebek']);
        expect(typeof store.read()).toBe('string');
        expect(COLLECTION_STORAGE_KEY).toContain('balloonStickers');
    });

    it('depolama atarsa sessizce geçer', () => {
        const throwing = {
            getItem: () => {
                throw new Error('x');
            },
            setItem: () => {
                throw new Error('x');
            },
        };
        expect(loadCollection(throwing)).toEqual([]);
        expect(() => saveCollection(['elma'], throwing)).not.toThrow();
    });

    it('addSticker: yeni ekler, tekrar eklemez, geçersiz id\'yi yok sayar', () => {
        const first = addSticker([], 'elma');
        expect(first).toMatchObject({ next: ['elma'], isNew: true, isComplete: false });
        const dup = addSticker(first.next, 'elma');
        expect(dup.isNew).toBe(false);
        expect(dup.next).toEqual(['elma']);
        const bad = addSticker(first.next, 'olmayan');
        expect(bad.isNew).toBe(false);
    });

    it('addSticker: son sticker eklenince koleksiyon tamamlanır', () => {
        const ids = STICKERS.map((s) => s.id);
        const almost = ids.slice(0, -1);
        const res = addSticker(almost, ids[ids.length - 1]);
        expect(res.isNew).toBe(true);
        expect(res.isComplete).toBe(true);
    });
});
