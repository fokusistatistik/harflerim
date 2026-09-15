# Seslendirmeler — Statik Ses Envanteri

> Bu dosya, projedeki TÜM seslendirme (TTS) noktalarının envanteri ve statik ses dosyalarıyla eşleştirmesidir. `PROMPTLAR.md`'nin (görsel üretim) sesteki karşılığı.
>
> Oluşturulma: 2026-09-14. **2026-09-15 1. tur:** ElevenLabs yerine kullanıcının kendi kaydettiği 105 ses dosyası statik katman olarak entegre edildi. **2026-09-15 2. tur (aynı gün, "standart hale getirme"):** Envanter 214 kaynak dosyaya genişletildi — harf şablonları kapsamı büyüdü, AAC kelimeleri BİLİNÇLİ OLARAK boşaltıldı (ayrı bir turda yeniden kaydedilecek), ve en önemlisi Harf Avı'nın "dinamik" sayılan 71 nesne/ipucu kelimesi (`LETTER_OBJECTS`) artık STATİK — bu, D bölümündeki eski "Piper'da kalmalı" kararını geçersiz kılıyor (bkz. güncellenmiş D bölümü). **2026-09-15 3. tur:** Piper/tarayıcı `speechSynthesis` fallback zinciri TAMAMEN KALDIRILDI (kullanıcı isteği: "sadece mp3 kayıtlardan seçsin") — artık kayıt yoksa robotik ses yerine SESSİZ kalınıyor (özgün-anlamlı metinler: AAC, Aile Albümü cümleleri) veya mevcut kayıtlar arasından rastgele seçiliyor (rastgele-havuzlu metinler: kutlama/teşvik/harf sorma). Ayrıca bu turda Türkçe özel harf çiftlerinde (C/Ç, S/Ş, G/Ğ, I/İ, O/Ö, U/Ü) dosya adı slug çakışması nedeniyle 9 dosyanın birbirinin üzerine yazıldığı KRİTİK bir hata bulunup düzeltildi (kullanıcı bulgusu: "Bakalım Ü harfini bulabilecek misin" diyor U da) — tüm harf-şablon dosyaları hash bazında kaynağıyla yeniden doğrulandı.

## 🔴 KRİTİK — 4 Modülde Ses Kaydı Olmayan Metinler (2026-09-15, 3. tur)

Aşağıdakiler Faz 2.11 denetiminden geçmiş 4 modülde (**Harf Avı, Gölge Eşleştirme, Hafıza Kartları, Aile Albümü**) gerçekten kullanılan ama `public/sounds/tts/`'te KAYDI OLMAYAN metinlerdir. 3. tur mimari değişikliği (Piper/robotik fallback kaldırıldı) nedeniyle bunların hiçbiri artık ses ÇIKARMIYOR — sessiz kalıyorlar. Öncelik sırasına göre:

🔴 **Gölge Eşleştirme ve Hafıza Kartları'nın KENDİ özel metni yok** — ikisi de yalnızca paylaşılan kutlama/teşvik havuzunu (`celebrateSuccess`/`encourageRetry`) kullanıyor, o havuz TAM (B1 4/6, B2 3/3) — bu iki oyunda kritik eksik YOK, aşağıdaki liste yalnızca Harf Avı ve Aile Albümü'nü kapsıyor.

🔴 **Harf Avı — 29 eksik harf-şablon kombinasyonu** (87 olası kombinasyondan, 3 şablon × 29 harf):
```
Bakalım: F, R, S, Ş, T harfleri için "Bakalım X harfini bulabilecek misin?" YOK
Hadi: Ğ, I, İ, J, L, M, N, O, Ö, P, U, Ü, V, Y, Z harfleri için "Hadi X harfini bulalım!" YOK
Nerede: Ğ, I, İ, J, Ö, P, R, Ü, V harfleri için "X harfi nerede?" YOK
```
Etkisi: Bu harfler round'a geldiğinde `askLetter()` şimdi 3 şablonun geri kalanından (varsa) rastgele seçiyor — ör. "L" harfi sorulduğunda "Hadi" YOK ama "Nerede"/"Bakalım" var, o ikisinden biri çalınır. Yalnızca ÜÇÜ DE eksikse (bu 29'un içinde böyle bir harf yok — her harfin en az 1 şablonu var, bkz. A1 tablosu) tamamen sessiz kalınır.

