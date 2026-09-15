# Papatya — Suno Müzik Üretim Promptları

Bu dosya, Müzik Köşesi (`music-corner`, `Song` modeli) için Suno'da üretilecek özgün şarkıların prompt kütüphanesidir — `PROMPTLAR.md`'nin (görsel) ve `seslendirmeler.md`'nin (konuşma/TTS) müzikteki karşılığı, aynı "kaynak, prompt ve karar tek yerde dokümante edilir" ilkesiyle (bkz. YOL-HARITASI.md 4.10). Her prompt kopyala-yapıştır hazırdır.

> **Bağlam:** Müzik Köşesi bugün ebeveynin YouTube linki yapıştırdığı hazır içerikle çalışıyor. Bu dosya, Papatya'ya özgü, Melike'nin (ve gelecekteki diğer çocukların) ilgi alanlarına göre üretilebilecek şarkılar için bir başlangıç prompt setidir — 4.10 maddesinin "önce bir prompt kütüphanesi oluşturulur" adımı. **Üretilen hiçbir içerik otomatik yayına girmez** — YOL-HARITASI.md'nin klinik sınır sözleşmesi gereği her şarkı, oynatılmadan önce aşağıdaki "Otizm değerlendirme çeklisti" ile elle kontrol edilip ancak ondan sonra ebeveyn tarafından onaylanmalıdır.

---

## 0. Ortak Kurallar (tüm şarkılar için geçerli)

Bu kurallar YOL-HARITASI.md'nin "Ekran sağlığı" ve "Kriz anı — Sakinleştirme modu" ilkelerinin müzik karşılığıdır; otizmli bir çocuğun duyusal profili göz önünde tutularak belirlendi.

