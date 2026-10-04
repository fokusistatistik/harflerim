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

**Neden ayrı bir bölüm (0b):** Görsel promptlardaki (`PROMPTLAR.md`) "Kesinlikle olmayacaklar" listesinin müzik karşılığı — ama müzik, görselden farklı olarak ZAMAN İÇİNDE gelişen bir uyaran olduğu için (bir görsel anlık, bir şarkı 2 dakika boyunca sürpriz yapabilir) negatif liste daha kapsamlı tutuldu. Çocuk gelişimi/psikiyatri literatüründeki otizmde işitsel duyusal hassasiyet (auditory sensory sensitivity) ve öngörülebilirlik ihtiyacı (need for predictability) bulgularına dayanır — bu genel, herkese uyarlanabilir prensiplerdir; **Melike'ye özgü bir tanı/değerlendirme değildir** (YOL-HARITASI.md'nin "tanı koymaz" sınırı burada da geçerli, bu liste yalnızca genel otizm-dostu tasarım pratiğidir).

---

## 0c. Söz Yazım Kuralları — Türkçe, Ritim ve Otizm Uyumu

`0.` neyin istendiğini, `0b.` neyin istenmediğini tarif ediyor; bu bölüm **sözlerin nasıl yazılacağını** tarif eder. Aşağıdaki sözler bu kurallara göre yazıldı; yeni bir şarkı eklenirken de bu kurallara uyulmalı.

**1. Sabit hece ölçüsü (ritim için zorunlu).** Türk çocuk şarkılarının klasik ölçüsü 7'li ve 8'li hecedir. Bir şarkının **içinde** ölçü değişmez — 7 heceli bir kıtanın yanına 12 heceli bir satır konursa Suno vokali sıkıştırır veya uzatır, melodi tökezler. Aşağıdaki her şarkının başında ölçüsü belirtildi, her satır tek tek sayıldı.

**2. Olumlu dil — olumsuzlama ve "yapma" kalıbı yok.** Otizmde olumsuz cümlenin işlenmesi ek bilişsel yük getirir; ayrıca *"korkma"* demek çocuğa korku kavramını hatırlatır. Bu yüzden `0b`'de korku teması yasaklanmışken sözlerde "korkma sen" bulunması bir çelişkiydi — kaldırıldı. Kural: *korkma → güvendeyim*, *yalnız değilim → yanımdalar*, *acele etme → kendi hızımla*.

**3. Somut dil — metafor ve soyutlama yok.** *"Her gün bir yolculuk"*, *"her biri ayrı ama hepsi bir"* gibi mecazlar 6-7 yaşındaki bir otizmli çocuk için anlamsız veya kafa karıştırıcıdır. Somut, görülebilir/duyulabilir şeyler yazılır: *anne gülümser*, *kedi miyav der*, *fil büyüktür*.

**4. Düz cümle kuruluşu — devrik cümle yok.** Şarkı sözlerinde devrik cümle (*"Papatya hep yanında, unutma sen"*) yaygındır ama dil işlemleme farklılığı olan bir çocukta anlamayı zorlaştırır. Özne-nesne-yüklem sırası korunur.

**5. Tek seferde tek yönerge.** *"Bak, dinle, öğren, gül"* gibi arka arkaya sıralanan emirler çalışma belleğini zorlar. Bir satırda en fazla bir eylem istenir.

**6. Paralel yapı ve tekrar.** Her satırın aynı kalıpta kurulması (*"Kedi miyav der bize / Köpek hav hav der bize"*) öngörülebilirlik yaratır, ezberlemeyi ve birlikte söylemeyi kolaylaştırır. Nakarat kelimesi kelimesine aynı tekrarlanır.

**7. Tutarlı anlatıcı.** Şarkı boyunca aynı kişi ağzından konuşulur (bu kütüphanede: çocuğun kendi ağzından, birinci tekil). Kıtada "ben", nakaratta "biz" gibi geçişler yapılmaz.

**8. Kafiye uğruna kelime uydurulmaz.** (Önceki sürümde *"dostumuz gerçel"* geçiyordu — *gerçel* Türkçede yoktur.) Kafiye tutmuyorsa satır yeniden yazılır, kelime icat edilmez.

