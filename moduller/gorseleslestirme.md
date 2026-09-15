# Gölge Eşleştirme (`/games/visual-match`)

> Faz 2.11 denetim çeklistinin üçüncü modülü — format `moduller/harfavi.md` / `moduller/hafizakartlari.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-15 (4 turluk denetim/iyileştirme döngüsü kapandı — harf tabanlı ilk mekanik tamamen kaldırılıp gerçek bir nesne-siluet mekaniğine dönüştürüldü, adaptif zorluk/günlük limit/klavye erişilebilirliği eklendi, siluet render'ı ve düzen kullanıcı geri bildirimiyle iki kez düzeltildi).

## Özet

Sürükle-bırak mekaniğiyle çalışan oyun: ekranda hedef bir nesnenin **SİLUETİ** (gerçek bir `ComparisonItem` fotoğrafından SVG filtresiyle üretilen, tek renkli, keskin bir gölge — Hafıza Kartları'nın "Nesnelerle" moduyla aynı 100 fotoğraflık havuz) belirir. Çocuk, en az 3 alternatif arasından doğru nesnenin renkli fotoğrafını bulup bu siluetin üzerine sürükler. Ölçtüğü beceri `golge-eslestirme` (SkillAttempt). Masaüstünde hedef solda / alternatifler sağda yan yana; mobil/tablette dikey akış. Adaptif zorluk motoruna, günlük round limitine ve klavye-only sürükle-bırak desteğine sahip — artık Harf Avı/Hafıza Kartları ile aynı olgunluk seviyesinde.

**Ana dosyalar:** `src/components/games/visual-match/GameBoard.tsx`, `Draggable.tsx`, `Droppable.tsx` · `src/app/games/visual-match/page.tsx` · `src/actions/skills.ts` (`recordSkillAttempt`, `getAllSkillProgress`) · `src/actions/visualMatch.ts` (`getVisualMatchDailyState`, `getVisualMatchRoundPool`) · `src/lib/adaptiveDifficulty.ts` (`getAdaptiveVisualMatchConfig`) · `src/components/ui/ImageWithFallback.tsx` (siluet için `style` prop desteği) · `src/hooks/useGameDayBudget.ts`, `useCalmingModeMonitor.ts` (paylaşılan) · `src/config/gameIntros.ts` · `src/actions/parentSettings.ts` (`dailyVisualMatchLimit`) · `src/components/ui/parentPanel/ScreenTimeTab.tsx`.

**Bu modülün geçmişi diğer ikisinden farklı:** Harf Avı ve Hafıza Kartları ilk yazımlarından beri kendi kimliklerine uygun mekaniklerle geldi; bu modül ise ilk halinde ismiyle (Gölge Eşleştirme) hiç örtüşmeyen, Harf Avı'nın birebir kopyası bir mekanikle yazılmıştı — kullanıcı bulgusuyla dört turda gerçek bir siluet oyununa dönüştürüldü. Bu geçmiş, dosyanın en altındaki "Geliştirme geçmişi" bölümünde özetleniyor.

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Sağlam — Harf Avı/Hafıza Kartları ile aynı adaptif zorluk ailesinde.**

- ✅ **Adaptif zorluk motoru.** `getAdaptiveVisualMatchConfig` (`adaptiveDifficulty.ts`) — Harf Avı/Hafıza Kartları ile aynı `detectErrorStreak` altyapısı, farklı çıktı: `distractorCount` (2-3 arası çeldirici nesne sayısı, taban 2 — "her round en az 3 alternatif" kullanıcı isteği). 3 ardışık yanlışta anında tabana düşer, başarı ≥%60 iken 3 çeldiriciye çıkar. Çocuk doğru nesneyi 2-3 yanlış seçenek arasından ayırt etmek zorunda — gerçek bir görsel tanıma/karşılaştırma görevi.
- ✅ **Ardışık aynı hedef koruması.** Harf Avı'ndaki kesin korumanın aynısı: `previousTargetIdRef` ile bir önceki hedef havuzdan çıkarılıp yeniden seçiliyor — art arda aynı nesne asla gelmiyor.
- ✅ Sakinleştirme modu doğru bağlı: `useCalmingModeMonitor('golge-eslestirme')` her `handleDragEnd`'de çağrılıyor.
- ✅ Rozet mekanizması aynı merkezi `recordSkillAttempt`/`Skill` katmanını kullanıyor, spam değil.
- ⚠️ Pekiştirme her tek doğru eşleşmede tetikleniyor (ses + konfeti + 👍 emoji) — Harf Avı/Hafıza Kartları'nda da not edilen "aralıklı pekiştirme yok" bulgusunun aynısı, üç oyunda da tutarlı, henüz hiçbirinde ele alınmayan bir eksiklik.
- ✅ Round geçiş gecikmesi 2sn — Harf Avı/Hafıza Kartları'nın (1.5-2sn) aralığıyla tutarlı.

**Kalan öneri:** Pekiştirme yoğunluğunun aralıklı hale getirilmesi (her tek doğru cevapta değil) — üç oyunda ortak, proje-geneli bir iyileştirme, henüz kapsam dışı.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Sağlam — Harf Avı/Hafıza Kartları ile aynı seviyede.**

- ✅ **Günlük round (tur) limiti.** `UserSettings.dailyVisualMatchLimit` (10-50 arası, varsayılan 20 — Hafıza Kartları ile aynı aralık). Ayrı bir `Session`/`Event` tablosu gerektirmedi — sayaç bugünkü `SkillAttempt` (`gameId: 'visual-match'`) kayıt sayısından hesaplanıyor (`countTodaysAttempts`, `actions/visualMatch.ts`). Limit dolunca oyun ekranı yerine "Bugünkü N turluk hakkın doldu / Yarın devam edebilirsin!" mesajı gösteriliyor. `ScreenTimeTab.tsx`'e alan eklendi, ebeveyn panelinde görüntüleme + kaydetme + DB'ye yazma gerçek tarayıcıda doğrulandı.
- ✅ Genel günlük süre limiti doğru çalışıyor: `dayBudget?.isDayComplete` hem `handleDragStart` hem `handleDragEnd`'de kontrol ediliyor.
- ✅ **`golge-eslestirme` becerisi `ProgressTab.tsx`'te görünüyor.** `getAllSkillProgress()` tüm `Skill` kayıtlarını (bu beceri dahil) filtresiz listeliyor — gerçek tarayıcıda bir round oynanıp ebeveyn panelinin İlerleme sekmesi açıldığında hem "Kazanılan rozetler" bölümünde ("🌗 Gölge Eşleştirme") hem "Beceri ilerlemesi" listesinde (yüzdelik başarı oranıyla) doğrulandı.
- N/A İçerik kontrol listesi/onay akışı (Müzik/Video sekmelerindeki gibi) — bu oyun türünde (sabit fotoğraf havuzu, dış içerik yükleme yok) gerekli değil.

---

## Blok (c) — UI/UX

**Durum: Kapsamlı şekilde düzeltildi — kritik hydration hatası, scroll bug'ı, layout ve klavye erişilebilirliği dahil.**

- ✅ **Scroll bug'ı düzeltildi.** Harf Avı denetiminde bulunan aynı kök nedenin (`<body>`'nin `pt-16/lg:pt-20` padding'i + oyunun kendi `100vh`'ı üst üste biniyor) bu oyundaki `h-screen` varyantı düzeltildi — yeni `.h-app` utility'si (`globals.css`) ile `scrollHeight === innerHeight` sağlandı.
- ✅ **Kritik hydration mismatch hatası düzeltildi.** `DndContext`'e sabit `id="visual-match-dnd"` verilmemişti — dnd-kit'in otomatik `aria-describedby` sayacı sunucu/istemci arasında tutarsızdı, her sayfa yüklemesinde React konsol hatası veriyordu. Sabit id ile giderildi.
- ✅ **Layout: header + içerik + progress göstergesi, Harf Avı'nın kanıtlanmış deseniyle yeniden kuruldu.** İlk denemelerde `GameHud`'ı `absolute` header içinde tutup `pt-*` padding ile progress metnini konumlandırmaya çalışmak iki turdur başarısız oluyordu (flex `justify-center` padding'i içeriği itmiyor, yalnızca kullanılabilir alanı daraltıyor) — kullanıcı ekran görüntüsüyle "üstte gereksiz boşluk + progress metni siluetin içine biniyor" bulgusunu iki kez iletti. Kesin çözüm: Harf Avı'nın (`src/components/game/GameBoard.tsx`) deseni birebir kopyalandı — `GameHud` normal akışta (`w-full p-4 shrink-0`, absolute değil), progress `center` prop'unda kendi rozetinde (`bg-papatya-petal/15`), altında `flex-1` içerik doğal olarak geri kalan alanı dolduruyor. Gerçek tarayıcıda 375/800/1920px'te doğrulandı: hiçbir örtüşme yok, üstte gereksiz boşluk kalmadı.
- ✅ **Masaüstünde yan yana düzen.** Kullanıcı isteği: "masaüstünde ana öğe solda, gölge alternatifleri sağda, alt alta değil." İç kapsayıcı `flex-col` (mobil/tablet, dikey) → `lg:flex-row` (masaüstü, hedef solda/kartlar sağda `flex-wrap`).
- ✅ Dokunma hedefleri büyük ve net: draggable kart 128-176px, WCAG 44px'i fazlasıyla aşıyor.
- ✅ Sürükleme geri bildirimi net: `DragOverlay` ile imleci takip eden büyütülmüş/döndürülmüş kopya, `whileHover`/`whileTap` mikro-etkileşimleri.
- ✅ **Erişilebilirlik etiketleri.** `Draggable`'a nesne-özel `aria-label` ("X, sürüklenebilir"), `Droppable`'a `role="status"` + `aria-live="polite"` + eşleşince `aria-label="Doğru eşleşme!"` (Harf Avı'ndaki `DraggableToken`/`TargetFrame` deseninin aynısı). Siluet görseline de `alt="X gölgesi"` etiketi var.
- ✅ **Dekoratif emoji ekran okuyucudan gizlendi.** Başarı anındaki "👍" emojisine `aria-hidden="true"` eklendi.
- ✅ **PC'de (1920px+) içerik genişletildi** — `xl:` boyut kademesi, `flex-wrap` ile geniş yatay alan doğal olarak kullanılıyor.
- ✅ **Klavye-only sürükle-bırak desteği.** `useSensor(KeyboardSensor)` eklendi (ek bağımlılık gerekmedi). Gerçek tarayıcıda uçtan uca doğrulandı: Tab ile karta odaklan → Space (sürüklemeyi başlat, dnd-kit `aria-live` bölgesi "Picked up draggable item X" duyurusu yapıyor) → ok tuşlarıyla hedefe taşı → Space (bırak) → başarılı eşleşme.

**Kalan:** Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi — insan/cihaz adımı, henüz yapılmadı (diğer iki modülde de aynı durum).

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Sağlam — tamamen yerel varlıklar, gerçek bir siluet mekaniği, mekanik/tanıtım metni tutarlı.**

### Harici CDN/dış bağımlılık listesi

| Varlık | Kaynak | Durum |
|---|---|---|
| `success.wav` (doğru eşleşme sesi) | `public/sounds/success.wav` | ✅ Yerel |
| `pop.wav` (sürükleme başlangıcı sesi) | `public/sounds/pop.wav` | ✅ Yerel |
| Konfeti (`react-confetti`) | npm paketi, canvas ile client-side üretiliyor | ✅ Harici ağ isteği yok |
| Nesne fotoğrafları (hedef siluet + kartlar) | `ComparisonItem.imageUrl` → `public/karsilastirma/*.jpg` | ✅ Yerel, 100 fotoğraf, aynı havuz Hafıza Kartları'nda da doğrulanmıştı |
| 👍 emoji | Unicode karakter (sistem emoji fontu) | ✅ Harici kaynak yok |

**Sonuç: bu oyunda hiçbir harici/CDN bağımlılığı yok.**

### Diğer bulgular

- ✅ **Siluet render'ı SVG filtresiyle çözüldü.** İki ara deneme başarısız oldu: (1) CSS `filter` kombinasyonları (`brightness`/`grayscale`/`contrast`) nesnenin kendi renginden bağımsız değildi — koyu nesnelerde arka planla birleşip yarı saydam, "x-ray" gibi düz bir blok gösteriyordu; (2) `mask-image`/`mask-mode: luminance` JPEG'lerde tarayıcı bazında güvenilmez çalıştı, görsel hiç maskelenmedi. Kesin çözüm: standart bir SVG `<filter>` (`feColorMatrix` gri tonlama → `feComponentTransfer`/`feFuncA` luminance %70 eşiğinde ikili alfa maskesi → `feFlood`+`feComposite` ile düz `papatya-ink-soft` rengi dolduruluyor). Nesnenin rengi ne olursa olsun tutarlı, keskin bir siluet — gerçek tarayıcıda 5+ farklı round'da (sırt çantası, deve, lale, balık kavanozu, valiz, raket) görsel olarak doğrulandı.
- ⚠️ Çok gürültülü dokulu nesnelerde (ör. üstü serpme kaplı bir donut fotoğrafı) siluet biraz dağınık/noktalı çıkabiliyor — luminance eşiklemenin doğal bir sınırı, genel kullanılabilirliği etkilemeyen küçük bir kusur.
- ✅ Tanıtım metni gerçek mekanikle örtüşüyor: "Nesnenin gölgesine bak, doğru resmi bul ve gölgenin üzerine sürükle. Görsel tanımayı ve ayırt etmeyi öğretir." (`gameIntros.ts`) — ilk halindeki "Görseli doğru gölgesinin üzerine sürükle... şekilleri tanımayı ve karşılaştırmayı öğretir" iddiası harf-tabanlı mekanikle hiç örtüşmüyordu, artık birebir karşılığı var.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: `reduceMotion` köprüsü tam kapsıyor; `sensoryProfile` proje-geneli eksik burada da var.**

- ✅ `reduceMotion` → Framer Motion köprüsü (`MotionPreference`, kök `layout.tsx`) bu oyunun `motion.div` animasyonlarını (sürükleme scale/rotate, 👍 belirme animasyonu, yanlış kart shake) kapsıyor.
- ✅ **Konfeti azaltıldı ve `reduceMotion`'a bağlandı.** `numberOfPieces` 200'den 80'e düşürüldü; `useReducedMotion()` `true` iken `<Confetti>` hiç render edilmiyor — önceden bağımsız bir kütüphane olduğu için bu ayardan hiç etkilenmiyordu.
- ✅ Yanlış cevapta ceza/kırmızı-çarpı yok — yalnızca nazik bir ses (`encourageRetry`) + hafif shake animasyonu (kendisi de `reduceMotion`'a tabi), "Başarısızlık yok" ilkesiyle uyumlu.
- ❌ `sensoryProfile` JSON'u burada da (proje-geneli, diğer tüm oyunlarla aynı) hiç okunmuyor — konfeti/ses gibi potansiyel aşırı-uyarıcı efektler duyusal profile göre ayarlanmıyor.

**Kalan:** Gerçek ekran okuyucu testi (blok c ile aynı) ve `sensoryProfile` bağlanması (proje-geneli, ayrı mimari iş) — her ikisi de üç oyunda ortak, henüz hiçbirinde ele alınmadı.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Sağlam.**

- ✅ `recordSkillAttempt` çağrısı diğer oyunlarla birebir aynı, sunucu tarafında `getCurrentUser()` ile doğrulanan, hatayı yutan güvenli desen.
- ✅ `getVisualMatchDailyState`/`getVisualMatchRoundPool` oturumsuz durumda güvenle boş/temel değere düşüyor.
- ✅ Client'a sızan hassas veri yok — `ComparisonItem` havuzu zaten public, kişiye özel bir veri taşımıyor.
- ✅ Middleware statik asset matcher'ı `karsilastirma/` klasörünü zaten kapsıyor (Hafıza Kartları denetiminde doğrulanmıştı).
- ✅ `useGameDayBudget`/`useCalmingModeMonitor` diğer oyunlarla aynı paylaşılan, önceden doğrulanmış davranışı miras alıyor.

**Kalan:** Yok — bu blok tamamen kapsanmış durumda.

---

## Blok (g) — Ses/görsel efekt yeterliliği ve ihtiyaç tespiti

**Durum: Tamamlandı.**

- ✅ Sürükleme başlangıcı: `pop.wav` sesi + animasyon büyümesi.
- ✅ Doğru eşleşme: `success.wav` sesi + konfeti (reduceMotion'a bağlı) + 👍 emoji animasyonu + `Droppable`'ın border/arkaplan renk değişimi (nötr → yeşil).
- ✅ Yanlış bırakma: `encourageRetry` sesi + yanlış kartların hafif shake animasyonu — ceza değil, nazik bir "tekrar dene" daveti.
- ✅ Sürükleme sırasında `isOver` durumunda görsel geri bildirim (hedef üstündeyken mavi vurgu + `scale-105`).
- N/A İpucu kavramı bu oyun tipinde yok — mekanik zaten tek adımlı.

**Kalan:** Yok.

---

## Genel geliştirme önerileri — durum

1. ✅ Adaptif zorluk motoru (blok a).
2. ✅ Ardışık aynı hedef koruması (blok a).
3. ✅ Günlük round limiti (blok b).
4. ✅ `ProgressTab.tsx`'te beceri görünürlüğü (blok b) — doğrulandı.
5. ✅ Tokensiz sabit renkler → Papatya tema token'ları (blok c/GENEL-KURALLAR md.5).
6. ✅ Scroll bug'ı + hydration mismatch hatası (blok c).
7. ✅ Layout: header/progress/siluet/kartlar konumlandırması (blok c) — Harf Avı deseniyle kesin çözüldü.
8. ✅ Masaüstü yan yana düzen (blok c).
9. ✅ Klavye-only sürükle-bırak desteği (blok c).
10. ✅ Siluet render kalitesi (blok d) — SVG filtresiyle kesin çözüldü.
11. ✅ Yanlış cevap ses+görsel geri bildirimi (blok g).
12. ✅ Konfeti azaltma + reduceMotion bağlama (blok e).
13. ✅ Tanıtım metni gerçek mekanikle örtüşür hale getirildi (blok d).

**Yeni ortaya çıkan, henüz ele alınmayan öneriler:**
- Pekiştirme yoğunluğunun aralıklı hale getirilmesi (blok a) — üç oyunda ortak.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması (blok e) — proje-geneli.
- Çok gürültülü dokulu nesnelerde siluetin dağınık çıkması (blok d) — küçük, kabul edilebilir bir sınır.
- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi (blok c/e) — insan/cihaz adımı.

---

## Geliştirme geçmişi (özet, tarihli)

- **2026-09-15, 1. tur (loop):** İlk Faz 2.11 denetimi. Harf tabanlı mekanik henüz sabit sistemdeydi (adaptif zorluk yok). Düşük riskli UI düzeltmeleri: tokensiz renkler, scroll bug'ı, hydration mismatch hatası, erişilebilirlik etiketleri.
- **2026-09-15, 2. tur:** Kullanıcı raporu okuyup büyük/mimari önerileri de onayladı — adaptif zorluk motoru, ardışık-aynı-harf koruması, günlük round limiti, klavye-only sürükle-bırak, yanlış cevap geri bildirimi, konfeti azaltma, PC genişletme, harf seti 21→29. Bu turda mekanik hâlâ harf tabanlıydı.
- **2026-09-15, 3. tur (kritik dönüş noktası):** Kullanıcı bulgusu — mekanik "Gölge Eşleştirme" adıyla hiç alakalı değildi, Harf Avı'nın birebir kopyasıydı. Harf tamamen kaldırılıp `ComparisonItem` havuzuna geçirildi (gerçek nesne-siluet mekaniği), her round en az 3 alternatif, masaüstünde yan yana düzen. Bu turdaki siluet CSS'i (`contrast(3)`) ve layout çözümü (progress göstergesi konumlandırması) yetersiz kaldı.
- **2026-09-15, 4. tur:** Kullanıcı ekran görüntüsüyle "x-ray gibi duruyor + üstte boşluk var" bulgusunu iletti. Siluet SVG filtresiyle (luminance eşiklemesi) kesin çözüldü; layout Harf Avı'nın kanıtlanmış deseniyle (normal akışta GameHud, `center` prop'unda progress rozeti) yeniden kuruldu. Bu turda ayrıca `ProgressTab.tsx` görünürlüğü doğrulandı (önceki turlarda "doğrulanmadı" olarak işaretliydi, gerçekte çalıştığı teyit edildi).

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, Harf Avı/Hafıza Kartları ile aynı insan/cihaz adımı.
- Pekiştirme yoğunluğunun aralıklı hale getirilmesi — üç oyunda ortak, henüz hiçbirinde ele alınmadı.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması — proje-geneli, diğer iki modülde de aynı not var.
- Çok gürültülü dokulu nesnelerde siluetin dağınık çıkması — küçük bir kusur, eşik ince ayarı veya bu tür fotoğrafların havuzdan hariç tutulması değerlendirilebilir.