🔴 **Aile Albümü — Ebeveyn Paneli "Dinle" butonu, 7 yakınlık kelimesi eksik:**
```
Anneanne, Babaanne, Dede (anne tarafı), Dede (baba tarafı), Hala, Kuzen, Yenge, Bakıcı
```
Etkisi: Ebeveyn panelinde bu kelimeleri seçince "Dinle" butonuna tıklandığında artık HİÇ SES ÇIKMIYOR (önceden robotik sese düşerdi). Not: "Dede" için cümle formu (`Bu senin dede`) kayıtlı, yalnızca tek-kelime önizlemesi eksik.

🔴 **Aile Albümü — Sesli ipucu cümlesi, 2 yakınlık eksik:**
```
Bakıcı, Komşu ("Bu senin bakıcı" / "Bu senin komşu" YOK)
```
Etkisi: Hedef kişi "Bakıcı" veya "Komşu" olan bir round'da "Sesli ipucu" butonuna basılırsa artık SESSİZ kalır.

**Toplam: 39 eksik metin** (29 harf-şablon kombinasyonu + 10 Aile Albümü). Tam liste `src/lib/ttsManifest.ts`'teki mevcut anahtarlarla karşılaştırılarak programatik olarak çıkarıldı, doğrulandı.

---

## Şu anki mimari