- **Tempo:** 70-110 BPM aralığında kalınmalı — çok yavaş (uyuşukluk/sıkılma) veya çok hızlı (aşırı uyarılma) tempolardan kaçınılmalı. Prompt'larda açıkça BPM aralığı belirtildi.
- **Dinamik/ani değişim yok:** Ani ses patlaması, beklenmedik sessizlik-sonrası-gürültü, aniden giren yeni enstrüman/perde sıçraması istenmiyor — geçişler her zaman "gentle", "gradual", "smooth" olarak tarif edildi.
- **Tekrarlayan/öngörülebilir yapı:** Otizmli çocuklar öngörülebilirlikten güç alır — nakarat/melodi tekrarı bilinçli olarak isteniyor (ezber ve güven duygusu için), rastgele/deneysel yapı istenmiyor.
- **Enstrümantasyon sade:** Çok katmanlı, yoğun prodüksiyon yerine 2-4 tanınabilir enstrüman (ör. akustik gitar, piyano, hafif perküsyon, yumuşak sintezayzer pad'i) — kalabalık miks kafa karıştırıcı/yorucu olabilir.
- **Vokal tonu:** Sıcak, sakin, aşırı tiz/keskin olmayan bir ses — bağıran, "hype" tarzı çocuk şarkısı okuyucularından kaçınılıyor (bkz. `seslendirmeler.md`'deki aynı ilke: "ani perde değişimleri yok").
- **Söz içeriği:** Türkçe, basit/somut kelimeler, tekrarlayan kısa cümleler, korkutucu/gerilimli hiçbir imge yok (kayıp, karanlık, canavar gibi temalardan kaçınılıyor — bkz. tema notları).
- **Süre:** 90-150 saniye arası hedeflenir — Müzik Köşesi'nin `dailyLoopLimit` mantığıyla (şarkı başına günlük tekrar sınırı) uyumlu, çok uzun bir parça tek dinlemede günlük bütçeyi hızla tüketir.
- **Format notu:** Suno prompt alanına "Style/Genre" ve "Lyrics" ayrı girilir — aşağıda her tema için ikisi ayrı ayrı verildi. `[Verse]`/`[Chorus]` etiketleri Suno'nun kendi söz yapılandırma sözdizimidir.

---

## 0b. Negatif Promptlar — Klinik/Nörolojik/Gelişimsel Kaçınma Listesi

`0. Ortak Kurallar` neyin İSTENDİĞİni tarif ediyor; bu bölüm neyin AÇIKÇA İSTENMEDİĞİni tarif eder. Suno'nun "Exclude Styles" / "Negative Tags" alanına (varsa) veya prompt'un sonuna "AVOID:" ön ekiyle eklenebilecek, kopyala-yapıştır hazır bir liste. Her kategori hangi klinik/gelişimsel gerekçeye dayandığını da taşıyor — bu yüzden yalnızca "yasak kelime listesi" değil, gerekçeli bir kaçınma çerçevesi.

**Duyusal işlemleme (otizmde en sık bildirilen hassasiyet alanı):**
- Ani/keskin yüksek frekanslı sesler (zil, çığlık-benzeri synth, cam kırılması efekti, alarm sesi) — işitsel aşırı-tepki (hyperacusis) riski.
- Ani ses seviyesi sıçramaları (sessizlikten aniden yükseğe, "drop" tarzı elektronik müzik yapısı) — öngörülemeyen uyaran, kaygı tetikleyici olabilir.
- Aşırı bas/düşük frekans titreşimi (dubstep-tarzı ağır bass, gövdede hissedilecek kadar güçlü kick drum) — bazı çocuklarda fiziksel rahatsızlık verir.
- Distorsiyonlu/çığlık atan vokal, agresif rap/scream tarzı söyleme — tehdit algısı yaratabilir.
- Çok katmanlı/kakofonik prodüksiyon (aynı anda çok fazla enstrüman, "wall of sound") — dikkat/işlemleme yükünü artırır.

**Nörolojik/bilişsel yük:**
- Değişken/senkopik/karmaşık ritim kalıpları (polyritim, sık zaman imzası değişimi) — öngörülebilirlik otizmli çocuklarda düzenleyici bir işlev görür, karmaşık ritim bu işlevi bozar.
- Atonal/disonan armoni, beklenmedik akor değişimleri — müzikal "şaşırtma" nörotipik dinleyicide ilgi çekici olsa da, burada kafa karıştırıcı/rahatsız edici olabilir.
- Aşırı hızlı söz temposu (hızlı rap, "tongue twister" tarzı yoğun kelime akışı) — dil işlemleme süresi kısıtlı olabilir, anlaşılmayı zorlaştırır.

**Duygusal/tematik içerik (çocuk gelişimi ve psikiyatri açısından):**
- Korku, kayıp, terk edilme, karanlık, canavar, ölüm gibi temalar — güven duygusunu hedefleyen bir uygulamanın amacıyla doğrudan çelişir.
- Alay, aşağılama, "yanlış yapma" vurgusu içeren söz (ör. "neden yapamıyorsun", "hep hata yapıyorsun") — Papatya'nın "yorum ve değerlendirme yok" ilkesiyle (bkz. YOL-HARITASI.md Klinik sınır sözleşmesi) doğrudan çelişir.
- Romantik/yetişkin temalı içerik, şiddet imgesi, otorite figürüne karşı tehdit (ör. "polis geliyor", "seni yakalayacak") — hedef yaş grubuna (6-7) uygun değil.
- Aşırı "hype"/reklam-tarzı enerji ("en havalısı!", "hemen şimdi!") — YOL-HARITASI.md'nin anti-bağımlılık mimarisiyle (kumar mekaniği, rastgele ödül yasağı) aynı ruhla çelişir; müzik de bir "daha fazla" isteği yaratmamalı.

**Suno'ya eklenebilecek hazır negatif etiket bloğu (her prompt'un sonuna eklenebilir):**
```
AVOID: sudden loud noises, screaming vocals, harsh distortion, heavy bass drops, atonal dissonance, complex syncopated rhythms, fast rap-speed lyrics, dark or scary themes, loss or abandonment imagery, monsters, violence, mocking or shaming lyrics, hyperactive "hype" energy, abrupt genre or tempo changes, industrial or glitchy sound effects, jump scares
```

**Neden ayrı bir bölüm:** Görsel promptlardaki (`PROMPTLAR.md`) "Kesinlikle olmayacaklar" listesinin müzik karşılığı — ama müzik, görselden farklı olarak ZAMAN İÇİNDE gelişen bir uyaran olduğu için (bir görsel anlık, bir şarkı 2 dakika boyunca sürpriz yapabilir) negatif liste daha kapsamlı tutuldu. Çocuk gelişimi/psikiyatri literatüründeki otizmde işitsel duyusal hassasiyet (auditory sensory sensitivity) ve öngörülebilirlik ihtiyacı (need for predictability) bulgularına dayanır — bu genel, herkese uyarlanabilir prensiplerdir; **Melike'ye özgü bir tanı/değerlendirme değildir** (YOL-HARITASI.md'nin "tanı koymaz" sınırı burada da geçerli, bu liste yalnızca genel otizm-dostu tasarım pratiğidir).

