/**
 * 2026-09-15 — statik ses kayıtları envanteri (bkz. `seslendirmeler.md`).
 * ElevenLabs yerine gerçek insan sesiyle önceden kaydedilmiş sabit metinler
 * — `useTurkishSpeech.ts`'teki `speak()` çağrılmadan önce burada tam metin
 * eşleşmesi aranır; bulunursa Piper/tarayıcı zincirine hiç gidilmeden
 * doğrudan bu dosya çalınır (daha doğal ses, gecikmesiz, API çağrısı yok).
 * Eşleşme yoksa (dinamik kelimeler — nesne adları gibi) mevcut zincir
 * değişmeden çalışmaya devam eder.
 *
 * Bazı metinlerin birden fazla kaydı var (farklı seslendirme denemeleri) —
 * bunlar arasından her çalışta rastgele biri seçilir (bkz. `pickTtsAsset`),
 * Harf Avı'nın 3 soru şablonu arasında rastgele seçim yapan deseniyle tutarlı.
 *
 * Kaynak: kullanıcının kendi kaydettiği ses dosyaları
 * (`public/sounds/tts/`), 2026-09-15'te toplu olarak eklendi.
 */
const TTS_MANIFEST: Record<string, string[]> = {
    // A1 — Harf sorma şablonları (tr.json `game.findLetter` ile birebir, harf interpolasyonlu)
    'Hadi A harfini bulalım!': ['/sounds/tts/harf-hadi-a.mp3'],
    'A harfi nerede?': ['/sounds/tts/harf-nerede-a.mp3'],
    'Hadi B harfini bulalım!': ['/sounds/tts/harf-hadi-b.mp3'],
    'B harfi nerede?': ['/sounds/tts/harf-nerede-b.mp3'],
    'Hadi C harfini bulalım!': ['/sounds/tts/harf-hadi-c.mp3'],
    'C harfi nerede?': ['/sounds/tts/harf-nerede-c.mp3'],
    'Hadi Ç harfini bulalım!': ['/sounds/tts/harf-hadi-c.mp3'],
    'Ç harfi nerede?': ['/sounds/tts/harf-nerede-c.mp3'],
    'Bakalım, Ç harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-c.mp3'],
    'Hadi D harfini bulalım!': ['/sounds/tts/harf-hadi-d.mp3'],
    'D harfi nerede?': ['/sounds/tts/harf-nerede-d.mp3'],
    'Hadi E harfini bulalım!': ['/sounds/tts/harf-hadi-e.mp3'],
    'E harfi nerede?': ['/sounds/tts/harf-nerede-e.mp3'],
    'Bakalım, E harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-e.mp3'],
    'Hadi F harfini bulalım!': ['/sounds/tts/harf-hadi-f.mp3'],
    'F harfi nerede?': ['/sounds/tts/harf-nerede-f.mp3'],
    'Hadi G harfini bulalım!': ['/sounds/tts/harf-hadi-g.mp3'],
    'G harfi nerede?': ['/sounds/tts/harf-nerede-g.mp3'],
    'Bakalım, G harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-g.mp3'],
    'Bakalım, Ğ harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-g.mp3'],
    'Hadi H harfini bulalım!': ['/sounds/tts/harf-hadi-h.mp3'],
    'H harfi nerede?': ['/sounds/tts/harf-nerede-h.mp3'],
    'Bakalım, H harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-h.mp3'],
    'Bakalım, I harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-i.mp3'],
    'Bakalım, İ harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-i.mp3'],
    'Bakalım, J harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-j.mp3'],
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
    'Bakalım, Ö harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-o.mp3'],
    'Bakalım, P harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-p.mp3'],
    'Hadi R harfini bulalım!': ['/sounds/tts/harf-hadi-r.mp3'],
    'Hadi S harfini bulalım!': ['/sounds/tts/harf-hadi-s.mp3', '/sounds/tts/harf-hadi-s-v2.mp3'],
    'S harfi nerede?': ['/sounds/tts/harf-nerede-s.mp3'],
    'Hadi Ş harfini bulalım!': ['/sounds/tts/harf-hadi-s.mp3'],
    'Ş harfi nerede?': ['/sounds/tts/harf-nerede-s.mp3'],
    'Hadi T harfini bulalım!': ['/sounds/tts/harf-hadi-t.mp3'],
    'T harfi nerede?': ['/sounds/tts/harf-nerede-t.mp3'],
    'U harfi nerede?': ['/sounds/tts/harf-nerede-u.mp3'],
    'Bakalım, U harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-u.mp3'],
    'Bakalım, Ü harfini bulabilecek misin?': ['/sounds/tts/harf-bakalim-u.mp3'],
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

    // A3 — AAC kelimeleri (15/18 mevcut — Sakinim/Oynamak/Uyumak eksik, Piper'a düşer)
    Açım: ['/sounds/tts/aac-acim.mp3'],
    Dur: ['/sounds/tts/aac-dur.mp3'],
    Evet: ['/sounds/tts/aac-evet.mp3'],
    Hastayım: ['/sounds/tts/aac-hastayim.mp3'],
    Hayır: ['/sounds/tts/aac-hayir.mp3'],
    Kızgınım: ['/sounds/tts/aac-kizginim.mp3'],
    Lütfen: ['/sounds/tts/aac-lutfen.mp3'],
    Mutluyum: ['/sounds/tts/aac-mutluyum.mp3'],
    Su: ['/sounds/tts/aac-su.mp3'],
    Susadım: ['/sounds/tts/aac-susadim.mp3'],
    Tuvalet: ['/sounds/tts/aac-tuvalet.mp3'],
    Yardım: ['/sounds/tts/aac-yardim.mp3'],
    Yorgunum: ['/sounds/tts/aac-yorgunum.mp3'],
    Üzgünüm: ['/sounds/tts/aac-uzgunum.mp3'],
    İstiyorum: ['/sounds/tts/aac-istiyorum.mp3'],

    // B1 — Kutlama (tr.json `feedback.success` — 4/6 mevcut, Aferin!/Bravo! eksik)
    'Harika!': ['/sounds/tts/kutlama-harika.mp3'],
    'Mükemmel!': ['/sounds/tts/kutlama-mukemmel.mp3'],
    'Süpersin!': ['/sounds/tts/kutlama-supersin.mp3'],
    'Çok güzel!': ['/sounds/tts/kutlama-cok-guzel.mp3'],

    // B2 — Teşvik (tr.json `feedback.retry` — 3/3 tam)
    'Tekrar deneyelim mi?': ['/sounds/tts/tesvik-tekrar-deneyelim-mi.mp3'],
    'Bir daha bakalım': ['/sounds/tts/tesvik-bir-daha-bakalim.mp3'],
    'Birlikte bulalım': ['/sounds/tts/tesvik-birlikte-bulalim.mp3'],
};

/** Metin tam olarak eşleşiyorsa kayıtlı ses dosyalarından birini (varsa birden fazla varyanttan rastgele) döndürür, yoksa null. */
export function pickTtsAsset(text: string): string | null {
    const variants = TTS_MANIFEST[text];
    if (!variants || variants.length === 0) return null;
    return variants[Math.floor(Math.random() * variants.length)];
}