Projede **tek katmanlı bir statik ses sistemi** var, `src/hooks/useTurkishSpeech.ts` üzerinden (2026-09-15, 3. turda Piper/`speechSynthesis` fallback'leri KALDIRILDI — kullanıcı isteği: "sadece mp3 kayıtlardan seçsin"):

1. **Özgün-anlamlı metinler** (`speak(text)` — AAC, "Bu kim?", Aile Albümü yakınlık cümlesi/kelimesi gibi) — `src/lib/ttsManifest.ts`'teki tam-metin eşleştirme tablosundan (`pickTtsAsset`) aranır. Bulunursa çalınır, bulunmazsa **SESSİZ KALINIR** (yanlış kelime çalmaktansa hiç çalmamak tercih edildi).
2. **Rastgele-havuzlu metinler** (`celebrateSuccess()`, `encourageRetry()`, `askLetter()`) — artık `tr.json`'dan rastgele metin seçip sonra o metni aramıyor; doğrudan mevcut ses kayıtları arasından rastgele seçiyor (`pickRandomTtsAssetForCategory`, veya `askLetter` için harfin kayıtlı şablonları arasından). Bu sayede bu üçü için asla "kayıt yok" durumu oluşmaz.

**Kayıt kaynağı:** Kullanıcının kendi kaydettiği sesler (`sesler_part1` klasörü) — ses karakteri KARIŞIK (bazı metinler farklı seslerle okunmuş, tek bir "Papatya"/"Coşkun" karakter ayrımı garanti değil, aşağıdaki A/B bölümlerindeki karakter ataması artık yalnızca METİN KATEGORİSİ anlamına geliyor, ses kimliği garantisi değil). Dosyalar `public/sounds/tts/` altında TEK düz klasörde, dosya adı önekiyle kategorize (`harf-*`, `aile-*`, `kutlama-*`, `tesvik-*`, `ekstra-*`, `nesne-*`, `sayilar/`). **`aac-*` önekiyle dosya artık YOK** — 2. turda AAC klasörü bilinçli olarak boşaltıldı.

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

**Durum (2026-09-15, 2. tur ile genişledi): 29 harfin HEPSİ en az bir şablonda kayıtlı, kapsam 1. tura göre büyüdü ama hâlâ hiçbir harf için 3 şablonun TAMAMI yok (kasıtlı — kullanıcı kararı, her harf 1-3 varyantla kayıtlı, artık bazı harfler 3'ün 2'sini de kapsıyor).** `src/lib/ttsManifest.ts`'e entegre edildi, Playwright ile doğrulandı.

```
1. Hadi {{harf}} harfini bulalım!
2. {{harf}} harfi nerede?
3. Bakalım, {{harf}} harfini bulabilecek misin?
```

**Harf başına hangi şablon(lar) kayıtlı (2. tur sonrası):**
| Harf | Hadi | Nerede | Bakalım |
|---|---|---|---|
| A,B,C,D | ✅ | ✅ | ✅ |
| Ç,E,G,H | ✅ | ✅ | ✅ |
| F | ✅ | ✅ | ❌ |
| Ğ,I,İ,J,Ö,P | ❌ | ❌ | ✅ |
| K | ✅ | ✅ | ✅ |
| L,M,N,O,U,Y,Z | ❌ | ✅ | ✅ |
| R | ✅ | ❌ | ❌ |
| S,Ş,T | ✅ | ✅ | ❌ |
| Ü,V | ❌ | ❌ | ✅ |

Eksik kombinasyonlar için (2026-09-15, 3. tur güncellemesi) kod artık Piper'a düşmüyor — `askLetter()` o harfin kayıtlı diğer şablonlarından rastgele seçiyor, hiçbiri kayıtlı değilse sessiz kalıyor (bkz. yukarıdaki 🔴 KRİTİK bölüm). **K ve V harfleri için 2'şer varyant** var (K: "K"/"Ke" okunuşu, V: normal/fazladan-harfli kayıt), **S/Ş harflerinin "Hadi" şablonu için de 2 varyant** var — kullanıcı onayıyla hepsi tutuldu, çalışta rastgele seçilir.

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

**Not:** "Diğer" ile serbest metin girilen kayıtlar (örn. "Aile dostu") bu sabit listede yer almaz — bunlar için `speak()` artık sessiz kalır (3. tur, Piper kaldırıldı). "Bakıcı" ve "Komşu" cümle formu eksik — bu iki yakınlık için sesli ipucu artık sessiz kalır (bkz. 🔴 KRİTİK bölüm), oyunu bozmaz.

**Kod entegrasyonu: ✅ TAMAMLANDI (2026-09-15).** `src/lib/ttsManifest.ts` + `useTurkishSpeech.ts`'teki `speak()` fonksiyonu (3. turdan itibaren yalnızca statik dosya, Piper yok). `FamilyAlbumGame.tsx`'teki `speak(\`Bu senin ${target.relation.toLocaleLowerCase('tr-TR')}\`)` ve `FamilyMembersTab.tsx`'teki `speak(relation)` çağrıları hiç değişmedi, otomatik olarak yerel dosyadan faydalanıyor. Playwright ile doğrulandı: "Sesli ipucu" butonuna tıklanınca `aile-cumle-anne.mp3` doğru çaldı.

**İkinci kullanım noktası — Ebeveyn Paneli, "Dinle" butonu (2026-09-15, tespit edildi/eklendi):** `FamilyMembersTab.tsx:273` — aile bireyi eklerken/düzenlerken yakınlık derecesi seçilince (`relation !== 'Diğer'`), o kelimenin nasıl okunduğunu duyabilmek için `speak(relation)` çağrılan ayrı bir "Dinle" (hoparlör) butonu var. Bu, A4'teki 21 kelimenin AYNI ses varlığını kullanıyor — yeni bir metin üretimi gerektirmiyor, sadece kod tarafında ikinci bir çağrı noktası (oyun içi toast/ipucu + ebeveyn panelindeki önizleme). ElevenLabs entegrasyonunda tek bir yerel dosya her iki noktada da paylaşılabilir.

### A3. AAC Tahtası — 18 kelime (`src/store/aacData.ts`, her biri tek başına okunuyor, interpolasyon yok)

**Durum (2026-09-15, 2. tur): 0/18 — BİLİNÇLİ OLARAK BOŞ.** 1. turda 15/18 kayıtlıydı; kullanıcı "standart hale getirme" turunda tüm eski `public/sounds/tts/` içeriğini silip yeni bir envanterle değiştirdi, yeni envanterde AAC kelimeleri yoktu ("onları sonra yapacağım" — ayrı bir turda tekrar kaydedilecek). Şu an 18 kelimenin TAMAMI sessiz kalıyor (2026-09-15, 3. tur — Piper zinciri kaldırıldığı için artık robotik sese de düşmüyor, doğrudan ses çıkmıyor) — oyunu bozmuyor, AAC panelinde o kelimeye dokunulunca yalnızca görsel/piktogram tepkisi kalıyor.

**İhtiyaçlar (6):**
```
İstiyorum ❌   Su ❌   Tuvalet ❌   Yardım ❌   Açım ❌   Susadım ❌
```

**Duygular (6):**
```
Mutluyum ❌   Üzgünüm ❌   Yorgunum ❌   Kızgınım ❌   Hastayım ❌   Sakinim ❌
```

**Günlük Yaşam (6):**
```
Dur ❌   Evet ❌   Hayır ❌   Lütfen ❌   Oynamak ❌   Uyumak ❌
```

**Kod entegrasyonu:** `AacBoard.tsx`'teki `speak(symbol.word)` çağrısı hiç değişmedi — `ttsManifest.ts`'te AAC kelimeleri için hiç girdi yok, dolayısıyla `pickTtsAsset()` her zaman `null` döner ve `speak()` sessiz kalır (3. tur, Piper yok). Yeni AAC kayıtları geldiğinde tek yapılacak iş `ttsManifest.ts`'e ilgili satırları eklemek (kod değişikliği gerekmez, yalnızca manifest güncellemesi).

---

## B) Erkek Ses — "Coşkun" — Metin Listesi

> **Not (2026-09-15):** Gerçek kayıtların ses karakteri karışık geldi (kullanıcı: "sesler karma kimisi erkek kimisi kadın") — bu bölüm başlığı yalnızca METİN KATEGORİSİ anlamına geliyor, kayıtlı dosyanın gerçekten erkek sesiyle okunduğu garanti değil.

### B1. Kutlama/başarı (6 — `celebrateSuccess()` ile rastgele biri okunur)

**Durum: 4/6 kayıtlı ve entegre edildi, "Aferin!"/"Bravo!" eksik — ama bu iki metin `celebrateSuccess()`'in `tr.json` havuzunda hiç yok artık (3. tur, kategori bazlı seçime geçildi), dolayısıyla pratikte hiç çağrılmıyor, eksiklik teorik.**

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

## D) Harf Avı ipucu kelimesi — artık STATİK (2026-09-15, 2. turda değişti)

**Bu bölüm eskiden "dinamik, Piper'da kalmalı" diyordu — artık GEÇERSİZ (hem statikleşti hem Piper kaldırıldı).** Harf Avı'nın ipucu kelimesi (`GameBoard.tsx` → `speak(randomObj.word)`) `LETTER_OBJECTS`'teki (`src/store/gameData.ts`) sabit 71 kelimeden birini okuyor — DB'den geliyor olsa da (`prisma/seedContent.ts` tohumlama kaynağı) kelime havuzu proje-geneli sabit bir liste, tamamen rastgele/kullanıcı-üretimi değil. Kullanıcı 2. turda bu 71 kelimenin TAMAMINI kaydettirdi (aynı zamanda Hafıza Kartları'nın 100 karşılaştırma görseli isimlerinin 71'i — bkz. F bölümü) ve `ttsManifest.ts`'e eklendi.

**Durum: ✅ 71/71 kayıtlı ve entegre, Playwright ile doğrulandı** (hedef harf "Z" → `harf-nerede-z.mp3`, ipucu kelimesi "Zürafa" → `nesne-zurafa.mp3`, ikisi de art arda yerel dosyadan çaldı).

**Not — hâlâ gerçekten dinamik kalan tek nokta:** Ebeveyn panelinden `LETTER_OBJECTS` listesine YENİ bir kelime eklenirse (kod değişikliği veya gelecekteki bir ebeveyn-içerik-yönetimi özelliğiyle), o yeni kelime `ttsManifest.ts`'te olmayacağı için `speak()` sessiz kalır (3. tur, Piper yok) — sistem bunu kendiliğinden idare eder, oyun bozulmaz, ama o kelime seslendirilmeyene kadar kayıt eklenmesi gerekir. Yani "dinamik" tanımı artık yalnızca *henüz kaydedilmemiş yeni kelimeler* için geçerli, mevcut sabit havuz için değil.

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

## Kayıt durumu özeti (2026-09-15, 2. tur sonrası)

| Bölüm | Toplam metin | Kayıtlı | Entegre | Eksik |
|---|---|---|---|---|
| A1 — Harf şablonları | 87 (29×3) | 58 kombinasyon (harf başına 1-3/3) | ✅ | 29 kombinasyon (🔴 KRİTİK bölümde listelendi, artık sessiz kalır) |
| A2 — "Bu kim?" | 1 | 1 | ✅ | — |
| A4 — Yakınlık cümlesi | 21 | 19 | ✅ | Bakıcı, Komşu |
| A4 — Yakınlık tek kelime (ebeveyn) | 21 | 13 | ✅ | 8 (🔴 KRİTİK, artık sessiz kalır) |
| A3 — AAC | 18 | **0 (2. turda bilinçli olarak boşaltıldı)** | — | 18 — ayrı bir turda yeniden kaydedilecek |
| D — Harf Avı nesne/ipucu kelimeleri | 71 | 71 | ✅ | — (**yeni**, 2. turda tamamen statikleşti) |
| B1 — Kutlama | 6 | 4 | ✅ | Aferin!, Bravo! |
| B2 — Teşvik | 3 | 3 | ✅ | — |
| C — Kullanılmayan | 3 | 3 (kayıtlı ama entegre edilmedi, kod onları hiç seslendirmiyor) | — | — |
| Rakamlar (kapsam dışı) | 0-10 | 11 | — (hiçbir oyun kullanmıyor, envanterde duruyor) | — |

**Kaynak klasör:** kullanıcının kendi kaydettiği `sesler_part1` (Windows: `Desktop/melike/sesler_part1`) — **2. turda tüm 1. tur dosyaları silinip klasör 217 yeni ham dosyayla değiştirildi** (kullanıcı: "SESLERİ STANDART hale getiriyorum az önceki mp3 leri siler misin yeni liste vereceğim"). 214'ü `public/sounds/tts/` altına kopyalandı (3'ü rakam/harf tekrarı nedeniyle aynı hedefe gitti — `sayılar` klasörü öncekiyle aynı kaldığı için tekrar kopyalanmadı sayılmadı). AAC kelimeleri (13 dosya) bu turda YOK, o kelimeler artık boş.