---

## Otizm değerlendirme çeklisti (her üretilen şarkı için, YOL-HARITASI.md 4.10 gereği zorunlu)

Bir şarkı Suno'da üretildikten sonra, Müzik Köşesi'ne eklenmeden önce bu adımlardan geçmelidir — Faz 2.11 denetim çeklistindeki (g) bloğuyla aynı disiplinde:

1. **Tempo kontrolü** — gerçekten 70-110 BPM aralığında mı (Suno bazen istenenden sapabilir), kulakla veya bir BPM sayaç aracıyla doğrulanmalı.
2. **Ani ses sıçraması var mı** — parçanın tamamı dinlenerek (atlama yapmadan) beklenmedik gürültü patlaması, aniden giren davul/synth vuruşu olup olmadığı kontrol edilir.
3. **Söz içeriği** — üretilen sözler prompt'ta istenenle uyumlu mu, Suno'nun kendiliğinden eklediği (halüsinasyon) uygunsuz/korkutucu bir kelime var mı.
4. **Genel his** — ebeveynin kendi kulağıyla "bu parça Melike'yi sakinleştirir mi, heyecanlandırır mı, rahatsız eder mi?" sorusuna cevap vermesi (Faz 3.14'teki "duyusal yoğunluk tahmini" otomatik araç gelene kadar bu manuel adım zorunlu).
5. Yalnızca bu dört adımdan geçen şarkı ebeveyn panelinden `Song` olarak eklenir.

---

## 1. "Harfleri Öğreniyorum" — Öğrenme/Alfabe Teması

Papatya'nın çekirdek oyunu Harf Avı ile aynı temayı taşır — harfleri sevimli, tehditkâr olmayan bir şarkıyla pekiştirir. Sınıfta/evde tekrar tekrar dinlenebilecek, ezberlenebilir bir yapı hedefler.

**Style/Genre (Suno "Style of Music" alanına):**
```
gentle acoustic children's song, warm acoustic guitar fingerpicking, soft ukulele, light hand percussion (shaker, soft claps), no drums, female vocal warm and calm and soothing, Turkish language, tempo 85 BPM, major key, simple repetitive melody, lo-fi cozy production, no sudden dynamic changes, smooth gentle transitions
```

**Negative Tags (Suno "Exclude Styles" alanına, bkz. 0b):**
```
sudden loud noises, screaming vocals, harsh distortion, heavy bass drops, atonal dissonance, complex syncopated rhythms, fast rap-speed lyrics, dark or scary themes, hyperactive energy, abrupt tempo changes
```

**Lyrics (Suno "Lyrics" alanına):**
```
[Verse]
A, B, C, harfler geliyor
Papatya bahçesinde şarkı söylüyor
Her harfin bir sesi, bir de şekli var
Yavaşça öğreniriz, hiç acele yok

[Chorus]
Hadi birlikte söyleyelim
A'dan Z'ye kadar gidelim
Her harf bir arkadaş, korkma sen
Papatya hep yanında, unutma sen

[Verse]
Bugün bir harf bulduk, ne kadar güzel
Yarın bir tane daha, adım adım gel
Acele etmeden, kendi hızımızda
Her harf bir hediye, saklı kutumuzda

[Chorus]
Hadi birlikte söyleyelim
A'dan Z'ye kadar gidelim
Her harf bir arkadaş, korkma sen
Papatya hep yanında, unutma sen
```

**Neden bu tema:** Uygulamanın çekirdek pedagojik amacıyla (harf tanıma) doğrudan hizalı, ödül/başarı baskısı içermeyen ("acele yok", "kendi hızımızda") sözlerle adaptif zorluk felsefesiyle tutarlı.

---

## 2. "Ailem Benim Yanımda" — Aile/Bağlanma Teması

Aile Albümü oyunuyla aynı duygusal temayı taşır — yakınlık, güven ve aidiyet duygusunu pekiştiren, sakinleştirici bir ninni-tarzı parça. Kriz anı/sakinleştirme modu sonrası dinlemeye de uygun, aşırı sakin bir alternatif.

**Style/Genre:**
```
soft lullaby, minimal piano and warm string pad, very gentle, slow-medium tempo 72 BPM, female vocal breathy and tender and reassuring, Turkish language, sparse arrangement, lots of space between notes, no percussion, calming bedtime song atmosphere, smooth soft dynamics throughout
```

**Negative Tags (bkz. 0b):**
```
sudden loud noises, screaming vocals, harsh distortion, heavy bass, dissonance, complex rhythms, loss or abandonment imagery, dark themes, hyperactive energy, abrupt dynamic changes, industrial or glitchy sounds
```

**Lyrics:**
```
[Verse]
Annem gülümser, bakar yüzüme
Babam elini uzatır, gelir dizime
Ablam, ağabeyim, hepsi burada
Ailem benimle, her zaman yanımda

[Chorus]
Ben yalnız değilim, hiç korkmuyorum
Sevdiklerim yanımda, biliyorum
Ailem benim yanımda
Güvendeyim, biliyorum

[Verse]
Anneannem, dedem, hikaye anlatır
Sıcacık kucaklar, kalbimi ısıtır
Her biri ayrı, ama hepsi bir
Ailem bir yuva, en güzel yer
```

**Neden bu tema:** Aile Albümü'nün ("sosyal-tanima" becerisi) duygusal karşılığı — yakınlık derecelerini (anne, baba, abla vb.) doğal biçimde tekrar eder, oyunun sözlü ipucu mantığıyla (bkz. `seslendirmeler.md` A4) aynı kelime dağarcığını pekiştirir.

---

## 3. "Bugün Neler Yaptık" — Günlük Rutin/Öngörülebilirlik Teması

Otizmli çocuklarda rutin ve öngörülebilirlik güven verir. Bu şarkı günün akışını (uyanma → oyun → yemek → uyku) sırayla anlatan, "Gün Tamamlandı" ekranının (DayComplete.tsx, bkz. `seslendirmeler.md` C bölümü notu) müzikal karşılığı olabilir — gün sonu kapanış ritüeli için aday.

**Style/Genre:**
```
warm mid-tempo folk-pop, acoustic guitar strumming, soft glockenspiel accents, light cajon percussion, tempo 95 BPM, female vocal cheerful but calm, Turkish language, predictable verse-chorus structure, cozy daytime radio feel, gentle build with no abrupt jumps
```

**Negative Tags (bkz. 0b):**
```
sudden loud noises, screaming vocals, harsh distortion, heavy bass drops, complex syncopated rhythms, fast rap-speed lyrics, dark or scary themes, mocking or shaming lyrics, hyperactive hype energy, abrupt genre changes
```

**Lyrics:**
```
[Verse]
Güneş doğdu, gözlerimi açtım
Kahvaltımı yedim, güne başladım
Oyun oynadım, harfler öğrendim
Papatya ile bugün çok eğlendim

[Chorus]
Bugün neler yaptık, hadi sayalım
Adım adım, sırayla anlatalım
Sabah, öğlen, akşam, gece
Her gün bir yolculuk, güzelce

[Verse]
Öğlen oldu, biraz dinlendim
Sonra tekrar kalktım, resim çizdim
Akşam oldu, ailemle yemek
Şimdi uyku vakti, iyi geceler demek

[Chorus]
Bugün neler yaptık, hadi sayalım
Adım adım, sırayla anlatalım
Sabah, öğlen, akşam, gece
Her gün bir yolculuk, güzelce
```

**Neden bu tema:** YOL-HARITASI.md'nin "sakin kapanış ritüeli" ilkesiyle uyumlu; zaman kavramını (sabah/öğlen/akşam/gece) somut ve tekrarlayan bir yapıda pekiştirir, gün sonu geçişini kolaylaştırıcı bir araç olabilir.

---

## 4. "Hayvanlar Bahçede" — Doğa/Hayvan Teması (Hafıza Kartları ile ortak evren)

Hafıza Kartları'nın 100 karşılaştırma görselinin (bkz. `seslendirmeler.md` F bölümü — Hayvan kategorisi 27 görselle en kalabalık grup) müzikal karşılığı. Neşeli ama abartısız, sayma/tekrar oyunu formatında.

**Style/Genre:**
```
playful but gentle children's folk song, acoustic guitar and soft marimba, light woodblock percussion, tempo 100 BPM, female vocal playful and warm, Turkish language, call-and-response structure, simple singable melody, bright but not overstimulating, clean uncluttered mix
```

**Negative Tags (bkz. 0b):**
```
sudden loud noises, screaming vocals, harsh distortion, heavy bass drops, complex syncopated rhythms, fast rap-speed lyrics, scary animal imagery (predators attacking, growling, roaring aggressively), hyperactive hype energy, abrupt tempo changes, industrial or glitchy sounds
```

**Lyrics:**
```
[Verse]
Kedi miyav der, köpek hav hav
Tavşan zıplar, ne kadar sevimli bak
İnek möö der, koyun mee mee
Hayvanlar bahçede, gel birlikte gör

[Chorus]
Hayvanlar bahçede, hepsi burada
Her biri farklı, her biri güzel arkadaşımız
Bak, dinle, öğren, gül
Hayvanlar bahçesinde bugün

[Verse]
Kelebek uçar, karınca yürür
Fil çok büyük, kirpi küçücük durur
Her biri farklı, her biri özel
Hepsini severiz, hepsi bizim dostumuz gerçel

[Chorus]
Hayvanlar bahçede, hepsi burada
Her biri farklı, her biri güzel arkadaşımız
Bak, dinle, öğren, gül
Hayvanlar bahçesinde bugün
```

**Neden bu tema:** Mevcut görsel içerik havuzuyla (karşılaştırma görselleri) doğrudan bağlanabilir — ileride şarkı sözlerindeki hayvanlarla oyun içeriği arasında görsel eşleştirme yapılabilir (ayrı bir teknik iş, burada yalnızca tematik uyum kurgulanıyor).

---

## 5. "Nefes Al, Nefes Ver" — Sakinleştirme Modu Eşlik Müziği

Diğer dördünden farklı amaçla: Sakinleştirme Modu (`CalmingMode.tsx`) tetiklendiğinde ARKA PLANDA çalınabilecek, sözsüz veya minimal sözlü, aşırı yavaş ve tahmin edilebilir bir parça. **Bu tema özellikle hassas** — YOL-HARITASI.md'nin "sakinleştirme modunda ses ve müzik durur" ilkesiyle gerilimde olabilir, bu yüzden kullanım kararı ebeveyne/klinik değerlendirmeye açıkça bırakılmalı (aşağıdaki nota bakın).

**Style/Genre:**
```
extremely minimal ambient soundscape, single soft piano note pattern, warm low string drone, tempo 60 BPM or free tempo (no strong beat), no percussion, no vocal or only breathy wordless humming, very slow gentle swells, silence-friendly, therapeutic breathing exercise atmosphere, no climax, static and predictable throughout
```

**Negative Tags (bkz. 0b — bu temada ÖZELLİKLE kritik, sıfır tolerans):**
```
any sudden sound, drums, percussion, bass drops, dissonance, tempo changes, climactic build-up, loud dynamics, distortion, screaming, aggressive vocals, dark or scary themes, industrial or glitchy sounds, any element that could startle
```

**Lyrics (opsiyonel, minimal — enstrümantal versiyon da denenmeli):**
```
[Verse]
Nefes al... nefes ver...
Yavaşça, yavaşça...
Nefes al... nefes ver...
Güvendesin, buradayım
```

**Neden bu tema, ve ÖNEMLİ UYARI:** YOL-HARITASI.md "Kriz anı — Sakinleştirme modu" bölümü açıkça "ses ve müzik durur" diyor — bu şarkı o kuralla ÇELİŞEBİLİR. Bu tema yalnızca bir **öneri/tartışma başlangıcı** olarak eklendi: belki Sakin Mod'un kendisinde değil, Sakin Mod'dan ÇIKARKEN geçiş müziği olarak, ya da tamamen ayrı isteğe bağlı bir "sakinleştirici şarkı" olarak Müzik Köşesi'nde durabilir. **Bu şarkının Sakinleştirme Modu'yla ilişkisi, üretilmeden önce mutlaka ebeveyn/klinik görüşüyle netleştirilmeli** — mevcut mimariyi (sessizlik kuralı) bozmadan nasıl konumlandırılacağı ayrı bir karar gerektirir.

---

## Uygulama notu (kod entegrasyonu, henüz yapılmadı)

Bu dosya yalnızca prompt kütüphanesidir — hiçbir kod değişikliği içermez. Bir şarkı Suno'da üretilip çeklistten geçtikten sonra, bugünkü akışla aynı şekilde ebeveyn panelinden eklenir: üretilen ses dosyası bir barındırma noktasına (ör. `public/sounds/` altına, YouTube yerine yerel dosya referansı için `Song` modelinde küçük bir alan eklentisi gerekebilir — bugün `youtubeId` zorunlu alan, yerel dosya senaryosu şemaya henüz uymuyor, bu ayrı bir teknik karar/iş).
