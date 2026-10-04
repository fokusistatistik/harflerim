# Seslendirmeler — Statik Ses Envanteri

> Projedeki tüm seslendirme (TTS) noktalarının envanteri ve statik ses dosyası eşleştirmesi. Görsel karşılığı `PROMPTLAR.md`, müzik karşılığı `muzik.md`.

## Mimari

Tek katmanlı statik ses sistemi (`src/hooks/useTurkishSpeech.ts`) — Piper/`speechSynthesis` fallback'i yok, yalnızca kayıtlı mp3 çalar.

1. **Özgün-anlamlı metinler** (`speak(text)`) — `src/lib/ttsManifest.ts`'teki tam-metin eşleştirmeden (`pickTtsAsset`) aranır. Bulunamazsa sessiz kalır (yanlış kelime çalmaktansa hiç çalmamak tercih edildi).
2. **Rastgele-havuzlu metinler** (`celebrateSuccess()`, `encourageRetry()`, `askLetter()`) — mevcut kayıtlar arasından rastgele seçer, "kayıt yok" durumu hiç oluşmaz.

**Ses karakteri:** Tek kadın ses — "Papatya". Otizmli bir çocukta ses tutarlılığı önemli olduğu için erkek/ikinci karakter ayrımı kaldırıldı. Eski kayıtların bir kısmı (B bölümü) farklı seslerle okunmuş olabilir, korunuyor; yeni kayıtlar hep Papatya ile yapılır. Kriterler: doğal Türkçe telaffuz, sakin/ani perde değişimi olmayan ton, sıcak ama yapay olmayan yetişkin sesi.

**Kaynak klasör:** Kullanıcının kendi kaydettiği sesler, `public/sounds/tts/` altında düz klasör, önekle kategorize (`harf-*`, `aile-*`, `kutlama-*`, `tesvik-*`, `ekstra-*`, `nesne-*`, `sayilar/`). `aac-*` öneki şu an boş (bkz. H).

---

## A) Harf sorma şablonları

```
1. Hadi {{harf}} harfini bulalım!
2. {{harf}} harfi nerede?
3. Bakalım, {{harf}} harfini bulabilecek misin?
```

29 harfin hepsi en az bir şablonda kayıtlı; hiçbiri üçünün tamamını kapsamıyor (kasıtlı). Eksik kombinasyonda kod diğer kayıtlı şablondan rastgele seçer, hiçbiri yoksa sessiz kalır.

| Harf | Hadi | Nerede | Bakalım |
|---|---|---|---|
| A, B, C, Ç, D, E, G, H, K | ✅ | ✅ | ✅ |
| F | ✅ | ✅ | ❌ |
| Ğ, I, İ, J, Ö, P | ❌ | ❌ | ✅ |
| L, M, N, O, U, Y, Z | ❌ | ✅ | ✅ |
| R | ✅ | ❌ | ❌ |
| S, Ş, T | ✅ | ✅ | ❌ |
| Ü, V | ❌ | ❌ | ✅ |

**Harf isimleri (referans):** A, Be, Ce, Çe, De, E, Fe, Ge, Yumuşak Ge, He, I, İ, Je, Ke, Le, Me, Ne, O, Ö, Pe, Re, Se, Şe, Te, U, Ü, Ve, Ye, Ze

**Bilinen varyantlar:** K ve V harflerinde 2'şer kayıt, S/Ş'nin "Hadi" şablonunda 2 varyant, Ğ/Ö/Ü'nün kendi ayrı "Bakalım" kayıtları var — hepsi tutuldu, rastgele seçiliyor.

### A2. Aile Albümü sabit metni

```
Bu kim?
```
✅ Kayıtlı, entegre.

### A3. AAC — eski havuz (geçersiz)

Eski 18 kelimelik havuzun yerini H bölümündeki yeni havuz aldı; kod (`src/store/aacData.ts`) henüz güncellenmedi.

### A4. Aile Albümü — yakınlık derecesi kelimeleri

`src/config/familyRelations.ts`, 20 sabit seçenek ("Diğer" hariç, serbest metin — sessiz kalır). Üç kullanım noktası: sesli ipucu (`Bu senin {{yakınlık}}!`), ebeveyn panelinde "Dinle" (tek kelime), doğru-cevap toast'ı (yalnızca görsel).

