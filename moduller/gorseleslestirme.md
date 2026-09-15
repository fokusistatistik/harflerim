# Gölge Eşleştirme (`/games/visual-match`)

> Faz 2.11 denetim çeklistinin üçüncü modülü — format `moduller/harfavi.md` / `moduller/hafizakartlari.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-15 (1. tur — kapsamlı ilk denetim, düşük riskli UI/erişilebilirlik/hydration düzeltmeleri uygulandı).

## Özet

Sürükle-bırak mekaniğiyle çalışan en basit/en erken aşamadaki oyun: ekranda hedef bir harf gölgesi (ana hatları çizili, dolgusuz) belirir, çocuk aynı harfi taşıyan dolu bir kartı bu gölgenin üzerine sürükler. Ölçtüğü beceri `golge-eslestirme` (SkillAttempt). **Önemli bulgu:** oyunun tanıtım metni ("Görseli doğru gölgesinin üzerine sürükle... şekilleri tanımayı ve karşılaştırmayı öğretir") ile gerçek uygulama örtüşmüyor — bkz. Blok (a) ve (d).

**Ana dosyalar:** `src/components/games/visual-match/GameBoard.tsx`, `Draggable.tsx`, `Droppable.tsx` · `src/app/games/visual-match/page.tsx` · `src/actions/skills.ts` (`recordSkillAttempt`) · `src/hooks/useGameDayBudget.ts`, `useCalmingModeMonitor.ts` (paylaşılan, diğer oyunlarla aynı) · `src/config/gameIntros.ts` (tanıtım metni).

**Harf Avı/Hafıza Kartları'na göre en belirgin fark:** bu oyun hâlâ Faz 3.2 öncesi mimaride — `src/lib/adaptiveDifficulty.ts`'e hiç bağlı değil, sabit/rastgele tek harf seçimi dışında hiçbir zorluk kademesi yok, `Skill`/`Badge` katmanı dışında ebeveyn tarafında hiçbir görünürlüğü/limiti yok.

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Zayıf — oyun hâlâ Faz 1 seviyesinde, Harf Avı/Hafıza Kartları'nın geçtiği hiçbir olgunlaşma adımından geçmemiş.**

- ❌ **Zorluk kademesi yok.** `startNewLevel` her seferinde 21 harften (`LETTERS` sabiti) tamamen rastgele birini seçiyor — Harf Avı'ndaki "ilk round her zaman en kolay", "3 ardışık yanlışta kolaya düş" gibi hiçbir uyarlanabilir güvenlik mekanizması yok. Bir çocuk zorlandığı harfte üst üste yanlış yapabilir, sistem bunu hiç fark etmiyor.
- ❌ **Ardışık aynı harf koruması yok.** Harf Avı'nda "sürekli aynı harf geliyor" kullanıcı bulgusuyla eklenen kesin korumanın (havuzda alternatif varken art arda aynı hedef asla seçilmez) burada hiçbir karşılığı yok — `Math.random()` teorik olarak aynı harfi art arda verebilir.
- ⚠️ **Mekanik, tanıtım metniyle tutarsız (bkz. blok d için ayrıntı).** Gölge (hedef) ve sürüklenen kart HER ZAMAN aynı harf/aynı temsille eşleşiyor (`targetLetter` tek bir state, hem gölgede hem draggable'da kullanılıyor) — ortada gerçek bir "ayırt etme/seçim yapma" görevi yok, tek bir nesneyi tek bir hedefe taşıma var. "Şekilleri tanımayı ve karşılaştırmayı öğretir" iddiası mekanik olarak karşılanmıyor; çocuk hiçbir zaman yanlış bir seçenek arasından doğrusunu ayıklamıyor.
- ✅ Sakinleştirme modu doğru bağlı: `useCalmingModeMonitor('golge-eslestirme')` her `handleDragEnd`'de çağrılıyor — diğer oyunlarla aynı desen.
- ✅ Rozet mekanizması aynı merkezi `recordSkillAttempt`/`Skill` katmanını kullanıyor, spam değil.
- ⚠️ Pekiştirme her tek doğru eşleşmede tetikleniyor (ses + konfeti 200 parça + 👍 emoji) — Harf Avı/Hafıza Kartları'nda da not edilen "aralıklı pekiştirme yok" bulgusunun aynısı, üç oyunda da tutarlı bir eksiklik.
- ⚠️ **3 saniyelik sabit gecikme sonrası otomatik sonraki tura geçiş** (`setTimeout(..., 3000)`) — Harf Avı/Hafıza Kartları'nın kendi round geçiş gecikmeleriyle (1.5-2sn) karşılaştırıldığında gereksiz uzun; çocuğun kutlamayı görmesi için makul ama optimize edilmemiş görünüyor.

**Öneri (kod dışı, mimari karar gerektirir — bu turda kapsam dışı):** Bu oyunu Harf Avı/Hafıza Kartları ile aynı olgunluğa taşımak için (1) `adaptiveDifficulty.ts`'e bağlanması, (2) gerçek bir "birden fazla seçenek arasından doğru gölgeyi seç" mekaniğine (ör. 2-3 gölge gösterip yalnızca birinin doğru olması) geçirilmesi, ya da tanıtım metninin gerçek mekanikle örtüşecek şekilde sadeleştirilmesi ("harfi kendi şekline sürükle") değerlendirilmeli.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Yok denecek kadar zayıf — bu oyuna özel hiçbir ebeveyn kontrolü/görünürlüğü yok.**

- ❌ Günlük round (tur) limiti yok. Harf Avı (`dailyLetterHuntLimit`) ve Hafıza Kartları'nda (`dailyMemoryMatchLimit`) ebeveyn panelinden ayarlanabilen bir sınır varken, bu oyunda hiçbir round/tur limiti kavramı yok — yalnızca genel günlük ekran süresi bütçesi (`useGameDayBudget`) geçerli.
- ✅ Genel günlük süre limiti doğru çalışıyor: `dayBudget?.isDayComplete` hem `handleDragStart` hem `handleDragEnd`'de kontrol ediliyor, `Draggable`'a `disabled` olarak geçiriliyor.
- ❌ Ebeveyn panelinde (`ProgressTab.tsx`) `golge-eslestirme` becerisi teorik olarak genel `getAllSkillProgress()` listesinde görünüyor olabilir (paylaşılan altyapı sayesinde) ama oyuna özel hiçbir ek görünürlük/ayar yok — doğrulanmadı, kontrol edilmesi öneri olarak kalıyor.
- ❌ İçerik kontrol listesi/onay akışı yok (Müzik/Video sekmelerindeki gibi) — ama bu oyun türü (statik harf gösterimi, dış içerik yok) için zaten gerekli değil, N/A olarak değerlendirilebilir.

**Öneri:** Harf Avı/Hafıza Kartları'ndaki `dailyXxxLimit` desenine paralel bir `dailyVisualMatchLimit` eklenmesi tutarlılık açısından mantıklı olur — büyük bir iş değil (şema + action + `ScreenTimeTab.tsx`'e bir alan), ama bu turun kapsamı dışında bırakıldı (kullanıcı onayıyla yalnızca öneri).

---

## Blok (c) — UI/UX

**Durum: Bu turda kapsamlı şekilde düzeltildi — kritik bir hydration hatası ve scroll bug'ı giderildi.**

- ✅ (2026-09-15) **`h-screen` → `h-app` scroll bug'ı düzeltildi.** Harf Avı denetiminde bulunan aynı kök nedenin (`<body>`'nin `pt-16/lg:pt-20` padding'i + oyunun kendi `100vh`'ı üst üste biniyor) bu oyunda `min-h-screen` yerine sabit `h-screen` biçiminde bir varyantı vardı — `overflow-hidden` scrollbar'ı gizlese de içerik gerçek görünür alandan taşıp alttan kırpılıyordu. `globals.css`'e `.min-h-app`'in sabit-yükseklik karşılığı olan yeni bir `.h-app` utility'si eklendi (`height: calc(100vh - 4rem)` / `lg: calc(100vh - 5rem)`), `GameBoard.tsx` buna geçirildi. Gerçek tarayıcıda 375/800/1920px'te doğrulandı: `scrollHeight === innerHeight`, taşma yok.
- ✅ (2026-09-15) **Kritik hydration mismatch hatası düzeltildi.** `DndContext`'e hiç sabit `id` verilmemişti — dnd-kit'in otomatik ürettiği `aria-describedby` ID'si dev sunucusunda paylaşılan bir sayaca dayanıyor: sunucu tarafı (o ana kadar yapılan tüm SSR render'larının toplam sayısı) ile istemci tarafı (tarayıcıda sıfırdan başlayan sayaç) farklı ID üretiyordu (`DndDescribedBy-6` vs `DndDescribedBy-0`), her sayfa yüklemesinde React konsola hydration uyarısı basıyordu. `<DndContext id="visual-match-dnd" ...>` ile sabitlendi — gerçek tarayıcıda taze bir context'te ardışık ilk yüklemede hata sayısı 1'den 0'a düştü.
- ✅ Dokunma hedefleri büyük ve net: draggable kart 160-256px (`w-40`→`lg:w-64`), WCAG 44px'i fazlasıyla aşıyor.
- ✅ Sürükleme geri bildirimi net: `DragOverlay` ile imleci takip eden büyütülmüş/döndürülmüş kopya, `whileHover`/`whileTap` mikro-etkileşimleri (Framer Motion).
- ✅ (2026-09-15) **Erişilebilirlik etiketleri eklendi.** `Draggable`'a harf-özel `aria-label` ("X harfi, sürüklenebilir" — Harf Avı'ndaki `DraggableToken` deseninin aynısı), `Droppable`'a `role="status"` + `aria-live="polite"` + eşleşince `aria-label="Doğru eşleşme!"` (Harf Avı'ndaki `TargetFrame` deseninin aynısı). Not: dnd-kit `attributes` üzerinden zaten temel `role`/`tabIndex` sağlıyor, eksik olan harf-özel etiketti.
- ✅ (2026-09-15) **Dekoratif emoji ekran okuyucudan gizlendi.** Başarı anındaki "👍" emojisine `aria-hidden="true"` eklendi — zaten `Droppable`'ın kendi `aria-live` duyurusu "Doğru eşleşme!" metnini veriyor, emoji ekran okuyucuya anlamsız "başparmak yukarı" olarak okunmuyor artık.
- ✅ (2026-09-15) **Ölü/yorum satırı kod temizlendi.** `startNewLevel` ve `handleDragEnd` içindeki hiç aktifleştirilmemiş `// resetTimer()`, `// logEvent(...)` yorumları kaldırıldı (GENEL-KURALLAR md.8); kullanılmayan `active` değişkeni `handleDragEnd` destructure'ından çıkarıldı.
- ⚠️ **Geniş ekranda (1920px) içerik ekranın küçük bir bölümünü kaplıyor, çok fazla boş alan var** — gölge/kart `lg:` breakpoint'inde en fazla 320px/256px'e büyüyor, PC'de dikey `gap-16` ile ortalanıyor ama yatay genişlik hiç kullanılmıyor. Harf Avı/Hafıza Kartları'nda da benzer "PC'de fazla boşluk" bulguları geçmişte bulunmuştu (bu oyunda henüz görsel olarak ölçülüp karşılaştırılmadı, ekran görüntüsüyle gözlemlendi). Küçük/orta risk, kapsam dışı bırakıldı.
- ⚠️ Klavye ile sürükle-bırak desteği doğrulanmadı — dnd-kit `KeyboardSensor` bu oyunda hiç kurulmamış (`sensors` yalnızca `MouseSensor`+`TouchSensor` içeriyor); Hafıza Kartları'nda kartlara `onKeyDown` ile Enter/Space desteği eklenmişti ama bu, ayrık kart tıklama etkileşimi içindi — bu oyunun sürükle-bırak mekaniği fare/dokunmadan bağımsız çalışamıyor, klavye-only kullanıcılar için tamamen erişilemez. Büyük bir iş (dnd-kit `KeyboardSensor` + `keyboardCoordinates` gerektirir), bu turun kapsamı dışında bırakıldı.

