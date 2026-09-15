# Seslendirmeler — Statik Ses Envanteri

> Bu dosya, projedeki TÜM seslendirme (TTS) noktalarının envanteri ve statik ses dosyalarıyla eşleştirmesidir. `PROMPTLAR.md`'nin (görsel üretim) sesteki karşılığı.
>
> Oluşturulma: 2026-09-14. **2026-09-15 güncellemesi:** ElevenLabs yerine kullanıcının kendi kaydettiği 105 ses dosyası (`public/sounds/tts/`) statik katman olarak entegre edildi — aşağıdaki mimari artık UYGULANDI (önceki "henüz uygulanmadı" notu geçersiz).

## Şu anki mimari

Projede **üç katmanlı bir TTS zinciri** var, `src/hooks/useTurkishSpeech.ts` üzerinden (`speak(text)` çağrıldığında sırayla denenir):

1. **Statik yerel dosya (birincil, 2026-09-15 eklendi)** — `src/lib/ttsManifest.ts`'teki tam-metin eşleştirme tablosu (`pickTtsAsset`). `speak()` çağrılan metin tabloda varsa `public/sounds/tts/` altındaki gerçek ses kaydı doğrudan çalınır, API çağrısı yapılmaz. Birden fazla kaydı olan metinler (ör. harf şablonlarının bazı varyantları) arasından rastgele biri seçilir.
2. **Piper TTS (ikincil)** — kendi barındırılan Python servisi (`python/services/tts_service.py`), model `tr_TR-dfki-medium.onnx` (tek konuşmacılı, DFKI Türkçe veri seti). `/api/tts` route'u üzerinden proxy'lenir, sonuç disk üzerinde SHA-256 hash'li dosya adıyla önbelleklenir (`python/cache/tts/*.wav`). Statik dosya bulunamazsa (dinamik metin — nesne adları gibi) buraya düşülür.
3. **Tarayıcı `speechSynthesis` (fallback)** — Piper de başarısız olursa sessizce buna düşülür, ses seçimi kontrolsüz (yalnızca `lang=tr-TR`, cihaza bağlı).

**Kayıt kaynağı:** Kullanıcının kendi kaydettiği sesler (`sesler_part1` klasörü) — ses karakteri KARIŞIK (bazı metinler farklı seslerle okunmuş, tek bir "Papatya"/"Coşkun" karakter ayrımı garanti değil, aşağıdaki A/B bölümlerindeki karakter ataması artık yalnızca METİN KATEGORİSİ anlamına geliyor, ses kimliği garantisi değil). Dosyalar `public/sounds/tts/` altında TEK düz klasörde, dosya adı önekiyle kategorize (`harf-*`, `aile-*`, `aac-*`, `kutlama-*`, `tesvik-*`, `ekstra-*`).

---

## Ses karakteri ataması

İki sabit karakter sesi tanımlandı — otizmli bir çocuk için ses tutarlılığı önemli olduğundan, her karakterin ElevenLabs'ta **tek bir sabit ses ID'sine** sabitlenmesi ve bir daha değiştirilmemesi gerekir.

| Karakter | Cinsiyet | Rol | Kullanıldığı senaryolar |
|---|---|---|---|
| **Papatya (Anlatıcı)** | Kadın | Sakin, sıcak, yönlendirici — sorular sorar, yönlendirir | Harf sorma (B1), AAC kelimeleri (E), "Bu kim?" (C-16) |
| **Coşkun (Kutlama Sesi)** | Erkek | Enerjik, sıcak, motive edici — kutlar, teşvik eder | Kutlama/başarı (C4-9), Teşvik/tekrar (C10-12) |