**Bilinen tuhaflıklar (kod tarafında zararsız, gelecekte kayıt tazelenirken hatırlanmalı):**
- "K harfi nerede" ve "Ke harfi nerede" iki farklı kayıt (harfin okunuşu farklı) — ikisi de tutuldu, rastgele seçiliyor.
- "Bakalım V harfini bulabilecek misin(n)" ve "Hadi Ş harfini bulalım(m)" için fazladan harfli isimlendirilmiş ikinci bir kayıt var — kullanıcı onayladı, farklı ses denemeleri, ikisi de tutuldu.
- Ğ, Ö, Ü harflerinin kendi ayrı "Bakalım" kayıtları var (`Bakalım Ğ/Ö/Ü harfini bulabilecek misin.mp3`) — benzer sesli harften (G/O/U) paylaştırma YAPILMADI, her biri kendi dosyasına gidiyor, manifest'te doğru eşleşti.
- "arı.mp3"/"at.mp3"/"civciv.mp3" küçük harfle, DB'deki adlar büyük harfle ("Arı"/"At"/"Civciv") — kullanıcı onayıyla aynı kelime kabul edildi.
- "Işık.mp3" dosyası DB'deki tam ad "Trafik Işığı"nın kısaltması — kullanıcı onayıyla aynı nesne için kullanıldı, `ttsManifest.ts`'te anahtar `LETTER_OBJECTS`'teki gerçek `speak()` metnine (`Işık`) göre yazıldı, DB'deki uzun ada göre değil.

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
- **Hafıza Kartları** (`memory-match`) — `src/actions/comparisonPairs.ts` üzerinden `ComparisonItem` havuzundan çift seçiyor (ilgi alanı ağırlıklandırmalı, bkz. `moduller/hafizakartlari.md`). Nesne adını hiç seslendirmiyor, yalnızca görsel etiket.
- **Harf Avı** (`letter-hunt`) — `LETTER_OBJECTS` (`src/store/gameData.ts`) harf başına 1-5 nesne referans veriyor, bu 100 görselin 71'i burada kullanılıyor (kalan 29'u yalnızca Hafıza Kartları'nda). `speak(randomObj.word)` ile SESLENDİRİLİYOR.
- **2026-09-15, 2. tur ile YENİ bağlantı:** Bu 71 nesnenin Türkçe adı artık aynı zamanda ses envanterinin bir parçası — bkz. güncellenmiş D bölümü. Yani bu F bölümündeki görsel envanteri ile D bölümündeki ses envanteri artık kısmen aynı 71 kelimeyi paylaşıyor (görsel `public/karsilastirma/*.jpg`, ses `public/sounds/tts/nesne-*.mp3`, ikisi ayrı dosya ama aynı Türkçe kelimeye karşılık geliyor).