**Kalan:** Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klavye-only sürükle-bırak desteği — insan/cihaz ve ayrı bir mimari iş.

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Varlıklar sağlam ve tamamen yerel; ama tanıtım metni ile gerçek mekanik arasında bir tutarsızlık var.**

### Harici CDN/dış bağımlılık listesi (kullanıcı talebiyle eklenen açık kontrol)

| Varlık | Kaynak | Durum |
|---|---|---|
| `success.wav` (doğru eşleşme sesi) | `public/sounds/success.wav` | ✅ Yerel, proje içinde mevcut (52.964 bayt) |
| `pop.wav` (sürükleme başlangıcı sesi) | `public/sounds/pop.wav` | ✅ Yerel, proje içinde mevcut (8.864 bayt) |
| Konfeti (`react-confetti`) | npm paketi, canvas ile client-side üretiliyor | ✅ Harici ağ isteği yok |
| Harf gösterimi (hedef + draggable) | CSS metin (`{targetLetter}`), `--font-andika` yazı tipi | ✅ Görsel değil, yazı tipi ile render ediliyor — kırık görsel riski yok |
| 👍 emoji | Unicode karakter (sistem emoji fontu) | ✅ Harici kaynak yok |

**Sonuç: bu oyunda hiçbir harici/CDN bağımlılığı yok** — Harf Avı ve Hafıza Kartları'nda bulunan (`static.fokusistatistik.com`, `cdn.freesound.org`) türden ölü/harici bağımlılık riski bu modülde hiç mevcut değil, çünkü oyun hiç görsel/ses varlığı kullanmıyor (harfler yazı tipiyle çiziliyor, sesler zaten yerel).

