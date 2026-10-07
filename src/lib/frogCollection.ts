/**
 * Zıp Zıp Kurbağa — Göl Dostları Defteri (Koleksiyon Sistemi).
 *
 * Tamamen cihaz üzerinde (localStorage). Sunucuya/DB'ye yük bindirmez,
 * şema değişikliği gerektirmez. Bozuk veya eksik veride asla patlamaz.
 */

export interface PondFriendDef {
    id: string;
    emoji: string;
    label: string;
    description: string;
}

export const POND_FRIENDS: readonly PondFriendDef[] = [
    { id: 'frog', emoji: '🐸', label: 'Neşeli Kurbağa', description: 'Gölün en usta zıp zıpı' },
    { id: 'dragonfly', emoji: '✨', label: 'Renkli Yusufçuk', description: 'Su üstünde dans eden pırıltılı kanatlar' },
    { id: 'butterfly', emoji: '🦋', label: 'Mavi Kelebek', description: 'Nilüfer çiçeklerinin dostu' },
    { id: 'duckling', emoji: '🦆', label: 'Yavru Ördek', description: 'Sarı tüylü tatlı yüzücü' },
    { id: 'pond_turtle', emoji: '🐢', label: 'Göl Kaplumbağası', description: 'Güneşlenen sakin bilge' },
    { id: 'goldfish', emoji: '🐟', label: 'Altın Sazan', description: 'Pırıl pırıl parlayan su dostu' },
    { id: 'snail', emoji: '🐌', label: 'Kıyı Salyangozu', description: 'Yosunlu taşların gezgini' },
    { id: 'lotus_fairy', emoji: '🪷', label: 'Büyülü Nilüfer', description: 'Gölün en zarif çiçeği' },
] as const;

export const POND_COLLECTION_STORAGE_KEY = 'papatya.pondFriends.v1';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const VALID_IDS = new Set(POND_FRIENDS.map((f) => f.id));

function defaultStorage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

/**
 * Bozuk veya geçersiz veride asla hata fırlatmaz, yalnızca bilinen id'leri döner.
 */
export function loadPondCollection(storage: ReadableStorage | null = defaultStorage()): string[] {
    if (!storage) return [];
    try {
        const raw = storage.getItem(POND_COLLECTION_STORAGE_KEY);
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

export function savePondCollection(
    ids: readonly string[],
    storage: WritableStorage | null = defaultStorage()
): void {
    if (!storage) return;
    try {
        storage.setItem(POND_COLLECTION_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Kota vb. durumlarda sessizce geç
    }
}

export interface AddPondFriendResult {
    next: string[];
    isNew: boolean;
    isComplete: boolean;
}

/**
 * Koleksiyona yeni göl dostu ekler (aynı dost tekrar eklenmez).
 */
export function addPondFriend(current: readonly string[], id: string): AddPondFriendResult {
    if (!VALID_IDS.has(id) || current.includes(id)) {
        return {
            next: [...current],
            isNew: false,
            isComplete: current.length >= POND_FRIENDS.length,
        };
    }
    const next = [...current, id];
    return {
        next,
        isNew: true,
        isComplete: next.length >= POND_FRIENDS.length,
    };
}
