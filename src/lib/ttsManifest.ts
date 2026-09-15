/**
 * 2026-09-15 — statik ses kayıtları envanteri (bkz. `seslendirmeler.md`).
 * ElevenLabs yerine gerçek insan sesiyle önceden kaydedilmiş sabit metinler
 * — `useTurkishSpeech.ts`'teki `speak()` çağrılmadan önce burada tam metin
 * eşleşmesi aranır; bulunursa Piper/tarayıcı zincirine hiç gidilmeden
 * doğrudan bu dosya çalınır (daha doğal ses, gecikmesiz, API çağrısı yok).
 * Eşleşme yoksa (henüz kaydedilmemiş metinler) mevcut zincir değişmeden
 * çalışmaya devam eder.
 *
 * Bazı metinlerin birden fazla kaydı var (farklı seslendirme denemeleri) —
 * bunlar arasından her çalışta rastgele biri seçilir (bkz. `pickTtsAsset`),
 * Harf Avı'nın 3 soru şablonu arasında rastgele seçim yapan deseniyle tutarlı.
 *
 * Kaynak: kullanıcının kendi kaydettiği ses dosyaları (`public/sounds/tts/`).
 * 2026-09-15 ilk turda 105 dosya eklendi; aynı gün ikinci turda envanter
 * standartlaştırılıp 214 kaynak dosyaya genişletildi (harf şablonları
 * tamamlandı, 100 nesne ismi eklendi) — AAC kelimeleri bu turda BİLİNÇLİ
 * OLARAK boş bırakıldı, ayrı bir turda yeniden kaydedilecek (kullanıcı kararı).
 */