### Diğer bulgular

- ❌ **Tanıtım metni gerçek mekanikle örtüşmüyor (bkz. blok a).** `gameIntros.ts`'teki "Gölge Eşleştirme" açıklaması "Görseli doğru gölgesinin üzerine sürükle... şekilleri tanımayı ve karşılaştırmayı öğretir" diyor, ama oyun yalnızca harfler kullanıyor (görsel/nesne yok) ve gölge ile kart HER ZAMAN aynı harf — hiçbir "tanıma/karşılaştırma/seçim" görevi yok. Ebeveyn bu açıklamayı okuyunca oyunun gerçekte ne yaptığını yanlış anlayabilir.
- ✅ Harf seti (`LETTERS`, 21 harf) Türkçe alfabenin bir alt kümesi — ama Harf Avı'nın 29 harfini kapsamıyor (Ç/Ğ/İ/Ö/Ş/Ü gibi bazı harfler eksik: `LETTERS` içinde yalnızca Ç var, Ğ/İ/Ö/Ş/Ü hiç yok). Harf Avı'nda "Ğ harfi eklendi, tüm 29 harfi kapsayacak şekilde tamamlandı" notu düşülmüştü — bu oyun o güncellemeyi hiç almamış.
- ✅ Yazı tipi tutarlı: hem hedef hem draggable `var(--font-andika)` kullanıyor — Harf Avı ile aynı font, harf şekli çocuk için tanıdık kalıyor.

