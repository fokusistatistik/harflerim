export const APP_NAME = 'Papatyalar';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://papatyalar.com';
export const APP_TAGLINE = 'Otizmli Çocuklar İçin Özel Eğitim, İletişim ve Eğlenceli Öğrenme Platformu';
export const APP_DESCRIPTION =
    'Papatyalar; otizm spektrumundaki (ASD) çocuklara özel hazırlanmış, Türkçe harf eğitimi, AAC alternatif iletişim panosu, duyusal regülasyon mini-oyunları ve ebeveyn denetimi sunan modern ve güvenli çocuk platformudur.';
export const APP_KEYWORDS = [
    'Papatyalar',
    'otizm özel eğitim',
    'otizm eğitim uygulaması',
    'aac iletişim tahtası',
    'türkçe harf avı',
    'otizmli çocuklar için oyunlar',
    'duyusal regülasyon oyunları',
    'sakinleştirici çocuk oyunları',
    'çocuk konuşma terapisi kartları',
    'özel eğitim yazılımı',
    'çocuk ekran süresi yönetimi',
    'alternatif ve destekleyici iletişim',
];

/// Turkish possessive suffix depends on whether the final vowel is front or back,
/// and whether the name ends in a vowel: Melike -> "Melike'nin", Emre -> "Emre'nin",
/// Zeynep -> "Zeynep'in", Kuzu -> "Kuzu'nun".
export function possessive(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return '';

    const lower = trimmed.toLocaleLowerCase('tr-TR');
    const vowels = 'aeıioöuü';
    const lastVowel = [...lower].reverse().find((c) => vowels.includes(c));
    if (!lastVowel) return `${trimmed}'in`;

    const endsWithVowel = vowels.includes(lower[lower.length - 1]);
    const suffix = { a: 'ın', ı: 'ın', o: 'un', u: 'un', e: 'in', i: 'in', ö: 'ün', ü: 'ün' }[lastVowel]!;

    return `${trimmed}'${endsWithVowel ? 'n' : ''}${suffix}`;
}

export function worldName(firstName: string): string {
    return `${possessive(firstName)} Dünyası`;
}