const TTS_MANIFEST: Record<string, string[]> = {
    // A1 — Harf sorma şablonları (tr.json `game.findLetter` ile birebir, harf interpolasyonlu)
    'Hadi A harfini bulalım!': ['/sounds/tts/harf-hadi-a.mp3'],
    'A harfi nerede?': ['/sounds/tts/harf-nerede-a.mp3'],
    'Bakalım, A harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-a.mp3'],
    'Hadi B harfini bulalım!': ['/sounds/tts/harf-hadi-b.mp3'],
    'B harfi nerede?': ['/sounds/tts/harf-nerede-b.mp3'],
    'Bakalım, B harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-b.mp3'],
    'Hadi C harfini bulalım!': ['/sounds/tts/harf-hadi-c.mp3'],
    'C harfi nerede?': ['/sounds/tts/harf-nerede-c.mp3'],
    'Bakalım, C harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-c.mp3'],
    'Hadi Ç harfini bulalım!': ['/sounds/tts/harf-hadi-cc.mp3'],
    'Ç harfi nerede?': ['/sounds/tts/harf-nerede-cc.mp3'],
    'Bakalım, Ç harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-cc.mp3'],
    'Hadi D harfini bulalım!': ['/sounds/tts/harf-hadi-d.mp3'],
    'D harfi nerede?': ['/sounds/tts/harf-nerede-d.mp3'],
    'Bakalım, D harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-d.mp3'],
    'Hadi E harfini bulalım!': ['/sounds/tts/harf-hadi-e.mp3'],
    'E harfi nerede?': ['/sounds/tts/harf-nerede-e.mp3'],
    'Bakalım, E harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-e.mp3'],
    'Hadi F harfini bulalım!': ['/sounds/tts/harf-hadi-f.mp3'],
    'F harfi nerede?': ['/sounds/tts/harf-nerede-f.mp3'],
    'Hadi G harfini bulalım!': ['/sounds/tts/harf-hadi-g.mp3'],
    'G harfi nerede?': ['/sounds/tts/harf-nerede-g.mp3'],
    'Bakalım, G harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-g.mp3'],
    'Bakalım, Ğ harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-gg.mp3'],
    'Hadi H harfini bulalım!': ['/sounds/tts/harf-hadi-h.mp3'],
    'H harfi nerede?': ['/sounds/tts/harf-nerede-h.mp3'],
    'Bakalım, H harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-h.mp3'],
    'Bakalım, I harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-i.mp3'],
    'Bakalım, İ harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-ii.mp3'],
    'Bakalım, J harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-j.mp3'],
    'Hadi K harfini bulalım!': ['/sounds/tts/harf-hadi-k.mp3'],
    'K harfi nerede?': ['/sounds/tts/harf-nerede-k.mp3', '/sounds/tts/harf-nerede-k-v2.mp3'],
    'Bakalım, K harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-k.mp3'],
    'L harfi nerede?': ['/sounds/tts/harf-nerede-l.mp3'],
    'Bakalım, L harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-l.mp3'],
    'M harfi nerede?': ['/sounds/tts/harf-nerede-m.mp3'],
    'Bakalım, M harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-m.mp3'],
    'N harfi nerede?': ['/sounds/tts/harf-nerede-n.mp3'],
    'Bakalım, N harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-n.mp3'],
    'O harfi nerede?': ['/sounds/tts/harf-nerede-o.mp3'],
    'Bakalım, O harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-o.mp3'],
    'Bakalım, Ö harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-oo.mp3'],
    'Bakalım, P harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-p.mp3'],
    'Hadi R harfini bulalım!': ['/sounds/tts/harf-hadi-r.mp3'],
    'Hadi S harfini bulalım!': ['/sounds/tts/harf-hadi-s.mp3'],
    'S harfi nerede?': ['/sounds/tts/harf-nerede-s.mp3'],
    'Hadi Ş harfini bulalım!': ['/sounds/tts/harf-hadi-ss.mp3', '/sounds/tts/harf-hadi-ss-v2.mp3'],
    'Ş harfi nerede?': ['/sounds/tts/harf-nerede-ss.mp3'],
    'Hadi T harfini bulalım!': ['/sounds/tts/harf-hadi-t.mp3'],
    'T harfi nerede?': ['/sounds/tts/harf-nerede-t.mp3'],
    'U harfi nerede?': ['/sounds/tts/harf-nerede-u.mp3'],
    'Bakalım, U harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-u.mp3'],
    'Bakalım, Ü harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-uu.mp3'],
    'Bakalım, V harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-v.mp3', '/sounds/tts/harf-bakalim-v-v2.mp3'],
    'Y harfi nerede?': ['/sounds/tts/harf-nerede-y.mp3'],
    'Bakalım, Y harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-y.mp3'],
    'Z harfi nerede?': ['/sounds/tts/harf-nerede-z.mp3'],
    'Bakalım, Z harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-z.mp3'],

    // A2 — Aile Albümü sabit soru
    'Bu kim?': ['/sounds/tts/aile-bu-kim.mp3'],

    // A4 — Aile Albümü yakınlık cümlesi (`speak(\`Bu senin ${relation.toLocaleLowerCase('tr-TR')}\`)`)
    'Bu senin abla': ['/sounds/tts/aile-cumle-abla.mp3'],
    'Bu senin amca': ['/sounds/tts/aile-cumle-amca.mp3'],
    'Bu senin anne': ['/sounds/tts/aile-cumle-anne.mp3'],
    'Bu senin anneanne': ['/sounds/tts/aile-cumle-anneanne.mp3'],
    'Bu senin arkadaş': ['/sounds/tts/aile-cumle-arkadas.mp3'],
    'Bu senin ağabey': ['/sounds/tts/aile-cumle-agabey.mp3'],
    'Bu senin baba': ['/sounds/tts/aile-cumle-baba.mp3'],
    'Bu senin babaanne': ['/sounds/tts/aile-cumle-babaanne.mp3'],
    'Bu senin dayı': ['/sounds/tts/aile-cumle-dayi.mp3'],
    'Bu senin dede (anne tarafı)': ['/sounds/tts/aile-cumle-dede.mp3'],
    'Bu senin dede (baba tarafı)': ['/sounds/tts/aile-cumle-dede.mp3'],
    'Bu senin enişte': ['/sounds/tts/aile-cumle-eniste.mp3'],
    'Bu senin erkek kardeş': ['/sounds/tts/aile-cumle-erkek-kardes.mp3'],
    'Bu senin hala': ['/sounds/tts/aile-cumle-hala.mp3'],
    'Bu senin kuzen': ['/sounds/tts/aile-cumle-kuzen.mp3'],
    'Bu senin kız kardeş': ['/sounds/tts/aile-cumle-kiz-kardes.mp3'],
    'Bu senin teyze': ['/sounds/tts/aile-cumle-teyze.mp3'],
    'Bu senin yenge': ['/sounds/tts/aile-cumle-yenge.mp3'],
    'Bu senin öğretmen': ['/sounds/tts/aile-cumle-ogretmen.mp3'],

    // Ebeveyn paneli "Dinle" butonu (FamilyMembersTab.tsx) — yakınlık kelimesi tek başına
    Anne: ['/sounds/tts/aile-kelime-anne.mp3'],
    Abla: ['/sounds/tts/aile-kelime-abla.mp3'],
    Amca: ['/sounds/tts/aile-kelime-amca.mp3'],
    Arkadaş: ['/sounds/tts/aile-kelime-arkadas.mp3'],
    Ağabey: ['/sounds/tts/aile-kelime-agabey.mp3'],
    Baba: ['/sounds/tts/aile-kelime-baba.mp3'],
    Dayı: ['/sounds/tts/aile-kelime-dayi.mp3'],
    Enişte: ['/sounds/tts/aile-kelime-eniste.mp3'],
    'Erkek Kardeş': ['/sounds/tts/aile-kelime-erkek-kardes.mp3'],
    Komşu: ['/sounds/tts/aile-kelime-komsu.mp3'],
    'Kız Kardeş': ['/sounds/tts/aile-kelime-kiz-kardes.mp3'],
    Teyze: ['/sounds/tts/aile-kelime-teyze.mp3'],
    Öğretmen: ['/sounds/tts/aile-kelime-ogretmen.mp3'],

    // A3 — AAC kelimeleri: 2026-09-15 ikinci turda BİLİNÇLİ OLARAK boş bırakıldı
    // (kullanıcı: "onları sonra yapacağım") — hepsi şimdilik Piper/tarayıcıya düşer.

    // B1 — Kutlama (tr.json `feedback.success` — 4/6 mevcut, Aferin!/Bravo! eksik)
    'Harika!': ['/sounds/tts/kutlama-harika.mp3'],
    'Mükemmel!': ['/sounds/tts/kutlama-mukemmel.mp3'],
    'Süpersin!': ['/sounds/tts/kutlama-supersin.mp3'],
    'Çok güzel!': ['/sounds/tts/kutlama-cok-guzel.mp3'],

    // B2 — Teşvik (tr.json `feedback.retry` — 3/3 tam)
    'Tekrar deneyelim mi?': ['/sounds/tts/tesvik-tekrar-deneyelim-mi.mp3'],
    'Bir daha bakalım': ['/sounds/tts/tesvik-bir-daha-bakalim.mp3'],
    'Birlikte bulalım': ['/sounds/tts/tesvik-birlikte-bulalim.mp3'],

    // D→statikleşen kısım — Harf Avı'nın ipucu kelimesi (`GameBoard.tsx` →
    // `speak(randomObj.word)`). `LETTER_OBJECTS` (`src/store/gameData.ts`)
    // içindeki TÜM 71 kelime artık kayıtlı (2026-09-15, 2. tur) — aynı
    // kelimeler Hafıza Kartları'nın 100 karşılaştırma görseli havuzuyla da
    // ortak (bkz. `seslendirmeler.md` F bölümü), o oyun nesne adını hiç
    // seslendirmiyor (yalnızca görsel etiket), bu yüzden anahtarlar burada
    // yalnızca Harf Avı'nın gerçek `speak()` metniyle (`word` alanı) eşleşecek
    // şekilde yazıldı — DB'deki uzun/resmî ad (ör. "Trafik Işığı") değil.
    Anahtar: ['/sounds/tts/nesne-anahtar.mp3'],
    Ananas: ['/sounds/tts/nesne-ananas.mp3'],
    Araba: ['/sounds/tts/nesne-araba.mp3'],
    Arı: ['/sounds/tts/nesne-ari.mp3'],
    At: ['/sounds/tts/nesne-at.mp3'],
    Ayakkabı: ['/sounds/tts/nesne-ayakkabi.mp3'],
    Ayıcık: ['/sounds/tts/nesne-ayicik.mp3'],
    Ağaç: ['/sounds/tts/nesne-agac.mp3'],
    Balon: ['/sounds/tts/nesne-balon.mp3'],
    Balık: ['/sounds/tts/nesne-balik.mp3'],
    Bisiklet: ['/sounds/tts/nesne-bisiklet.mp3'],
    Ceviz: ['/sounds/tts/nesne-ceviz.mp3'],
    Civciv: ['/sounds/tts/nesne-civciv.mp3'],
    Deve: ['/sounds/tts/nesne-deve.mp3'],
    'Diş Fırçası': ['/sounds/tts/nesne-dis-fircasi.mp3'],
    Domates: ['/sounds/tts/nesne-domates.mp3'],
    Dondurma: ['/sounds/tts/nesne-dondurma.mp3'],
    Donut: ['/sounds/tts/nesne-donut.mp3'],
    Dünya: ['/sounds/tts/nesne-dunya.mp3'],
    Ekmek: ['/sounds/tts/nesne-ekmek.mp3'],
    Elbise: ['/sounds/tts/nesne-elbise.mp3'],
    Eldiven: ['/sounds/tts/nesne-eldiven.mp3'],
    Elma: ['/sounds/tts/nesne-elma.mp3'],
    Eşek: ['/sounds/tts/nesne-esek.mp3'],
    Fil: ['/sounds/tts/nesne-fil.mp3'],
    Gemi: ['/sounds/tts/nesne-gemi.mp3'],
    Gitar: ['/sounds/tts/nesne-gitar.mp3'],
    Gökkuşağı: ['/sounds/tts/nesne-gokkusagi.mp3'],
    Güneş: ['/sounds/tts/nesne-gunes.mp3'],
    'Güneş Gözlüğü': ['/sounds/tts/nesne-gunes-gozlugu.mp3'],
    Havuç: ['/sounds/tts/nesne-havuc.mp3'],
    Hindi: ['/sounds/tts/nesne-hindi.mp3'],
    Işık: ['/sounds/tts/nesne-trafik-isigi.mp3'],
    // 'Işık' Harf Avı'nın (LETTER_OBJECTS) speak() metni, 'Trafik Işığı' ise
    // ComparisonItem DB kaydının tam adı (Hafıza Kartları/Gölge Eşleştirme
    // speak(item.name) çağırırsa bu anahtarı arar) — aynı ses dosyası, iki alias.
    'Trafik Işığı': ['/sounds/tts/nesne-trafik-isigi.mp3'],
    Jelibon: ['/sounds/tts/nesne-jelibon.mp3'],
    Kalemler: ['/sounds/tts/nesne-kalemler.mp3'],
    Kaplumbağa: ['/sounds/tts/nesne-kaplumbaga.mp3'],
    Karpuz: ['/sounds/tts/nesne-karpuz.mp3'],
    Karınca: ['/sounds/tts/nesne-karinca.mp3'],
    Kavun: ['/sounds/tts/nesne-kavun.mp3'],
    Kayısı: ['/sounds/tts/nesne-kayisi.mp3'],
    Kaşık: ['/sounds/tts/nesne-kasik.mp3'],
    Kedi: ['/sounds/tts/nesne-kedi.mp3'],
    Kelebek: ['/sounds/tts/nesne-kelebek.mp3'],
    Kirpi: ['/sounds/tts/nesne-kirpi.mp3'],
    Kivi: ['/sounds/tts/nesne-kivi.mp3'],
    Koyun: ['/sounds/tts/nesne-koyun.mp3'],
    Kurbağa: ['/sounds/tts/nesne-kurbaga.mp3'],
    Kuzu: ['/sounds/tts/nesne-kuzu.mp3'],
    Köpek: ['/sounds/tts/nesne-kopek.mp3'],
    Lale: ['/sounds/tts/nesne-lale.mp3'],
    Limon: ['/sounds/tts/nesne-limon.mp3'],
    Masa: ['/sounds/tts/nesne-masa.mp3'],
    'Muhabbet Kuşu': ['/sounds/tts/nesne-muhabbet-kusu.mp3'],
    Muz: ['/sounds/tts/nesne-muz.mp3'],
    Nar: ['/sounds/tts/nesne-nar.mp3'],
    Olta: ['/sounds/tts/nesne-olta.mp3'],
    Otobüs: ['/sounds/tts/nesne-otobus.mp3'],
    Panda: ['/sounds/tts/nesne-panda.mp3'],
    Pantolon: ['/sounds/tts/nesne-pantolon.mp3'],
    Pasta: ['/sounds/tts/nesne-pasta.mp3'],
    Patates: ['/sounds/tts/nesne-patates.mp3'],
    Paten: ['/sounds/tts/nesne-paten.mp3'],
    Penguen: ['/sounds/tts/nesne-penguen.mp3'],
    Piyano: ['/sounds/tts/nesne-piyano.mp3'],
    Portakal: ['/sounds/tts/nesne-portakal.mp3'],
    Raket: ['/sounds/tts/nesne-raket.mp3'],
    Saat: ['/sounds/tts/nesne-saat.mp3'],
    Sandalye: ['/sounds/tts/nesne-sandalye.mp3'],
    Satürn: ['/sounds/tts/nesne-saturn.mp3'],
    Simit: ['/sounds/tts/nesne-simit.mp3'],
    Soğan: ['/sounds/tts/nesne-sogan.mp3'],
    Tabak: ['/sounds/tts/nesne-tabak.mp3'],
    Tavuk: ['/sounds/tts/nesne-tavuk.mp3'],
    Tavşan: ['/sounds/tts/nesne-tavsan.mp3'],
    Tencere: ['/sounds/tts/nesne-tencere.mp3'],
    Toka: ['/sounds/tts/nesne-toka.mp3'],
    Top: ['/sounds/tts/nesne-top.mp3'],
    Traktör: ['/sounds/tts/nesne-traktor.mp3'],
    Uçak: ['/sounds/tts/nesne-ucak.mp3'],
    Valiz: ['/sounds/tts/nesne-valiz.mp3'],
    Vinç: ['/sounds/tts/nesne-vinc.mp3'],
    Yaprak: ['/sounds/tts/nesne-yaprak.mp3'],
    Yatak: ['/sounds/tts/nesne-yatak.mp3'],
    Yumurta: ['/sounds/tts/nesne-yumurta.mp3'],
    Yunus: ['/sounds/tts/nesne-yunus.mp3'],
    Yıldız: ['/sounds/tts/nesne-yildiz.mp3'],
    Zeytin: ['/sounds/tts/nesne-zeytin.mp3'],
    Zürafa: ['/sounds/tts/nesne-zurafa.mp3'],
    Çanta: ['/sounds/tts/nesne-canta.mp3'],
    Çikolata: ['/sounds/tts/nesne-cikolata.mp3'],
    Çiçek: ['/sounds/tts/nesne-cicek.mp3'],
    Çorap: ['/sounds/tts/nesne-corap.mp3'],
    Ördek: ['/sounds/tts/nesne-ordek.mp3'],
    'Ördek Yavrusu': ['/sounds/tts/nesne-ordek-yavrusu.mp3'],
    Üzüm: ['/sounds/tts/nesne-uzum.mp3'],
    Üçgen: ['/sounds/tts/nesne-ucgen.mp3'],
    İnek: ['/sounds/tts/nesne-inek.mp3'],
    İp: ['/sounds/tts/nesne-ip.mp3'],
    Şapka: ['/sounds/tts/nesne-sapka.mp3'],
    Şemsiye: ['/sounds/tts/nesne-semsiye.mp3'],
};

