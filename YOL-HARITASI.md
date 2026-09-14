# Papatya — Ürün Yol Haritası

**Sürüm 2.15 · 13 Eylül 2026 — Mühürlenmiş**

Otizmli çocuklar için kişiselleştirilebilir öğrenme ve iletişim uygulaması.
**Melike için inşa ediliyor, herkes için tasarlanıyor.** Bu belge, bugünkü koddan yola çıkıp
LLM destekli bir otizm eğitim platformuna giden dört fazlık yolu ve ötesindeki vizyonu tarif eder.

| | |
|---|---|
| **Kod Tabanı** | Next.js 14 · Prisma · Zustand |
| **İlk Kullanıcı** | Melike Bostanoğlu, 6–7 yaş |
| **Hedef Cihazlar** | Telefon · Tablet · PC |
| **Mevcut Oyun/Etkinlik** | 8 (4 oyun + müzik + video + çizim + yazı), tümü çalışır durumda |
| **Ufuk** | Çocukluk → ergenlik → erken yetişkinlik |

---

## Yönetişim: Pazarlık konusu olmayan kurallar

Bu bölüm fazlardan önce gelir çünkü fazların hepsini bağlar. Bir özellik bu kurallardan birini çiğniyorsa, ne kadar değerli olursa olsun yapılmaz.

Bu bölüm **ürünün** ne yapıp ne yapmayacağını tarif eder. Geliştirmenin **nasıl** yürütüldüğü (kapsam onayı, commit disiplini, kod standardı, port ayrımı vb.) [GENEL-KURALLAR.md](GENEL-KURALLAR.md)'de ayrıca mühürlenmiştir; `/loop` aracının özel işleyişi ise [LOOP-KURALLARI.md](LOOP-KURALLARI.md)'de. Tamamlanan maddelerin ayrıntılı özeti (bu belgeyi şişirmesin diye) [YOL-HARITASI-YAPILANLAR.md](YOL-HARITASI-YAPILANLAR.md)'dedir.

### Veri güvenliği anayasası — Katı yerel işleme

Kamera görüntüsü, ses kaydı ve konum verisi **cihazdan veya ev sunucusundan asla çıkmaz.** Python servisleri yerel ağda çalışır. Buluta yalnızca sayısal sonuç gider (`{hareket: "kollar_yukarı", skor: 0.91}`), ham medya asla. LLM'e gönderilen her şey anonimleştirilmiş metindir.

```
Kamera ──┐
Mikrofon ─┼─→ [Yerel işleme] ──→ sadece sonuç ──→ [Bulut / DB]
Konum ────┘         │
                    └─→ ham medya burada kalır ve silinir
```

Bu bir ayar değil, mimari kuraldır. Ham medyayı buluta gönderen bir kod yolu var olmamalıdır.

### Klinik sınır sözleşmesi

Uygulama **tanı koymaz, otizm şiddeti/seviyesi ölçmez, gelişim geriliği tespit etmez.** İçerik politikası kademelidir:

| Aşama | Kim onaylar | Ne sunulabilir |
|---|---|---|
| **Bugün (Faz 1–3)** | Ebeveyn | Aktivite verisi, nötr istatistik, ebeveynin kendi seçtiği/onayladığı içerik. Yorum ve değerlendirme yok. |
| **Uzman bağlıyken (Faz 4)** | Çocuk gelişimci / psikolog / psikiyatrist | Yapılandırılmış program ve gelişim değerlendirmesi açılır; her içerik kimin onayladığı kaydıyla saklanır. |

Uzman bağlı değilken değerlendirme ve program modülleri **kodda hazır ama kapalı** durur. Varsayılan her zaman güvenli taraftır.

> **Uzman denetim kapısı:** Her fazın çıkışında yol haritasının tamamı çocuk psikiyatristi, çocuk gelişimci ve çocuk psikoloğu bakış açısıyla gözden geçirilir. Bu bir öneri değil, faz kapısının parçasıdır.

### Ekran sağlığı — Anti-bağımlılık mimarisi

Otizmli çocuklarda ekran takıntısı bilinen bir risktir. Uygulama çocuğu ekranda tutmaya değil, **ekrandan sağlıklı biçimde ayırmaya** çalışır.

| Yasak | Zorunlu |
|---|---|
| Sonsuz kaydırma / akış | Net günlük süre limiti |
| Otomatik sonraki video | Doğal bitiş: papatya dolar, gün biter |
| "X gün üst üste!" serisi | Sakin kapanış ritüeli |
| Push bildirimi / geri çağırma | Ekran dışı görev önerisi ("resmini annene göster") |
| Rastgele ödül (kumar mekaniği) | Ebeveyne şeffaf kullanım raporu |
| "Biraz daha" pazarlığı | Limit aşımında yumuşak ama kesin son |

### Kullanıcı katmanları

Şu an **tüm kullanıcılar temel (`basic`) katmandadır** ve aralarında hiçbir kısıtlama farkı yoktur. Uygulama ticari amaç taşımaz. Yalnızca gerçek maliyet üreten özellikler (LLM çağrıları, video depolama) için ileride bir **token havuzu + bağış** modeli değerlendirilecektir: her aileye aylık ücretsiz kota, isteyen aile bağışla havuza katkı. Kâr amacı yoktur; hedef yalnızca altyapı maliyetinin karşılanmasıdır.

### Aile yapısı: bir ebeveyn → çoklu çocuk

`User` modeli bugün tek çocuğu (Melike) temsil eder, ancak **ileride kardeşler aynı ebeveyn yönetimi altında ayrı profiller olarak bağlanabilecek** şekilde tasarlanır. Giriş ekranına ilerde bir "kim giriyor?" profil seçimi eklenir; tek bir ebeveyn PIN'i tüm çocuk profillerini yönetir, ancak her çocuğun verisi ve ilerlemesi birbirinden bağımsız kalır. Bu, Faz 1'deki şemanın bugünden kaçınması gereken bir varsayımdır: `User` ile ebeveyn kimliği asla birebir eşlenmemelidir.

### Kriz anı — Sakinleştirme modu

Ardışık yanlış cevap veya hızlı/rastgele dokunma gibi sıkıntı belirtisi paternleri algılandığında uygulama kendiliğinden **Sakin Mod**'a geçer: ses ve müzik durur, ekran sadeleşir, nefes alma daveti gösterilir ve ebeveyne bildirim gider. Bu bir klinik müdahale değildir — yalnızca durdurma ve haber vermedir; yorum veya tanı içermez. Ayrıntılı algılama kuralları Faz 3'te (uyarlanabilir zorluk motoruyla birlikte) tasarlanır, ancak ilke şimdiden mühürlenir.

### Veri devri — Yetişkinliğe geçiş ilkesi

Şema, çocuğun **kendi hesabının sahipliğini yetişkinlik eşiğinde devralabileceği** varsayımıyla kurulur. Bugünden itibaren ebeveyn ile çocuk arasındaki ilişki, `User` tablosunda sonradan sökülmesi gereken sabit bir bağımlılık olarak değil, zamanla yön değiştirebilecek bir yetki ilişkisi olarak modellenir. Devrin tam mekanizması Faz 5'in açık sorularından biridir; burada mühürlenen yalnızca ilkedir: sahiplik devredilebilir olmalıdır, baştan kilitlenmemelidir.

### Yedekleme ve felaket kurtarma

Katı yerel işleme ilkesi bozulmadan veri kaybı riskine karşı: düzenli aralıklarla **uçtan uca şifreli bir yedek dosyası** oluşturulur. Ebeveyn bu dosyayı kendi seçtiği bir yere (USB, kendi bulut hesabı) taşıyabilir; şifreleme anahtarı yalnızca ebeveyndedir, Papatya'nın kendi sunucusu yedeğin içeriğini hiçbir zaman görmez. Cihaz kaybı/arızası durumunda geri yükleme bu dosya + parola ile yapılır.

### İçerik moderasyonu sorumluluğu

Sistem otomatik içerik filtresi uygulamaz — yanlış pozitif/negatif riski, otomatik kararın getirdiği güvenden daha zararlıdır. Bunun yerine, ebeveyn bir video/şarkı/hikâye eklerken kısa bir **kontrol listesi** gösterilir (ani/yüksek ses var mı, yıpıcı görsel var mı, çocuğa uygun mu) ve ebeveyn açıkça onaylar. Sorumluluk her zaman ebeveyne aittir; sistem yalnızca hatırlatır.