**Not:** "Hepsi eksik" ifadesi muhtemelen bu envanterin daha önce hiç bu dosyada listelenmemiş olmasına işaret ediyor (görsellerin kendisi zaten `public/karsilastirma/` altında mevcut ve kullanımda) — eksik olan doküman kaydıydı, görsel dosyaları değil. Gerçekten eksik/istenen yeni bir görsel varsa ayrıca belirtilmesi gerekir.

---

## Kod entegrasyonu (TAMAMLANDI, 2026-09-15)

`src/lib/ttsManifest.ts` (tam-metin → dosya yolu eşleştirmesi, `pickTtsAsset()`) + `src/hooks/useTurkishSpeech.ts`'teki `speak()` fonksiyonu (3. turdan itibaren yalnızca statik dosya çalar, Piper/tarayıcı fallback'i yok). Hiçbir oyun dosyası değişmedi — tüm `speak()`/`askLetter()`/`celebrateSuccess()`/`encourageRetry()` çağrıları olduğu gibi kaldı, katman şeffaf çalışıyor. `tsc --noEmit` ve `eslint` temiz, Playwright ile Harf Avı ve Aile Albümü'nde gerçek tarayıcıda doğrulandı (network istekleri izlenerek, yerel dosyanın gerçekten çaldığı teyit edildi).

