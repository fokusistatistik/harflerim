# Seslendirmeler — Statik Ses Envanteri

> Bu dosya, projedeki TÜM seslendirme (TTS) noktalarının envanteri ve statik ses dosyalarıyla eşleştirmesidir. `PROMPTLAR.md`'nin (görsel üretim) sesteki karşılığı.
>
> Oluşturulma: 2026-09-14. **2026-09-15 1. tur:** ElevenLabs yerine kullanıcının kendi kaydettiği 105 ses dosyası statik katman olarak entegre edildi. **2026-09-15 2. tur (aynı gün, "standart hale getirme"):** Envanter 214 kaynak dosyaya genişletildi — harf şablonları kapsamı büyüdü, AAC kelimeleri BİLİNÇLİ OLARAK boşaltıldı (ayrı bir turda yeniden kaydedilecek), ve en önemlisi Harf Avı'nın "dinamik" sayılan 71 nesne/ipucu kelimesi (`LETTER_OBJECTS`) artık STATİK — bu, D bölümündeki eski "Piper'da kalmalı" kararını geçersiz kılıyor (bkz. güncellenmiş D bölümü). **2026-09-15 3. tur:** Piper/tarayıcı `speechSynthesis` fallback zinciri TAMAMEN KALDIRILDI (kullanıcı isteği: "sadece mp3 kayıtlardan seçsin") — artık kayıt yoksa robotik ses yerine SESSİZ kalınıyor (özgün-anlamlı metinler: AAC, Aile Albümü cümleleri) veya mevcut kayıtlar arasından rastgele seçiliyor (rastgele-havuzlu metinler: kutlama/teşvik/harf sorma). Ayrıca bu turda Türkçe özel harf çiftlerinde (C/Ç, S/Ş, G/Ğ, I/İ, O/Ö, U/Ü) dosya adı slug çakışması nedeniyle 9 dosyanın birbirinin üzerine yazıldığı KRİTİK bir hata bulunup düzeltildi (kullanıcı bulgusu: "Bakalım Ü harfini bulabilecek misin" diyor U da) — tüm harf-şablon dosyaları hash bazında kaynağıyla yeniden doğrulandı. **2026-09-15 4. tur:** Sistem TEK kadın ses karakterine sadeleştirildi (bkz. "Ses karakteri ataması"); oyun modülü dışı (açılış/kapanış/hata) seslendirme ihtiyaçları envanterlendi (bkz. G bölümü); İletişim Tahtası (AAC) kelime havuzu Core Vocabulary + Brown'ın gelişim evreleri çerçevesinde 18 kelimeden 223 kelime/ifadeye (6 kategori × 1/2/3/4-kelime seviyeleri) baştan tasarlandı — henüz yalnızca doküman/hazırlık, kod ve UI'ye yansıtılmadı (bkz. H bölümü). **2026-09-15 5. tur:** 4 denetimli oyun (Harf Avı, Gölge Eşleştirme, Hafıza Kartları, Aile Albümü) kod satır satır taranıp temel/henüz düşünülmemiş seslendirme ihtiyaçları çıkarıldı (bkz. 🔴 KRİTİK bölümündeki "5. Tur — Derin Tarama" alt bölümü) — 12 öncelikli yeni metin + isteğe bağlı 29 harf-şablonlu ek metin hazır kayıt listesi olarak eklendi. Ayrıca "Trafik Işığı"/"Işık" anahtar uyuşmazlığı `ttsManifest.ts`'te düzeltildi (kod düzeltmesi, yeni kayıt gerekmedi) — artık 100/100 karşılaştırma nesnesi tam adıyla da erişilebilir.

## 🔴 KRİTİK — 4 Modülde Ses Kaydı Olmayan Metinler (2026-09-15, 3. tur)

Aşağıdakiler Faz 2.11 denetiminden geçmiş 4 modülde (**Harf Avı, Gölge Eşleştirme, Hafıza Kartları, Aile Albümü**) gerçekten kullanılan ama `public/sounds/tts/`'te KAYDI OLMAYAN metinlerdir. 3. tur mimari değişikliği (Piper/robotik fallback kaldırıldı) nedeniyle bunların hiçbiri artık ses ÇIKARMIYOR — sessiz kalıyorlar. Öncelik sırasına göre:

🔴 **~~Gölge Eşleştirme ve Hafıza Kartları'nın KENDİ özel metni yok, kritik eksik YOK~~ — DÜZELTME (2026-09-15, 5. tur):** Bu satır 3. turda yanlış yazılmıştı. Derin tarama (5. tur) bu iki oyunda da kodda HİÇ `speak()` çağrısı olmayan ama pedagojik açıdan önemli temel eksikler bulmuştur — bkz. aşağıdaki "5. Tur — Derin Tarama" alt bölümü. Bu satırın altındaki 3. tur listesi (harf şablonu + Aile Albümü) hâlâ geçerli, ayrıca okunmalı.

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

### 🔴 5. Tur — Derin Tarama: 4 Oyunda Temel Eksik Seslendirme İhtiyaçları (2026-09-15)

