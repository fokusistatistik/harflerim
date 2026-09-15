# Gölge Eşleştirme (`/games/visual-match`)

> Faz 2.11 denetim çeklistinin üçüncü modülü — format `moduller/harfavi.md` / `moduller/hafizakartlari.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-15 (2. tur — kullanıcı kararlarıyla adaptif zorluk, günlük round limiti, klavye erişilebilirliği, yanlış cevap geri bildirimi ve daha fazlası uygulandı; ayrıntı için aşağıdaki "İkinci tur" bölümüne bakın).

## Özet

Sürükle-bırak mekaniğiyle çalışan oyun: ekranda hedef bir harf gölgesi (ana hatları çizili, dolgusuz) belirir, çocuk aynı harfi taşıyan dolu bir kartı bu gölgenin üzerine sürükler. Ölçtüğü beceri `golge-eslestirme` (SkillAttempt). 2. turda gerçek bir adaptif zorluk motoruna kavuştu: başarı arttıkça hedefin yanına 1-3 çeldirici (yanlış) harf eklenir, çocuk doğru olanı seçip sürükler — artık gerçek bir ayırt etme görevi var (bkz. Blok a/d).

**Ana dosyalar:** `src/components/games/visual-match/GameBoard.tsx`, `Draggable.tsx`, `Droppable.tsx` · `src/app/games/visual-match/page.tsx` · `src/actions/skills.ts` (`recordSkillAttempt`), `src/actions/visualMatch.ts` (`getVisualMatchDailyState` — adaptif config + günlük limit) · `src/lib/adaptiveDifficulty.ts` (`getAdaptiveVisualMatchConfig`) · `src/hooks/useGameDayBudget.ts`, `useCalmingModeMonitor.ts` (paylaşılan, diğer oyunlarla aynı) · `src/config/gameIntros.ts` (tanıtım metni) · `src/actions/parentSettings.ts` (`dailyVisualMatchLimit`) · `src/components/ui/parentPanel/ScreenTimeTab.tsx` (ebeveyn ayarı).

**Harf Avı/Hafıza Kartları'na göre kalan fark:** çeldirici sayısı dışında zorluk boyutu yok (hedef/kart boyutu, gecikme gibi diğer değişkenler sabit); "Nesnelerle" modu gibi harf-bağımsız bir alternatif yok.

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: 2. turda büyük ölçüde güçlendirildi — artık Harf Avı/Hafıza Kartları ile aynı adaptif zorluk ailesinde.**

- ✅ (2026-09-15, 2. tur) **Adaptif zorluk motoru eklendi.** `getAdaptiveVisualMatchConfig` (`adaptiveDifficulty.ts`) — Harf Avı/Hafıza Kartları ile aynı `detectErrorStreak` altyapısı, farklı çıktı: `distractorCount` (0-3 arası çeldirici harf sayısı). İlk round her zaman en kolay (çeldiricisiz, tek kart), 3 ardışık yanlışta anında en kolaya düşer, başarı ≥%80 iken 3 çeldiriciye çıkar. Çocuk artık doğru harfi 1-3 yanlış seçenek arasından ayırt etmek zorunda — gerçek bir tanıma/karşılaştırma görevi oluştu.
- ✅ (2026-09-15, 2. tur) **Ardışık aynı harf koruması eklendi.** Harf Avı'ndaki kesin korumanın aynısı: `previousLetterRef` ile bir önceki hedef, havuzdan çıkarılıp yeniden seçiliyor — art arda aynı harf asla gelmiyor.
- ✅ (2026-09-15, 2. tur) **Mekanik artık tanıtım metniyle tutarlı.** Çeldiricili yapı sayesinde "harfi bul ve ayırt et" iddiası mekanik olarak karşılanıyor (bkz. blok d — metin de buna göre güncellendi). Not: kullanıcı kararıyla tam bir "farklı görsel/şekil" mekaniğine dönüştürülmedi — çeldiriciler de birer harf, gerçek nesne/görsel karşılaştırması hâlâ yok (bu, "Nesnelerle" modu gibi ayrı bir iş olarak roadmap'te kalıyor).
- ✅ Sakinleştirme modu doğru bağlı: `useCalmingModeMonitor('golge-eslestirme')` her `handleDragEnd`'de çağrılıyor — diğer oyunlarla aynı desen.
- ✅ Rozet mekanizması aynı merkezi `recordSkillAttempt`/`Skill` katmanını kullanıyor, spam değil.
- ⚠️ Pekiştirme her tek doğru eşleşmede tetikleniyor (ses + konfeti + 👍 emoji) — Harf Avı/Hafıza Kartları'nda da not edilen "aralıklı pekiştirme yok" bulgusunun aynısı, üç oyunda da tutarlı bir eksiklik, bu turda da ele alınmadı.
- ✅ (2026-09-15, 2. tur) **Round geçiş gecikmesi 3sn → 2sn'ye kısaltıldı** — Harf Avı/Hafıza Kartları'nın (1.5-2sn) aralığına daha yakın.

**Kalan öneri:** Pekiştirme yoğunluğunun aralıklı hale getirilmesi (her tek doğru cevapta değil) — üç oyunda da ortak, henüz hiçbirinde ele alınmadı.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: 2. turda Harf Avı/Hafıza Kartları ile aynı seviyeye getirildi.**

- ✅ (2026-09-15, 2. tur) **Günlük round (tur) limiti eklendi.** `UserSettings.dailyVisualMatchLimit` (yeni migration, Hafıza Kartları ile aynı aralık: 10-50, varsayılan 20). Ayrı bir `Session`/`Event` tablosu gerektirmedi — sayaç bugünkü `SkillAttempt` (`gameId: 'visual-match'`) kayıt sayısından hesaplanıyor (`countTodaysAttempts`, `actions/visualMatch.ts`). Limit dolunca oyun ekranı yerine "Bugünkü N turluk hakkın doldu / Yarın devam edebilirsin!" mesajı gösteriliyor (Harf Avı'ndaki mesaj deseninin aynısı). `ScreenTimeTab.tsx`'e yeni bir alan eklendi, gerçek tarayıcıda kaydetme + DB'ye yazma doğrulandı.
- ✅ Genel günlük süre limiti doğru çalışıyor: `dayBudget?.isDayComplete` hem `handleDragStart` hem `handleDragEnd`'de kontrol ediliyor, `Draggable`'a `disabled` olarak geçiriliyor.
- ❌ Ebeveyn panelinde (`ProgressTab.tsx`) `golge-eslestirme` becerisi teorik olarak genel `getAllSkillProgress()` listesinde görünüyor olabilir (paylaşılan altyapı sayesinde) ama oyuna özel hiçbir ek görünürlük/ayar yok — doğrulanmadı, kontrol edilmesi öneri olarak kalıyor.
- ❌ İçerik kontrol listesi/onay akışı yok (Müzik/Video sekmelerindeki gibi) — ama bu oyun türü (statik harf gösterimi, dış içerik yok) için zaten gerekli değil, N/A olarak değerlendirilebilir.

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
- ✅ (2026-09-15, 2. tur) **PC'de (1920px+) içerik genişletildi.** Hedef/kart boyutlarına `xl:` kademesi eklendi (`xl:w-96 xl:h-96` hedef, `xl:w-64 xl:h-64` kart), dikey boşluk `xl:gap-24`'e çıkarıldı — geniş ekranda içerik daha fazla yer kaplıyor, çeldiricili düzende (2-4 kart) `flex-wrap` ile doğal olarak yatay alanı da kullanıyor. Gerçek tarayıcıda 1920px'te doğrulandı.
- ✅ (2026-09-15, 2. tur) **Klavye-only sürükle-bırak desteği eklendi.** `useSensor(KeyboardSensor)` sensörlere eklendi (ek bağımlılık gerekmedi, `@dnd-kit/core`'un kendi varsayılan `coordinateGetter`'ı kullanıldı). Gerçek tarayıcıda uçtan uca doğrulandı: Tab ile karta odaklan → Space (sürüklemeyi başlat, dnd-kit `aria-live` bölgesi "Picked up draggable item X" duyurusu yapıyor) → ok tuşlarıyla hedefe taşı → Space (bırak) → başarılı eşleşme. Şimdi fare/dokunma olmadan da oyun tamamen oynanabilir.

**Kalan:** Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi — insan/cihaz adımı, henüz yapılmadı.

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

- ✅ (2026-09-15, 2. tur) **Tanıtım metni gerçek mekanikle örtüşecek şekilde güncellendi.** "Görseli doğru gölgesinin üzerine sürükle... şekilleri tanımayı ve karşılaştırmayı öğretir" → "Doğru harfi bul ve kendi gölgesinin üzerine sürükle. Harf tanımayı ve ayırt etmeyi öğretir." Artık çeldiricili mekanikle birebir örtüşüyor (kullanıcı kararı: metin sadeleştirildi, oyun tam bir görsel/nesne mekaniğine dönüştürülmedi).
- ✅ (2026-09-15, 2. tur) **Harf seti 21'den 29'a genişletildi.** `LETTERS` artık Ğ/İ/I/H/J/Ö/Ş/Ü dahil tüm Türkçe alfabeyi kapsıyor — Harf Avı ile tutarlı. Gerçek tarayıcıda Türkçe özel karakterlerin (İ, Ç, Ü vb.) doğru render olduğu doğrulandı.
- ✅ Yazı tipi tutarlı: hem hedef hem draggable `var(--font-andika)` kullanıyor — Harf Avı ile aynı font, harf şekli çocuk için tanıdık kalıyor.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: `reduceMotion` köprüsü diğer tüm oyunları kapsadığı için burada da geçerli; `sensoryProfile` proje-geneli eksik burada da var.**

- ✅ `reduceMotion` → Framer Motion köprüsü (`MotionPreference`, kök `layout.tsx`) bu oyunun `motion.div` animasyonlarını (sürükleme scale/rotate, 👍 belirme animasyonu) da kapsıyor — kod yolu ortak, Harf Avı'nda doğrulanan mekanizmanın aynısı, bu oyunda ayrıca gerçek tarayıcıda doğrulanmadı.
- ❌ `sensoryProfile` JSON'u burada da (proje-geneli, diğer tüm oyunlarla aynı) hiç okunmuyor — konfeti/ses gibi potansiyel aşırı-uyarıcı efektler duyusal profile göre ayarlanmıyor. Bu turun kapsamı dışında.
- ✅ (2026-09-15, 2. tur) **Konfeti azaltıldı ve `reduceMotion`'a bağlandı.** `numberOfPieces` 200'den 80'e düşürüldü; `useReducedMotion()` (Framer Motion) `true` iken `<Confetti>` hiç render edilmiyor — önceden bağımsız bir kütüphane olduğu için bu ayardan tamamen etkilenmiyordu, artık diğer `motion.*` animasyonlarıyla tutarlı davranıyor.
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

**Durum: 2. turda tamamlandı — yanlış cevapta artık ses + görsel geri bildirim var.**

- ✅ Sürükleme başlangıcı: `pop.wav` sesi + `whileTap`/animasyon büyümesi.
- ✅ Doğru eşleşme: `success.wav` sesi + konfeti (80 parça, reduceMotion'a bağlı) + 👍 emoji animasyonu + `Droppable`'ın kendi border/arkaplan renk değişimi (nötr → yeşil).
- ✅ (2026-09-15, 2. tur) **Yanlış bırakma anına ses + hafif shake animasyonu eklendi.** Doğru hedefe yanlış kart bırakılınca: `useAudio().encourageRetry()` (Harf Avı'ndaki "tekrar dene" sesinin aynısı, paylaşılan hook) + yanlış kartların `motion.div` ile hafif x-ekseni sallanması (`[0, -8, 8, -8, 0]`, 0.4sn — `reduceMotion` açıkken Framer Motion tarafından otomatik bastırılıyor). Ceza/kırmızı-çarpı yok, yalnızca nazik bir "tekrar dene" daveti — "Başarısızlık yok" ilkesiyle uyumlu. Gerçek tarayıcıda doğrulandı.
- ✅ Sürükleme sırasında `isOver` durumunda görsel geri bildirim var (hedef üstündeyken mavi vurgu + `scale-105`).
- N/A İpucu kavramı bu oyun tipinde yok (Harf Avı'ndaki ipucu sistemi burada karşılık bulmuyor, mekanik zaten tek adımlı).

**Kalan:** Yok — bu blok artık tamamen kapsanmış durumda.

---

## İkinci tur (2026-09-15) — kullanıcı kararlarıyla büyük/mimari maddelerin uygulanması

1. ✅ **Adaptif zorluk motoru** (blok a) — `getAdaptiveVisualMatchConfig`, 0-3 çeldirici harf, `detectErrorStreak` tabanlı.
2. ✅ **Ardışık aynı harf koruması** (blok a) — Harf Avı'ndaki kesin korumanın aynısı.
3. ✅ **Günlük round limiti** (blok b) — `dailyVisualMatchLimit` (yeni migration, 10-50, varsayılan 20), `ScreenTimeTab.tsx`'e eklendi, `SkillAttempt` sayımından hesaplanıyor (ek tablo gerekmedi).
4. ✅ **Tanıtım metni sadeleştirildi** (blok d) — artık çeldiricili mekanikle örtüşüyor.
5. ✅ **Harf seti 21 → 29** (blok d) — Ğ/İ/I/H/J/Ö/Ş/Ü eklendi, Harf Avı ile tutarlı.
6. ✅ **Yanlış cevap geri bildirimi** (blok g) — `encourageRetry` sesi + hafif shake animasyonu.
7. ✅ **Klavye-only sürükle-bırak desteği** (blok c) — `KeyboardSensor`, uçtan uca doğrulandı.
8. ✅ **Konfeti azaltıldı + reduceMotion'a bağlandı** (blok e) — 200→80 parça, `reduceMotion` açıkken hiç gösterilmiyor.
9. ✅ **PC'de içerik genişletildi** (blok c) — `xl:` kademesi eklendi.

**Bilinçli olarak kapsam dışı bırakılan (kullanıcı kararı):** Oyunun tam bir "farklı görsel/nesne" mekaniğine dönüştürülmesi — çeldiriciler de birer harf, gerçek fotoğraf/nesne karşılaştırması hâlâ yok. "Nesnelerle" modu (Hafıza Kartları'ndaki gibi) ayrı bir olası gelecek iş olarak roadmap'te kalıyor.

**Doğrulama (1. ve 2. tur birlikte):** `tsc --noEmit` ve `eslint` (tüm değişen dosyalar) temiz. Gerçek tarayıcıda (Playwright, `dev:agent`/3042) 375px/800px/1920px'te: sayfa yükleme + giriş akışı + doğru/yanlış kart sürükleme (fare) + klavye ile sürükleme (Tab→Space→ok tuşları→Space) + günlük limit ekranı + ebeveyn panelindeki yeni alan (görüntüleme + kaydetme + DB doğrulama) test edildi, konsol hatası sıfır, `scrollHeight === innerHeight` (taşma yok).

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, Harf Avı/Hafıza Kartları ile aynı insan/cihaz adımı.
- Pekiştirme yoğunluğunun aralıklı hale getirilmesi (blok a) — üç oyunda da ortak, henüz hiçbirinde ele alınmadı.
- Gerçek bir "farklı görsel/nesne" mekaniğine (Hafıza Kartları'nın "Nesnelerle" modu gibi) geçiş — kullanıcı kararıyla bu turda bilinçli olarak ertelendi.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması (blok e) — proje-geneli, diğer iki modülde de aynı not var.
- Ebeveyn panelinde `golge-eslestirme` becerisinin `ProgressTab.tsx`'te ayrıca görünür kılınması (blok b) — doğrulanmadı.