**Öneri (kod dışı/tasarım kararı):** Tanıtım metni ya gerçek mekanikle örtüşecek şekilde yeniden yazılmalı ("Harfi kendi şekline sürükle") ya da oyun gerçekten bir görsel/nesne eşleştirme mekaniğine dönüştürülmeli. Harf seti 29 harfe (Harf Avı ile tutarlı) genişletilebilir — küçük bir değişiklik ama bu turun onaylı kapsamı dışında bırakıldı.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: `reduceMotion` köprüsü diğer tüm oyunları kapsadığı için burada da geçerli; `sensoryProfile` proje-geneli eksik burada da var.**

- ✅ `reduceMotion` → Framer Motion köprüsü (`MotionPreference`, kök `layout.tsx`) bu oyunun `motion.div` animasyonlarını (sürükleme scale/rotate, 👍 belirme animasyonu) da kapsıyor — kod yolu ortak, Harf Avı'nda doğrulanan mekanizmanın aynısı, bu oyunda ayrıca gerçek tarayıcıda doğrulanmadı.
- ❌ `sensoryProfile` JSON'u burada da (proje-geneli, diğer tüm oyunlarla aynı) hiç okunmuyor — konfeti/ses gibi potansiyel aşırı-uyarıcı efektler duyusal profile göre ayarlanmıyor. Bu turun kapsamı dışında.
- ⚠️ **Konfeti 200 parça** — Harf Avı/Hafıza Kartları ile karşılaştırıldığında (onlarda da konfeti var ama bu oyunda parça sayısı özellikle yüksek: `numberOfPieces={200}`) görece daha yoğun bir görsel efekt. Duyusal hassasiyeti yüksek bir çocuk için fazla uyarıcı olabilir — `reduceMotion` açıkken bile konfeti kütüphanesinin kendisi bu ayara bağlı değil (yalnızca Framer Motion'a bağlı `motion.div`'ler etkileniyor, `react-confetti` bağımsız bir kütüphane). Bu, Harf Avı/Hafıza Kartları'nda da konfeti kullanılıyorsa aynı derecede geçerli olan, henüz hiçbir oyunda ele alınmamış bir bulgu.
- ✅ Yanlış cevapta ceza/kırmızı-çarpı yok — `handleDragEnd`'in `else` dalı yalnızca `recordSkillAttempt(..., false)` ve `checkCalmingMode(false)` çağırıyor, kart otomatik olarak bırakıldığı yerden geri döner (dnd-kit varsayılan davranışı), görsel bir "yanlış" göstergesi yok — "Başarısızlık yok" ilkesiyle uyumlu.