> Kullanıcı isteğiyle eklendi: "bu oyunları güçlendirmek için ... temel ihtiyaç ses kayıtları varsa kritik altında bunları da ekleyebilirsin ... bu listeyi başka asistana vereceğim, biz başlamadan hazır etsinler ihtiyaç olan kelimeleri - cümleleri." Bu bölüm, 4 oyunun kodu satır satır taranarak (henüz kodda hiç `speak()` çağrısı olmayan ama pedagojik/UX değeri olan noktalar dahil) çıkarılan **hazır kayıt listesidir** — kopyala-yapıştır kullanılabilir. Her madde **YENİ KAYIT GEREKİYOR** veya **KAYIT ZATEN VAR, sadece kod eksik** olarak işaretlendi (ikincisi başka bir asistanın kaydetmesine gerek yok, bu bilgi amaçlı).

**Önemli tespit — nesne adları zaten %100 kayıtlı:** Tarama sırasında bir doküman hatası bulunup düzeltildi: `ttsManifest.ts`'teki 100 karşılaştırma nesnesinin ("Trafik Işığı" hariç) TAMAMI zaten Harf Avı'nın ipucu kelimesi olarak kayıtlıydı — yalnızca "Trafik Işığı" (DB'deki tam ad) ile "Işık" (Harf Avı'nın kullandığı kısa ad) arasında bir anahtar uyuşmazlığı vardı, bu turda `Trafik Işığı` alias'ı eklenerek KOD tarafında düzeltildi (yeni kayıt gerekmedi). Yani Gölge Eşleştirme/Hafıza Kartları ileride "eşleşen nesnenin adını söyle" özelliğini kodlarsa, **100/100 nesne için ses zaten hazır**, hiçbir yeni kayıt gerekmiyor.

#### YENİ KAYIT GEREKENLER (öncelik sırasına göre)

🔴 **Yüksek öncelik — Gölge Eşleştirme'nin oyun içi talimatı hiç seslendirilmiyor:**
```
Nesnenin gölgesine bak, doğru resmi bul ve üzerine sürükle.
```
Etkisi: Oyunun TEK yazılı açıklaması bir tıklamayla açılan bir balonda (`GameIntroCard` tooltip) — okuma bilmeyen/henüz konuşmayan bir çocuk için bu içerik fiilen erişilemez durumda. Diğer 3 oyunun hepsinde en azından round başı bir sözlü yönlendirme var (Harf Avı: harf sorusu, Aile Albümü: "Bu kim?", Hafıza Kartları: kısmen), Gölge Eşleştirme'de hiç yok.

🔴 **Orta öncelik — Gölge Eşleştirme'de ipucu mekanizması hiç yok** (diğer 3 oyunda var: Harf Avı görsel highlight, Aile Albümü sesli ipucu butonu, Hafıza Kartları örtük):
```
Gölgeye bak, hangisi ona benziyor?
```

🔴 **Orta öncelik — Hafıza Kartları'nda round tamamlanma anına özel bir kutlama yok** (şu an tek eşleşmeyle aynı jenerik havuzdan çalıyor, ayırt edilemiyor):
```
Hepsini buldun! Harika iş çıkardın!
```

🔴 **Orta öncelik — Hafıza Kartları'nda mod seçim ekranı (Harflerle/Nesnelerle) seslendirilmiyor:**
```
Harflerle mi, nesnelerle mi eşleştirmek istersin?
```

🔴 **Orta öncelik — Aile Albümü'nde 30sn zaman aşımına özel bir geçiş ifadesi yok** (yalnızca jenerik "tekrar deneyelim" çalıyor, ama bu round DEĞİŞİYOR, tekrar denenmiyor — metin yanıltıcı):
```
Başka birine bakalım!
```

🔴 **Orta öncelik — Hafıza Kartları'nın harf modunda eşleşen harfin adı söylenmiyor** (nesne modunun aksine — nesne modu için kayıt zaten hazır, ama harf modu için "X harfini buldun!" kalıbı hiç kayıtlı değil, 29 harf × 1 şablon = 29 yeni kayıt gerekir, DÜŞÜK öncelik çünkü Harf Avı zaten harf isimlerini kapsıyor, bu yalnızca Hafıza Kartları'na özel bir pekiştirme metni):
```
{harf} harfini buldun!  (29 harf için ayrı ayrı: "A harfini buldun!", "B harfini buldun!" ... "Z harfini buldun!")
```

🔴 **Düşük-orta öncelik — 4 oyunun HEPSİNDE günlük tur limiti dolduğunda gösterilen mesaj hiç seslendirilmiyor** (aynı kalıp, oyun adı değişiyor — 4 ayrı kayıt):
```
Bugünkü harf avı turların bitti, yarın yine oynayabilirsin.
Bugünkü gölge eşleştirme turların bitti, yarın tekrar oynayabilirsin.
Bugünkü hafıza kartları turların bitti, yarın tekrar oynayabilirsin.
Bugünkü aile albümü turların bitti, yarın tekrar oynayabilirsin.
```

🔴 **Düşük öncelik — Harf Avı'nın `GameIntroCard` açıklaması** (isteğe bağlı "dinle" düğmesiyle, otomatik değil — diğer oyunlardan farklı olarak Harf Avı zaten round başında harf sorusunu sesli veriyor, bu yüzden düşük öncelik):
```
Söylenen harfi doğru yere sürükle.
```