**9. Aile bireyleri nötr terimlerle anılır.** Bu kütüphane tek bir çocuk için değil, çoklu aile için genel olmalı (Faz 4 hedefi). Bu yüzden belirli bir aile yapısını varsayan kelimeler kullanılmaz: *anneanne* (annenin annesi) yerine her iki taraf için de geçerli olan *nine*, *babaanne* yerine yine *nine*; *abla/ağabey* gibi her çocukta bulunmayan bireyler sözlere sabitlenmez. Çocuğa özel bir ad veya yakınlık istenirse ebeveyn kendi üretiminde o satırı değiştirir — kütüphanedeki temel sürüm nötr kalır.

---

## Otizm değerlendirme çeklisti (her üretilen şarkı için, YOL-HARITASI.md 4.10 gereği zorunlu)

Bir şarkı Suno'da üretildikten sonra, Müzik Köşesi'ne eklenmeden önce bu adımlardan geçmelidir — Faz 2.11 denetim çeklistindeki (g) bloğuyla aynı disiplinde:

1. **Tempo kontrolü** — gerçekten 70-110 BPM aralığında mı (Suno bazen istenenden sapabilir), kulakla veya bir BPM sayaç aracıyla doğrulanmalı.
2. **Ani ses sıçraması var mı** — parçanın tamamı dinlenerek (atlama yapmadan) beklenmedik gürültü patlaması, aniden giren davul/synth vuruşu olup olmadığı kontrol edilir.
3. **Söz içeriği** — üretilen sözler prompt'ta istenenle uyumlu mu, Suno'nun kendiliğinden eklediği (halüsinasyon) uygunsuz/korkutucu bir kelime var mı. **Suno Türkçe sözü bazen kendi değiştirir veya uydurma kelime ekler** — söylenen sözler yazdığımızla birebir aynı mı, dinleyerek karşılaştırılmalı; `0c`'deki kurallara aykırı bir şey girmişse (olumsuz kalıp, uydurma kelime, devrik cümle) o üretim atılıp yeniden denenmeli.
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

**Lyrics (Suno "Lyrics" alanına) — ölçü: 7 hece:**
```
[Verse]
Harfler bize gülüyor
Papatya şarkı söyler
Her harfin bir sesi var
Yavaşça öğrenirim

[Chorus]
Birlikte söyleyelim
A'dan Z'ye sayalım
Her harf benim dostumdur
Papatya hep yanımda

[Verse]
Bugün bir harf öğrendim
Yarın yenisi gelir
Adım adım giderim
Kendi hızım güzeldir

[Chorus]
Birlikte söyleyelim
A'dan Z'ye sayalım
Her harf benim dostumdur
Papatya hep yanımda

[Bridge]
A, B, C, Ç, D ve E
Hepsini öğrenirim
Acelem yok, yavaşım
Papatya hep yanımda
```

**Neden bu tema:** Uygulamanın çekirdek pedagojik amacıyla (harf tanıma) doğrudan hizalı, ödül/başarı baskısı içermeyen ("acelem yok", "kendi hızım güzeldir") sözlerle adaptif zorluk felsefesiyle tutarlı.

**Bu turda ne değişti:** Önceki sözlerde nakarat *"Her harf bir arkadaş, korkma sen / Papatya hep yanında, unutma sen"* şeklindeydi — iki olumsuz emir (`0c.2`) ve iki devrik cümle (`0c.4`) içeriyordu; ayrıca "korkma" `0b`'deki korku yasağıyla çelişiyordu. Olumlu ve düz kuruluşa çevrildi: *"Her harf benim dostumdur / Papatya hep yanımda"*. Hece sayıları 8-12 arasında gidip geliyordu, tamamı 7'ye sabitlendi. Alfabeyi gerçekten seslendiren bir `[Bridge]` eklendi — Türk alfabesinin ilk harfleri sırayla (Ç dahil) söyleniyor, Harf Avı'ndaki harf setiyle birebir örtüşüyor. *Not: Ğ bilerek söylenen diziye alınmadı — adı "yumuşak ge" olduğu için tek hecelik ritmi bozuyor.*

*Hece sayımı notu: `A'dan Z'ye sayalım` ve `A, B, C, Ç, D ve E` satırları yazıda kısa görünür ama söylendiğinde harf adları açılır (Ze-ye; A-Be-Ce-Çe-De-ve-E) ve ikisi de 7 heceye oturur — bu satırlar "eksik" sanılıp düzeltilmemeli.*

