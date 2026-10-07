/**
 * Renkli Sapan — Meyve Bahçesi Defteri (Koleksiyon Sistemi).
 *
 * Tamamen cihaz üzerinde (localStorage). Sunucuya/DB'ye yük bindirmez,
 * şema değişikliği gerektirmez. Bozuk veya eksik veride asla patlamaz.
 */

export interface OrchardFruitDef {
    id: string;
    emoji: string;
    label: string;
    description: string;
}

export const ORCHARD_FRUITS: readonly OrchardFruitDef[] = [
    { id: 'elma', emoji: '🍎', label: 'Kırmızı Elma', description: 'Dalından taze tatlı elma' },
    { id: 'armut', emoji: '🍐', label: 'Yeşil Armut', description: 'Bal gibi sulu armut' },
    { id: 'portakal', emoji: '🍊', label: 'Turuncu Portakal', description: 'Güneş gibi C vitamini' },
    { id: 'muz', emoji: '🍌', label: 'Sarı Muz', description: 'Neşeli maymunların favorisi' },
    { id: 'uzum', emoji: '🍇', label: 'Mor Üzüm', description: 'Bağların tatlı salkımı' },
    { id: 'cilek', emoji: '🍓', label: 'Kokulu Çilek', description: 'Baharın en tatlı meyvesi' },
    { id: 'seftali', emoji: '🍑', label: 'Yumuşak Şeftali', description: 'Kadife gibi mis kokulu' },
    { id: 'karpuz', emoji: '🍉', label: 'Sulu Karpuz', description: 'Yaz günlerinin serinliği' },
] as const;

export const ORCHARD_COLLECTION_STORAGE_KEY = 'papatya.orchardFruits.v1';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const VALID_IDS = new Set(ORCHARD_FRUITS.map((f) => f.id));

function defaultStorage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

/**
 * Bozuk veya eksik veride asla hata fırlatmaz, yalnızca bilinen id'leri döner.
 */
export function loadOrchardCollection(storage: ReadableStorage | null = defaultStorage()): string[] {
    if (!storage) return [];
    try {
        const raw = storage.getItem(ORCHARD_COLLECTION_STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const seen = new Set<string>();
        for (const item of parsed) {
            if (typeof item === 'string' && VALID_IDS.has(item)) seen.add(item);
        }
        return Array.from(seen);
    } catch {
        return [];
    }
}

export function saveOrchardCollection(
    ids: readonly string[],
    storage: WritableStorage | null = defaultStorage()
): void {
    if (!storage) return;
    try {
        storage.setItem(ORCHARD_COLLECTION_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Kota vb. durumlarda sessizce geç
    }
}

export interface AddOrchardFruitResult {
    next: string[];
    isNew: boolean;
    isComplete: boolean;
}

/**
 * Koleksiyona yeni meyve ekler (aynı meyve tekrar eklenmez).
 */
export function addOrchardFruit(current: readonly string[], id: string): AddOrchardFruitResult {
    if (!VALID_IDS.has(id) || current.includes(id)) {
        return {
            next: [...current],
            isNew: false,
            isComplete: current.length >= ORCHARD_FRUITS.length,
        };
    }
    const next = [...current, id];
    return {
        next,
        isNew: true,
        isComplete: next.length >= ORCHARD_FRUITS.length,
    };
}