**Yeni kayıt gereken toplam: 8 tekil metin + 4 günlük-limit kalıbı + 29 harf-şablonlu "X harfini buldun!" = 41 metin** (harf şablonları hariç tutulursa 12 metin — harf şablonları düşük öncelikli, isteğe bağlı ilk turda atlanabilir).

#### KAYIT GEREKMİYOR (kod eksikliği, bilgi amaçlı — başka asistana YÜK OLUŞTURMAZ)

- **Gölge Eşleştirme'de doğru cevapta hiç kutlama sesi yok** — mevcut kutlama havuzu (B1: Harika/Çok güzel/Mükemmel/Süpersin) doğrudan yeniden kullanılabilir, `celebrateSuccess()` çağrısı kodda eksik. Yeni kayıt GEREKMİYOR.
- **Aile Albümü'nde doğru cevapta yakınlık adı sesle tekrar edilmiyor** — "Bu senin {yakınlık}" ifadeleri zaten A4'te kayıtlı (sesli ipucu butonu için), doğru cevap anında da aynı ses tekrar çalınabilir. Yeni kayıt GEREKMİYOR, yalnızca kod tarafında `triggerReward` sonrası bu sesin de çalınması gerekir.
- **Hafıza Kartları/Gölge Eşleştirme'de eşleşen nesnenin adı söylenmiyor** — yukarıda açıklandığı gibi 100/100 nesne için kayıt zaten hazır (bu turda "Trafik Işığı" alias'ı ile tamamlandı). Yeni kayıt GEREKMİYOR.

---

## Şu anki mimari

Projede **tek katmanlı bir statik ses sistemi** var, `src/hooks/useTurkishSpeech.ts` üzerinden (2026-09-15, 3. turda Piper/`speechSynthesis` fallback'leri KALDIRILDI — kullanıcı isteği: "sadece mp3 kayıtlardan seçsin"):

1. **Özgün-anlamlı metinler** (`speak(text)` — AAC, "Bu kim?", Aile Albümü yakınlık cümlesi/kelimesi gibi) — `src/lib/ttsManifest.ts`'teki tam-metin eşleştirme tablosundan (`pickTtsAsset`) aranır. Bulunursa çalınır, bulunmazsa **SESSİZ KALINIR** (yanlış kelime çalmaktansa hiç çalmamak tercih edildi).
2. **Rastgele-havuzlu metinler** (`celebrateSuccess()`, `encourageRetry()`, `askLetter()`) — artık `tr.json`'dan rastgele metin seçip sonra o metni aramıyor; doğrudan mevcut ses kayıtları arasından rastgele seçiyor (`pickRandomTtsAssetForCategory`, veya `askLetter` için harfin kayıtlı şablonları arasından). Bu sayede bu üçü için asla "kayıt yok" durumu oluşmaz.

**Kayıt kaynağı:** Kullanıcının kendi kaydettiği sesler (`sesler_part1` klasörü) — ses karakteri KARIŞIK (bazı metinler farklı seslerle okunmuş, tek bir "Papatya"/"Coşkun" karakter ayrımı garanti değil, aşağıdaki A/B bölümlerindeki karakter ataması artık yalnızca METİN KATEGORİSİ anlamına geliyor, ses kimliği garantisi değil). Dosyalar `public/sounds/tts/` altında TEK düz klasörde, dosya adı önekiyle kategorize (`harf-*`, `aile-*`, `kutlama-*`, `tesvik-*`, `ekstra-*`, `nesne-*`, `sayilar/`). **`aac-*` önekiyle dosya artık YOK** — 2. turda AAC klasörü bilinçli olarak boşaltıldı.

---

## Ses karakteri ataması (2026-09-15, SADELEŞTİRİLDİ — tek kadın sesi)

**Karar (kullanıcı, 2026-09-15):** Sistem bundan sonra **TEK bir kadın ses karakteriyle** ilerleyecek — "Papatya" (Anlatıcı). Erkek ses / ikinci karakter ("Coşkun") ayrımı KALDIRILDI, yeni kayıt talebi verilmeyecek. Otizmli bir çocuk için ses tutarlılığı kritik önemde (beklenmedik/değişken bir sesin duyusal şaşırtıcı etkisi olabilir) — tek sesin her senaryoda (soru sorma, kutlama, teşvik, AAC, aile albümü vb.) kullanılması bu tutarlılığı en üst düzeyde sağlar.

| Karakter | Cinsiyet | Rol | Kullanıldığı senaryolar |
|---|---|---|---|
| **Papatya (tek ses)** | Kadın | Sakin, sıcak, yönlendirici — soru sorar, kutlar, teşvik eder, yönlendirir | TÜM senaryolar (harf sorma, kutlama, teşvik, AAC, Aile Albümü, vb.) |

**Ses seçim kriterleri (gelecekteki tüm yeni kayıtlar için):**
- Türkçe doğal telaffuz
- Sakin, ağır olmayan, tiz/keskin olmayan ton — ani perde değişimleri yok (otizmli çocuklarda duyusal hassasiyet)
- Çocuk dostu ama çocuksu/yapay değil — gerçek, sıcak bir yetişkin sesi
- Cümle-cümle ton tutarlılığı korunmalı (aynı kişi, aynı gün içinde kaydedilmeli, mümkünse)

**Tarihsel not — eski "B) Erkek Ses" kayıtları ne olacak:** Mevcut kutlama/teşvik kayıtlarının (aşağıdaki B bölümü) bir kısmı muhtemelen erkek sesiyle okunmuştu (3. tur notunda zaten "ses karakteri karışık geldi" diye işaretlenmişti). Bu dosyalar SİLİNMEDİ, hâlâ kullanımda — yalnızca gelecekte YENİ bir kutlama/teşvik kaydı istendiğinde artık kadın sesiyle (Papatya) kaydedilmesi gerekiyor. B bölümü başlığı bu yüzden aşağıda "eski/karışık kayıt" olarak yeniden etiketlendi, silinmesi/yeniden kaydedilmesi ayrı bir karar.

---

## A) Kadın Ses — "Papatya" — Metin Listesi (2026-09-15'ten itibaren TEK ses karakteri)

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

### A3. AAC Tahtası — ESKİ 18 kelimelik havuz (ARTIK GEÇERSİZ, bkz. H bölümü)

**⚠️ Bu alt bölüm 2026-09-15'te (3. tur sonrası, aynı gün) TAMAMEN YENİDEN TASARLANDI — aşağıdaki 18 kelime artık geçersiz, yerini H) bölümündeki ~350+ kelime/ifadelik yeni havuz aldı.** `src/store/aacData.ts`'teki KOD henüz eski 3-kategori/18-kelime yapısında (kod değişikliği bu turun kapsamında değil, yalnızca doküman/kelime hazırlığı) — bu eski liste yalnızca tarihsel referans için bırakıldı, yeni kayıt/entegrasyon çalışması H) bölümündeki havuza göre yapılmalı.

