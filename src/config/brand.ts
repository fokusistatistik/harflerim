export const APP_NAME = 'Papatyalar';
export const PRIMARY_DOMAIN = 'papatyalar.com';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://papatyalar.com';
export const SUPPORT_EMAIL = 'destek@papatyalar.com';
export const APP_TAGLINE =
    'Otizmli Çocuklar İçin Özel Eğitim, AAC İletişim ve Duyusal Öğrenme Platformu';
export const APP_DESCRIPTION =
    'Papatyalar; otizm spektrumundaki (ASD/OSB) ve özel eğitim gereksinimi olan çocuklara yönelik geliştirilmiş; Türkçe fonetik harf eğitimi, AAC destekleyici iletişim tahtası, duyusal regülasyon mini-oyunları, konuşma terapisi pratikleri ve güvenli ebeveyn denetim paneli sunan kapsayıcı eğitim platformudur.';

export const APP_KEYWORDS = [
    // Marka ve Ana Başlıklar
    'Papatyalar',
    'Papatyalar eğitim platformu',
    'otizm özel eğitim',
    'otizm eğitim uygulaması',
    'otizmli çocuklar için dijital eğitim',
    
    // Otizm Spektrumu ve Gelişim Alanları
    'otizm spektrum bozukluğu',
    'OSB özel eğitim',
    'atipik otizm eğitim programı',
    'asperger sendromu çocuk',
    'gecikmiş konuşma',
    'çocuk dil ve konuşma terapisi',
    'duyu bütünleme bozukluğu',
    'duyusal hassasiyet çocuk',
    
    // AAC & Alternatif Destekleyici İletişim
    'aac iletişim tahtası',
    'türkçe aac uygulaması',
    'alternatif ve destekleyici iletişim',
    'otizm konuşma kartları',
    'dijital pecs kartları',
    'otizm görsel sembol panosu',
    'konuşamayan çocuklar için sesli iletişim',
    
    // Harf, Okuma ve Yazma
    'türkçe harf avı',
    'otizm harf tanıma',
    'fonetik sesler harf öğrenimi',
    'özel eğitim okuma yazma hazırlık',
    'noktalı harf yazma alıştırması',
    'sihirli kelimeler konuşma oyunu',
    
    // Duyusal Oyunlar & Bilişsel Beceriler
    'duyusal regülasyon oyunları',
    'otizm sakinleştirici oyunlar',
    'sakin balonlar duyusal oyun',
    'neşeli havuz su fiziği oyunu',
    'el göz koordinasyonu çocuk oyunları',
    'görsel hafıza kartları eşleştirme',
    'gölge eşleştirme sürükle bırak',
    
    // Güvenlik & Ebeveyn Denetimi
    'reklamsız otizm uygulaması',
    'otizm ekran süresi yönetimi',
    'ebeveyn pin korumalı çocuk platformu',
    'çevrimdışı pwa özel eğitim uygulaması',
];

export const AUTISM_ENTITIES = {
    autismSpectrum: {
        name: 'Otizm Spektrum Bozukluğu',
        sameAs: 'https://tr.wikipedia.org/wiki/Otizm',
        wikidata: 'https://www.wikidata.org/wiki/Q38404',
    },
    aacCommunication: {
        name: 'Alternatif ve Destekleyici İletişim (AAC)',
        sameAs: 'https://en.wikipedia.org/wiki/Augmentative_and_alternative_communication',
        wikidata: 'https://www.wikidata.org/wiki/Q760337',
    },
    specialEducation: {
        name: 'Özel Eğitim',
        sameAs: 'https://tr.wikipedia.org/wiki/%C3%96zel_e%C4%9Fitim',
        wikidata: 'https://www.wikidata.org/wiki/Q21198',
    },
    sensoryIntegration: {
        name: 'Duyu Bütünleme',
        sameAs: 'https://en.wikipedia.org/wiki/Sensory_integration_therapy',
        wikidata: 'https://www.wikidata.org/wiki/Q1429906',
    },
};

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