### Test ve kalite güvencesi

Otizmli bir çocuk için rutin bozulması sıradan bir yazılım hatasından daha ciddi bir sonuçtur — yanlış çalan bir ses veya beklenmedik bir geçiş kaygı tetikleyebilir. Bu yüzden her yeni özellik canlıya geçmeden önce hem **otomatik testten** hem **gerçek kullanımla deneme**den geçer; çubuk sıradan bir uygulamadan daha sıkıdır. Bu Faz 1'in temel bir maddesidir.

---

## Bu yol haritası neyi çözüyor

Mevcut kodda çalışan üç oyun var ve Melike bunları bugün oynayabiliyor. Ancak altyapıda üç yapısal düğüm bulunuyor: **bir kullanıcı bir cihaza eşit** (çoklu profil imkânsız), **tüm içerik TypeScript dosyalarına gömülü** (yeni kelime eklemek deploy gerektiriyor) ve **yazılmış ama bağlanmamış bir sistem katmanı** var — Türkçe seslendirme, tema tokenleri ve dil dosyası kodda duruyor fakat hiçbiri devrede değil.

Fazlar bu gerçeğe göre sıralandı. Faz 1 düğümleri çözer ve kapalı duran sistemleri açar; bunlar yapılmadan sonraki her özellik iki kez yazılmak zorunda kalır. Faz 2 Melike'nin günlük kullanacağı içerikleri getirir. Faz 3 yapay zekâyı ve ses tanımayı ekler. Faz 4 uygulamayı başka ailelere ve geliştiricilere açar.

---

## Mevcut durum denetimi

Faz planı bu tabloya dayanıyor. "Yazılmış ama kapalı" satırları özellikle önemli — bunlar en düşük maliyetli, en yüksek getirili ilk işler.

