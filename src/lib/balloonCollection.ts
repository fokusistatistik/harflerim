import { STICKERS } from './balloonLogic';

/**
 * Sticker defteri — tamamen cihazda (localStorage). Bilerek sunucuya/DB'ye
 * yazılmıyor: 1 çekirdekli sunucuya ek yük bindirmez, şema değişikliği ve
 * migrasyon gerektirmez. Bedeli: cihaz değişince defter sıfırlanır.
 */
export const COLLECTION_STORAGE_KEY = 'papatya.balloonStickers.v1';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const VALID_IDS = new Set(STICKERS.map((s) => s.id));

function defaultStorage(): Storage | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        // Gizli sekme / çerez engeli: koleksiyon yalnızca oturum boyunca yaşar.
        return null;
    }
}

/** Bozuk/eski/manipüle edilmiş veride bile asla patlamaz; yalnızca bilinen id'leri döner. */
export function loadCollection(storage: ReadableStorage | null = defaultStorage()): string[] {
    if (!storage) return [];
    try {
        const raw = storage.getItem(COLLECTION_STORAGE_KEY);
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

export function saveCollection(
    ids: readonly string[],
    storage: WritableStorage | null = defaultStorage()
): void {
    if (!storage) return;
    try {
        storage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Kota dolu vb.: sessizce geç, oyun etkilenmesin.
    }
}

export interface AddStickerResult {
    next: string[];
    isNew: boolean;
    isComplete: boolean;
}

/** Saf fonksiyon: aynı sticker ikinci kez eklenmez; koleksiyon tamamlandı mı bilgisini verir. */
export function addSticker(current: readonly string[], id: string): AddStickerResult {
    if (!VALID_IDS.has(id) || current.includes(id)) {
        return { next: [...current], isNew: false, isComplete: current.length >= STICKERS.length };
    }
    const next = [...current, id];
    return { next, isNew: true, isComplete: next.length >= STICKERS.length };
}
