# Hafıza Kartları (`/games/memory-match`)

> Faz 2.11 denetim çeklistinin ikinci modülü — format `moduller/harfavi.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-14 (2. tur — kullanıcı bulgularıyla 6 düzeltme uygulandı: klavye erişilebilirliği, harici ses bağımlılığı, mobil Header çakışması, sayfa yenilemede round kalıcılığı, günlük tur limiti, kart/ikon görselleri. Ayrıca proje-geneli Sakinleştirme Modu'nda iki bulgu daha bu turda çözüldü, bkz. alt not).

## Özet

Kart çevirme/eşleştirme oyunu: çocuk aynı anda iki kart açar, `matchKey` eşleşirse çift kapanır. İki bağımsız mod var: **Harflerle** (harf-nesne eşleştirmesi, `ContentSet`/`ContentItem` havuzu) ve **Nesnelerle** (2026-09-13'te eklendi — harf-bağımsız, gerçek fotoğraf `ComparisonItem` havuzu, çocuğun kayıtlı ilgi alanlarına göre ağırlıklandırılmış seçim). Ölçtüğü beceri `gorsel-hafiza` (SkillAttempt), amacı görsel kısa süreli hafıza. Faz 3.2'de (Harf Avı ile aynı loop'ta) sabit 24-seviyeli sistemden adaptif zorluğa (sonsuz round, çift sayısı 3-8 arası) geçirildi.

**Ana dosyalar:** `src/components/game/MemoryMatchGame.tsx` (tek dosyalı, ayrı alt bileşeni yok) · `src/actions/gameProgress.ts` (`submitMemoryRoundResult`, `getAdaptiveMemoryRoundConfig`) · `src/actions/comparisonPairs.ts` (`getComparisonPairsPool` — ilgi alanı ağırlıklandırması) · `src/lib/adaptiveDifficulty.ts` (`getAdaptiveMemoryConfig`, `BASE_MEMORY_ADAPTIVE_CONFIG`) · `src/hooks/useGameContent.ts`, `useGameDayBudget.ts`, `useCalmingModeMonitor.ts` (paylaşılan, Harf Avı ile aynı).

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Sağlam, Harf Avı ile aynı ilkeleri paylaşıyor.**

- ✅ Zorluk kademeli ve güvenli: ilk round her zaman en kolay (`BASE_MEMORY_ADAPTIVE_CONFIG` → 3 çift/6 kart), 3 ardışık yanlışta anında en kolaya düşer (`adaptiveDifficulty.ts:84-86`) — Harf Avı'ndaki `getAdaptiveConfig` ile birebir aynı desen.
- ✅ Sakinleştirme modu doğru bağlı ve gerçek tarayıcıda tetiklendiği doğrulandı: `useCalmingModeMonitor('gorsel-hafiza')` hook'u çağrılıyor (`MemoryMatchGame.tsx:64`), her eşleştirme denemesinde `checkCalmingMode(isMatch)` ile denetleniyor (`MemoryMatchGame.tsx:188`), test sırasında (birikmiş yanlış denemelerle) "Nefes al..." ekranı gerçekten devreye girdi — ses kesildi, ebeveyne bildirim gönderildi, çocuğa yorum yapılmadı.
- ✅ Rozet mekanizması spam değil — `recordSkillAttempt` diğer oyunlarla aynı `Skill`/`SkillAttempt` katmanını kullanıyor, ilk-kez-doğru kuralı merkezi (`skills.ts`).
- ⚠️ Pekiştirme her tek doğru eşleşmede tetikleniyor (ses + `celebrateSuccess` + toast "Harika!") — Harf Avı'ndaki (a) bloğunda not edilen "aralıklı pekiştirme yok" bulgusunun aynısı, henüz ele alınmadı, iki oyunda da tutarlı bir eksiklik.
- ⚠️ **Nesne modu ile Harf modu arasında zorluk ölçütü paylaşılıyor ama içerik farklı davranıyor olabilir.** `getAdaptiveMemoryConfig` her iki mod için de aynı `gorsel-hafiza` beceri geçmişini okuyor — çocuk bir modda kolay, diğerinde zor bulsa bile ikisi aynı zorluk eğrisini paylaşıyor (kasıtlı bir tasarım kararı olabilir, ama modlar arası performans farkı hiç ayrıştırılmıyor). Henüz ele alınmadı.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Güçlü — 2. turda oyuna özel günlük tur limiti eklendi.**

- ✅ Günlük süre limiti (global `levelStore`/`useGameDayBudget`) doğru çalışıyor — her 10 saniyede raporlama, sekme arka plandayken sayılmıyor.
- ✅ (2026-09-14, 2. tur) **Günlük round (tur) limiti eklendi.** Harf Avı'ndaki `dailyLetterHuntLimit` deseninin aynısı: `UserSettings.dailyMemoryMatchLimit` (varsayılan 20, ebeveyn panelinde 10-50 arası ayarlanabilir — Ekran Süresi sekmesi, `ScreenTimeTab.tsx`). `Session.roundsPlayed` yeni bir sayaç alanı (Harf Avı kendi `Event` tablosundan sayıyor, Hafıza Kartları'nın böyle bir tablosu olmadığı için doğrudan sayaç). Yeni `getMemoryMatchDailyState` action'ı mod seçim ekranı açılırken limit durumunu bildirir; limit dolunca her iki mod butonu da devre dışı kalır, açıklayıcı bir mesaj gösterilir.
- ❌ Ebeveyn panelinde bu oyunun beceri ilerlemesi (`gorsel-hafiza`) görünüyor mu kontrol edildi: `ProgressTab.tsx`'teki `getAllSkillProgress()` tüm becerileri genel listelediği için `gorsel-hafiza` de teorik olarak orada görünür (Harf Avı denetiminde eklenen genel mekanizma) — oyuna özel bir ek görünürlük yok ama paylaşılan altyapı sayesinde temel bir ilerleme sinyali zaten var.
- ❌ "Nesnelerle" modunun hangi `ComparisonItem`'ları kullandığı (ilgi alanı eşleşmesi) ebeveyne hiçbir yerde gösterilmiyor — ebeveyn çocuğun ilgi alanı ağırlıklandırmasının fiilen çalıştığını göremiyor.

---

## Blok (c) — UI/UX

**Durum: 2. turda 4 bulgu düzeltildi; iki küçük sadelik notu hâlâ açık.**

- ✅ Round akışı doğru: `checkWin` tüm kartlar eşleşince 1.5 sn sonra otomatik yeni round başlatıyor (sonsuz akış, Harf Avı ile aynı ilke).
- ✅ Kart çevirme animasyonu (`motion.div` `rotateY`) `MotionPreference`'a bağlı — `reduceMotion` açıkken bu da otomatik söner (Harf Avı denetiminde kurulan köprü tüm oyunları kapsıyor, gerçek tarayıcıda ayrıca doğrulanmadı ama kod yolu aynı).
- ✅ Dokunma hedefleri: kartlar `min-w-tap min-h-tap` + `aspect-square`, WCAG 44px'i karşılıyor.
- ✅ Grid düzeni çift sayısına göre uyarlanıyor (`cards.length` eşiklerine göre 2/3/4 sütun) — 3 çiftte 2 sütun, 8 çiftte 4 sütun, taşma yok.
- ✅ (2026-09-14, 2. tur) **Mobil (390px) Header çakışması düzeltildi.** `Header.tsx`'in üç bölümüne (sol saat/ev, orta tarih, sağ süre+papatya+kilit) `min-w-0`/`shrink-0`/`truncate` eklendi — dar ekranda tarih artık üst üste binmiyor, zarifçe kırpılıyor. Proje-geneli bir düzeltme olduğu için tüm sayfaları etkiliyor, yalnızca bu modülde bulundu.
- ✅ (2026-09-14, 2. tur) **Mod seçim ekranındaki gereksiz üst boşluk düzeltildi.** `justify-center` (dikey ortalama) yerine sabit üst padding — içerik artık Header'ın hemen altında başlıyor, kısa içerikte oluşan büyük boş alan kalktı.
- ✅ (2026-09-14, 2. tur) **Sayfa yenilenince/tekrar girilince oyun kaldığı moddan devam ediyor.** Harf Avı'ndaki `sessionStorage` deseninin aynısı (`papatya-playing-memory-match` anahtarı) — yalnızca "hangi moddaydın" niyeti saklanır (tam round durumu değil, kasıtlı olarak basit), sekme kapanınca sıfırlanır.
- ⚠️ Mod seçim ekranında hem üst navbar (Header'daki ev ikonu) hem de sabit alt "Ana Sayfaya Dön" butonu var — aynı eylemin iki ayrı yerde tekrarı, hâlâ düzeltilmedi (kullanıcı 2. turda bu maddeyi kapsam dışı bıraktı, tutarlılık notu olarak kalıyor).
- ⚠️ Kartlar ile üstteki "Tur N" rozeti arasında (özellikle az sayıda çiftle, 3-4 çift) oldukça büyük boş dikey alan var — `flex-1 items-center justify-center` dikey ortalıyor ama düşük kart sayısında ekranın çoğu boş kalıyor. Henüz ele alınmadı (mod seçim ekranındaki benzer boşluktan ayrı, oyun ekranına özel).

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Sağlam — 2. turda harici ses bağımlılığı da kapatıldı, görsel/ikon güncellemeleri yapıldı.**

- ✅ Harf modu: `content.letterImages` (DB kaynaklı `ContentSet.imageUrl`) — Harf Avı denetiminde CDN sorunu zaten çözülmüştü, bu havuz ondan bağımsız ve sağlam (gerçek tarayıcıda "J" harfi net göründü).
- ✅ Nesne modu: 100 aktif `ComparisonItem` var (`public/karsilastirma/`), `MAX_PAIRS=8` (en fazla 16 kart) ihtiyacını fazlasıyla karşılıyor — havuz tükenme riski yok.
- ✅ `ImageWithFallback` her iki modda da kullanılıyor — kırık görsel senaryosunda kart etiketine (harf/nesne adı) zarif şekilde düşüyor.
- ✅ (2026-09-14, 2. tur) **Kart çevirme sesi yerele taşındı.** `playFlip` artık `cdn.freesound.org`'a değil, kullanıcının kendi ses kaydından eklenen `public/sounds/card.mp3`'e (`AUDIOS.flip`) bağlı — projenin "çevrimdışı çalışır" ilkesiyle artık tutarlı, Harf Avı'ndaki düzeltmeyle aynı düzeyde.
- ✅ (2026-09-14, 2. tur) **Mod seçim kartlarındaki ikonlar ve kart arka yüzü güncellendi.** Lucide ikonları (`LayoutGrid`/`Sparkles`) yerine kullanıcının kendi PNG'leri (`abc.png`, `meyveler.png`), boyutu %33 büyütüldü; kartların kapalı (arka) yüzündeki jenerik `User` ikonu papatya logosuna (`papatya_favicon.png`) çevrildi.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: 2. turda klavye erişilebilirliği kapatıldı; `sensoryProfile` hâlâ proje-geneli bir eksik.**

- ✅ `reduceMotion` → Framer Motion köprüsü (`MotionPreference`, kök layout) bu oyunun kart çevirme animasyonunu da kapsıyor (kod yolu ortak, Harf Avı'nda doğrulanan mekanizmanın aynısı).
- ✅ (2026-09-14, 2. tur) **Klavye erişilebilirliği eklendi.** Kartlara `role="button"`, `tabIndex` (eşleşmiş kartlarda `-1`, diğerlerinde `0`), harf/nesne-özel `aria-label` ("Kapalı kart, açmak için seç" / harf-nesne adı / "eşleşti"), `onKeyDown` ile Enter/Space desteği ve odak görünürlüğü (`focus-visible:outline`) — Harf Avı'nda daha önce uygulanan desenin doğrudan taşınmış hâli.
- ✅ (2026-09-14, 2. tur) **Eşleşme sonucu artık `aria-live="polite"` ile duyuruluyor** ("Doğru eşleşme!" / "Eşleşmedi, tekrar deneyelim") — `TargetFrame.tsx`'teki (Harf Avı) `role="status"` deseninin aynısı.
- ❌ `sensoryProfile` JSON'u burada da (Harf Avı ile aynı, proje-geneli) hiç okunmuyor — bu turun kapsamı dışında bırakıldı.

**Kalan:** Gerçek bir ekran okuyucuyla (VoiceOver/NVDA) uçtan uca test edilmedi — Faz 3'ün "Tam gerçek-cihaz QA" notunun kapsamında, insan/cihaz adımı.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Sağlam.**

- ✅ `submitMemoryRoundResult` doğru sahiplik kontrolü yapıyor: `getCurrentUser()` + `session.userId !== user.id` ise `null` dönüyor (Harf Avı'ndaki `submitLevelResult` düzeltmesiyle aynı düzeyde, buradaki zaten baştan doğru yazılmış).
- ✅ `getAdaptiveMemoryRoundConfig` oturumsuz durumda güvenle `BASE_MEMORY_ADAPTIVE_CONFIG`'e düşüyor (Harf Avı'ndaki `getAdaptiveRoundConfig` ile aynı, bilinçli tasarım tutarlılığı).
- ✅ `getComparisonPairsPool` yalnızca `isActive: true` nesneleri çekiyor, çocuğun ilgi alanı verisi (`getChildProfile`) sunucu tarafında kalıyor, client'a yalnızca `{id, name, imageUrl}` gönderiliyor — hassas profil verisi sızmıyor.
- ✅ Middleware `karsilastirma/` ve `harfler/` klasörlerini doğru şekilde matcher'dan hariç tutmuş (Harf Avı denetiminde bulunan middleware düzeltmesi bu oyunun görsellerini de kapsıyor) — gerçek tarayıcıda her iki moddaki görseller de sorunsuz yüklendi.
- ✅ Client'a sızan hassas veri yok.

---

## Blok (g) — Ses/görsel efekt yeterliliği ve ihtiyaç tespiti

**Durum: Temel geri bildirimler var, ipucu/dikkat sesi kavramı bu oyunda hiç yok (oyun tipi gereği).**

- ✅ Kart çevirme: ses (`playFlip`, artık yerel — bkz. blok d) + 3D flip animasyonu.
- ✅ Doğru eşleşme: ses (`playMatch`) + `celebrateSuccess` + toast "Harika!" — 600ms gecikmeyle, kartların açık kaldığı süre çocuğun görmesine yetecek kadar.
- ✅ Yanlış eşleşme: `encourageRetry` sesi + 1000ms sonra kartlar otomatik kapanıyor — ceza/kırmızı-çarpı yok, "Değişmeyen tasarım ilkeleri"ndeki "Başarısızlık yok" ilkesiyle uyumlu.
- ✅ Round tamamlama: `triggerReward({ message: 'Harika eşleştirme!' })` — ayrı bir kutlama katmanı.
- N/A İpucu gösterimi bu oyun tipinde yok (Harf Avı'ndaki ipucu kavramının burada karşılığı yok, oyun mekaniği farklı).

**Öneri:** Yok — blok (d)'deki harici ses riski de kapatıldığı için bu blok tamamen kapsanmış durumda.

---

## İkinci tur (2026-09-14) — kullanıcı bulgularıyla ortaya çıkan düzeltmeler

1. ✅ Klavye erişilebilirliği + `aria-live` (blok e).
2. ✅ Harici ses bağımlılığı — `playFlip` artık yerel `card.mp3` (blok d/g).
3. ✅ Mobil Header çakışması — proje-geneli `Header.tsx` düzeltmesi (blok c).
4. ✅ Sayfa yenilemede round kalıcılığı — `sessionStorage` (blok c).
5. ✅ Günlük tur limiti — `dailyMemoryMatchLimit`, 10-50 arası, varsayılan 20 (blok b).
6. ✅ Mod seçim ekranı üst boşluğu — `justify-center` kaldırıldı, sabit padding (blok c).
7. ✅ Mod seçim kartları ve kart arka yüzü görselleri — kullanıcının kendi PNG'leriyle güncellendi (blok d).

**Bilinçli olarak kapsam dışı bırakılan:** Mod seçim ekranındaki çift navigasyon (Header ev ikonu + sabit alt "Ana Sayfaya Dön" butonu) — kullanıcı 2. turda bu maddeyi ertelemeyi tercih etti.

**Proje-geneli not — Sakinleştirme Modu (Faz 3.2b, bu modülün kapsamı dışında ama burada test edilirken bulundu):** Kullanıcı bu turda ayrıca Sakinleştirme Modu'nu "agresif" ve "sık sık tekrar geliyor" olarak bildirdi. İki kök neden bulunup düzeltildi: (1) tetikleme eşiği 5'ten 10'a çıkarıldı, (2) "Devam Edelim" sonrası geçmiş yanlış zinciri hiç sıfırlanmadığı için bir sonraki TEK yanlışta anında yeniden tetikleniyordu — `calmingModeStore`'a `acknowledged` bayrağı eklenip bir sonraki DOĞRU cevaba kadar bastırıldı; ayrıca ikinci bir çıkış butonu ("Oynamaya devam et") eklendi. Ayrıntı için `CalmingMode.tsx`, `calmingMode.ts`, `useCalmingModeMonitor.ts`.

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, Harf Avı ile aynı insan/cihaz adımı.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması — proje-geneli, henüz roadmap'e madde olarak işlenmedi (Harf Avı denetiminde de aynı not var).
- Pekiştirme yoğunluğunun aralıklı hale getirilmesi (blok a) — her tek doğru eşleşmede değil, Harf Avı'nda da aynı açık öneri.
- Nesne/Harf modu arasında zorluk ölçütünün ayrıştırılması (blok a) — şu an ikisi aynı `gorsel-hafiza` geçmişini paylaşıyor, kasıtlı bir tasarım kararı olabilir ama doğrulanmadı.
- Ebeveyn panelinde "Nesnelerle" modunun ilgi alanı eşleşmesinin görünür kılınması (blok b).
- Mod seçim ekranındaki çift navigasyon (Header ev ikonu + sabit alt "Ana Sayfaya Dön" butonu) — kullanıcı 2. turda bilinçli olarak ertelendi.
- Oyun ekranında kartlar ile "Tur N" rozeti arasındaki fazla dikey boşluk (az sayıda çiftle) — henüz ele alınmadı.
- Sakinleştirme Modu eşiğinin ebeveyn tarafından ayarlanabilir olması (proje-geneli) — şu an hâlâ sabit kodlanmış (10), YOL-HARITASI risk tablosundaki "eşik değerleri ihtiyatlı seçilmeli ve ebeveyn geri bildirimiyle ayarlanabilir olmalı" ilkesi henüz tam karşılanmıyor.
