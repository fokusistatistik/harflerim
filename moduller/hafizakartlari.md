# Hafıza Kartları (`/games/memory-match`)

> Faz 2.11 denetim çeklistinin ikinci modülü — format `moduller/harfavi.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-14 (1. tur — ilk denetim).

## Özet

Kart çevirme/eşleştirme oyunu: çocuk aynı anda iki kart açar, `matchKey` eşleşirse çift kapanır. İki bağımsız mod var: **Harflerle** (harf-nesne eşleştirmesi, `ContentSet`/`ContentItem` havuzu) ve **Nesnelerle** (2026-09-13'te eklendi — harf-bağımsız, gerçek fotoğraf `ComparisonItem` havuzu, çocuğun kayıtlı ilgi alanlarına göre ağırlıklandırılmış seçim). Ölçtüğü beceri `gorsel-hafiza` (SkillAttempt), amacı görsel kısa süreli hafıza. Faz 3.2'de (Harf Avı ile aynı loop'ta) sabit 24-seviyeli sistemden adaptif zorluğa (sonsuz round, çift sayısı 3-8 arası) geçirildi.

**Ana dosyalar:** `src/components/game/MemoryMatchGame.tsx` (tek dosyalı, ayrı alt bileşeni yok) · `src/actions/gameProgress.ts` (`submitMemoryRoundResult`, `getAdaptiveMemoryRoundConfig`) · `src/actions/comparisonPairs.ts` (`getComparisonPairsPool` — ilgi alanı ağırlıklandırması) · `src/lib/adaptiveDifficulty.ts` (`getAdaptiveMemoryConfig`, `BASE_MEMORY_ADAPTIVE_CONFIG`) · `src/hooks/useGameContent.ts`, `useGameDayBudget.ts`, `useCalmingModeMonitor.ts` (paylaşılan, Harf Avı ile aynı).

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Sağlam, Harf Avı ile aynı ilkeleri paylaşıyor.**

- ✅ Zorluk kademeli ve güvenli: ilk round her zaman en kolay (`BASE_MEMORY_ADAPTIVE_CONFIG` → 3 çift/6 kart), 3 ardışık yanlışta anında en kolaya düşer (`adaptiveDifficulty.ts:84-86`) — Harf Avı'ndaki `getAdaptiveConfig` ile birebir aynı desen.
- ✅ Sakinleştirme modu doğru bağlı ve gerçek tarayıcıda tetiklendiği doğrulandı: `useCalmingModeMonitor('gorsel-hafiza')` her eşleştirme denemesinde çağrılıyor (`MemoryMatchGame.tsx:147`), test sırasında (birikmiş yanlış denemelerle) "Nefes al..." ekranı gerçekten devreye girdi — ses kesildi, ebeveyne bildirim gönderildi, çocuğa yorum yapılmadı.
- ✅ Rozet mekanizması spam değil — `recordSkillAttempt` diğer oyunlarla aynı `Skill`/`SkillAttempt` katmanını kullanıyor, ilk-kez-doğru kuralı merkezi (`skills.ts`).
- ⚠️ Pekiştirme her tek doğru eşleşmede tetikleniyor (ses + `celebrateSuccess` + toast "Harika!") — Harf Avı'ndaki (a) bloğunda not edilen "aralıklı pekiştirme yok" bulgusunun aynısı, henüz ele alınmadı, iki oyunda da tutarlı bir eksiklik.
- ⚠️ **Nesne modu ile Harf modu arasında zorluk ölçütü paylaşılıyor ama içerik farklı davranıyor olabilir.** `getAdaptiveMemoryConfig` her iki mod için de aynı `gorsel-hafiza` beceri geçmişini okuyor — çocuk bir modda kolay, diğerinde zor bulsa bile ikisi aynı zorluk eğrisini paylaşıyor (kasıtlı bir tasarım kararı olabilir, ama modlar arası performans farkı hiç ayrıştırılmıyor). Henüz ele alınmadı.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Kısmi — global süre bütçesi çalışıyor, oyuna özel ebeveyn kontrolü hiç yok.**

- ✅ Günlük süre limiti (global `levelStore`/`useGameDayBudget`) doğru çalışıyor — her 10 saniyede raporlama, sekme arka plandayken sayılmıyor.
- ❌ Harf Avı'ndaki `dailyLetterHuntLimit` (oyuna özel günlük round limiti) benzeri bir kontrol Hafıza Kartları'nda yok — ebeveyn panelinde bu oyuna özel hiçbir ayar bulunmuyor (round limiti, mod kısıtlama, vb.).
- ❌ Ebeveyn panelinde bu oyunun beceri ilerlemesi (`gorsel-hafiza`) görünüyor mu kontrol edildi: `ProgressTab.tsx`'teki `getAllSkillProgress()` tüm becerileri genel listelediği için `gorsel-hafiza` de teorik olarak orada görünür (Harf Avı denetiminde eklenen genel mekanizma) — oyuna özel bir ek görünürlük yok ama paylaşılan altyapı sayesinde temel bir ilerleme sinyali zaten var.
- ❌ "Nesnelerle" modunun hangi `ComparisonItem`'ları kullandığı (ilgi alanı eşleşmesi) ebeveyne hiçbir yerde gösterilmiyor — ebeveyn çocuğun ilgi alanı ağırlıklandırmasının fiilen çalıştığını göremiyor.

**Öneri:** Harf Avı'ndaki oyuna-özel günlük limit deseni burada da değerlendirilebilir; öncelik değil, tutarlılık notu.

---

## Blok (c) — UI/UX

**Durum: Genel akış sağlam, mobilde Header çakışması modül-bağımsız ama burada da gözlemlendi; dikey boşluk fazla.**

- ✅ Round akışı doğru: `checkWin` tüm kartlar eşleşince 1.5 sn sonra otomatik yeni round başlatıyor (sonsuz akış, Harf Avı ile aynı ilke).
- ✅ Kart çevirme animasyonu (`motion.div` `rotateY`) `MotionPreference`'a bağlı — `reduceMotion` açıkken bu da otomatik söner (Harf Avı denetiminde kurulan köprü tüm oyunları kapsıyor, gerçek tarayıcıda ayrıca doğrulanmadı ama kod yolu aynı).
- ✅ Dokunma hedefleri: kartlar `min-w-tap min-h-tap` + `aspect-square`, WCAG 44px'i karşılıyor.
- ✅ Grid düzeni çift sayısına göre uyarlanıyor (`cards.length` eşiklerine göre 2/3/4 sütun) — 3 çiftte 2 sütun, 8 çiftte 4 sütun, taşma yok.
- ⚠️ **(Gerçek tarayıcıda gözlemlendi) Mobilde (390px) Header çakışması.** Tarih ("14 Eylül Pazartesi") ile sol saat/sağ ikon grubu üst üste biniyor, "Pazartesi" ikinci satıra kayıyor. Bu `Header.tsx`'in kendi genel `justify-between` düzeninden kaynaklanıyor — Hafıza Kartları'na özel değil, muhtemelen her sayfada aynı, ama bu modülün gerçek-cihaz turunda ilk kez somut ekran görüntüsüyle yakalandı. Henüz düzeltilmedi.
- ⚠️ Mod seçim ekranında hem üst navbar (Header'daki ev ikonu) hem de sabit alt "Ana Sayfaya Dön" butonu var — aynı eylemin iki ayrı yerde tekrarı, küçük bir tutarlılık/sadelik notu (Header'a taşınan navigasyon sonrası bu alt buton gereksiz hale gelmiş olabilir).
- ⚠️ Kartlar ile üstteki "Tur N" rozeti arasında (özellikle az sayıda çiftle, 3-4 çift) oldukça büyük boş dikey alan var — `flex-1 items-center justify-center` dikey ortalıyor ama düşük kart sayısında ekranın çoğu boş kalıyor.
- ❌ Sayfa yenilenince/tekrar girilince oyun kaldığı yerden devam etmiyor — her zaman mod seçim ekranına döner (Harf Avı'nda bu `sessionStorage` ile çözülmüştü, burada yok). Round içi ilerleme (açık kartlar, tur sayısı) yenilemede kaybolur; küçük bir kayıp (round zaten kısa) ama Harf Avı ile tutarsız.

**Kalan:** Mobil Header çakışması muhtemelen proje-geneli bir Header düzeltmesi gerektiriyor, bu modülün kapsamı değil ama burada tekrar teyit edildi.

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Görsel taraf sağlam (iki modda da gerçek görsel geliyor), ses tarafında bir harici bağımlılık kalıntısı var.**

- ✅ Harf modu: `content.letterImages` (DB kaynaklı `ContentSet.imageUrl`) — Harf Avı denetiminde CDN sorunu zaten çözülmüştü, bu havuz ondan bağımsız ve sağlam (gerçek tarayıcıda "J" harfi net göründü).
- ✅ Nesne modu: 100 aktif `ComparisonItem` var (`public/karsilastirma/`), `MAX_PAIRS=8` (en fazla 16 kart) ihtiyacını fazlasıyla karşılıyor — havuz tükenme riski yok.
- ✅ `ImageWithFallback` her iki modda da kullanılıyor — kırık görsel senaryosunda kart etiketine (harf/nesne adı) zarif şekilde düşüyor.
- ❌ **Kart çevirme sesi (`playFlip`, satır 69) hâlâ harici bir CDN'e bağlı** — `https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3`. Şu an 200 dönüyor (canlı) ama Harf Avı denetiminde tam olarak bu desenin (`AUDIOS.wrong`'un ölü CDN'e bağlı kalması) bir kez bulunup düzeltildiği göz önüne alınırsa, bu satır aynı riski taşıyor: CDN çökerse veya ağ kesilirse (Papatya'nın "çevrimdışı çalışır" ilkesi, YOL-HARITASI Değişmeyen Tasarım İlkeleri) kart çevirme sesi sessizce çalmaz. `AUDIOS`'a yerel bir `flip` girdisi eklenmesi önerilir.

**Öneri:** `playFlip`'i yerel bir `public/sounds/` dosyasına taşımak — küçük, düşük riskli bir düzeltme.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: reduceMotion köprüsü teorik olarak kapsıyor ama klavye/ekran-okuyucu erişimi tamamen eksik.**

- ✅ `reduceMotion` → Framer Motion köprüsü (`MotionPreference`, kök layout) bu oyunun kart çevirme animasyonunu da kapsıyor (kod yolu ortak, Harf Avı'nda doğrulanan mekanizmanın aynısı).
- ❌ **Kartlar klavyeyle hiç erişilemiyor.** Gerçek tarayıcıda ölçüldü: her kart salt `<div onClick>`, `role`/`aria-label` yok, `tabIndex` DOM'da `-1` (tarayıcının varsayılanı, element hiç fokus alamıyor). Tab tuşuyla oyuna girmek imkânsız — Harf Avı'nda tam olarak bu eksiklik bulunup düzeltilmişti (`DraggableToken`'a `aria-label`, `TargetFrame`'e `aria-live` eklendi); Hafıza Kartları bu düzeltmeyi hiç almamış.
- ❌ Doğru/yanlış eşleşme durumu (`isMatch`) hiçbir `aria-live` bölgesiyle duyurulmuyor — ekran okuyucu kullanıcısı için oyun sessiz kalıyor.
- ❌ `sensoryProfile` JSON'u burada da (Harf Avı ile aynı, proje-geneli) hiç okunmuyor.

**Öneri:** Kartlara `role="button"`, `tabIndex={0}`, harf/nesne-özel `aria-label` (ör. "J harfi, kapalı kart" / "Kapalı kart, eşleştirmek için seç") ve klavye ile açma (`onKeyDown` Enter/Space) eklenmesi — Harf Avı'nda uygulanan desenin doğrudan taşınabilir hâli. Eşleşme sonucu için `aria-live="polite"` bölgesi.

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

- ✅ Kart çevirme: ses (`playFlip`, harici — bkz. blok d) + 3D flip animasyonu.
- ✅ Doğru eşleşme: ses (`playMatch`) + `celebrateSuccess` + toast "Harika!" — 600ms gecikmeyle, kartların açık kaldığı süre çocuğun görmesine yetecek kadar.
- ✅ Yanlış eşleşme: `encourageRetry` sesi + 1000ms sonra kartlar otomatik kapanıyor — ceza/kırmızı-çarpı yok, "Değişmeyen tasarım ilkeleri"ndeki "Başarısızlık yok" ilkesiyle uyumlu.
- ✅ Round tamamlama: `triggerReward({ message: 'Harika eşleştirme!' })` — ayrı bir kutlama katmanı.
- N/A İpucu gösterimi bu oyun tipinde yok (Harf Avı'ndaki ipucu kavramının burada karşılığı yok, oyun mekaniği farklı).

**Öneri:** Yok — bu blok yeterli kapsanmış durumda, tek risk blok (d)'deki harici ses bağımlılığı.

---

## Genel geliştirme önerileri — durum (ilk denetim, 2026-09-14)

1. ❌ Kartlara klavye erişimi + `aria-label`/`aria-live` (blok e) — Harf Avı'nda uygulanan desenin taşınması gerekiyor, henüz yapılmadı.
2. ❌ `playFlip`'in yerel bir ses dosyasına taşınması (blok d/g) — küçük, düşük riskli.
3. ❌ Mobil Header çakışması (blok c) — modül-bağımsız, proje-geneli bir düzeltme gerektiriyor.
4. ❌ Sayfa yenilenince round'un korunmaması (blok c) — Harf Avı'ndaki `sessionStorage` deseninin taşınması değerlendirilebilir, düşük öncelik (round kısa).
5. ❌ Oyuna özel ebeveyn kontrolü yok (blok b) — Harf Avı'daki günlük round limiti benzeri, öncelik değil.
6. ⚠️ Mod seçim ekranındaki çift navigasyon (Header ev ikonu + sabit alt buton) — küçük sadelik notu (blok c).

**Bu turda kod değişikliği yapılmadı — yalnızca tespit/rapor.** Hangi maddelerin bu oturumda ele alınacağı kullanıcı kararını bekliyor.

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, Harf Avı ile aynı insan/cihaz adımı.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması — proje-geneli, henüz roadmap'e madde olarak işlenmedi (Harf Avı denetiminde de aynı not var).