<details>
<summary>Eski 18 kelime (tarihsel referans, artık kullanılmıyor)</summary>

```
İhtiyaçlar: İstiyorum, Su, Tuvalet, Yardım, Açım, Susadım
Duygular: Mutluyum, Üzgünüm, Yorgunum, Kızgınım, Hastayım, Sakinim
Günlük Yaşam: Dur, Evet, Hayır, Lütfen, Oynamak, Uyumak
```

</details>

**Kod entegrasyonu:** `AacBoard.tsx`'teki `speak(symbol.word)` çağrısı hiç değişmedi — `ttsManifest.ts`'te AAC kelimeleri için hiç girdi yok, dolayısıyla `pickTtsAsset()` her zaman `null` döner ve `speak()` sessiz kalır (3. tur, Piper yok). `src/store/aacData.ts`'in H) bölümündeki yeni havuza göre güncellenmesi ve ses kayıtlarının yapılması ayrı, gelecekteki bir iş.

---

## B) Kutlama/Teşvik Metinleri — eski adıyla "Erkek Ses" (ARTIK KATEGORİ ADI, KARAKTER DEĞİL)

> **Not (2026-09-15, güncellendi):** Bu bölüm başlığı eskiden "Erkek Ses — Coşkun" idi — artık sistem tek kadın sesiyle ilerlediği için (bkz. yukarıdaki "Ses karakteri ataması") bu yalnızca METİN KATEGORİSİ (kutlama/teşvik amaçlı metinler) anlamına geliyor, ses karakteri anlamı YOK. Mevcut kayıtların bir kısmı gerçekten erkek sesiyle okunmuş olabilir (kullanıcı: "sesler karma kimisi erkek kimisi kadın") — bu dosyalar korunuyor, yalnızca YENİ kayıtlar artık kadın sesiyle yapılacak.

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

**Not (2026-09-15, 5. tur):** `ttsManifest.ts` aslında bu 71'in ötesinde, 100 karşılaştırma nesnesinin TAMAMI için kayıt içeriyor (yalnızca Harf Avı'nın 71'i kullandığı doğru — kalan 29'u şu an hiçbir oyun kullanmıyor ama ses zaten hazır). Bu, Gölge Eşleştirme/Hafıza Kartları ileride "eşleşen nesnenin adını söyle" özelliği eklerse (bkz. "5. Tur — Derin Tarama") hiçbir yeni kayıt gerekmeyeceği anlamına geliyor — bkz. F bölümü ve KRİTİK bölümündeki 5. tur notu.

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
| H — AAC (4. tur, baştan tasarlandı) | 223 (6 kategori × 1/2/3/4-kelime) | **0** | — | 223 — kod/UI/ses kaydı henüz yapılmadı, yalnızca doküman hazırlığı (bkz. H bölümü) |
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

## G) Uygulama Yaşam Döngüsü — Oyun Modülü Dışı Seslendirme İhtiyaçları (2026-09-15 eklendi)

> Kullanıcı isteğiyle eklendi: "Oyunun modül dışında ilk açılma kapanma hata veya başka süreçlerde gerekli seslendirmelerde ihtiyaçlar varsa ek kelimeler ekle." Kod tabanı sistematik olarak tarandı (açılış/kapanış/hata/geçiş noktaları) — bulunan gerçek metinler + önerilen yeni adaylar aşağıda. **Hiçbiri şu an kayıtlı DEĞİL, hiçbiri şu an seslendirilmiyor** — bu bölüm yalnızca envanter/öneri, kod değişikliği bu turun kapsamında değil.