---

## 2. "Ailem Benim Yanımda" — Aile/Bağlanma Teması

Aile Albümü oyunuyla aynı duygusal temayı taşır — yakınlık, güven ve aidiyet duygusunu pekiştiren, sıcak ve sevecen bir aile şarkısı. Ninni/uyku vakti rolü buradan alınıp tamamen `5. "Nefes Al, Nefes Ver"`e bırakıldı (bkz. o şarkının notu) — bu parça günün herhangi bir anında dinlenebilecek, neşeli değilse de canlı bir "evdeyim, güvendeyim" hissi taşımalı.

**Style/Genre:**
```
warm acoustic children's song, gentle acoustic guitar and soft piano, light hand percussion (soft shaker), medium tempo 88 BPM, female vocal warm and tender and sweet (not sleepy or breathy), Turkish language, cozy homely daytime atmosphere, simple repetitive melody, smooth gentle dynamics, uplifting but calm, no dramatic swells
```

**Negative Tags (bkz. 0b):**
```
sudden loud noises, screaming vocals, harsh distortion, heavy bass, dissonance, complex rhythms, loss or abandonment imagery, dark themes, hyperactive energy, abrupt dynamic changes, industrial or glitchy sounds
```

**Lyrics — ölçü: 7 hece:**
```
[Verse]
Annem bana gülümser
Babam elimi tutar
Evimiz çok sıcaktır
Ailem hep yanımda

[Chorus]
Ailem yanımdadır
Güvendeyim burada
Sevgi dolu bu evim
Ailem hep yanımda

[Verse]
Dedem masal anlatır
Ninem bana sarılır
Kucakları sıcacık
Ben onları severim

[Chorus]
Ailem yanımdadır
Güvendeyim burada
Sevgi dolu bu evim
Ailem hep yanımda
```

**Neden bu tema:** Aile Albümü'nün ("sosyal-tanima" becerisi) duygusal karşılığı — yakınlık derecelerini (anne, baba, dede, nine) doğal biçimde tekrar eder, oyunun sözlü ipucu mantığıyla (bkz. `seslendirmeler.md` A4) aynı kelime dağarcığını pekiştirir.

**Bu turda ne değişti:** *"Babam elini uzatır, gelir dizime"* satırı anlamsızdı (babanın eli mi dize geliyor?) — *"Babam elimi tutar"* ile hem düzeltildi hem somutlaştı. *"Ben yalnız değilim, hiç korkmuyorum"* iki olumsuzlama içeriyordu (`0c.2`), olumlu karşılığıyla değiştirildi: *"Ailem yanımdadır / Güvendeyim burada"*. *"Her biri ayrı, ama hepsi bir"* soyut bir ifadeydi (`0c.3`), somut bir sahneye çevrildi: *"Kucakları sıcacık"*. Hece sayısı 9-13 arasında dalgalanıyordu, 7'ye sabitlendi. Nakarat artık iki kez birebir aynı geçiyor (`0c.6`) — önceki sürümde nakarat yalnızca bir kez vardı ve kendi içinde "biliyorum" kafiyesi tekrarlanıyordu. **Aile bireyleri nötr terimlere çekildi** (`0c.9`): Kardeş satırı (*"Ablam, ağabeyim"*) çıkarıldı — her çocuğun kardeşi yok. *"Anneannem"* de **"ninem"** ile değiştirildi: "anneanne" yalnızca *annenin annesi* demektir, yani ailenin bir tarafını seçer; üstelik bir üst satırdaki "dede" her iki taraf için de kullanılan genel bir kelime olduğu için ikili kendi içinde tutarsızdı. "Nine" her iki taraf için de geçerli, günlük ve sade bir karşılık — "dede + nine" artık simetrik. Çocuğa özel bir ad/yakınlık (kardeş adı, "babaannem" vb.) istenirse ebeveyn kendi üretiminde o satırı değiştirebilir. **Ayrıca kullanıcı geri bildirimiyle Style/Genre yeniden ayarlandı:** önceki "soft lullaby, 72 BPM, breathy vocal, bedtime atmosphere" tarifi fazla ağır ve dramatik bulundu — bu şarkının işi "evdeyim, güvendeyim" hissini gündüz de taşıyabilmek, uyku vakti değil (o rol tamamen `5.`'e ait). Tempo 88 BPM'e çıkarıldı, "breathy"/"bedtime"/"sparse" gibi uykuya çağıran nitelikler kaldırıldı; sıcak ama canlı, "not sleepy or breathy" olarak açıkça belirtildi.

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

