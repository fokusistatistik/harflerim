/**
 * 2026-09-15 — Aile Albümü denetimi: yakınlık derecesi serbest metin
 * alanıydı ("Anne", "anne", "ANNE" gibi tutarsız girişlere açıktı, ekranda
 * okunuşu ebeveynin yazımına bağlıydı). Sabit bir kategorik liste — kan
 * bağı olan/olmayan yakınlıkları kapsar, "Diğer" seçilirse serbest metin
 * alanı açılır (nadir durumlar için esneklik korunur). `FamilyMember.relation`
 * alanı hâlâ düz `String` (şema değişikliği gerekmedi) — burada seçilen
 * etiket doğrudan o alana yazılır.
 */
export const FAMILY_RELATIONS = [
    'Anne',
    'Baba',
    'Abla',
    'Ağabey',
    'Kız Kardeş',
    'Erkek Kardeş',
    'Anneanne',
    'Babaanne',
    'Dede (anne tarafı)',
    'Dede (baba tarafı)',
    'Teyze',
    'Hala',
    'Dayı',
    'Amca',
    'Kuzen',
    'Yenge',
    'Enişte',
    'Arkadaş',
    'Öğretmen',
    'Bakıcı',
    'Komşu',
    'Diğer',
] as const;

export type FamilyRelation = (typeof FAMILY_RELATIONS)[number];