| Durum | Alan | Değerlendirme |
|---|---|---|
| **Kısmen** | Oyunlar | Harf Avı (24 seviye, DB'ye kayıt), Hafıza Kartları ve Sihirli Kelimeler çalışıyor. Ancak üçü de birbirinden bağımsız yazılmış; ortak bir oyun soyutlaması yok ve ikisi ilerlemesini `localStorage`'a, biri veritabanına yazıyor. Visual Match bir prototip — ses dosyası adları eşleşmediği için sesleri hiç çalmıyor. |
| **Darboğaz** | Kullanıcı modeli | `User.id` doğrudan çerezdeki `deviceId`. Aynı tablette iki çocuk ayrı profil olamıyor, çerez silinince tüm ilerleme kurtarılamadan kayboluyor. Ebeveyn kavramı şemada hiç yok. |
| **Darboğaz** | İçerik | 28 harf ve yüzlerce kelime `gameData.ts` içinde sabit. Melike'nin sevdiği yeni bir kelimeyi eklemek için kod değiştirip yeniden yayınlamak gerekiyor. Ayrıca `Ğ` harfi tip tanımında var ama veride yok. |
| **Yazılmış, kapalı** | Türkçe seslendirme | `useTurkishSpeech.ts` tamamen hazır (tr-TR, yavaşlatılmış konuşma hızı) fakat `AudioProvider` ana şablonda yorum satırında. Uygulama şu an tek kelime konuşmuyor. |
| **Yazılmış, kapalı** | Tema sistemi | `config/theme.ts` içindeki renk paleti ve animasyon süreleri hiçbir yerden çağrılmıyor. Renkler bunun yerine her bileşene tek tek yazılmış; duyusal hassasiyete göre tema değiştirmek şu an mümkün değil. |
| **Hazır** | Konuşma tanıma | Sihirli Kelimeler oyununda gerçekten çalışıyor: sürekli dinleme, "pas/geç" atlama komutları, toleranslı eşleştirme. Faz 3'teki ses tabanlı onay sisteminin temeli burada mevcut. |
| **Hazır** | PWA | Servis çalışanı, manifest ve ikonlar yerinde. Ancak resim ve sesler harici bir CDN'den çekildiği için gerçek çevrimdışı kullanım henüz çalışmaz. |
| **Yok** | Masaüstü düzeni | Yalnızca `md:` kırılma noktası kullanılmış; `lg:` ve üzeri hiç yok. PC'de arayüz tablet görünümünde sıkışık kalıyor. Ölçek faktörü veya akışkan tipografi altyapısı bulunmuyor. |

---

## Marka kimliği

İsim **Papatya**. Sakin, doğal ve yaş-cinsiyet nötr — Melike için sıcak, başka çocuklara açıldığında da yabancı durmayan bir ad. Sekiz yapraklı papatya hem logo hem ilerleme göstergesi olarak çalışıyor: her tamamlanan etkinlik bir yaprağı doldurur, tam çiçek günün tamamlandığını anlatır.

- **Açılış animasyonu:** yapraklar sırayla açılır, göbek yerine oturur. Toplam 400 ms — bekletmeyecek kadar kısa, fark edilecek kadar belirgin. `prefers-reduced-motion` açıkken tek karede belirir.
- **İlerleme metaforu:** sekiz yaprak = günün sekiz etkinliği. Yaprak dolmak, ilerleme çubuğundan çok daha somut ve sözel olmayan bir geri bildirim.
- **Palet:** krem zemin gözü yormaz, papatya sarısı yalnızca ödül ve vurgu anlarında kullanılır — otizm dostu arayüzde renk, dikkat yönlendirme aracıdır, dekorasyon değil.

**Renkler**

| Rol | Hex |
|---|---|
| Zemin (krem) | `#FBF8EF` |
| Papatya sarısı (vurgu) | `#E8B33C` |
| Yaprak yeşili | `#5F7A52` |
| Gök mavisi | `#6B87A8` |
| Gül | `#C4756A` |
| Mürekkep | `#2A2722` |

> İsim kodda tek bir `brand.ts` dosyasından okunur. Bugün "Papatya", yarın başka bir aile için başka bir ad — arayüz metinleri, manifest, açılış ekranı ve seslendirme cümleleri hep o tek kaynaktan beslenir.

**Çatı + aksan ilkesi:** Papatya logosu, ana renk paleti ve sekiz yapraklı ilerleme metaforu **marka kimliğinin sabit çatısıdır** ve hiçbir kişiselleştirmeyle değişmez. Çocuğun ilgi alanına göre kişiselleştirme (bkz. Faz 2.10) yalnızca ikon, motif ve aksesuar seviyesinde bir **aksan katmanı** olarak çalışır — çatının üstüne giyilir, çatının yerini almaz.

---

## Faz 1 — Temel & Kimlik

> **Ön koşul fazı.** Melike'nin gözünde çok az şey değişir; altta neredeyse her şey değişir. Bu fazın amacı, sonraki üç fazın yeniden yazım gerektirmeden inşa edilebileceği bir temel kurmaktır.

> ✅ ile işaretli maddeler tamamlanmıştır — uzun açıklamaları roadmap'i şişirmesin diye [YOL-HARITASI-YAPILANLAR.md](YOL-HARITASI-YAPILANLAR.md)'ye taşınmıştır (kopyalanmamıştır). Aşağıdaki tablo yalnızca kısa bir özet ve o belgeye yönlendirme içerir.

| # | İş | Açıklama | Yük |
|---|---|---|---|
| 1.1 | **Kullanıcı ve kimlik altyapısı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.2 | **Dinamik kimlik: "Adının Dünyası"** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 1.3 | **Tek giriş, korumalı yönetim alanı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.4 | **İçeriği veritabanına taşı** ✅ *(Kritik)* | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.4b | **Çocuk profili şeması: ilgi alanı ve duyusal profil** ✅ *(Kritik)* | *Tamamlandı (yalnızca şema) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.5 | **Seslendirmeyi aç** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 1.6 | **Tasarım tokeni katmanı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.7 | **Üç cihaz ölçeklemesi** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.8 | **Ortak oyun soyutlaması** ✅ | *Tamamlandı ("ortak kabuk, ayrı ilerleme modelleri") — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.9 | **Papatya görsel kimliği** ✅ | *Tamamlandı (teknik iskele) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.10 | **Ekran sağlığı temeli** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.11 | **Gerçek çevrimdışı çalışma** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.12 | **Test ve deneme protokolü** ✅ | *Tamamlandı (Vitest+RTL) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.13 | **Audit log altyapısı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.14 | **Merkezi bildirim altyapısı** ✅ | *Tamamlandı (kısmi) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.16 | **Arka plan geçiş bildirimi** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 1.17 | **Duyusal ayarların merkezi bağlanması** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.18 | **Navigasyon iskeleti ve çıkış kontrolü** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.19 | **Aile/Guardian veri modeli (yalnızca şema)** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.20 | **Beceri/kazanım (Skill) katmanı** ✅ | *Tamamlandı (dört oyunun tamamı bağlandı) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.21 | **Dil/metin katmanını tekilleştir** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.22 | **Oyun ilerlemesini tam veritabanına taşı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 1.23 | **Kişiselleştirme: hardcoded "Melike" referansları** ✅ | *Tamamlandı (metin) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 1.24 | **ParentFooter'ı oyun-bağımsız hale getir** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 1.25 | **Ekran sağlığı/güvenlik-kritik kod için test kapsamını genişlet** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 1.26 | **Küçük temizlik** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |

**Faz Çıkışı** — Melike kendi adıyla giriş yapar, *Melike'nin Dünyası* onu karşılar, uygulama onunla Türkçe konuşur, dört oyun da (Harf Avı, Hafıza Kartları, Sihirli Kelimeler, Görsel Eşleştirme) telefonda ve PC'de düzgün ölçeklenir, ilerlemesi hesabına kaydedilir (dördü de veritabanında, `localStorage`'da değil), günlük süre limiti fiilen çalışır ve internet olmadan da her şey açılır. Yeni bir kelime eklemek artık kod değişikliği gerektirmez. Ebeveyn, çocuğun ilgi alanlarını ve duyusal profilini kaydedebilir — bu veri henüz kullanılmasa da (Faz 2.10'u bekler) şemada hazır durur. Her ebeveyn işlemi audit log'a düşer, bildirimler tek merkezi kaynaktan çıkar, çocuk uygulamayı arka plana attığında ebeveyn haberdar olur. Tüm korumalı rotalar gerçekten girişle korunuyor (`src/middleware.ts` — 2026-09-13'te konum hatası düzeltildi, prod build'de doğrulandı, bkz. [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md)). Ebeveyn kapısından çıkış yapılabilir, menüde Faz 3'e kadar planlanan tüm alanlar — henüz yazılmamış olsa bile — en azından bir yuva olarak görünür.

**Faz 1 artık tam kapalı (27/27)** — hesap silme akışı (eski 1.15) Faz 3.11'e bağımlı olduğu için 2026-09-13'te **Faz 3'e taşındı** (bkz. 3.11b), Faz 1'in kendi listesinde artık açık bir kalem yok.

**1.19-1.26 not** ✅ *Tamamlandı* — Bu maddeler 3. loop'un genel denetiminde bulunup eklendi ve tamamlandı: bir kısmı sonraki fazların (3.1, 3.12, 4.3) hiç başlamamış altyapı temeliydi, bir kısmı mevcut işteki tutarsızlık/eksiklik düzeltmesiydi. Faz 1'in "sağlam temel" ilkesini tamamlıyorlar, yeni bir ürün özelliği eklemiyorlar. Faz 1 artık **tamamen kapalı (27/27)** — eski 1.15, 3.11b olarak Faz 3'e taşındı.

---

## Faz 2 — Zenginleşme

> **Günlük kullanım fazı.** Faz 1 temeli kurdu; bu faz üzerine Melike'nin gerçekten sevdiği şeyleri koyar. Müzik, kendi çizgi film karakteri, çizim ve yazı — uygulamayı bir alıştırma aracından günlük bir arkadaşa dönüştüren faz.

> **Kapsam sınırı (2026-09-13):** Faz 2'de hiçbir Python servisi/altyapısı kurulmaz. Ses tanıma, kamera/MediaPipe işleme, içerik risk skoru gibi tüm Python tabanlı sistemler Faz 3'ün işidir (bkz. 3.3, 3.4, 3.14) ve orada başlatılır. Faz 2'deki her madde yalnızca mevcut Next.js/tarayıcı katmanıyla (ör. 2.2'deki ses kaydı tarayıcı MediaRecorder API'sidir, bir Python servisi değil) inşa edilir.

| # | İş | Açıklama | Yük |
|---|---|---|---|
| 2.1 | **Ebeveyn yönetim alanı** ✅ *(Önce bu)* | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 2.2 | **Aile bireyleri kaydı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 2.3 | **Müzik köşesi** ✅ *(Öne çıkan)* | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 2.4 | **Melike'nin çizgi filmi** ✅ | *Tamamlandı (kapsamı daraltılmış — gerçek AI üretimi Faz 4.2'ye ertelendi) — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 2.5 | **Aile albümü oyunu** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 2.6 | **Çizim tahtası** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 2.7 | **Yazı alıştırması** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 2.8 | **Günlük rutin ve oyunlaştırma** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 2.8b | **Beceri rozetleri** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 2.9 | **Sözlü onay mekanizması** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Düşük |
| 2.10 | **İlgi alanı aksan katmanı** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 2.11 | **Araç/oyun/sistem denetim çeklisti (blok blok)** | Faz 1-2'de yazılmış her oyun ve sistemin (Harf Avı, Hafıza Kartları, Sihirli Kelimeler, Görsel Eşleştirme, Aile Albümü, Çizim Tahtası, Yazı Alıştırması, Müzik Köşesi, Melike'nin Çizgi Filmi, AAC tahtası, Sakinleştirme Modu, ebeveyn yönetim alanının tamamı) tek tek gözden geçirildiği, bloklar hâlinde ilerleyen bir denetim turu — kod yazan kişinin (Claude) kendi başına karar veremeyeceği, insan/uzman girdisi gerektiren bir kapsam. Her blok ayrı bir loop/oturumda ele alınır, bulgular bu maddenin altına ve gerekirse ilgili Faz 3+ maddelerine (3.13 metodoloji uyumu, "Uzman denetimi" notu vb.) bağlanır:<br>**a) Klinik/pedagojik/gelişimsel uygunluk** — çocuk gelişimi uzmanı, psikiyatrist ve pedagog gözüyle: zorluk kademeleri yaşa/gelişim düzeyine uygun mu, pekiştirme/ödül mekanizması davranışsal açıdan sağlıklı mı, takıntı/aşırı-uyarılma riski var mı, sakinleştirme modu eşiği klinik açıdan yeterli mi.<br>**b) Ebeveyn deneyimi** — ebeveynin günlük kullanımda ihtiyaç duyduğu kontrol/görünürlük eksiksiz mi (limit ayarları, ilerleme görünürlüğü, içerik onayı), yönetim alanı anlaşılır mı, ebeveyn için gereksiz karmaşıklık var mı.<br>**c) UI/UX iyileştirmeleri** — her oyun/ekranın akışı, buton/dokunma hedefleri, geri bildirim netliği, gereksiz boşluk/tutarsız düzen, üç cihaz ölçeklemesinin (telefon/tablet/PC) her ekranda fiilen sınanması.<br>**d) Görsel/işitsel içerik yeterliliği** — her oyundaki görsel/ses varlıklarının eksiksiz, kaliteli ve tutarlı olup olmadığı (kırık görsel/ses yok mu, 88 karşılaştırma görseli gibi yeni eklenen içeriklerin oyun bağlamına düzgün oturup oturmadığı), metinlerin (readingText, etiketler) çocuğa uygun sadelikte olup olmadığı.<br>**e) Erişilebilirlik/duyusal uygunluk** — renk kontrastı, ses seviyesi/ani ses değişimleri, animasyon yoğunluğu, duyusal profil ayarlarının (Faz 1.17) her oyunda fiilen etkili olup olmadığı.<br>**f) Güvenlik/gizlilik tekrar kontrolü** — middleware/ParentGate gibi daha önce bulunan kritik açıkların bir daha yaşanmadığından blok bazında emin olma (kod incelemesiyle, ayrı bir "genel tarama" değil).<br>**g) Ses efektleri/görsel efektler yeterliliği ve ihtiyaç tespiti** — her oyundaki geri bildirim efektlerinin (doğru/yanlış sesi, ödül animasyonu, kart çevirme/eşleşme efekti, geçiş animasyonları, dokunma/hover mikro-etkileşimleri) eksiksiz, tutarlı ve duyusal açıdan aşırı uyarıcı olmadığının denetimi; hangi oyunlarda hâlâ "sessiz" veya "efektsiz" kalan etkileşim noktaları olduğunun (ör. bir butonun basıldığını hissettirecek görsel/işitsel karşılığı olmayan yerler) tespiti ve önceliklendirilmesi. Statik varlık bütünlüğü (d)'nin işi; bu blok davranışsal/etkileşimsel efekt katmanına odaklanır. | Yüksek |