**Lyrics — ölçü: 8 hece:**
```
[Verse]
Güneş doğdu, ben uyandım
Kahvaltımı güzel yaptım
Sonra oyunlar oynadım
Papatya'yla harf öğrendim

[Chorus]
Sabah, öğlen, akşam, gece
Günüm sırayla geçiyor
Biliyorum ne olacak
İçim rahat, çok mutluyum

[Verse]
Öğlen oldu, dinlendim ben
Sonra resim çizdim biraz
Akşam ailemle yedim
Şimdi uyku vakti geldi

[Chorus]
Sabah, öğlen, akşam, gece
Günüm sırayla geçiyor
Biliyorum ne olacak
İçim rahat, çok mutluyum
```

**Neden bu tema:** YOL-HARITASI.md'nin "sakin kapanış ritüeli" ilkesiyle uyumlu; zaman kavramını (sabah/öğlen/akşam/gece) somut ve tekrarlayan bir yapıda pekiştirir, gün sonu geçişini kolaylaştırıcı bir araç olabilir.

**Bu turda ne değişti:** İki gerçek Türkçe hatası vardı: *"Akşam oldu, ailemle yemek"* (yüklem yok) ve *"Şimdi uyku vakti, iyi geceler demek"* (mastar yanlış kullanılmış) — ikisi de düzgün cümleye çevrildi. Anlatıcı tutarsızdı (`0c.7`): kıtalarda *"ben"*, nakaratta *"yaptık / sayalım / anlatalım"* çoğul kullanılıyordu; nakarat da birinci tekile alındı. *"Her gün bir yolculuk, güzelce"* hem metafordu (`0c.3`) hem "güzelce" kafiye için zorlanmıştı (`0c.8`) — yerine şarkının asıl işini yapan iki satır kondu: *"Biliyorum ne olacak / İçim rahat, çok mutluyum"*. Bu, öngörülebilirliğin neden iyi hissettirdiğini çocuğun kendi ağzından, somut olarak söylüyor — şarkının rutin/öngörülebilirlik temasının tam karşılığı. Hece sayısı 9-14 arasındaydı, 8'e sabitlendi.

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

**Lyrics — ölçü: 7 hece:**
```
[Verse]
Kedi miyav der bize
Köpek hav hav der bize
İnek möö möö der bize
Koyun mee mee der bize

[Chorus]
Hayvanlar bahçededir
Hepsi burada bizle
Her biri çok sevimli
Hepsini çok severim

[Verse]
Kelebek uçar yavaş
Karınca yürür yavaş
Fil büyüktür, çok büyük
Kirpi küçük, çok küçük

[Chorus]
Hayvanlar bahçededir
Hepsi burada bizle
Her biri çok sevimli
Hepsini çok severim
```

**Neden bu tema:** Mevcut görsel içerik havuzuyla (karşılaştırma görselleri) doğrudan bağlanabilir — ileride şarkı sözlerindeki hayvanlarla oyun içeriği arasında görsel eşleştirme yapılabilir (ayrı bir teknik iş, burada yalnızca tematik uyum kurgulanıyor).

**Bu turda ne değişti:** En ciddi hata buradaydı: *"Hepsini severiz, hepsi bizim dostumuz gerçel"* — **"gerçel" Türkçede yok**, yalnızca "özel" ile kafiye tutsun diye uydurulmuş (`0c.8`); ayrıca satır 15 heceyle diğerlerinin iki katıydı. Kıta tamamen yeniden yazıldı. *"Bak, dinle, öğren, gül"* arka arkaya dört emirdi (`0c.5`), kaldırıldı. Nakarattaki *"her biri güzel arkadaşımız"* 13 heceydi (diğer satırlar 8-9), ölçü 7'ye sabitlendi.