**Kalan:** Gerçek ekran okuyucu testi (blok c ile aynı) ve `sensoryProfile` bağlanması (proje-geneli) — insan/cihaz ve ayrı mimari iş.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Sağlam, küçük bir tutarlılık notu var.**

- ✅ `recordSkillAttempt` çağrısı diğer oyunlarla birebir aynı, sunucu tarafında `getCurrentUser()` ile doğrulanan, hatayı yutan (`~.catch(() => {})`) güvenli desen — oyun akışını asla bloklamıyor.
- ✅ Client'a sızan hassas veri yok — oyun hiçbir kullanıcıya özel veri (ilgi alanı, isim, vb.) kullanmıyor, yalnızca sabit bir harf listesi.
- ✅ Middleware statik asset matcher'ı bu oyun için gerekli hiçbir yolu (harf gösterimi CSS/font, `sounds/` zaten kapsamda) dışarıda bırakmıyor — kontrol edildi, sorun yok.
- ✅ `useGameDayBudget`/`useCalmingModeMonitor` diğer oyunlarla aynı paylaşılan, önceden doğrulanmış güvenlik/gizlilik davranışını miras alıyor.
- N/A Bu oyunda kullanıcıya özel içerik/dosya yükleme, DB'den okunan kişisel veri yok — Harf Avı/Hafıza Kartları'ndaki auth-tutarsızlığı (redirect vs sessiz fallback) türünden bir bulgu bu modülde oluşamıyor çünkü zaten sunucu tarafında hiçbir veri okunmuyor (yalnızca yazılıyor).

**Kalan:** Yok — bu blok tamamen kapsanmış durumda.

---

## Blok (g) — Ses/görsel efekt yeterliliği ve ihtiyaç tespiti

**Durum: Temel geri bildirimler var ama yanlış cevapta hiçbir ses/görsel karşılık yok — sessiz nokta.**