/** Metin tam olarak eşleşiyorsa kayıtlı ses dosyalarından birini (varsa birden fazla varyanttan rastgele) döndürür, yoksa null. */
export function pickTtsAsset(text: string): string | null {
    const variants = TTS_MANIFEST[text];
    if (!variants || variants.length === 0) return null;
    return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * 2026-09-15, 3. tur — kullanıcı isteği: `celebrateSuccess()`/`encourageRetry()`
 * artık `tr.json`'daki metin havuzundan rastgele SEÇİP SONRA o metni aramak
 * yerine, doğrudan mevcut ses kayıtlarından rastgele birini döndürür — bu
 * sayede asla "kayıt yok, robotik sese düş" durumu oluşmaz (yalnızca kayıtlı
 * olan seçenekler arasından seçilir). Harf sorma (`askLetter`) için bu
 * fonksiyon kullanılmaz — harf-spesifik olduğu için `useTurkishSpeech.ts`
 * kendi içinde harfin 3 şablonunu ayrı ayrı dener.
 */
const KUTLAMA_ASSETS = [
    '/sounds/tts/kutlama-harika.mp3',
    '/sounds/tts/kutlama-mukemmel.mp3',
    '/sounds/tts/kutlama-supersin.mp3',
    '/sounds/tts/kutlama-cok-guzel.mp3',
];

const TESVIK_ASSETS = [
    '/sounds/tts/tesvik-tekrar-deneyelim-mi.mp3',
    '/sounds/tts/tesvik-bir-daha-bakalim.mp3',
    '/sounds/tts/tesvik-birlikte-bulalim.mp3',
];

export function pickRandomTtsAssetForCategory(category: 'kutlama' | 'tesvik'): string | null {
    const pool = category === 'kutlama' ? KUTLAMA_ASSETS : TESVIK_ASSETS;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}