## Açık kalan kararlar

- **AAC'nin 18 kelimesi ne zaman yeniden kaydedilecek** (2. turda bilinçli olarak boşaltıldı, kullanıcı "sonra yapacağım" dedi) — bu en öncelikli açık madde, çünkü AAC iletişim için kritik.
- Diğer eksik kayıtlar (Aferin/Bravo, Bakıcı/Komşu cümle formu, bazı yakınlık tek-kelimeleri, ~27 harf şablonu kombinasyonu) ne zaman tamamlanacak?
- `DayComplete.tsx`'in seslendirilip seslendirilmeyeceği (şu an sessiz, kayıt da yok).
- C bölümündeki 3 metin ("Çok yaklaştın!" vb.) gerçekten kullanılmaya başlanacak mı, yoksa `tr.json`'dan temizlenecek mi?

## İlgili doküman: Müzik Köşesi

`muzik.md` — Suno ile Müzik Köşesi için üretilecek özgün şarkıların prompt kütüphanesi (bkz. YOL-HARITASI.md 4.10), bu dosyanın "kaynak/prompt/karar tek yerde" ilkesini müzik için taşıyan kardeş dokümanı. Konuşma/TTS'ten ayrı bir kapsam (müzik, sözlü yönerge değil) ama aynı otizm-duyarlı tasarım prensiplerini (ani ses değişimi yok, sakin ton, öngörülebilir yapı) paylaşıyor.