- ✅ Sürükleme başlangıcı: `pop.wav` sesi + `whileTap`/animasyon büyümesi.
- ✅ Doğru eşleşme: `success.wav` sesi + 200 parçalı konfeti + 👍 emoji animasyonu + `Droppable`'ın kendi border/arkaplan renk değişimi (nötr → yeşil).
- ❌ **Yanlış/başarısız bırakma anında hiçbir ses veya görsel geri bildirim yok.** `handleDragEnd`'in `else` dalı yalnızca sessizce `recordSkillAttempt(false)` çağırıyor — kart eski konumuna döner (dnd-kit varsayılanı) ama bunun dışında hiçbir işitsel/görsel "bu doğru değildi, tekrar dene" sinyali yok. Harf Avı'nda yanlış cevapta ses + shake animasyonu + TTS teşviki + toast var; Hafıza Kartları'nda yanlış eşleşmede `encourageRetry` sesi var — bu oyun üçü arasında yanlış cevap geri bildirimi tamamen eksik olan tek modül. "Başarısızlık yok" ilkesiyle çelişmiyor (ceza yok) ama çocuk denemesinin neden "saymadığını" hiç anlamayabilir, bu bir ihtiyaç tespiti.
- ✅ Sürükleme sırasında `isOver` durumunda görsel geri bildirim var (hedef üstündeyken mavi vurgu + `scale-105`).
- N/A İpucu kavramı bu oyun tipinde yok (Harf Avı'ndaki ipucu sistemi burada karşılık bulmuyor, mekanik zaten tek adımlı).

**Öneri (kod dışı/orta risk, kapsam dışı bırakıldı):** Yanlış bırakma anına Harf Avı'ndaki "tekrar dene" sesi + hafif shake animasyonu deseninin taşınması — üç oyun arasında tutarlılık sağlar, düşük-orta karmaşıklıkta bir sonraki adım olabilir.

---

## Genel geliştirme önerileri — bu turda uygulanan düzeltmeler (5/5 düşük riskli)

1. ✅ Tokensiz sabit renkler (`emerald`, `softIndigo`, `gray-300`, `gray-100`) → Papatya tema token'larına (`papatya-leaf`, `papatya-sky`, `papatya-rule`, `papatya-cream`) taşındı (blok c/GENEL-KURALLAR md.5).
2. ✅ `h-screen` → yeni `.h-app` utility'si (blok c) — scroll taşması giderildi.
3. ✅ Kritik hydration mismatch hatası (`DndContext id` eksikliği) düzeltildi (blok c) — her sayfa yüklemesinde React konsol hatası veriyordu.
4. ✅ Erişilebilirlik etiketleri eklendi: `Draggable` `aria-label`, `Droppable` `role="status"`/`aria-live` (blok c).
5. ✅ Dekoratif emoji `aria-hidden`, ölü yorum satırları ve kullanılmayan değişken temizlendi (blok c/GENEL-KURALLAR md.8).

**Doğrulama:** `tsc --noEmit` ve `eslint` (değişen 3 dosya) temiz. Gerçek tarayıcıda (Playwright, `dev:agent`/3042) 375px/800px/1920px'te: sayfa yükleme + giriş akışı + sürükle-bırak (fare simülasyonu) + doğru eşleşme göstergesi üçünde de doğrulandı, konsol hatası sıfır, `scrollHeight === innerHeight` (taşma yok).

**Bu turda kod DEĞİŞTİRİLMEYEN, yalnızca öneri olarak kalan büyük/mimari bulgular (kullanıcı onayıyla kapsam dışı):**
- Adaptif zorluk sistemine geçiş (blok a) — `adaptiveDifficulty.ts`'e hiç bağlı değil, Harf Avı/Hafıza Kartları'nın aksine sabit rastgele seçim.
- Ardışık aynı harf koruması yok (blok a) — Harf Avı'ndaki kesin korumanın karşılığı yok.
- Günlük round/tur limiti yok (blok b) — `dailyLetterHuntLimit`/`dailyMemoryMatchLimit` desenine paralel bir alan eksik.
- Tanıtım metni ile gerçek mekanik arasındaki tutarsızlık (blok a/d) — "şekil tanıma/karşılaştırma" iddiası, gerçekte tek-seçenekli harf taşıma.
- Harf setinin 21'den 29'a (Ğ/İ/Ö/Ş/Ü dahil) genişletilmemiş olması (blok d).
- Klavye-only sürükle-bırak desteğinin tamamen eksik olması (blok c) — dnd-kit `KeyboardSensor` hiç kurulmamış.
- Yanlış bırakma anında hiçbir ses/görsel geri bildirim olmaması (blok g).
- Konfeti yoğunluğu (200 parça) ve `react-confetti`'nin `reduceMotion`'a bağlı olmaması (blok e).
- PC'de (1920px) içeriğin ekranın küçük bir kısmını kaplaması, geniş yatay alanın kullanılmaması (blok c).
- `sensoryProfile` JSON'unun oyun davranışına bağlanması (blok e) — proje-geneli, diğer iki modülde de aynı not var.

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, Harf Avı/Hafıza Kartları ile aynı insan/cihaz adımı.
- Bu modülün Faz 3.2 (adaptif zorluk) kapsamına hiç alınmamış olması — roadmap'e ayrı bir madde olarak işlenmesi düşünülebilir (şu an yalnızca bu raporda not).
- Tanıtım metni/mekanik tutarsızlığının çözülmesi — ya metin sadeleştirilir ya oyun gerçek bir çoktan-seçmeli mekaniğe dönüştürülür; kullanıcı kararı gerektiren bir ürün sorusu.