| Yakınlık | Cümle | Tek kelime |
|---|---|---|
| Anne | ✅ | ❌ |
| Baba | ✅ | ✅ |
| Abla | ✅ | ✅ |
| Ağabey | ✅ | ✅ |
| Kız Kardeş | ✅ | ✅ |
| Erkek Kardeş | ✅ | ✅ |
| Anneanne | ✅ | ❌ |
| Babaanne | ✅ | ❌ |
| Dede | ✅ (iki taraf için aynı kayıt) | ❌ |
| Teyze | ✅ | ✅ |
| Hala | ✅ | ❌ |
| Dayı | ✅ | ✅ |
| Amca | ✅ | ✅ |
| Kuzen | ✅ | ❌ |
| Yenge | ✅ | ❌ |
| Enişte | ✅ | ✅ |
| Arkadaş | ✅ | ✅ |
| Öğretmen | ✅ | ✅ |
| Komşu | ❌ | ✅ |

✅ Kod entegrasyonu tamamlandı, Playwright ile doğrulandı.

---

## B) Kutlama/Teşvik Metinleri

Eski adı "Erkek Ses" — artık yalnızca metin kategorisi, ses karakteri anlamı yok.

**Kutlama (`celebrateSuccess()`, rastgele):**
```
Harika! ✅   Çok güzel! ✅   Aferin! ❌   Mükemmel! ✅   Süpersin! ✅   Bravo! ❌
```

**Teşvik (`encourageRetry()`, rastgele):**
```
Tekrar deneyelim mi? ✅   Bir daha bakalım ✅   Birlikte bulalım ✅
```

✅ Kod entegrasyonu tamamlandı, doğrulandı.

---

## C) Kayıtlı ama kullanılmayan metinler

Kayıt var, ama kod hiçbir yerde `speak()`'e vermiyor:
```
Çok yaklaştın! · Devam et! · Sen yaparsın!
```
Kullanılmaya başlanırsa `ttsManifest.ts`'e eklenmesi yeterli.

Seslendirilmeyen ama ekranda gösterilen metinler: `CalmingMode.tsx` "Nefes al/ver" (kasıtlı olabilir, sessizlik terapötik), `DayComplete.tsx` gün sonu metinleri (iyi bir aday, bkz. G1).

---

## D) Harf Avı ipucu kelimesi

