/**
 * Faz 3.7 — İletişim Tahtası (AAC) sabit sembol listesi. v1 kasıtlı olarak
 * kodda sabit (DB-tabanlı ebeveyn yönetimi sonraki bir iş) — bkz.
 * YOL-HARITASI.md 3.7.
 *
 * Görseller ARASAAC'ın kendi CDN'inden doğrudan bağlanır (yerel kopya
 * TUTULMAZ, git'e commit edilmez) — CC BY-NC-SA 4.0 lisanslı, Papatya'nın
 * "ticari amaç taşımaz" ilkesiyle uyumlu (bkz. YOL-HARITASI.md Yönetişim).
 * Atıf: arasaac.org (Aragón Hükümeti, İspanya).
 *
 * Her `arasaacId`, https://api.arasaac.org/v1/pictograms/tr/search/<kelime>
 * ile gerçek bir Türkçe arama sonucundan doğrulanmış, `imageUrl`'in gerçekten
 * 200 döndüğü curl ile teyit edilmiştir (2026-09-13).
 */

export interface AacSymbol {
    arasaacId: number;
    /** Sembole dokunulduğunda seslendirilecek ve kartta gösterilecek kelime/ifade. */
    word: string;
    imageUrl: string;
}

export interface AacCategory {
    id: string;
    label: string;
    symbols: AacSymbol[];
}

function arasaacImageUrl(id: number): string {
    return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
}

export const AAC_CATEGORIES: AacCategory[] = [
    {
        id: 'ihtiyaclar',
        label: 'İhtiyaçlar',
        symbols: [
            { arasaacId: 32753, word: 'İstiyorum', imageUrl: arasaacImageUrl(32753) },
            { arasaacId: 32464, word: 'Su', imageUrl: arasaacImageUrl(32464) },
            { arasaacId: 5921, word: 'Tuvalet', imageUrl: arasaacImageUrl(5921) },
            { arasaacId: 4570, word: 'Yardım', imageUrl: arasaacImageUrl(4570) },
            { arasaacId: 4962, word: 'Açım', imageUrl: arasaacImageUrl(4962) },
            { arasaacId: 7273, word: 'Susadım', imageUrl: arasaacImageUrl(7273) },
        ],
    },
    {
        id: 'duygular',
        label: 'Duygular',
        symbols: [
            { arasaacId: 35547, word: 'Mutluyum', imageUrl: arasaacImageUrl(35547) },
            { arasaacId: 35545, word: 'Üzgünüm', imageUrl: arasaacImageUrl(35545) },
            { arasaacId: 2314, word: 'Yorgunum', imageUrl: arasaacImageUrl(2314) },
            { arasaacId: 10748, word: 'Kızgınım', imageUrl: arasaacImageUrl(10748) },
            { arasaacId: 3308, word: 'Hastayım', imageUrl: arasaacImageUrl(3308) },
            { arasaacId: 31310, word: 'Sakinim', imageUrl: arasaacImageUrl(31310) },
        ],
    },
    {
        id: 'gunluk-yasam',
        label: 'Günlük Yaşam',
        symbols: [
            { arasaacId: 8289, word: 'Dur', imageUrl: arasaacImageUrl(8289) },
            { arasaacId: 5584, word: 'Evet', imageUrl: arasaacImageUrl(5584) },
            { arasaacId: 5526, word: 'Hayır', imageUrl: arasaacImageUrl(5526) },
            { arasaacId: 8195, word: 'Lütfen', imageUrl: arasaacImageUrl(8195) },
            { arasaacId: 23392, word: 'Oynamak', imageUrl: arasaacImageUrl(23392) },
            { arasaacId: 2369, word: 'Uyumak', imageUrl: arasaacImageUrl(2369) },
        ],
    },
];