**Üretim sırasında dikkat edilecek tek nokta:** `möö` ve `mee` Türkçede doğru yazımlardır ve burada **tek, uzatılmış hece** olarak tasarlandı (inek sesinin doğal olarak uzaması gibi) — böylece dört satır da 7 hece tutar. Suno bunları iki heceymiş gibi (*mö-ö*, *me-e*) okursa o iki satır diğerlerinden uzun düşer ve paralellik ritmik olarak bozulur. Üretim dinlenirken buna özellikle kulak verilmeli; bozuk çıkarsa ya yeniden üretilmeli ya da o iki satır `İnek möö der bize` / `Koyun mee der bize` şeklinde tek sesli hâle getirilip tekrar denenmelidir (bu durumda kalıp korunur, yalnızca ses bir kez söylenir).

Asıl kazanç birinci kıtada: dört satır da artık **birebir aynı kalıpta** (*"[hayvan] [ses] der bize"*) — `0c.6`'daki paralel yapı ilkesinin en net uygulaması. Çocuk ikinci satırda kalıbı çözer, üçüncüde kendisi tahmin edebilir, dördüncüde birlikte söyleyebilir; hayvan sesleri de taklit edilebilir olduğu için katılımı doğal olarak davet eder. İkinci kıta aynı mantığı zıtlık öğretimine uyguluyor: *yavaş/yavaş* ve *büyük/küçük* ikilileri simetrik satırlarda veriliyor — Hafıza Kartları'ndaki boyut karşılaştırmalarıyla aynı kavram.

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
Yavaşça... yavaşça...
Nefes al... nefes ver...
Ben buradayım...

[Verse]
Nefes al... nefes ver...
Her şey yolunda...
Nefes al... nefes ver...
Güvendesin... güvendesin...
```

**Bu turda ne değişti:** Sözler zaten sade ve olumluydu, büyük bir düzeltme gerekmedi — yalnızca ikinci bir kıta eklenerek parçanın nefes döngüsünü taşıyacak kadar uzaması sağlandı ve kapanış *"güvendesin"* tekrarıyla yumuşatıldı.

**İki bilinçli istisna (diğer şarkılardan farklı):**
- **Ölçü serbest.** `0c.1`'deki sabit hece kuralı burada uygulanmadı — bu parçanın stili zaten "free tempo, no strong beat". Sözler nefes hızına uymalı, ölçüye değil; noktalar (`...`) Suno'ya duraklama işareti verir.
- **Anlatıcı değişiyor.** Diğer dört şarkı çocuğun kendi ağzından ("ben öğrenirim", "ailem yanımda"); bu şarkı çocuğa *seslenen* sakin bir yetişkin sesi ("güvendesin", "ben buradayım"). `0c.7` şarkı **içinde** tutarlılık ister, bu şarkı kendi içinde tutarlı — kriz/yatıştırma anında çocuğun kendi sesi değil, dışarıdan gelen güvenli bir sesin daha uygun olduğu değerlendirildi. Bu bir tasarım tercihi, klinik görüşle doğrulanmalı (aşağıdaki uyarıya bakın).

**Neden bu tema, ve ÖNEMLİ UYARI:** YOL-HARITASI.md "Kriz anı — Sakinleştirme modu" bölümü açıkça "ses ve müzik durur" diyor — bu şarkı o kuralla ÇELİŞEBİLİR. Bu tema yalnızca bir **öneri/tartışma başlangıcı** olarak eklendi: belki Sakin Mod'un kendisinde değil, Sakin Mod'dan ÇIKARKEN geçiş müziği olarak, ya da tamamen ayrı isteğe bağlı bir "sakinleştirici şarkı" olarak Müzik Köşesi'nde durabilir. **Bu şarkının Sakinleştirme Modu'yla ilişkisi, üretilmeden önce mutlaka ebeveyn/klinik görüşüyle netleştirilmeli** — mevcut mimariyi (sessizlik kuralı) bozmadan nasıl konumlandırılacağı ayrı bir karar gerektirir.

---

## Uygulama notu (kod entegrasyonu, henüz yapılmadı)

Bu dosya yalnızca prompt kütüphanesidir — hiçbir kod değişikliği içermez. Bir şarkı Suno'da üretilip çeklistten geçtikten sonra, bugünkü akışla aynı şekilde ebeveyn panelinden eklenir: üretilen ses dosyası bir barındırma noktasına (ör. `public/sounds/` altına, YouTube yerine yerel dosya referansı için `Song` modelinde küçük bir alan eklentisi gerekebilir — bugün `youtubeId` zorunlu alan, yerel dosya senaryosu şemaya henüz uymuyor, bu ayrı bir teknik karar/iş).