**ElevenLabs ses seçim kriterleri (her iki karakter için):**
- Türkçe doğal telaffuz (ElevenLabs'ın multilingual v2 modeli veya Türkçe-native bir ses)
- Sakin, ağır olmayan, tiz/keskin olmayan ton — ani perde değişimleri yok (otizmli çocuklarda duyusal hassasiyet)
- Çocuk dostu ama çocuksu/yapay değil — gerçek, sıcak bir yetişkin sesi
- Stabilite ayarı yüksek tutulmalı (ElevenLabs "Stability" slider'ı) — cümle-cümle ton tutarlılığı için

---

## A) Kadın Ses — "Papatya" — Metin Listesi

### A1. Harf sorma şablonları (`{{harf}}` interpolasyonlu, harf her okunuşta değişir)

**Durum: 29 harfin HEPSİ en az bir şablonda kayıtlı, ama hiçbir harf için 3 şablonun TAMAMI yok (kasıtlı — kullanıcı kararı, her harf 1-2 varyantla kayıtlı).** `src/lib/ttsManifest.ts`'e entegre edildi, Playwright ile doğrulandı (2026-09-15).

```
1. Hadi {{harf}} harfini bulalım!
2. {{harf}} harfi nerede?
3. Bakalım, {{harf}} harfini bulabilecek misin?
```

**Harf başına hangi şablon(lar) kayıtlı:**
| Harf | Hadi | Nerede | Bakalım |
|---|---|---|---|
| A,B,C,D,F | ✅ | ✅ | ❌ |
| Ç,E,G,H | ✅ | ✅ | ✅ |
| Ğ,I,İ,J,Ö,P | ❌ | ❌ | ✅ |
| K,L,M,N,O,U,Y,Z | ❌ | ✅ | ✅ |
| R | ✅ | ❌ | ❌ |
| S,Ş,T | ✅ | ✅ | ❌ |
| Ü,V | ❌ | ❌ | ✅ |

Eksik kombinasyonlar için kod otomatik olarak Piper/tarayıcı zincirine düşer (bkz. `ttsManifest.ts`, tam metin eşleşmezse `null` döner) — round hiç bozulmaz, sadece o an ses biraz daha az doğal olur. **K ve V harfleri için 2'şer varyant** var (K: "K"/"Ke" okunuşu, V: normal/fazladan-harfli kayıt) — kullanıcı onayıyla ikisi de tutuldu, çalışta rastgele seçilir.

**Harf isimleri (Türk alfabesi, 29 harf — ayrı kaydedilmedi, yalnızca referans):**
```
A, Be, Ce, Çe, De, E, Fe, Ge, Yumuşak Ge, He, I, İ, Je, Ke, Le, Me, Ne, O, Ö, Pe, Re, Se, Şe, Te, U, Ü, Ve, Ye, Ze
```

### A2. Aile Albümü sabit metni

```
16. Bu kim?
```

**Durum: ✅ kayıtlı ve entegre** (`aile-bu-kim.mp3`), Playwright ile round başında gerçekten çaldığı doğrulandı.

### A4. Aile Albümü — yakınlık derecesi kelimeleri (2026-09-15 eklendi, aynı gün entegre edildi)

Oyun artık özel ad değil yakınlık derecesi soruyor/gösteriyor (`src/config/familyRelations.ts`, 21 sabit seçenek — "Diğer" hariç, o serbest metin). Üç kullanım noktası var: (1) sesli ipucu butonu `speak("Bu senin {{yakınlık}}")`, (2) doğru-cevap toast'ı (yalnızca görsel, seslendirilmiyor), (3) ebeveyn panelindeki "Dinle" butonu `speak("{{yakınlık}}")` (tek kelime, cümle değil).

**Taşıyıcı cümle şablonu (sesli ipucu):**
```
17. Bu senin {{yakınlık}}!
```

**21 yakınlık kelimesi — kayıt durumu:**
| Yakınlık | Cümle formu (`Bu senin X`) | Tek kelime (ebeveyn "Dinle") |
|---|---|---|
| Anne | ✅ | ❌ |
| Baba | ✅ | ✅ |
| Abla | ✅ | ✅ |
| Ağabey | ✅ | ✅ |
| Kız Kardeş | ✅ | ✅ |
| Erkek Kardeş | ✅ | ✅ |
| Anneanne | ✅ | ❌ |
| Babaanne | ✅ | ❌ |
| Dede (anne/baba tarafı) | ✅ (tek kayıt, Türkiye'de iki tarafa da "dede" deniyor — kullanıcı kararı, iki seçenekte de aynı dosya kullanılıyor) | ❌ |
| Teyze | ✅ | ✅ |
| Hala | ✅ | ❌ |
| Dayı | ✅ | ✅ |
| Amca | ✅ | ✅ |
| Kuzen | ✅ | ❌ |
| Yenge | ✅ | ❌ |
| Enişte | ✅ | ✅ |
| Arkadaş | ✅ | ✅ |
| Öğretmen | ✅ | ✅ |
| Bakıcı | ❌ | ❌ |
| Komşu | ❌ | ✅ |

**Not:** "Diğer" ile serbest metin girilen kayıtlar (örn. "Aile dostu") bu sabit listede yer almaz — bunlar her zaman dinamik kalır, Piper'a düşer (D bölümündeki mantıkla aynı). "Bakıcı" ve "Komşu" cümle formu eksik — bu iki yakınlık için sesli ipucu Piper'a düşer, oyunu bozmaz.

**Kod entegrasyonu: ✅ TAMAMLANDI (2026-09-15).** `src/lib/ttsManifest.ts` + `useTurkishSpeech.ts`'teki `speak()` fonksiyonuna eklenen `speakWithLocalFile` katmanı — Piper'dan önce denenir. `FamilyAlbumGame.tsx`'teki `speak(\`Bu senin ${target.relation.toLocaleLowerCase('tr-TR')}\`)` ve `FamilyMembersTab.tsx`'teki `speak(relation)` çağrıları hiç değişmedi, otomatik olarak yerel dosyadan faydalanıyor. Playwright ile doğrulandı: "Sesli ipucu" butonuna tıklanınca `aile-cumle-anne.mp3` doğru çaldı.

**İkinci kullanım noktası — Ebeveyn Paneli, "Dinle" butonu (2026-09-15, tespit edildi/eklendi):** `FamilyMembersTab.tsx:273` — aile bireyi eklerken/düzenlerken yakınlık derecesi seçilince (`relation !== 'Diğer'`), o kelimenin nasıl okunduğunu duyabilmek için `speak(relation)` çağrılan ayrı bir "Dinle" (hoparlör) butonu var. Bu, A4'teki 21 kelimenin AYNI ses varlığını kullanıyor — yeni bir metin üretimi gerektirmiyor, sadece kod tarafında ikinci bir çağrı noktası (oyun içi toast/ipucu + ebeveyn panelindeki önizleme). ElevenLabs entegrasyonunda tek bir yerel dosya her iki noktada da paylaşılabilir.

### A3. AAC Tahtası — 18 kelime (`src/store/aacData.ts`, her biri tek başına okunuyor, interpolasyon yok)

**Durum: 15/18 kayıtlı ve entegre edildi, 3 eksik (Piper'a düşer).**

**İhtiyaçlar (6):**
```
İstiyorum ✅   Su ✅   Tuvalet ✅   Yardım ✅   Açım ✅   Susadım ✅
```

**Duygular (6):**
```
Mutluyum ✅   Üzgünüm ✅   Yorgunum ✅   Kızgınım ✅   Hastayım ✅   Sakinim ❌
```

**Günlük Yaşam (6):**
```
Dur ✅   Evet ✅   Hayır ✅   Lütfen ✅   Oynamak ❌   Uyumak ❌
```

**Kod entegrasyonu: ✅ TAMAMLANDI (2026-09-15).** `AacBoard.tsx`'teki `speak(symbol.word)` çağrısı değişmedi, `ttsManifest.ts` üzerinden otomatik yerel dosyaya yönleniyor. "Sakinim"/"Oynamak"/"Uyumak" için kayıt yok — bu üçü Piper'a düşmeye devam ediyor, oyunu bozmuyor.

---

## B) Erkek Ses — "Coşkun" — Metin Listesi

> **Not (2026-09-15):** Gerçek kayıtların ses karakteri karışık geldi (kullanıcı: "sesler karma kimisi erkek kimisi kadın") — bu bölüm başlığı yalnızca METİN KATEGORİSİ anlamına geliyor, kayıtlı dosyanın gerçekten erkek sesiyle okunduğu garanti değil.

### B1. Kutlama/başarı (6 — `celebrateSuccess()` ile rastgele biri okunur)

**Durum: 4/6 kayıtlı ve entegre edildi, "Aferin!"/"Bravo!" eksik (Piper'a düşer).**

```
4. Harika! ✅
5. Çok güzel! ✅
6. Aferin! ❌
7. Mükemmel! ✅
8. Süpersin! ✅
9. Bravo! ❌
```

### B2. Teşvik/tekrar (3 — `encourageRetry()` ile rastgele biri okunur)

**Durum: ✅ 3/3 TAM, entegre edildi.**

```
10. Tekrar deneyelim mi? ✅
11. Bir daha bakalım ✅
12. Birlikte bulalım ✅
```

**B1+B2 kod entegrasyonu: ✅ TAMAMLANDI (2026-09-15).** `useTurkishSpeech.ts`'teki `celebrateSuccess()`/`encourageRetry()` değişmedi (hâlâ `tr.json`'dan rastgele metin seçiyor), `speak()` içindeki yerel-dosya katmanı metni tanıyorsa otomatik yerel dosyayı çalıyor. Playwright ile "Bir daha bakalım"/"Birlikte bulalım" gerçekten yerel dosyadan çaldığı doğrulandı.

---

## C) Şu an kullanılmayan / gelecekte değerlendirilecek metinler

Bu metinler `src/locales/tr.json`'da tanımlı ama kod hiçbir yerde bunları bir TTS fonksiyonuna vermiyor (ölü içerik) — kullanılmaya başlanırsa diye ses kaydı zaten alınmış (✅), ama entegre edilmedi (kod hâlâ bu metinleri hiç seslendirmiyor):

```
13. Çok yaklaştın! ✅ (kayıtlı, kullanılmıyor)
14. Devam et! ✅ (kayıtlı, kullanılmıyor)
15. Sen yaparsın! ✅ (kayıtlı, kullanılmıyor)
```

Bu üçü `ttsManifest.ts`'e BİLİNÇLİ OLARAK eklenmedi — kod onları hiç `speak()`'e vermediği için ekleseydik ölü kod olurdu. Bu metinler kullanılmaya başlanırsa (`ekstra-cok-yaklastin.mp3` vb. zaten `public/sounds/tts/` altında hazır) manifest'e eklenmesi yeterli.

Ayrıca ekranda gösterilen ama hiç seslendirilmeyen metinler var (bilinçli bir ürün kararı olabilir, tekrar değerlendirilmeli):
- `CalmingMode.tsx`: "Nefes al...", "Nefes ver..." — sakinleştirme modunda sesin OLMAMASI kasıtlı olabilir (sessizlik terapötik), dokunulmadan bırakılması önerilir.
- `DayComplete.tsx`: "Harfler Uyudu. Yarın Görüşürüz!", "Bugün harika bir iş çıkardın. Şimdi dinlenme zamanı." — gün sonu ekranı, seslendirilmesi iyi bir aday olabilir, henüz kayıt yok.

---

## D) Dinamik metinler — statik kayda UYGUN DEĞİL, Piper'da kalmalı

Bu metinler çalışma zamanında değişen içerik (nesne/kelime adları, DB'den geliyor) — önceden kaydedilemez, Piper TTS zincirinde kalmalı:

- Harf Avı'nın ipucu kelimesi (`GameBoard.tsx` → `speak(randomObj.word)`) — `LETTER_OBJECTS`'teki ~240 kelime, DB'den geliyor, ebeveyn tarafından genişletilebilir. Bilinçli olarak `ttsManifest.ts`'e eklenmedi.

---

## E) Kayıtlı ses efektleri (TTS DEĞİL — ayrı bir konu, bilgi amaçlı)

Bu dosyalar insan sesi değil, oyun efekti — ElevenLabs kapsamı dışında ama envanterin bütünlüğü için not edildi:

| Dosya | Kullanım | Olay |
|---|---|---|
| `public/sounds/win.mp3` | 3 oyun | Doğru cevap/eşleşme |
| `public/sounds/bonus.mp3` | Harf Avı | Round tamamlama |
| `public/sounds/error.wav` | 2 oyun | Yanlış cevap |
| `public/sounds/success.wav` | Gölge Eşleştirme | Doğru eşleşme (AUDIOS sabitinden ayrı, tutarsız kullanım — bkz. not) |
| `public/sounds/pop.wav` | Gölge Eşleştirme | Sürükleme başlangıcı |

**Bulunan tutarsızlık (kod borcu, bu dosyanın kapsamı dışı ama not edildi):** `visual-match/GameBoard.tsx` `success.wav`/`pop.wav`'ı `AUDIOS` sabiti üzerinden değil doğrudan path string ile çağırıyor — merkezi ses yönetimiyle tutarsız.

**Ayrıca:** `MemoryMatchGame.tsx`'teki kart çevirme sesi (`playFlip`) hâlâ harici `cdn.freesound.org` linkine bağlı — diğer freesound linkleri yerel dosyalarla değiştirilmişken bu biri atlanmış. Ayrı bir küçük düzeltme olarak not edildi.

---

## Kayıt durumu özeti (2026-09-15 itibarıyla)

| Bölüm | Toplam metin | Kayıtlı | Entegre | Eksik |
|---|---|---|---|---|
| A1 — Harf şablonları | 87 (29×3) | 53 kombinasyon (harf başına 1-2/3) | ✅ | 34 kombinasyon (kasıtlı, Piper'a düşer) |
| A2 — "Bu kim?" | 1 | 1 | ✅ | — |
| A4 — Yakınlık cümlesi | 21 | 19 | ✅ | Bakıcı, Komşu |
| A4 — Yakınlık tek kelime (ebeveyn) | 21 | 12 | ✅ | 9 (Piper'a düşer) |
| A3 — AAC | 18 | 15 | ✅ | Sakinim, Oynamak, Uyumak |
| B1 — Kutlama | 6 | 4 | ✅ | Aferin!, Bravo! |
| B2 — Teşvik | 3 | 3 | ✅ | — |
| C — Kullanılmayan | 3 | 3 (kayıtlı ama entegre edilmedi, kod onları hiç seslendirmiyor) | — | — |
| Rakamlar (kapsam dışı, D/E değil) | 0-10 | 11 | — (hiçbir oyun kullanmıyor, envanterde duruyor) | — |

**Kaynak klasör:** kullanıcının kendi kaydettiği `sesler_part1` (Windows: `Desktop/melike/sesler_part1`) — 113 ham dosya, 105'i `public/sounds/tts/` altına kopyalandı (kalan 8'i: 2 yazım-hatalı-ama-geçerli varyant zaten v2 olarak tutuldu, aslında hepsi kopyalandı — bkz. `src/lib/ttsManifest.ts` tam liste).

**Bilinen tuhaflıklar (kod tarafında zararsız, gelecekte kayıt tazelenirken hatırlanmalı):**
- "K harfi nerede" ve "Ke harfi nerede" iki farklı kayıt (harfin okunuşu farklı) — ikisi de tutuldu, rastgele seçiliyor.
- "Bakalım V harfini bulabilecek misin(n)" ve "Hadi Ş harfini bulalım(m)" için fazladan harfli isimlendirilmiş ikinci bir kayıt var — kullanıcı onayladı, farklı ses denemeleri, ikisi de tutuldu.
- Ğ, Ö, Ü harflerinin kendi ayrı "Bakalım" kayıtları var (`Bakalım Ğ/Ö/Ü harfini bulabilecek misin.mp3`) — benzer sesli harften (G/O/U) paylaştırma YAPILMADI, her biri kendi dosyasına gidiyor, manifest'te doğru eşleşti.

---

## F) Görsel envanteri — Karşılaştırma görselleri / Harf Avı nesne kartları (2026-09-15 eklendi)

> Kullanıcı isteğiyle eklendi: "elimizdeki görsellerin tek tek listele dokumana ekle onların hepsi eksik" — Harf Avı'nın "kartları" ile Hafıza Kartları'nın karşılaştırma görselleri AYNI havuzu paylaşıyor (Harf Avı kendi ayrı görsel setine sahip değil, `LETTER_OBJECTS` — `src/store/gameData.ts` — doğrudan `/karsilastirma/*.jpg` yollarına referans veriyor). Bu yüzden tek bir envanter yeterli.

**Durum: 100/100 görsel `public/karsilastirma/` altında, DB'deki (`ComparisonItem`) 100 kayıtla birebir eşleşiyor (dosya↔kayıt karşılıklı kontrol edildi, ne fazla ne eksik dosya var).** Format `.jpg`, dosya adı = DB `slug` alanı.

**Hayvan (27):** Arı, At, Balık, Civciv, Deve, Eşek, Fil, Hindi, Kaplumbağa, Karınca, Kedi, Kelebek, Kirpi, Koyun, Kurbağa, Kuzu, Köpek, Muhabbet Kuşu, Panda, Penguen, Tavuk, Tavşan, Yunus, Zürafa, Ördek, Ördek Yavrusu, İnek

**Eşya (18):** Anahtar, Diş Fırçası, Gitar, Güneş Gözlüğü, Kalemler, Kaşık, Olta, Piyano, Raket, Saat, Tabak, Tencere, Toka, Trafik Işığı, Valiz, Çanta, İp, Şemsiye

**Meyve-Sebze (15):** Ananas, Domates, Elma, Havuç, Karpuz, Kavun, Kayısı, Kivi, Limon, Muz, Nar, Patates, Portakal, Soğan, Üzüm

**Oyuncak (11):** Araba, Ayıcık, Balon, Gemi, Otobüs, Paten, Top, Traktör, Uçak, Vinç, Üçgen

**Yiyecek (10):** Ceviz, Dondurma, Donut, Ekmek, Jelibon, Pasta, Simit, Yumurta, Zeytin, Çikolata

**Giyim (6):** Ayakkabı, Elbise, Eldiven, Pantolon, Çorap, Şapka

**Doğa (5):** Ağaç, Gökkuşağı, Lale, Yaprak, Çiçek

**Gezegen/Gökyüzü (4):** Dünya, Güneş, Satürn, Yıldız

**Mobilya (3):** Masa, Sandalye, Yatak

**Araç (1):** Bisiklet

**Kullanım noktaları:**
- **Hafıza Kartları** (`memory-match`) — `src/actions/comparisonPairs.ts` üzerinden `ComparisonItem` havuzundan çift seçiyor (ilgi alanı ağırlıklandırmalı, bkz. `moduller/hafizakartlari.md`).
- **Harf Avı** (`letter-hunt`) — `LETTER_OBJECTS` (`src/store/gameData.ts`) harf başına 1-5 nesne referans veriyor, HEPSİ bu 100 görselden bir alt küme (yalnızca `prisma/seedContent.ts`'in DB tohumlama kaynağı, çalışma zamanı DB'den okunuyor — bkz. dosya başındaki uyarı yorumu).
- Görsellerin kendisi ElevenLabs/ses envanteriyle ilgisiz — bu bölüm yalnızca kullanıcının "eksik" dediği görsel envanterini tamamlamak için buraya eklendi, ses/TTS kapsamına girmiyor.

**Not:** "Hepsi eksik" ifadesi muhtemelen bu envanterin daha önce hiç bu dosyada listelenmemiş olmasına işaret ediyor (görsellerin kendisi zaten `public/karsilastirma/` altında mevcut ve kullanımda) — eksik olan doküman kaydıydı, görsel dosyaları değil. Gerçekten eksik/istenen yeni bir görsel varsa ayrıca belirtilmesi gerekir.

---

## Kod entegrasyonu (TAMAMLANDI, 2026-09-15)

`src/lib/ttsManifest.ts` (tam-metin → dosya yolu eşleştirmesi, `pickTtsAsset()`) + `src/hooks/useTurkishSpeech.ts`'teki `speak()` fonksiyonuna eklenen `speakWithLocalFile` katmanı (Piper'dan önce denenir). Hiçbir oyun dosyası değişmedi — tüm `speak()`/`askLetter()`/`celebrateSuccess()`/`encourageRetry()` çağrıları olduğu gibi kaldı, katman şeffaf çalışıyor. `tsc --noEmit` ve `eslint` temiz, Playwright ile Harf Avı ve Aile Albümü'nde gerçek tarayıcıda doğrulandı (network istekleri izlenerek, yerel dosyanın gerçekten çaldığı teyit edildi).

## Açık kalan kararlar

- Eksik kayıtlar (Sakinim/Oynamak/Uyumak, Aferin/Bravo, Bakıcı/Komşu/Anne-tek-kelime/Anneanne-tek-kelime vb.) ne zaman tamamlanacak?
- `DayComplete.tsx`'in seslendirilip seslendirilmeyeceği (şu an sessiz, kayıt da yok).
- C bölümündeki 3 metin ("Çok yaklaştın!" vb.) gerçekten kullanılmaya başlanacak mı, yoksa `tr.json`'dan temizlenecek mi?