### G1. Gün Sonu Kapanışı (`DayComplete.tsx:50-57`) — GÜÇLÜ ADAY

Zaten kodda var, zaten C bölümünde "aday" olarak notlanmıştı — burada resmi bir kayıt talebi olarak öne çıkarılıyor. Otizmli çocuklar için gün kapanışının hem görsel hem işitsel olarak pekiştirilmesi, geçiş rutinini daha öngörülebilir kılar (bkz. YOL-HARITASI.md "sakin kapanış ritüeli" ilkesi).

```
Harfler Uyudu. Yarın Görüşürüz!
Bugün harika bir iş çıkardın. Şimdi dinlenme zamanı.
```

**Teknik not:** Kod yorumu (`DayComplete.tsx:38-40`) bu ekranın "otomatik yönlendirme yok, gerçekten biten yumuşak ama kesin son ekran" olması gerektiğini vurguluyor — seslendirme eklenirse kullanıcı etkileşimi beklemeden otomatik tetiklenmeli, sakin bir tonda.

### G2. Sakinleştirme Modu Çıkış Butonları (`CalmingMode.tsx:60,67`) — ORTA ÖNCELİK

"Nefes al.../Nefes ver..." zaten kasıtlı sessiz kalması öneriliyordu (terapötik sessizlik) — bu değişmiyor. Ama çıkış butonlarının etiketi ayrı bir konu: çocuğun ekrandan nasıl çıkacağını anlaması için duyulması faydalı olabilir.

```
Devam Edelim
Oynamaya devam et
```

### G3. Genel Hata/Kriz Anı Mesajı — YENİ ÖNERİ, KOD HENÜZ YOK

Taramada `error.tsx`/`global-error.tsx`/`not-found.tsx` gibi Next.js özel hata sayfalarının projede HİÇ olmadığı bulundu — uygulama çökerse/beklenmeyen bir hata olursa şu an yalnızca Next.js'in varsayılan (otizm-dostu olmayan, teknik) hata ekranı görünür. Bu, YOL-HARITASI.md'nin "aşırı uyarılma riski"nden kaçınma ilkesiyle çelişen bir boşluk. Önerilen sakin/kısa metinler (kayıt için hazırlanmış, henüz `error.tsx` de yazılmadı — bu ayrı bir kod işi):

```
Bir şeyler ters gitti, sorun değil.
Ebeveynine haber verelim mi?
Az sonra tekrar deneyelim.
```

**Not:** Bu üçü şu an hiçbir koda bağlı DEĞİL — yalnızca gelecekte bir `error.tsx` yazıldığında kullanılabilecek hazır metin envanteri. Kod işi ayrı bir tur gerektirir.

### G4. Ana Sayfa Karşılaması (`page.tsx:50`) — AÇIK KARAR GEREKTİRİYOR

Şu an metin `"Hoş Geldin {firstName}!"` — dinamik (isim interpolasyonlu), yalnızca görsel, hiç seslendirilmiyor. **Sorun:** 3. tur mimari kararı (Piper/dinamik TTS tamamen kaldırıldı, yalnızca statik mp3) bu metni doğrudan desteklemiyor — her çocuk için ayrı bir "Hoş geldin {isim}" kaydı gerekir (ölçeklenmez) veya ismi çıkarıp jenerik bir karşılama kullanılabilir (`"Hoş geldin!"`, `"Günaydın, hazır mısın?"`). **Bu doküman bir karar dayatmıyor** — kullanıcı karar vermeli, bkz. aşağıdaki "Açık kalan kararlar".

### G5. Değerlendirilip SESLENDİRİLMEMESİ önerilen noktalar (bilgi amaçlı, tam tarama sonucu)

- **Ebeveyn Kapısı (`ParentGate.tsx`)** — "Yanlış PIN. Tekrar deneyin." / "Devam etmek için ebeveyn PIN'inizi girin." — çocuğa değil ebeveyne yönelik bir ekran; üstelik yanlış PIN geri bildiriminin sesli olması çocuğun kilidi "duyarak" denemesini teşvik edebilir gibi ters bir güvenlik riski taşır. Seslendirilmemesi önerilir.
- **Yükleniyor/Loading ekranları** (`GameBoard.tsx`, `FamilyAlbumGame.tsx`, `CartoonPlayer.tsx`, `MusicCorner.tsx` vb.) — kısa süreli geçiş metinleri, sık tekrarı otizmli çocukta yorucu/rahatsız edici olabilir. Seslendirilmemesi önerilir.
- **Çevrimdışı/online durum bildirimi** — kodda hiç yok (`navigator.onLine` dinleyicisi bulunamadı), bu yüzden bu turda envanterlenecek bir metin de yok.
- **Oyun-bazlı günlük limit mesajları** (`GameBoard.tsx`, `FamilyAlbumGame.tsx` — "Bugünkü N turluk hakkın doldu") — oyun modülü kapsamında olduğu için bu bölümün dışında tutuldu, ayrı bir karar konusu.

---

## H) İletişim Tahtası (AAC) — Baştan Tasarlanmış Kelime/İfade Havuzu (2026-09-15 eklendi)