**Faz Çıkışı** — Melike sabah uygulamayı açıp günlük papatyasını ve "Bugün" özetini görüyor; sevdiği şarkıyı sınırlı sayıda dinliyor, ebeveynin yüklediği videoları/resimli hikâyeleri izliyor, resim yapıyor, ailesini tanıma oyununu (sesle de onaylayabildiği) oynuyor, harf yazma alıştırması yapıyor ve ilk kez başardığı becerilerde sabit bir rozet kazanıyor. Ebeveyn tüm bunları koda dokunmadan yönetim alanından tanımlıyor. *(Gerçek yapay zekâ ile üretilmiş çizgi film/görsel henüz yok — Faz 4.2'yi bekliyor, bu yüzden 2.4 kapsamı daraltılmış olarak kapandı.)*

**Faz 2 kapanış notu (2026-09-13)** — 2.1-2.10'un tamamı bir loop'ta tamamlandı. Faz 2'de hiçbir Python servisi kurulmadı (kesin sınır olarak baştan belirlendi); tüm özellikler mevcut Next.js/tarayıcı katmanıyla inşa edildi. Yeni Prisma modelleri: `FamilyMember`, `Song`/`SongPlayCount`, `Video`, `Drawing`, `Badge`. Yeni bir yerel dosya depolama katmanı (`src/lib/mediaStorage.ts`, `public/uploads/`) kuruldu — Faz 2.2'den itibaren tüm medya buradan geçiyor. **Sonradan bulunan/kapatılan boşluklar** (aynı gün, üç ayrı UX denetim turunda): profil fotoğrafı/isim/kullanıcı adı düzenlenemiyordu, aile bireyi yalnızca ekle/sil ile sınırlıydı (düzenleme yoktu), şarkının günlük tekrar hakkı eklendikten sonra değiştirilemiyordu, çizim galerisi ebeveyn tarafında hiç görünmüyordu, audit log ebeveyn panelinde görünmüyordu — hepsi kapatıldı, ayrıntı [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md)'da.

**Faz 2, 10/11 — 2.11 (denetim çeklisti) bilinçli olarak açık (2026-09-14)** — Kod/özellik anlamında Faz 2'nin tamamı yazılmış ve doğrulanmış durumda. 2.11, yeni kod yazmayı değil, mevcut işin geriye dönük blok-blok (klinik/pedagojik, ebeveyn, UI/UX, görsel içerik, erişilebilirlik, güvenlik, ses/görsel efekt yeterliliği+ihtiyaç tespiti) denetimini kapsıyor — kullanıcının açık talimatıyla eklendi, her blok ayrı bir emirle ele alınacak.

*(Faz 1-2'nin uzman denetimi ve gerçek-cihaz QA maddeleri artık Faz 3'ün ilgili notlarında birleştirildi — bkz. aşağıda.)*

---

## Faz 3 — Zeka Katmanı

> **Uyarlanabilirlik fazı.** Uygulama artık Melike'yi tanımaya başlar: neyi zor bulduğunu, ne zaman yorulduğunu, hangi ipucunun işe yaradığını. Ses tanıma ve dil modelleri bu fazda devreye girer.

**İlerleme notu (2026-09-13)** — Python temel altyapısı (`papatya-python`, port 8030) kuruldu; 7/17 madde tamamlandı (yukarıdaki tabloda ✅). Geri kalan madde her biri ayrı bir loop'ta, kendi kapsam/karar turuyla ele alınacak (Faz 1'in çok-loop'lu deseni).

| # | İş | Açıklama | Yük |
|---|---|---|---|
| 3.1 | **Beceri/kazanım katmanı ve anlamlı ölçüm altyapısı** ✅ *(Kritik)* | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 3.2 | **Uyarlanabilir zorluk** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 3.2b | **Sakinleştirme modu** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 3.3 | **Konuşmacı tanıma servisi** ✅ *(Öne çıkan)* | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 3.4 | **Kamera → karakter animasyonu** ✅ *(Öne çıkan)* | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 3.5 | **Doğal Türkçe seslendirme** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Orta |
| 3.6 | **LLM destekli içerik üretimi** | Yönetim alanında: çocuğun ilgi alanlarına göre kelime setleri, kişiselleştirilmiş kısa hikâyeler, sosyal öykü metinleri. **Üretilen her içerik ebeveyn onayından geçmeden çocuğa gösterilmez** — insan denetimi mimari bir kural, isteğe bağlı bir ayar değil. LLM'e yalnızca anonim metin gider; çocuğun adı, fotoğrafı veya sesi asla. | Yüksek |
| 3.6b | **Ebeveyn destek sohbet hattı** | Ebeveynin "çocuğum şunu yaptı, ne yapmalıyım?" türü sorular sorabileceği bir LLM sohbet arayüzü. **Kişiye özel davranış tavsiyesi vermez** — yalnızca genel/eğitici bilgi paylaşır ("otizmli çocuklarda bu tür davranışlar genelde şunun belirtisi olabilir, genel literatürde şu yaklaşımlar konuşulur") ve ciddi/tekrarlayan konularda uzmana yönlendirmeyi öne çıkarır. Her yanıtın altında sabit bir uyarı bulunur: *"Bu bir yapay zekâ yanıtıdır, klinik veya pedagojik olarak onaylanmamıştır. Lütfen bir uzmana danışın."* | Orta |
| 3.7 | **İletişim tahtası (AAC)** ✅ | *Tamamlandı — özet: [YAPILANLAR](YOL-HARITASI-YAPILANLAR.md).* | Yüksek |
| 3.8 | **Ebeveyn ve terapist içgörü raporu** | Ham grafik yığını değil, nötr ve okunabilir özet: "Bu hafta `b` ve `d` ayrımında 8 kez zorlandı, sabah seansları akşamdan daha uzun sürdü", "1'den 10'a sayma becerisinde 1 Ocak'ta başarısız, 2 Şubat'ta ilk kez başarılı, sonraki denemelerde pekişti." Beceri bazlı boylamsal (zaman içi) grafikler içerir. **Yorum ve değerlendirme içermez** — veriyi sunar, anlamlandırmayı uzmana bırakır. İsteğe bağlı olarak terapistle paylaşılabilir PDF çıktısı. | Orta |
| 3.9 | **Doğrulamalı kayıt ve hesap kurtarma** | E-posta, telefon veya Gmail ile doğrulamalı kayıt akışı; cihazlar arası senkronizasyon ve dışa aktarma. Faz 1'deki şema sayesinde bu bir ekleme işi olur, göç işi değil. Çocuk tarafındaki giriş deneyimi sade kalır. | Orta |
| 3.10 | **Token havuzu altyapısı** | LLM ve depolama maliyetlerini ölçen sayaç, aile başına aylık ücretsiz kota ve isteğe bağlı bağış akışı. Kâr amacı yok; hedef altyapı maliyetinin karşılanması. Kota dolduğunda özellik kapanır, çocuğun deneyimi bozulmaz. | Orta |
| 3.11 | **Şifreli yerel yedekleme** | Düzenli aralıklarla uçtan uca şifreli yedek dosyası oluşturulur; ebeveyn bunu kendi seçtiği bir ortama (USB, kendi bulut hesabı) taşır. Anahtar yalnızca ebeveyndedir, Papatya'nın kendi sunucusu yedek içeriğini görmez. Cihaz kaybında geri yükleme bu dosya + parolayla yapılır. | Orta |
| 3.11b | **Hesap silme ve veri temizleme akışı** *(Kritik, eski 1.15 — 2026-09-13'te buraya taşındı)* | Ebeveyn hesabı kapatmayı talep ettiğinde: önce zorunlu bir şifreli yedek alınır (3.11 mekanizmasıyla), ardından "bu işlem geri alınamaz" uyarısı gösterilir, sonra 24–48 saatlik bir **vazgeçme penceresi** başlar. Pencere dolunca gerçek silme yapılır ve audit log'a işlenir. Bu, Loop Kuralları'ndaki "geri dönüşsüz işlem" risk eşiğinin uygulamadaki karşılığıdır. 3.11 tamamlanmadan güvenle kodlanamaz — bilinçli bir sıralama bağımlılığı, rastgele bir erteleme değil. | Orta |
| 3.12 | **Kardeş profilleri** | Faz 1'de bırakılan boşluk doldurulur: giriş ekranına "kim giriyor?" profil seçimi eklenir, tek bir ebeveyn PIN'i birden fazla çocuk profilini yönetir. Her çocuğun verisi ve ilerlemesi bağımsız kalır. | Orta |
| 3.13 | **Metodoloji uyumluluk modları** | Uygulama hiçbir zaman "ABA/TEACCH/PECS uyguluyorum" gibi bir klinik metodoloji iddiasında bulunmaz — bu ruhsat/sertifika gerektiren bir klinik iddiadır ve klinik sınır sözleşmesini ihlal eder. Bunun yerine, **arayüz tercihleri** dünyada ve Türkiye'de kabul görmüş yaklaşımların felsefesiyle uyumlu sunulur: TEACCH'in görsel yapılandırma felsefesiyle uyumlu bir "Görsel Takvim Modu" (rutin ve etkinlik alanları arasında görsel-zamansal sınırlar — "bu alan oyun zamanı, bu alan yeme zamanı"), PECS'in simge-tabanlı iletişim felsefesiyle uyumlu AAC tahtası (3.7), davranışçı yaklaşımlarla uyumlu "Yapılandırılmış Adım Modu". Zaten bir terapi/BEP süreci içindeki çocuk için ebeveyn veya terapist, çocuğun kullandığı yönteme yakın modu seçer. | Yüksek |
| 3.14 | **İçerik risk skoru (bilgilendirici)** | Python analiz servisi eklenen müzik/video için tempo (BPM) ve söz içeriği üzerinden bir **duyusal yoğunluk tahmini** üretir ("yüksek tempo, yüksek uyarılma riski olabilir") ve bunu ebeveynin içerik kontrol listesine (2.3) ek bilgi olarak ekler. **Hiçbir içerik otomatik engellenmez** — bu, mevcut "sorumluluk ebeveyne aittir" ilkesini bozmayan bir yardımcı araçtır, karar her zaman ebeveyne kalır. Tahminin belirsiz/yanlış olabileceği açıkça belirtilir. | Orta |
| 3.15 | **Sosyal sınırlar içeriği** | Kişisel alan, "hayır" diyebilme, paylaşma sınırları, dokunma izni gibi sosyal-duygusal sınır kavramlarını öğreten senaryolar — mevcut sosyal öykü ve AAC içeriklerine yakın yeni bir kategori. Otizmde sınır kavramının anlaşılması sıkça çalışılan bir alan; içerik akademik kaynaklara dayanır, klinik sınır sözleşmesine tabidir. | Orta |
| 3.16 | **Harf Avı — güçlendirilecek harfler** | 2026-09-14'te `LETTER_OBJECTS`'teki tüm ölü CDN referansları (eski `static.fokusistatistik.com`) kaldırıldı — artık yalnızca gerçek, yerel görsele (`public/karsilastirma/`) bağlı kelimeler oyunda kullanılıyor (240 kelimeden 71'i). Bu, her harfin sahip olduğu örnek çeşitliliğini ciddi azalttı; **F, Ğ, H, I, J, N, Ö, R, U, V harfleri şu an yalnızca 1'er kelimeyle** çalışıyor (Fil, Ağaç, Havuç, Işık, Jelibon, Nar, Ördek, Raket, Uçak, Valiz), **C, İ, L, M, O, Ş, Ü, Z ise 2'şer kelimeyle**. Oyun bu haliyle çalışıyor (crash yok, her harfin en az 1 kelimesi var) ama tekrar oynanabilirlik zayıf — aynı harf hep aynı görseli gösteriyor. Bu madde, bu 18 zayıf harfe (öncelik: 1-kelimelik 10 harf) yeni fotoğrafik görsel bulunup/üretilip eklenmesini kapsar; kullanıcı kendi kaynağından bulabilir veya `PROMPTLAR.md`'deki şablonla AI ile üretilebilir. | Orta |

**Faz Çıkışı** — Uygulama Melike'nin zorlandığı yerleri tanıyıp kendini ayarlıyor, babasının sesini gerçekten tanıyor, kamera karşısında hareket ettiğinde kendi çizgi film karakteri onunla birlikte hareket ediyor, doğal bir Türkçeyle konuşuyor ve ihtiyaç duyduğunda Melike'nin kendini ifade etmesine yardım ediyor. Her beceri kazanımı tarihli olarak izleniyor — "1'den 10'a sayma" gibi bir beceri hangi tarihte denendi, ne zaman ilk kez başarılı oldu, ne zaman pekişti görülebiliyor. Ebeveyn ve terapist haftalık, yorumsuz ve anlaşılır bir rapor alıyor; merak ettiği anlık sorular için sınırları net çizilmiş bir destek sohbet hattına başvurabiliyor. Müzik/video eklerken bilgilendirici bir içerik risk tahmini görüyor, çocuk sosyal sınır kavramlarını öğreten içerikle çalışıyor.

**Uzman denetimi (Faz 1-3'ün tamamını kapsar — 2026-09-13'te birleştirildi)** — Kamera modunun kaygı etkisi, uyarlanabilir zorluğun frustrasyon eşiği, AAC simge setinin dilsel uygunluğu, raporun klinik sınırı aşmadığı; buna ek olarak Faz 1-2'den taşınan maddeler: arayüz sadeliği, giriş ritüelinin bilişsel yükü, süre limitinin uygulanış biçimi, müzik/video limitlerinin çocuk üzerindeki etkisi, aile tanıma oyununun sosyal-duygusal uygunluğu, oyunlaştırmanın takıntı riski. *(Koddan bağımsız bir adımdır — bir çocuk gelişimci/psikolog/psikiyatrist onayı gerektirir, kullanıcının kendisinin organize etmesi gerekir.)*

**Tam gerçek-cihaz QA (Faz 1-3'ün tamamını kapsar — 2026-09-13'te birleştirildi)** — Telefon, tablet ve PC'de eksiksiz interaktif click-through (ses kaydı, çizim, sözlü onay, kamera akışı dahil tüm dokunma/tıklama yolları). Bu oturumdaki UX denetim turlarında Playwright ile bazı akışlar (tema kilidi, kimlik/avatar, aile bireyi düzenleme, sekme genişliği, navbar/kart düzeni) gerçek tarayıcıda doğrulandı, ama bu otomasyon gerçek fiziksel cihazların yerini tutmaz — bir insan/donanım adımı olarak açık kalıyor.

---

## Faz 4 — Platform

> **Genelleşme fazı.** Bir çocuk için çalıştığı kanıtlanmış sistemi diğer ailelere açmak. Bu faz yalnızca önceki üç faz sahada gerçekten işe yaradıktan sonra anlamlıdır — erken genelleştirme, kimseye tam uymayan bir ürün üretir.

| # | İş | Açıklama | Yük |
|---|---|---|---|
| 4.1 | **Profil şablonları** | Yaş, gelişim düzeyi, ilgi alanı ve duyusal hassasiyete göre hazır başlangıç setleri. Yeni bir aile boş ekranla değil, çocuğuna yakın bir yapılandırmayla başlar ve oradan kişiselleştirir. | Orta |
| 4.2 | **İçerik stüdyosu** | Ebeveynin kendi fotoğraflarından, seslerinden ve videolarından oyun üretebildiği araç. Her ailenin kendi "Melike'nin çizgi filmi"ni yapabilmesi — kişiselleştirmenin en güçlü hâli. **Faz 2.4'ten ertelenen iş:** Faz 2'de "Melike'nin çizgi filmi" yalnızca ebeveynin yüklediği hazır içeriği oynatan bir kabuk olarak yapıldı; buradaki gerçek yapay zekâ ile video/görsel üretimi (dış API hesabı + bütçe kararı gerektirir) bu maddenin kapsamına dahildir. | Yüksek |
| 4.3 | **Çoklu dil** | Faz 1'de bağlanan dil altyapısı ikinci dille sınanır. Seslendirme ve konuşma tanıma dile göre değişir; içerik setleri dilden bağımsız kalır. | Orta |
| 4.4 | **Uzman iş birliği ve klinik kapının açılması** *(Kritik)* | Çocuk gelişimci, psikolog veya psikiyatristin hedef belirleyip ilerlemeyi izleyebildiği paylaşımlı görünüm. **Klinik sınır sözleşmesindeki ikinci aşama burada açılır:** uzman bağlandığında yapılandırılmış program ve değerlendirme modülleri etkinleşir, her içerik kimin onayladığı kaydıyla saklanır. Uygulama **resmi bir eğitim programı veya MEB/RAM onaylı BEP aracı değildir** — çocuğun zaten devam ettiği terapi/eğitim sürecinin yanında, yasal ve etik sınırlar içinde çalışan bir **destek aracı** olarak konumlanır; hedefleri terapist belirler, uygulama yalnızca uygular ve veri toplar. Bir klinik veya özel eğitim kurumu için görünüm **çoklu çocuğa** genişletilebilir — kurumun takip ettiği tüm çocukları beceri bazlı, karşılaştırmalı bir panelden izlemesi. Ev ile terapi arasındaki kopukluk, alanın en bilinen sorunlarından biri. | Yüksek |
| 4.5 | **Geliştirici SDK'sı** | Faz 1'deki oyun soyutlamasının dışa açılmış hâli: üçüncü taraflar kendi otizm dostu etkinliklerini yazıp platforma ekleyebilir. Erişilebilirlik ve içerik güvenliği kuralları paketin bir parçası. | Yüksek |
| 4.6 | **Yerel uygulama paketleri** | App Store ve Google Play dağıtımı, PC için masaüstü paketi. Çevrimdışı-öncelikli yapı Faz 1'de kurulduğu için bu bir paketleme işi olur, yeniden yazım değil. | Orta |
| 4.7 | **Gizlilik ve yasal uyum** | KVKK ve ilgili çocuk verisi koruma düzenlemelerine uyum: aydınlatılmış rıza metni, veri saklama politikası, şeffaf izin akışları, yerel işleme garantisinin hukuki dayanağı. **Veri sahibinin hakları** ayrıca ele alınır — çocuk yetişkinliğe eriştiğinde kendi verisine erişim, taşıma ve silme talebinde bulunabilmelidir (bkz. Yönetişim: Veri devri ilkesi). *Başka ailelerin verisini almadan önce tamamlanması zorunlu.* | Yüksek |
| 4.8 | **Bulunabilirlik: SEO/GEO/AEO** | Ailelerin Papatya'yı bulabilmesi için arama motoru (SEO), üretken yapay zekâ motoru (GEO — ChatGPT/Gemini gibi asistanların Papatya'yı bir öneri olarak sunabilmesi) ve doğrudan cevap motoru (AEO) optimizasyonu. **Kritik mimari ayrım:** bu yalnızca ayrı bir **tanıtım/landing sayfasına** uygulanır — çocuğun ve ebeveynin kullandığı asıl uygulama girişle korunuyor ve **kasıtlı olarak indekslenmemeli** (`noindex`, `robots.txt`). Tanıtım sayfası yapılandırılmış veri (schema.org), site haritası ve LLM'lerin kolay özetleyebileceği net, yapılandırılmış içerik (ne yaptığı, kime hitap ettiği, güvenlik ilkeleri) içerir — çocuğa dair hiçbir gerçek veri veya görsel barındırmaz. | Orta |
| 4.9 | **SQLite → PostgreSQL geçişi** *(Kritik eşik)* | Bugünkü SQLite (tek dosya, sınırlı eşzamanlı yazma) tek aile/az sayıda kullanıcı için yeterli ve doğru bir başlangıç kararıydı. **Eşik: 50 kullanıcı.** Bu sayının üzerinde SQLite ile devam edilmemeli — eşzamanlı yazma kilitlenmeleri ve performans düşüşü riski, aile sayısı arttıkça katlanarak büyür. Geçiş, Faz 4'ün genelleşme hedefiyle (4.1 profil şablonları, çoklu aile) doğal olarak örtüşür; Prisma zaten bir ORM soyutlaması sağladığı için şema değişmeden `datasource provider` değişimi + veri taşıma betiğiyle yapılabilir, yeniden yazım gerekmez. 50 kullanıcıya yaklaşılırken (ör. 30-40'ta) erken planlanmalı, eşik dolduktan sonra acil bir müdahale olarak değil. | Orta |
| 4.10 | **Müzik Köşesi: Suno ile özgün içerik + otizm değerlendirmesi** | Müzik Köşesi'ndeki şarkılar bugün dışarıdan (ör. Freesound) alınan hazır içerik. Suno (ya da benzeri bir üretken müzik aracı) ile Papatya'ya özgü, Melike'nin ilgi alanlarına göre üretilebilen şarkılar için önce bir **prompt kütüphanesi** oluşturulur (bkz. `moduller/seslendirmeler.md` deseni — kaynak, prompt ve karar tek yerde dokümante edilir). Her üretilen içerik yayına alınmadan önce **klinik/otizm açısından değerlendirme sürecinden** geçer: tempo, ani ses değişimleri, tekrarlayan/öngörülebilir yapı, duyusal aşırı uyarım riski gibi kriterler Faz 2.11'deki denetim çeklisti (ses/görsel efekt blokları) ile aynı disiplinde ele alınır — üretken içerik, elle seçilmiş içerikten daha az öngörülebilir olduğu için bu adım atlanmaz. | Orta |
| 4.11 | **Ses profilleri: Tam Sessiz / Sadece Yönerge / Tam Ses** | Bugün ses ya tamamen açık ya da (cihaz sessize alınarak) tamamen kapalı — ara bir seçenek yok. Üç kademeli, ebeveyn panelinden seçilebilen bir ses modu eklenir: **Tam Sessiz** (hiçbir ses çalmaz — sessiz/duyusal aşırı yüklenme anları için), **Sadece Yönerge** (yalnızca TTS/sözel yönerge — harf okuma, "Hadi X harfini bulalım" gibi öğrenme için gerekli konuşma; kutlama sesi, arka plan müziği ve UI efektleri dahil geri kalan HER ŞEY susar), **Tam Ses** (bugünkü varsayılan davranış). Teknik olarak mevcut `useTurkishSpeech`/`AudioProvider` (TTS) ile `useSound`/`AUDIOS` (efekt+müzik) zaten ayrı katmanlar olduğu için bu ayrım kod tarafında doğal bir sınırdan geçer — yeni bir mimari gerektirmez, yalnızca bir `UserSettings` alanı ve her iki katmanın bu alanı okuyup kendini susturması. | Orta |

**Faz Çıkışı** — Papatya, Melike'nin uygulaması olmaktan çıkıp her ailenin kendi çocuğuna göre şekillendirebildiği bir platforma dönüşür — geliştiricilerin yeni etkinlikler ekleyebildiği, uzmanların sürece katılabildiği açık bir yapı. Aileler Papatya'yı arama motorlarından ve yapay zekâ asistanlarından bulabilir; asıl uygulama ise indekslenmeden korunmaya devam eder.

**Uzman denetimi** — Profil şablonlarının gelişimsel doğruluğu, SDK'ya konulacak erişilebilirlik ve içerik güvenliği kurallarının yeterliliği bir uzman kurulunca onaylanır.

---

## Faz 5 — Ufuk

> **Plan değil, yön beyanı.** Bu bölüm bağlayıcı bir takvim içermez; Papatya'nın hangi yöne büyüyeceğini kaydeder ki bugünün mimari kararları yarının önünü kapatmasın. Buradaki hiçbir madde önceki fazlar sahada kanıtlanmadan başlatılmaz.

### Çok modlu etkileşim

Ses ve kameranın ötesinde: jest tanıma, nesne tanıma (gerçek bir elmayı kameraya gösterip "elma" kelimesiyle eşleştirme), fiziksel oyuncaklarla etkileşim. Her modda aynı kural geçerlidir — işleme yerel, ham medya cihazdan çıkmaz, her etkileşimin dokunmatik alternatifi vardır.

### Akademik araştırmaya katkı — ilke, henüz mekanizma değil

İleride, başka aileler katıldığında, kimliksizleştirilmiş ve toplulaştırılmış **istatistiksel özetler** (ham veri, kamera, ses veya fotoğraf değil) otizm eğitimi araştırmasına katkı sağlayacak şekilde paylaşılabilir hâle getirilebilir — örneğin "beceri X'te öğrenme eğrisi nasıl seyrediyor" türü toplu sorulara katkı. Bu, mevcut **katı yerel işleme** ilkesiyle doğrudan gerilir; bu yüzden şimdi hiçbir kod veya altyapı açılmaz. Böyle bir katkı yalnızca: (1) ayrı ve açık bir aydınlatılmış rıza süreciyle, (2) ayrı bir yasal zeminle, (3) yalnızca sayısal/istatistiksel özetler düzeyinde, mümkün olduğunda yürürlüğe girebilir. Bu bölüm bir taahhüt değil, kapıyı gelecekte kapatmamak için bırakılan bir not.

### Üçüncü parti cihaz entegrasyonu

Akıllı saat ve giyilebilir cihazlarla: konum takibi, acil durum butonu, düzensizlik/stres göstergelerinin ebeveyne bildirimi. **Bu alan en yüksek mahremiyet riskini taşır** — konum ve biyometrik veri, kamera kadar hassastır ve aynı katı yerel işleme kuralına tabidir. Ayrıca sürekli izlemenin çocuğun özerkliğini nasıl etkilediği, yaş ilerledikçe yeniden değerlendirilmesi gereken etik bir sorudur.

### Yaşam boyu eşlik: çocukluktan erken yetişkinliğe

Papatya'nın uzun vadeli hedefi, çocukla birlikte büyüyen bir arkadaş olmaktır. Bu, arayüz ve içeriğin yaşla birlikte dönüşmesi demektir:

| Dönem | Odak |
|---|---|
| **Çocukluk** (bugün) | Harf, kelime, tanıma, oyun, rutin |
| **Ergenlik** | Sosyal senaryolar, duygu düzenleme, öz-savunuculuk, mahremiyet kavramı, artan özerklik |
| **Erken yetişkinlik** | Günlük yaşam becerileri, ulaşım, iş hazırlığı, bağımsız iletişim |

Bu geçişin en kritik tasarım sorunu **çocuksuluktan arınma**dır: 17 yaşındaki bir genç, 7 yaşındaki hâlinin arayüzüyle karşılaşmamalıdır. Papatya metaforu ve ses tonu yaşla birlikte olgunlaşmalı, ebeveyn kontrolü kademeli olarak gence devredilmelidir.

### Gerçek koyu tema

Bugün Header'daki güneş/ay ikonu yalnızca günün durumunu gösteren dekoratif bir gösterge (bkz. YOL-HARITASI-YAPILANLAR.md, 2026-09-13 UX notu) — gerçek bir açık/koyu tema anahtarı DEĞİL. Kullanıcı bilinçli olarak bunu Faz 5'e erteledi: mevcut tek sakin/kontrastlı ASD-dostu palet (`src/config/theme.ts`) bilinçli bir tasarım kararı olduğu için, koyu tema eklemek yeni bir renk sistemi + tercih kalıcılığı + her bileşenin gözden geçirilmesini gerektiren ayrı bir iştir; sahada ihtiyaç netleşmeden başlatılmayacak.

### Açık sorular

Bu başlıklar bilinçli olarak cevapsızdır; zamanı geldiğinde uzman görüşüyle karara bağlanacaktır.

- Ergenlikte ebeveyn erişimi nasıl ve ne hızda azalmalı? *(İlke belirlendi — bkz. Yönetişim: Veri devri; mekanizma ve zamanlama hâlâ açık.)*
- Sürekli konum takibi hangi yaşta özerkliğe müdahale hâline gelir?
- Uygulamanın "arkadaş" olarak konumlanması, gerçek sosyal ilişkilerin yerini alma riski taşır mı? Nasıl ölçülür?
- Uzun süreli gelişim verisi ne kadar saklanmalı, hangi noktada otomatik silinmeli?
- Kardeş profilleri çoğaldığında (3+ çocuk) tek ebeveyn PIN'i yeterli mi, yoksa çocuk başına ayrı yetkilendirme mi gerekir?

---

## Riskler ve karşı önlemler

| Risk | Seviye | Karşı önlem |
|---|---|---|
| **Kapsam genişlemesi** | Yüksek | Vizyon geniş, geliştirici tek. Her fazın çıkış kriteri bir kapıdır: karşılanmadan sonraki faza geçilmez. Faz 2'deki bir özelliği Faz 1'e çekmek cazip gelecektir — bu, temeli yarım bırakmanın en yaygın yolu. |
| **Tek kullanıcıya aşırı uyum** | Orta | Melike için yapılan her özelleştirme kodda değil veride yaşar. "Bunu doğrudan koda yazsam daha hızlı olur" her seferinde Faz 4'ü biraz daha imkânsızlaştırır. |
| **Ses tanıma doğruluğu** | Orta | Konuşmacı tanıma gürültülü ev ortamında yanılabilir. Her ses onayının dokunmatik bir alternatifi olur — sistem çocuğu asla tanımadığı bir seste kilitlemez. |
| **Harici servis bağımlılığı** | Orta | YouTube politikaları ve LLM API'leri değişebilir. Müzik katmanı, yerel dosyalara düşebilecek bir arayüzün arkasına alınır; üretilen içerik her zaman önbelleğe kaydedilir. |
| **Çocuk verisinin mahremiyeti** | Yüksek | Ses kayıtları, fotoğraflar, kamera ve gelişim verisi son derece hassas. Katı yerel işleme mimari kuraldır — ham medyayı buluta gönderen bir kod yolu bulunmamalıdır. Faz 4'ün uyum maddesi pazarlık konusu değil. |
| **Ekran bağımlılığı** | Yüksek | Otizmli çocuklarda ekran takıntısı bilinen bir risk. Anti-bağımlılık kuralları oyun kabuğunun mimari parçasıdır, sonradan eklenen bir filtre değil. Sonsuz akış, otomatik oynatma, seri ödülü ve bildirim kodda hiç var olmaz. |
| **Klinik sınırın aşılması** | Yüksek | "Melike'de dikkat eksikliği var" gibi bir cümle uygulamanın ağzından asla çıkmamalı. Uzman bağlı değilken değerlendirme modülleri kapalı kalır; raporlar veri sunar, yorum yapmaz. Her faz kapısında uzman denetimi zorunludur. |
| **Duyusal aşırı yükleme** | Orta | Oyunlaştırma ve animasyon, otizmli bir çocuk için motive edici değil rahatsız edici olabilir. Her efekt kapatılabilir; sakin mod varsayılana yakın bir seçenek olarak hep erişilebilir kalır. |
| **Kamera kaygısı** | Orta | Kamera karşısında olmak kaygı tetikleyebilir. Varsayılan kapalı, çocuğun görüntüsü ekranda hiç gösterilmez — yalnızca kendi karakteri hareket eder. Her kameralı etkinliğin kamerasız alternatifi bulunur. |
| **Tek geliştirici sürdürülebilirliği** | Orta | Proje tek kişiye bağlı. Kararların ve gerekçelerin bu belgede yazılı olması, kodun standart araçlarla yazılması ve verinin dışa aktarılabilir kalması, projenin devredilebilir olmasını sağlar. |
| **Özel uygulamanın yanlışlıkla indekslenmesi** | Yüksek | SEO/GEO/AEO çalışması (4.8) yalnızca tanıtım sayfasına uygulanmalı. Asıl uygulamaya `noindex` eklemeyi unutmak, arama motorlarının çocuk verisi içeren sayfaları taramaya çalışmasına (başarısız da olsa) yol açabilir. Bu ayrım 4.8'in açılışında açıkça kontrol edilir. |
| **Tek cihazda veri kaybı** | Yüksek | Katı yerel işleme, verinin tek bir cihazda/sunucuda durması demektir. Cihaz arızası/kaybı aylarca ilerlemeyi ve aile fotoğraflarını yok edebilir. Şifreli yerel yedekleme (Faz 3.11) bu riski, verinin buluta çıkmasına gerek kalmadan azaltır. |
| **İçerik moderasyonu boşluğu** | Orta | Sistem otomatik filtre yapmadığı için uygunsuz/yıpıcı içerik yalnızca ebeveynin dikkatine bağlıdır. Kontrol listesi (Faz 2.3) riski azaltır ama tamamen ortadan kaldırmaz — sorumluluk açıkça ebeveyne aittir ve bu belgede öyle kalır. |
| **Kriz algılamada yanlış pozitif** | Orta | Sakinleştirme modu (Faz 3.2b) normal oyun duraksamasını krizle karıştırıp gereksiz yere araya girebilir. Eşik değerleri ihtiyatlı seçilmeli ve ebeveyn geri bildirimiyle ayarlanabilir olmalıdır; asla otomatik kilitlemeye dönüşmemelidir. |
| **Oyunlaştırmanın rekabete kayması** | Orta | Beceri rozetleri (2.8b) zamanla puan/sıralama/seri baskısına evrilme riski taşır. Her yeni oyunlaştırma önerisi önce anti-bağımlılık ilkesinden süzülür; rekabet unsuru içeren hiçbir ekleme kabul edilmez. |
| **Metodoloji iddiasının klinik sınırı aşması** | Yüksek | "Uyumluluk modu" (Faz 3.13) zamanla yanlışlıkla "bu yöntemi uyguluyoruz" iddiasına kayabilir. Arayüz metinleri hiçbir zaman bir metodolojinin adını kendi başarısıyla ilişkilendirmez; yalnızca "bu mod şu felsefeyle uyumlu tercih edilebilir" der. |
| **Geri dönüşsüz silmede veri kaybı** | Yüksek | Hesap silme (3.11b) zorunlu yedek almadan tamamlanırsa telafisi imkânsız veri kaybı olur. Vazgeçme penceresi ve zorunlu yedek adımı atlanamaz bir ön koşuldur. |
| **Destek sohbet hattının tavsiyeye kayması** | Yüksek | Ebeveyn destek sohbeti (3.6b) zamanla kişiye özel davranış/tedavi tavsiyesi verir hâle gelebilir — bu klinik sınırı doğrudan ihlal eder. Yanıt şablonu ve sistem talimatı düzenli olarak "genel bilgi mi, kişiye özel tavsiye mi" testinden geçirilir; her yanıtta sabit uyarı zorunludur. |
| **İçerik risk skorunun yanlış güven vermesi** | Orta | BPM/söz analizi (3.14) yanlış veya eksik bir "güvenli" izlenimi verip ebeveynin dikkatini gevşetebilir. Skor her zaman "tahmin, kesin değil" ibaresiyle sunulur; asla otomatik onay/red mekanizmasına dönüşmez. |
| **Arka plan bildiriminin gözetim hissi yaratması** | Orta | Arka plan geçiş bildirimi (1.16) dikkatsiz uygulanırsa çocuğun her hareketinin izlendiği hissini yaratabilir. Kapsam yalnızca "oturum durdu/devam etti" ile sınırlı tutulur; konum, süre detayı veya hangi uygulamaya geçildiği gibi ayrıntılar toplanmaz. |

---

## Değişmeyen tasarım ilkeleri

Fazlar boyunca her kararın sınandığı ölçüt bunlardır. Bir özellik bu ilkelerden birini çiğniyorsa, ne kadar etkileyici olursa olsun yapılmaz.

| İlke | Anlamı |
|---|---|
| **Öngörülebilirlik > sürpriz** | Aynı eylem her zaman aynı sonucu verir. Beklenmedik açılır pencere, rastgele ödül, ani ses yok. |
| **Sakin varsayılan** | Renk, ses ve hareket dikkat yönlendirme aracıdır. Her efekt kapatılabilir; hiçbiri bilgi taşımanın tek yolu değildir. |
| **Başarısızlık yok** | Yanlış cevap ceza değil, yeniden deneme davetidir. Geri sayım, kaybetme ekranı, kırmızı çarpı yok. |
| **Kişiselleştirme veridir** | Bir çocuğa özgü hiçbir şey kaynak koda yazılmaz. Bu kural Faz 4'ü mümkün kılan tek şeydir. |
| **Ebeveyn kontroldedir** | Yapay zekâ üretir, ebeveyn onaylar. Çocuğa gösterilen hiçbir içerik insan denetiminden geçmeden görünmez. Aile bilgileri yalnızca ebeveyn tarafından tanımlanır. |
| **Çevrimdışı çalışır** | İnternet kesintisi rutini bozmaz. Ağ, temel işlevin ön koşulu değil, ek yeteneklerin taşıyıcısıdır. |
| **Tek arayüz, üç cihaz** | Telefon, tablet ve PC için ayrı tasarımlar değil; tek bir ölçeklenebilir düzen ve ortak etkileşim dili. |
| **Ham medya cihazdan çıkmaz** | Kamera, mikrofon ve konum verisi yerelde işlenir ve silinir. Buluta yalnızca sayısal sonuç gider. Bu bir ayar değil, mimari kuraldır. |
| **Uygulama ekrandan uzaklaştırır** | Amaç çocuğu ekranda tutmak değil, öğrendiğini ekran dışına taşımaktır. Sonsuz akış, otomatik oynatma, seri ödülü ve bildirim yoktur. |
| **Tanı koymaz, yorum yapmaz** | Uygulama veri sunar; anlamlandırma insana aittir. Klinik değerlendirme yalnızca bir uzman bağlıyken ve onun imzasıyla açılır. |
| **Her otomatik onayın elle alternatifi var** | Ses veya görüntü tanıma yanılabilir. Sistem çocuğu tanımadığı bir seste veya harekette asla kilitlemez. |
| **Çocukla birlikte büyür** | Arayüz, dil ve içerik yaşla olgunlaşır. 17 yaşındaki bir genç, 7 yaşındaki hâlinin arayüzüyle karşılaşmaz. |
| **Kriz anında durdurur, tanı koymaz** | Sıkıntı belirtisi algılandığında uygulama sakinleşir ve ebeveyni haberdar eder — asla kendi başına yorumlamaz veya müdahale etmez. |
| **Sahiplik devredilebilir** | Ebeveyn-çocuk yetki ilişkisi baştan esnek kurulur; yetişkinlik eşiğinde hesap sahipliği çocuğa geçebilecek şekilde tasarlanır, sonradan sökülmesi gereken bir bağımlılık olarak değil. |
| **Sorumluluk her zaman insanda kalır** | İçerik seçimi, moderasyon ve onay her aşamada ebeveyne veya uzmana aittir. Sistem hatırlatır ve kaydeder, karar vermez. |
| **Rozet var, rekabet yok** | Beceri kazanımı sabit ve öngörülebilir bir rozetle onurlandırılır. Puan, sıralama, lider tablosu, seri ödülü asla olmaz. |
| **Metodoloji adlandırmaz, uyum sunar** | Uygulama hiçbir zaman bir klinik yöntemi (ABA, TEACCH, PECS vb.) uyguladığını iddia etmez. Yalnızca o felsefeyle uyumlu arayüz tercihleri sunar; karar ve uygulama uzmana aittir. |
| **Her önemli işlem iz bırakır** | Ebeveyn işlemleri, güvenlik olayları ve geri dönüşsüz talepler audit log'a kaydedilir — kim, ne zaman, ne yaptı her zaman geriye dönük görülebilir. |
| **Farkındalık verir, gözetim yapmaz** | Ebeveyn bildirimleri (arka plan geçişi, kullanım istatistiği) rutin yönetimi için asgari bilgiyle sınırlıdır — konum, süreklilik veya davranış izleme değildir. |
| **Yapay zeka skoru tahmindir, karar değil** | İçerik risk analizi gibi otomatik değerlendirmeler her zaman "tahmin, kesin değil" olarak sunulur ve hiçbir zaman otomatik engelleme veya onaya dönüşmez — karar insanda kalır. |