`LETTER_OBJECTS`'teki (`src/store/gameData.ts`) 71 sabit kelime — DB'den geliyor ama havuz sabit. ✅ 71/71 kayıtlı ve entegre (tam liste F'de). Yeni kelime eklenirse kayıt yapılana kadar sessiz kalır, oyun bozulmaz.

---

## E) Ses efektleri (TTS değil)

| Dosya | Kullanım | Olay |
|---|---|---|
| `win.mp3` | 3 oyun | Doğru cevap/eşleşme |
| `bonus.mp3` | Harf Avı | Round tamamlama |
| `error.wav` | 2 oyun | Yanlış cevap |
| `success.wav` | Gölge Eşleştirme | Doğru eşleşme |
| `pop.wav` | Gölge Eşleştirme | Sürükleme başlangıcı |

Kod borcu: `visual-match/GameBoard.tsx` bu ikisini `AUDIOS` sabiti yerine doğrudan path ile çağırıyor. `MemoryMatchGame.tsx`'in kart çevirme sesi hâlâ `cdn.freesound.org`'a bağlı.

---

## F) Görsel envanteri — Karşılaştırma kartları

Harf Avı ve Hafıza Kartları aynı havuzu (`ComparisonItem`, `public/karsilastirma/*.jpg`) paylaşır — 100/100 görsel, DB kaydıyla birebir eşleşiyor.

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

Harf Avı bu 100'ün 71'ini sesli kullanıyor (`LETTER_OBJECTS`). Kalan 29'u yalnızca Hafıza Kartları'nda görsel — ama sesi zaten hazır, ileride bir "nesne adını söyle" özelliği için yeni kayıt gerekmez.

---

## G) Oyun modülü dışı seslendirme ihtiyaçları

Henüz hiçbiri kayıtlı/seslendirilmiyor — envanter/öneri.

**G1. Gün sonu kapanışı (`DayComplete.tsx`) — güçlü aday:**
```
Harfler Uyudu. Yarın Görüşürüz!
Bugün harika bir iş çıkardın. Şimdi dinlenme zamanı.
```

**G2. Sakinleştirme modu çıkış butonu:**
```
Devam Edelim
Oynamaya devam et
```

**G3. Genel hata mesajı** (proje şu an özel bir hata sayfası kullanmıyor, `error.tsx` ayrı bir kod işi):
```
Bir şeyler ters gitti, sorun değil.
Ebeveynine haber verelim mi?
Az sonra tekrar deneyelim.
```

**G4. Ana sayfa karşılaması — açık karar gerekiyor:** Şu an `"Hoş Geldin {isim}!"`, dinamik ve seslendirilmiyor. Statik-only mimari her çocuk için ayrı kayıt gerektirir (ölçeklenmez) veya jenerik bir karşılamaya ("Hoş geldin!") geçilebilir.

**Seslendirilmemesi önerilenler:** Ebeveyn Kapısı (yanlış PIN'in duyulması güvenlik riski), yükleme/loading ekranları (sık tekrarı yorucu olabilir).

---

## H) İletişim Tahtası (AAC) — Yeni Kelime Havuzu

Eski 18 kelimelik havuzun yerini alacak, 223 kelime/ifadelik yeni tasarım. **Yalnızca kelime hazırlığı — kod (`aacData.ts`), UI ve ses kaydı henüz yapılmadı.**

**Yaklaşım:** Core Vocabulary ilkesi (yüksek sıklıklı, esnek kelimeler önce) + Brown'ın gelişim evreleri (1→2→3→4 kelime kademeli genişleme). 6 kategori, her seviyede aynı: İhtiyaçlar ve İstekler · Duygular ve Bedensel Durum · Eylemler · Sosyal İletişim · Kişiler/Yerler/Zaman · Tanımlayıcılar ve Duyusal Algı. Somut/net dil, deyim/mecaz/sarkazm yok.

### H1. Tek Kelime (103)

**İhtiyaçlar ve İstekler:** İstiyorum, İstemiyorum, Su, Yemek, Açım, Susadım, Tuvalet, Yardım, Dur, Bitti, Yoruldum, Yeter, Uyku, Giymek, Oyuncak, Kitap, Dinlenmek

**Duygular ve Bedensel Durum:** Mutluyum, Üzgünüm, Kızgınım, Korkuyorum, Yorgunum, Sakinim, Heyecanlıyım, Şaşırdım, Hastayım, Ağrıyor, İyiyim, Rahatsızım, Bunaldım, Gururluyum, Utandım, Sıkıldım

**Eylemler:** Git, Gel, Oyna, Ye, İç, Uyu, Bak, Dinle, Ver, Al, Aç, Kapat, Otur, Kalk, Koş, Yıka, Giy, Paylaş

**Sosyal İletişim:** Merhaba, Güle güle, Teşekkürler, Lütfen, Özür dilerim, Evet, Hayır, Belki, Tamam, Rica ederim, Hoş geldin, Günaydın, İyi geceler, Affedersin, Bilmiyorum, Anlamadım, Tekrar

**Kişiler, Yerler ve Zaman:** Anne, Baba, Öğretmen, Arkadaş, Okul, Ev, Bahçe, Park, Dışarı, İçeri, Bugün, Yarın, Şimdi, Sonra, Hastane, Market, Oyun odası

**Tanımlayıcılar ve Duyusal Algı:** Büyük, Küçük, Sıcak, Soğuk, Hızlı, Yavaş, Gürültülü, Sessiz, Parlak, Karanlık, Yumuşak, Sert, Temiz, Kirli, Aynı, Farklı, Çok, Az

### H2. İki Kelime (66)

**İhtiyaçlar ve İstekler:** Su istiyorum · Yemek istiyorum · Bunu istemiyorum · Tuvalete gitmek · Yardım istiyorum · Daha istiyorum · Artık yeter · Biraz dinlenmek · Oyuncak istiyorum · Kitap okumak · Ellerimi yıkamak

**Duygular ve Bedensel Durum:** Çok mutluyum · Biraz üzgünüm · Canım sıkıldı · Karnım ağrıyor · Başım ağrıyor · Çok yorgunum · Biraz korkuyorum · İyi hissetmiyorum · Sakinleşmek istiyorum · Çok heyecanlıyım · Yalnız hissediyorum

**Eylemler:** Bana ver · Beraber oynayalım · Müzik dinle · Kitap oku · Dışarı çık · İçeri gir · Elini yıka · Resim çiz · Yavaş yürü · Beraber yapalım · Bana bak

**Sosyal İletişim:** Nasılsın · İyi günler · Görüşürüz sonra · Tekrar söyle · Ne demek · Yardım eder misin · Adın ne · Kaç yaşındasın · Merhaba, nasılsın · Çok teşekkürler · Gerçekten özür dilerim

**Kişiler, Yerler ve Zaman:** Annemi istiyorum · Babam nerede · Okula gidiyorum · Eve gidelim · Parka gidelim · Şimdi değil · Yarın gidelim · Öğretmenim nerede · Arkadaşım geldi · Dışarı çıkalım · Bahçede oynayalım

**Tanımlayıcılar ve Duyusal Algı:** Çok gürültülü · Çok parlak · Çok yüksek · Daha yavaş · Çok sıcak · Çok soğuk · Bu farklı · Çok karanlık · Işığı kapat · Sesi kıs · Biraz sessiz

### H3. Üç Kelime (36)

**İhtiyaçlar ve İstekler:** Su içmek istiyorum · Yemek yemek istiyorum · Tuvalete gitmek istiyorum · Biraz yardım istiyorum · Bunu istemiyorum artık · Dışarı çıkmak istiyorum

**Duygular ve Bedensel Durum:** Kendimi kötü hissediyorum · Çok kızgın hissediyorum · Biraz sakinleşmek istiyorum · Yalnız kalmak istiyorum · Sarılmak istiyorum sana · Sesler beni rahatsız ediyor

**Eylemler:** Beraber oyun oynayalım · Bana kitap oku · Elimi tutar mısın · Yavaşça bana anlat · Beni dinler misin · Birlikte dışarı çıkalım

**Sosyal İletişim:** Adın ne senin · Nasıl yardımcı olabilirim · Bunu tekrar eder misin · Seninle oynayabilir miyim · Bunu anlamadım, tekrarla · Benimle konuşur musun

**Kişiler, Yerler ve Zaman:** Annemle konuşmak istiyorum · Bugün okula gitmiyorum · Parka gitmek istiyorum · Arkadaşımla oynamak istiyorum · Şimdi eve gidelim · Öğretmenimle konuşmak istiyorum

**Tanımlayıcılar ve Duyusal Algı:** Bu çok gürültülü · Işığı biraz kıs · Sesi çok yüksek · Bu bana batıyor · Çok parlak burası · Daha yavaş konuş

### H4. Dört Kelime (18)

**İhtiyaçlar ve İstekler:** Biraz su içmek istiyorum · Şimdi tuvalete gitmek istiyorum · Yemek yemek istiyorum şimdi

**Duygular ve Bedensel Durum:** Şu anda kendimi kötü hissediyorum · Biraz yalnız kalmak istiyorum · Bu ses beni rahatsız ediyor

**Eylemler:** Benimle oyun oynar mısın · Bana kitabı okur musun · Lütfen elimi tutar mısın

**Sosyal İletişim:** Seninle arkadaş olabilir miyim · Bunu bana açıklar mısın lütfen · Adın ne senin, söyler misin

**Kişiler, Yerler ve Zaman:** Bugün parka gitmek istiyorum · Annemle babamla oynamak istiyorum · Yarın okula gitmek istemiyorum

**Tanımlayıcılar ve Duyusal Algı:** Bu ışık çok parlak · Bu ses çok yüksek geliyor · Lütfen sesi biraz kıs

### Sonraki adımlar

**H1+H2+H3+H4 = 223 kelime/ifade.** Hiçbiri kodda/seste mevcut değil. Uygulanmadı: `aacData.ts` güncellenmedi, UI'ye yansıtılmadı, ARASAAC piktogram eşleştirmesi yapılmadı, ses kaydı alınmadı.

**Önerilen sıra:** H1 (103 tek kelime, en yüksek etki) → H2 (66 iki-kelimelik) → H3+H4 (54 ifade, muhtemelen ayrı bir "gelişmiş mod").

---

## Eksik / önerilen kayıtlar (4 oyun taraması)

**Yeni kayıt gerekenler:**
```
Nesnenin gölgesine bak, doğru resmi bul ve üzerine sürükle.   (Gölge Eşleştirme — tek talimat, hiç seslendirilmiyor)
Gölgeye bak, hangisi ona benziyor?                             (Gölge Eşleştirme — ipucu, hiç yok)
Hepsini buldun! Harika iş çıkardın!                            (Hafıza Kartları — round tamamlama)
Harflerle mi, nesnelerle mi eşleştirmek istersin?              (Hafıza Kartları — mod seçimi)
Başka birine bakalım!                                          (Aile Albümü — 30sn zaman aşımı geçişi)
```

**Günlük tur limiti dolduğunda (4 oyun, oyun adı değişiyor):**
```
Bugünkü harf avı turların bitti, yarın yine oynayabilirsin.
Bugünkü gölge eşleştirme turların bitti, yarın tekrar oynayabilirsin.
Bugünkü hafıza kartları turların bitti, yarın tekrar oynayabilirsin.
Bugünkü aile albümü turların bitti, yarın tekrar oynayabilirsin.
```

**Düşük öncelik:**
```
Söylenen harfi doğru yere sürükle.        (Harf Avı GameIntroCard — round başı zaten sesli soru var)
{harf} harfini buldun!                     (Hafıza Kartları harf modu, 29 harf — Harf Avı zaten kapsıyor)
```

**Kayıt gerekmiyor, yalnızca kod eksik:** Gölge Eşleştirme doğru cevap kutlaması (B1 havuzu kullanılabilir) · Aile Albümü doğru cevapta yakınlık adının tekrarı (A4 kaydı zaten var) · Hafıza Kartları/Gölge Eşleştirme'de nesne adı (F'deki 100 nesnenin sesi zaten hazır).

---

## Kayıt durumu özeti

| Bölüm | Toplam | Kayıtlı | Entegre | Eksik |
|---|---|---|---|---|
| A1 — Harf şablonları | 87 (29×3) | 58 kombinasyon | ✅ | 29 kombinasyon (sessiz kalır) |
| A2 — "Bu kim?" | 1 | 1 | ✅ | — |
| A4 — Yakınlık cümlesi | 19 | 18 | ✅ | Komşu |
| A4 — Yakınlık tek kelime | 19 | 11 | ✅ | 8 (sessiz kalır) |
| H — AAC (yeni tasarım) | 223 | 0 | — | Tamamı — yalnızca doküman hazır |
| D — Harf Avı nesne/ipucu | 71 | 71 | ✅ | — |
| B1 — Kutlama | 6 | 4 | ✅ | Aferin!, Bravo! |
| B2 — Teşvik | 3 | 3 | ✅ | — |
| C — Kullanılmayan | 3 | 3 (entegre değil) | — | — |
| I — Oyun Dünyası (Yeni) | 24 | 0 | Hazırlandı | 24 (Kayıt bekleniyor) |
| Rakamlar (kapsam dışı) | 0-10 | 11 | — | hiçbir oyun kullanmıyor |

**Bilinen tuhaflıklar:** "K"/"Ke" için ayrı okunuş kayıtları var, ikisi de rastgele seçiliyor. Ğ/Ö/Ü'nün kendi "Bakalım" kayıtları var, benzer sesli harften paylaştırılmadı. Küçük/büyük harf farkları ("arı.mp3" vs "Arı") ve "Işık.mp3" ↔ "Trafik Işığı" kısaltması kullanıcı onayıyla aynı kelime kabul edildi.

---

## Açık kalan kararlar

- AAC havuzu (H) tamamen tasarlandı ama hiçbiri kayıtlı değil — en öncelikli açık madde, hacim büyük olduğu için kademeli planlanmalı.
- Aferin/Bravo, Komşu cümle formu, 8 yakınlık tek-kelimesi, 29 harf şablonu kombinasyonu — ne zaman tamamlanacak?
- `DayComplete.tsx` seslendirilecek mi (G1, güçlü aday, henüz kayıt yok)?
- Ana sayfa karşılaması ("Hoş Geldin {isim}!") için mimari karar gerekiyor (G4) — jenerik statik metin mi, sınırlı dinamik TTS mi, yoksa vazgeçilsin mi?
- `error.tsx` kod işi henüz yapılmadı, yalnızca metin envanteri hazır (G3).
- C bölümündeki 3 metin kullanılmaya başlanacak mı, yoksa temizlenecek mi?

## İlgili doküman

`muzik.md` — Suno ile Müzik Köşesi için özgün şarkı prompt kütüphanesi, aynı "kaynak/prompt/karar tek yerde" ilkesini müzik için taşıyor.

---

## I) Oyun Dünyası (Eğlenceli Oyunlar Hub'ı) Ses İhtiyaçları

> 4 Ekim 2026 — Oyun Dünyası (`/games/fun-hub`) kapsamındaki 4 oyun (Neşeli Havuz, Neşeli Kurbağa, Sapanla Papatya, Sakin Balonlar), ebeveyn süre sınırı yumuşak kapanış ekranı (`ArcadeDayComplete.tsx`) ve sakinleştirme geçişleri için gerekli tüm seslendirme metinleri ve ses efektleri envanteri.
> 
> **Ses karakteri:** Papatya (sakin, şefkatli yetişkin kadın sesi; ani ton/perde sıçraması yok, melodik ama fısıltı kadar dingin, otizm dostu yumuşak artikülasyon).

### I1. Yumuşak Bitiş ve Kapanış Ritüeli (Günlük Oyun Süresi Dolduğunda)

Melike okuma aşamasında olduğu için süre dolduğunda ekranda beliren şefkatli kapanış ekranında otomatik seslendirilecek metinler:

* **Ana Kapanış (Öncelikli):**
  ```
  Oyun bitti, harika oynadın! Hadi şimdi babana kocaman sarılalım!
  ```
* **Varyant 2 (Mutfak / Su İçme Rutini):**
  ```
  Oyun saati bitti! Hadi şimdi mutfaktan bir bardak taze su içelim.
  ```
* **Varyant 3 (Doğa / Pencere Rutini):**
  ```
  Bugünkü oyun süremiz doldu. Gel seninle pencereden kuşlara el sallayalım.
  ```
* **Süre Azaldı Uyarısı (Son 1 Dakika - Yumuşak Bildirim):**
  ```
  Oyun saatimizin son dakikası, birazdan bitiriyoruz.
  ```

---

### I2. Oyun İçi Yönlendirme, İpucu ve Teşvik Cümleleri

#### 1. Oyun Dünyası Ana Sayfası (`/games/fun-hub`)
```
Oyun Dünyasına hoş geldin! Bugün hangi oyunu oynamak istersin?
```

#### 2. Neşeli Havuz (`/games/fun-hub/water-pool` — Duyusal Su Etkileşimi)
```
Hadi suyla oynayalım!                                (Serbest mod girişi)
Parmaklarınla suya dokun, dalgalar yap!             (Serbest mod ipucu)
Ördeği nilüfere doğru yüzdür!                        (Görev modu — ördek hedefi)
Yunus topa doğru yüzüyor!                            (Görev modu — yunus hedefi)
Yelkenliyi kıyıya doğru yüzdür!                      (Görev modu — gemi hedefi)
Harika! Oyuncak hedefe ulaştı!                       (Görev tamamlama kutlaması)
```

#### 3. Neşeli Kurbağa (`/games/fun-hub/frog-jump` — Ritim ve Zamanlama)
```
Yaprak gelince dokun, kurbağayı zıplat!              (Oyun başı kısa kılavuz)
Zıpla!                                               (Zamanlama komutu)
Harika bir zıplayış!                                 (Yaprağa başarıyla konma)
Hop! Sorun değil, bir daha deneyelim!                (Kıyıya tutunma — no-failure teşvik)
Tüm yaprakları geçtin, süpersin!                     (Bölüm tamamlama)
```

#### 4. Sapanla Papatya (`/games/fun-hub/slingshot` — Motor Hedefleme)
```
Topu geriye doğru çek ve bırak!                      (Oyun başı kısa kılavuz)
Papatyayı sepete gönderdin, harikasın!               (Tam isabet kutlaması)
Hedefe çok yaklaştın, bir daha fırlat!               (Hedef kaçtığında teşvik)
Biraz daha geriye çekebilirsin.                      (Mesafe kısa kaldığında ipucu)
```

#### 5. Sakin Balonlar (`/games/fun-hub/bubble-pop` — Görsel Takip)
```
Uçan balonlara dokun ve patlat!                      (Serbest mod girişi)
Kırmızı balonu bulabilecek misin?                    (Renk hedef modu — kırmızı)
Sarı balonu bulabilecek misin?                       (Renk hedef modu — sarı)
Mavi balonu bulabilecek misin?                       (Renk hedef modu — mavi)
Yeşil balonu bulabilecek misin?                      (Renk hedef modu — yeşil)
Mor balonu bulabilecek misin?                        (Renk hedef modu — mor)
Tüm balonları yakaladın, tebrikler!                  (Tur tamamlama)
```

#### 6. Sakinleştirme Geçişi (`useCalmingModeMonitor` — 5 Ardışık Hata / Kaçırma Sonrası)
```
Biraz dinlenelim mi? Sakinleşme bahçesine gidelim.
```

---

### I3. Ses Efektleri (SFX Envanteri)

Tüm SFX'ler ani tepe desibeli (peak) içermeyen, yüksek frekanslı cızırtılardan arındırılmış yumuşak seslerdir:

| Efekt Dosyası | Kaynak / Yol | Kullanım Yeri | Karakteristik / Not |
|---|---|---|---|
| `splash.wav` | `public/sounds/splash.wav` | Neşeli Havuz | Yumuşak su şıpırtısı, dalga dalgalanma efekti |
| `spring.wav` | `public/sounds/spring.wav` | Neşeli Kurbağa | Yumuşak yay / mantar zıplama sesi |
| `wood_click.wav` | `public/sounds/wood_click.wav` | Sapanla Papatya | Ahşap sepet / yumuşak devrilme tıkırtısı |
| `pop.wav` | `public/sounds/pop.wav` | Sakin Balonlar | Balon patlama pıt sesi (mevcut ✅) |
| `bubble_float.wav` | `public/sounds/bubble.wav` | Sakin Balonlar | Balonların yukarı süzülme esintisi |
| `success.wav` | `public/sounds/success.wav` | Tüm Oyunlar | Bölüm sonu kutlaması (mevcut ✅) |
| `win.mp3` | `public/sounds/win.mp3` | Tüm Oyunlar | Yıldız / kupa kazanma sesi (mevcut ✅) |

---

### I4. Kayıt Listesi ve Dosya Eşleştirme Tablosu

Kayıt yapıldığında dosyalar doğrudan `public/sounds/tts/` dizinine kaydedilecek ve `ttsManifest.ts` içine eklenecektir.

| Dosya Adı | Seslendirilecek Metin | Modül / Ekran | Öncelik | Durum |
|---|---|---|---|---|
| `oyun-sure-bitti-sarilma.mp3` | Oyun bitti, harika oynadın! Hadi şimdi babana kocaman sarılalım! | ArcadeDayComplete | En Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-sure-bitti-su.mp3` | Oyun saati bitti! Hadi şimdi mutfaktan bir bardak taze su içelim. | ArcadeDayComplete (Varyant 2) | Orta | ⏳ Kayıt Bekliyor |
| `oyun-sure-bitti-kuslar.mp3` | Bugünkü oyun süremiz doldu. Gel seninle pencereden kuşlara el sallayalım. | ArcadeDayComplete (Varyant 3) | Düşük | ⏳ Kayıt Bekliyor |
| `oyun-son-bir-dakika.mp3` | Oyun saatimizin son dakikası, birazdan bitiriyoruz. | Oyun HUD / Süre Uyarısı | Orta | ⏳ Kayıt Bekliyor |
| `oyun-hub-karsilama.mp3` | Oyun Dünyasına hoş geldin! Bugün hangi oyunu oynamak istersin? | Oyun Dünyası Hub | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-havuz-giris.mp3` | Hadi suyla oynayalım! | Neşeli Havuz (Giriş) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-havuz-dalga.mp3` | Parmaklarınla suya dokun, dalgalar yap! | Neşeli Havuz (İpucu) | Orta | ⏳ Kayıt Bekliyor |
| `oyun-havuz-ordek.mp3` | Ördeği nilüfere doğru yüzdür! | Neşeli Havuz (Görev) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-havuz-yunus.mp3` | Yunus topa doğru yüzüyor! | Neşeli Havuz (Görev) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-havuz-kurtarma.mp3` | Harika! Oyuncak hedefe ulaştı! | Neşeli Havuz (Kutlama) | Orta | ⏳ Kayıt Bekliyor |
| `oyun-kurbaga-giris.mp3` | Yaprak gelince dokun, kurbağayı zıplat! | Neşeli Kurbağa (Giriş) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-kurbaga-zipla.mp3` | Zıpla! | Neşeli Kurbağa (Ritim) | Orta | ⏳ Kayıt Bekliyor |
| `oyun-kurbaga-tekrar.mp3` | Hop! Sorun değil, bir daha deneyelim! | Neşeli Kurbağa (Teşvik) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-kurbaga-kutlama.mp3` | Harika bir zıplayış! | Neşeli Kurbağa (Kutlama) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-sapan-giris.mp3` | Topu geriye doğru çek ve bırak! | Sapanla Papatya (Giriş) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-sapan-tekrar.mp3` | Hedefe çok yaklaştın, bir daha fırlat! | Sapanla Papatya (Teşvik) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-sapan-kutlama.mp3` | Papatyayı sepete gönderdin, harikasın! | Sapanla Papatya (Kutlama) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-balon-giris.mp3` | Uçan balonlara dokun ve patlat! | Sakin Balonlar (Giriş) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-balon-kirmizi.mp3` | Kırmızı balonu bulabilecek misin? | Sakin Balonlar (Hedef) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-balon-sari.mp3` | Sarı balonu bulabilecek misin? | Sakin Balonlar (Hedef) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-balon-mavi.mp3` | Mavi balonu bulabilecek misin? | Sakin Balonlar (Hedef) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-balon-yesil.mp3` | Yeşil balonu bulabilecek misin? | Sakin Balonlar (Hedef) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-balon-kutlama.mp3` | Tüm balonları yakaladın, tebrikler! | Sakin Balonlar (Kutlama) | Yüksek | ⏳ Kayıt Bekliyor |
| `oyun-sakinlesme-gecis.mp3` | Biraz dinlenelim mi? Sakinleşme bahçesine gidelim. | Sakinleştirme Monitörü | Yüksek | ⏳ Kayıt Bekliyor |

---

### I5. TTS ve Stüdyo Kayıt Parametreleri (Papatya Karakteri)

* **Ses Profili:** 25-32 yaş aralığında, sıcak anne/abla şefkati barındıran, berrak artikülasyonlu kadın sesi.
* **ElevenLabs / TTS Ayarları:**
  * Model: `eleven_multilingual_v2`
  * Stability: `%65 - %70` (Duygu dalgalanmalarını önleyip sakinliği sabit tutar).
  * Similarity Boost: `%75` (Özgün ses karakterini korur).
  * Style Exaggeration: `%0` (Abartılı çizgi film tepkileri otizmde aşırı uyarılmaya yol açtığı için kesinlikle 0 olmalıdır).
* **Audio Mastering Standartları:**
  * Format: MP3, 44.1 kHz, 16-bit, Mono veya Stereo.
  * Normalizasyon: `-14 LUFS` entegre ses seviyesi (ani desibel patlamaları engellenmeli, peak maksimum `-1.0 dBFS`).
  * Baş/Son Sessizlik: Cümle başlangıcında ve bitişinde `100ms` sessizlik boşluğu.