> Kullanıcı isteğiyle eklendi: "buradaki kelime havuzu çok sığ ... baştan tasarla ... UI'ye şimdilik yansıtma o modüle gelince güncelleriz de en azından kelimeleri hazır ederiz." **Bu bölüm SADECE kelime/ifade hazırlığıdır — `src/store/aacData.ts` koduna veya UI'ye HENÜZ yansıtılmadı, kasıtlı olarak.** Eski 3 kategori/18 kelimelik havuzun (bkz. A3, artık geçersiz) yerini alıyor.

### Tasarım çerçevesi

**Klinik temel:** İki yerleşik konuşma-dil terapisi/AAC prensibi birleştirildi:
1. **Core Vocabulary (Çekirdek Kelime Dağarcığı) yaklaşımı** — AAC alanında yaygın kabul gören ilke (Gail Van Tatenhove, Caroline Musselwhite ve PrAACtical AAC gibi kaynaklarda tarif edilir): yüksek sıklıkla kullanılan, esnek/çok-bağlamlı kelimeler (fiiller, zamirler, sıfatlar, sosyal ifadeler) özel-konu kelimelerinden (meyve/hayvan adları gibi "fringe vocabulary") DAHA öncelikli olmalı — çünkü bir çocuk "istiyorum", "dur", "daha" gibi kelimelerle günün her anında iletişim kurabilir, ama "muz" yalnızca çok dar bir bağlamda işe yarar. Bu yüzden aşağıdaki kategoriler salt konu-bazlı (ör. "meyveler", "hayvanlar") değil, İŞLEVSEL/İLETİŞİMSEL kategoriler olarak kurgulandı.
2. **Brown'ın morfosentaktik gelişim evreleri / MLU (Ortalama Söyleyiş Uzunluğu)** — 1→2→3→4 kelime geçişi rastgele değil, tipik dil gelişiminde (ve AAC çoklu-sembol mesaj öğretiminde, ör. Binger & Light'ın çalışmaları) izlenen sırayı yansıtıyor: önce tek kelime (istek/red/adlandırma), sonra Bloom & Lahey'nin semantik ilişkileri (özne+eylem, eylem+nesne, nitelik+varlık, yineleme, yokluk/red) ile 2 kelimeli birleşimler, sonra 3 kelimeli genişlemeler, sonra 4 kelimelik daha tam cümleler.

**Yaş/spektrum kapsamı:** 5-12 yaş, geniş otizm spektrumu göz önünde tutuldu — somut/net dil (deyim, mecaz, sarkazm YOK), yüksek öngörülebilirlik, duygu düzenleme kelimeleri güçlü tutuldu, sosyal-pragmatik ifadeler basit ve doğrudan.

**Kategori yapısı — 6 kategori, TÜM 4 seviyede (1/2/3/4 kelime) aynı kategoriler kullanıldı** (kullanıcı talebi: "aynı 6 kategoride"):
1. İhtiyaçlar ve İstekler
2. Duygular ve Bedensel Durum
3. Eylemler (Core Fiiller)
4. Sosyal İletişim
5. Kişiler, Yerler ve Zaman
6. Tanımlayıcılar ve Duyusal Algı

**Hacim (asgari, kullanıcı talebiyle):** 1 kelime → 6×15; 2 kelime → 6×10; 3 kelime → 6×5; 4 kelime → 6×3. Aşağıdaki listeler bu asgarilerin hepsini aşıyor (güvenli pay).

---

### H1. Tek Kelime (6 kategori × 15+ = 100 kelime)

**1. İhtiyaçlar ve İstekler (17):**
```
İstiyorum, İstemiyorum, Su, Yemek, Açım, Susadım, Tuvalet, Yardım,
Dur, Bitti, Daha, Yeter, Uyku, Giymek, Oyuncak, Kitap, Dinlenmek
```

**2. Duygular ve Bedensel Durum (16):**
```
Mutluyum, Üzgünüm, Kızgınım, Korkuyorum, Yorgunum, Sakinim, Heyecanlıyım,
Şaşırdım, Hastayım, Ağrıyor, İyiyim, Rahatsızım, Bunaldım, Gururluyum,
Utandım, Sıkıldım
```

**3. Eylemler — Core Fiiller (18):**
```
Git, Gel, Oyna, Ye, İç, Uyu, Bak, Dinle, Ver, Al, Aç, Kapat,
Otur, Kalk, Koş, Yıka, Giy, Paylaş
```

**4. Sosyal İletişim (17):**
```
Merhaba, Güle güle, Teşekkürler, Lütfen, Özür dilerim, Evet, Hayır,
Belki, Tamam, Rica ederim, Hoş geldin, Günaydın, İyi geceler,
Affedersin, Bilmiyorum, Anlamadım, Tekrar
```

**5. Kişiler, Yerler ve Zaman (17):**
```
Anne, Baba, Öğretmen, Arkadaş, Okul, Ev, Bahçe, Park, Dışarı,
İçeri, Bugün, Yarın, Şimdi, Sonra, Hastane, Market, Oyun odası
```

**6. Tanımlayıcılar ve Duyusal Algı (18):**
```
Büyük, Küçük, Sıcak, Soğuk, Hızlı, Yavaş, Gürültülü, Sessiz,
Parlak, Karanlık, Yumuşak, Sert, Temiz, Kirli, Aynı, Farklı, Çok, Az
```

