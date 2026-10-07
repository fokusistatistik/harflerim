/**
 * Neşeli Havuz — Deniz Hazine Defteri (koleksiyon sistemi).
 *
 * Tamamen cihaz üzerinde (localStorage). Sunucuya/DB'ye yük bindirmez,
 * şema değişikliği gerektirmez. Bozuk veya eksik veride asla patlamaz.
 */

export interface WaterTreasureDef {
    id: string;
    emoji: string;
    label: string;
    description: string;
}

export const WATER_TREASURES: readonly WaterTreasureDef[] = [
    { id: 'duck', emoji: '🦆', label: 'Sarı Ördek', description: 'Gölün neşeli yüzücüsü' },
    { id: 'dolphin', emoji: '🐬', label: 'Sevimli Yunus', description: 'Dalgaların dostu' },
    { id: 'boat', emoji: '⛵', label: 'Küçük Yelkenli', description: 'Rüzgarla süzülen tekne' },
    { id: 'ball', emoji: '🏐', label: 'Renkli Top', description: 'Su üstünde zıplayan top' },
    { id: 'turtle', emoji: '🐢', label: 'Deniz Kaplumbağası', description: 'Sakin ve bilge yüzücü' },
    { id: 'starfish', emoji: '⭐', label: 'Deniz Yıldızı', description: 'Pırıl pırıl parlayan yıldız' },
    { id: 'pearl', emoji: '🦪', label: 'İnci İstiridye', description: 'Derinlerin parlayan hazinesi' },
    { id: 'clownfish', emoji: '🐠', label: 'Mercan Balığı', description: 'Renkli mercanların sakini' },
] as const;

export const WATER_COLLECTION_STORAGE_KEY = 'papatya.waterTreasures.v1';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const VALID_IDS = new Set(WATER_TREASURES.map((t) => t.id));

function defaultStorage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

/**
 * Bozuk/eski veride asla hata fırlatmaz, yalnızca geçerli id'leri döner.
 */
export function loadWaterCollection(storage: ReadableStorage | null = defaultStorage()): string[] {
    if (!storage) return [];
    try {
        const raw = storage.getItem(WATER_COLLECTION_STORAGE_KEY);
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

export function saveWaterCollection(
    ids: readonly string[],
    storage: WritableStorage | null = defaultStorage()
): void {
    if (!storage) return;
    try {
        storage.setItem(WATER_COLLECTION_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Kota vb. durumlarda sessizce geç
    }
}

export interface AddTreasureResult {
    next: string[];
    isNew: boolean;
    isComplete: boolean;
}

/**
 * Koleksiyona yeni hazine ekler (aynı hazine tekrar eklenmez).
 */
export function addWaterTreasure(current: readonly string[], id: string): AddTreasureResult {
    if (!VALID_IDS.has(id) || current.includes(id)) {
        return {
            next: [...current],
            isNew: false,
            isComplete: current.length >= WATER_TREASURES.length,
        };
    }
    const next = [...current, id];
    return {
        next,
        isNew: true,
        isComplete: next.length >= WATER_TREASURES.length,
    };
}