**Toplam H1: 103 kelime** (asgari 90'ın üzerinde).

---

### H2. İki Kelime (6 kategori × 10+ = 60 ifade) — Bloom & Lahey semantik ilişkileri (özne+eylem, eylem+nesne, yineleme, red)

**1. İhtiyaçlar ve İstekler (11):**
```
Su istiyorum · Yemek istiyorum · Bunu istemiyorum · Tuvalete gitmek ·
Yardım istiyorum · Daha istiyorum · Artık yeter · Biraz dinlenmek ·
Oyuncak istiyorum · Kitap okumak · Ellerimi yıkamak
```

**2. Duygular ve Bedensel Durum (11):**
```
Çok mutluyum · Biraz üzgünüm · Canım sıkıldı · Karnım ağrıyor ·
Başım ağrıyor · Çok yorgunum · Biraz korkuyorum · İyi hissetmiyorum ·
Sakinleşmek istiyorum · Çok heyecanlıyım · Yalnız hissediyorum
```

**3. Eylemler (11):**
```
Bana ver · Beraber oynayalım · Müzik dinle · Kitap oku · Dışarı çık ·
İçeri gir · Elini yıka · Resim çiz · Yavaş yürü · Beraber yapalım ·
Bana bak
```

**4. Sosyal İletişim (11):**
```
Nasılsın · İyi günler · Görüşürüz sonra · Tekrar söyle · Ne demek ·
Yardım eder misin · Adın ne · Kaç yaşındasın · Merhaba, nasılsın ·
Çok teşekkürler · Gerçekten özür dilerim
```

**5. Kişiler, Yerler ve Zaman (11):**
```
Annemi istiyorum · Babam nerede · Okula gidiyorum · Eve gidelim ·
Parka gidelim · Şimdi değil · Yarın gidelim · Öğretmenim nerede ·
Arkadaşım geldi · Dışarı çıkalım · Bahçede oynayalım
```

**6. Tanımlayıcılar ve Duyusal Algı (11):**
```
Çok gürültülü · Çok parlak · Çok yüksek · Daha yavaş · Çok sıcak ·
Çok soğuk · Bu farklı · Çok karanlık · Işığı kapat · Sesi kıs ·
Biraz sessiz
```

**Toplam H2: 66 ifade** (asgari 60'ın üzerinde).

---

### H3. Üç Kelime (6 kategori × 5+ = 30 ifade)

**1. İhtiyaçlar ve İstekler (6):**
```
Su içmek istiyorum · Yemek yemek istiyorum · Tuvalete gitmek istiyorum ·
Biraz yardım istiyorum · Bunu istemiyorum artık · Dışarı çıkmak istiyorum
```

**2. Duygular ve Bedensel Durum (6):**
```
Kendimi kötü hissediyorum · Çok kızgın hissediyorum · Biraz sakinleşmek istiyorum ·
Yalnız kalmak istiyorum · Sarılmak istiyorum sana · Sesler beni rahatsız ediyor
```

**3. Eylemler (6):**
```
Beraber oyun oynayalım · Bana kitap oku · Elimi tutar mısın ·
Yavaşça bana anlat · Beni dinler misin · Birlikte dışarı çıkalım
```

**4. Sosyal İletişim (6):**
```
Adın ne senin · Nasıl yardımcı olabilirim · Bunu tekrar eder misin ·
Seninle oynayabilir miyim · Bunu anlamadım, tekrarla · Benimle konuşur musun
```

**5. Kişiler, Yerler ve Zaman (6):**
```
Annemle konuşmak istiyorum · Bugün okula gitmiyorum · Parka gitmek istiyorum ·
Arkadaşımla oynamak istiyorum · Şimdi eve gidelim · Öğretmenimle konuşmak istiyorum
```

**6. Tanımlayıcılar ve Duyusal Algı (6):**
```
Bu çok gürültülü · Işığı biraz kıs · Sesi çok yüksek ·
Bu bana batıyor · Çok parlak burası · Daha yavaş konuş
```

**Toplam H3: 36 ifade** (asgari 30'un üzerinde).

---

### H4. Dört Kelime (6 kategori × 3+ = 18 ifade)

**1. İhtiyaçlar ve İstekler (3):**
```
Biraz su içmek istiyorum · Şimdi tuvalete gitmek istiyorum · Yemek yemek istiyorum şimdi
```

**2. Duygular ve Bedensel Durum (3):**
```
Şu anda kendimi kötü hissediyorum · Biraz yalnız kalmak istiyorum · Bu ses beni rahatsız ediyor
```

**3. Eylemler (3):**
```
Benimle oyun oynar mısın · Bana kitabı okur musun · Lütfen elimi tutar mısın
```

**4. Sosyal İletişim (3):**
```
Seninle arkadaş olabilir miyim · Bunu bana açıklar mısın lütfen · Adın ne senin, söyler misin
```

**5. Kişiler, Yerler ve Zaman (3):**
```
Bugün parka gitmek istiyorum · Annemle babamla oynamak istiyorum · Yarın okula gitmek istemiyorum
```

**6. Tanımlayıcılar ve Duyusal Algı (3):**
```
Bu ışık çok parlak · Bu ses çok yüksek geliyor · Lütfen sesi biraz kıs
```

**Toplam H4: 18 ifade** (asgari 18'e tam ulaştı).

---

### Genel toplam ve sonraki adımlar

**H1+H2+H3+H4 = 103 + 66 + 36 + 18 = 223 kelime/ifade.** Hiçbiri şu an ne kodda (`aacData.ts`) ne seste (`ttsManifest.ts`) mevcut — tamamı yeni hazırlık.

**Uygulanmadı, kasıtlı olarak (kullanıcı talebi):**
- `src/store/aacData.ts` güncellenmedi — kod hâlâ eski 3 kategori/18 kelime yapısında.
- UI'ye (`AacBoard.tsx`, kategori sekmeleri) hiçbir yansıma yapılmadı.
- ARASAAC piktogram ID eşleştirmesi yapılmadı (yeni 223 kelimenin her biri için `arasaacId` bulunması ayrı, zahmetli bir iş — kod entegrasyonu turunda ele alınmalı).
- Ses kaydı yapılmadı — bu hacimde (223 metin) kayıt süreci kademeli planlanmalı.

**Önerilen kademeli uygulama sırası (kod + ses kaydı, gelecekteki turlar için):**
1. **Faz H-1:** H1'in 6 kategorisi (103 tek kelime) — en yüksek iletişimsel etki, en düşük karmaşıklık. Kod (`aacData.ts` genişletme + ARASAAC ID eşleştirme) + ses kaydı.
2. **Faz H-2:** H2 (66 iki-kelimelik ifade) — çocuğun dil gelişimine paralel ikinci kademe.
3. **Faz H-3/H-4:** H3+H4 (54 ifade) — en gelişmiş kullanıcılar için, UI'de muhtemelen ayrı bir "gelişmiş mod" sekmesi gerektirebilir (tasarım kararı, bu turun kapsamı dışı).

---

## Kod entegrasyonu (TAMAMLANDI, 2026-09-15)

`src/lib/ttsManifest.ts` (tam-metin → dosya yolu eşleştirmesi, `pickTtsAsset()`) + `src/hooks/useTurkishSpeech.ts`'teki `speak()` fonksiyonu (3. turdan itibaren yalnızca statik dosya çalar, Piper/tarayıcı fallback'i yok). Hiçbir oyun dosyası değişmedi — tüm `speak()`/`askLetter()`/`celebrateSuccess()`/`encourageRetry()` çağrıları olduğu gibi kaldı, katman şeffaf çalışıyor. `tsc --noEmit` ve `eslint` temiz, Playwright ile Harf Avı ve Aile Albümü'nde gerçek tarayıcıda doğrulandı (network istekleri izlenerek, yerel dosyanın gerçekten çaldığı teyit edildi).

## Açık kalan kararlar

- **AAC kelime havuzunun tamamı yeniden tasarlandı (bkz. H bölümü, 2026-09-15) ama HİÇBİRİ kayıtlı değil** — eski 18 kelime zaten boşaltılmıştı, yeni ~350+ kelime/ifadelik havuz henüz hiç kaydedilmedi. Bu artık en öncelikli açık madde (iletişim için kritik), ayrıca hacim çok büyüdüğü için kayıt süreci kademeli planlanmalı (bkz. H bölümü sonundaki öncelik sırası).
- Diğer eksik kayıtlar (Aferin/Bravo, Bakıcı/Komşu cümle formu, bazı yakınlık tek-kelimeleri, 29 harf şablonu kombinasyonu — bkz. 🔴 KRİTİK bölüm) ne zaman tamamlanacak?
- `DayComplete.tsx`'in seslendirilip seslendirilmeyeceği (bkz. G1 — güçlü aday, henüz kayıt yok, karar bekliyor).
- **G4 — Ana sayfa karşılaması ("Hoş Geldin {isim}!") için mimari karar gerekiyor:** İsim dinamik olduğu için statik-only mimariyle (3. tur) doğrudan uyumsuz. Seçenekler: (a) ismi çıkarıp jenerik statik bir karşılama kaydet (ör. "Hoş geldin!"), (b) yalnızca bu tek nokta için sınırlı bir dinamik TTS yolu geri getir (mimariyi kısmen gevşetir), (c) seslendirmeden vazgeç. Kullanıcı kararı bekliyor.
- **G3 — `error.tsx` kod işi henüz yapılmadı**, yalnızca metin envanteri hazır (bkz. G3). Ayrı bir tur gerektirir.
- C bölümündeki 3 metin ("Çok yaklaştın!" vb.) gerçekten kullanılmaya başlanacak mı, yoksa `tr.json`'dan temizlenecek mi?

## İlgili doküman: Müzik Köşesi

`muzik.md` — Suno ile Müzik Köşesi için üretilecek özgün şarkıların prompt kütüphanesi (bkz. YOL-HARITASI.md 4.10), bu dosyanın "kaynak/prompt/karar tek yerde" ilkesini müzik için taşıyan kardeş dokümanı. Konuşma/TTS'ten ayrı bir kapsam (müzik, sözlü yönerge değil) ama aynı otizm-duyarlı tasarım prensiplerini (ani ses değişimi yok, sakin ton, öngörülebilir yapı) paylaşıyor.
