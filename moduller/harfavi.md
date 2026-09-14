# Harf Avı (`/games/letter-hunt`)

> Bu dosya, `moduller/` klasöründeki modül denetim dokümanlarının ilkidir — diğer oyun/araçlar (Hafıza Kartları, Sihirli Kelimeler, Gölge Eşleştirme, Aile Albümü, Çizim Tahtası, Yazı Alıştırması, Müzik Köşesi, AAC Tahtası, Kamera Karakteri, Çizgi Filmim) için de aynı yapı kullanılacak. Amaç: her modülün Faz 2.11 denetim çeklistindeki (bkz. [YOL-HARITASI.md](../YOL-HARITASI.md)) yedi bloğa göre güncel durumunu tek yerde, kanıta dayalı ve güncellenebilir şekilde tutmak.
>
> Son güncelleme: 2026-09-14 (denetim önerilerinin tamamı uygulandı).

## Özet

Sürükle-bırak mekaniğiyle çalışan bir harf tanıma oyunu: hedef harf sesli/yazılı sorulur, çocuk doğru harf kartını hedef çerçeveye sürükler. Ölçtüğü beceri `harf-tanima` (SkillAttempt), amacı harf tanıma + görsel olarak birbirine karışan harfleri (b/d, o/ö gibi) ayırt etme. Faz 3.2'de sabit 24-seviyeli sistemden adaptif zorluğa (sonsuz round) geçirildi.

**Ana dosyalar:** `src/components/game/GameBoard.tsx`, `DraggableToken.tsx`, `TargetFrame.tsx`, `HintImage.tsx`, `GameHud.tsx` · `src/store/gameData.ts` (`LETTER_OBJECTS`/`LETTER_IMAGES`/`AUDIOS`, yalnızca DB'nin seed kaynağı) · `src/actions/game.ts`, `skills.ts` · `src/lib/adaptiveDifficulty.ts`, `skillAnalytics.ts` · `prisma/seedContent.ts` (`ContentSet`/`ContentItem` — oyunun gerçek çalışma zamanı içerik kaynağı).

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Sağlam — harf-özel zekâ eklendi.**

- ✅ Zorluk kademeli ve güvenli: ilk round her zaman en kolay (`BASE_ADAPTIVE_CONFIG`), 3 ardışık yanlışta anında en kolaya düşer (`adaptiveDifficulty.ts:21,30-32`).
- ✅ Sakinleştirme modu doğru bağlı: `useCalmingModeMonitor('harf-tanima')` her `handleDragEnd`'de çağrılıyor (`GameBoard.tsx`), 5 ardışık yanlışta tüm sesi kesip ebeveyne bildirim gönderiyor (çocuğa değil) — doğru tasarım.
- ✅ Rozet mekanizması spam değil: bir beceri yalnızca ilk kez doğru yapıldığında bir kez rozet veriyor (`skills.ts`).
- ✅ (2026-09-14) **Harf-bazlı zayıflık takibi eklendi.** `getAdaptiveRoundConfig` artık son 20 `Event`'te en yüksek yanlış oranına sahip harfleri (`weakLetters`, en fazla 3) hesaplıyor (`actions/game.ts` → `getWeakLetters`); `GameBoard.tsx` hedef harfi %50 olasılıkla bu listeden seçiyor (tam öncelik değil — çeşitlilik korunuyor, sıkıcı tekrar döngüsüne girmiyor).
- ⚠️ Pekiştirme her tek doğru cevapta tetikleniyor (ses + konfeti + ⭐ + 1sn sonra ikinci ses) — aralıklı pekiştirme yok, aşırı-uyarıcı olma riski düşük ama var. (Henüz ele alınmadı.)

---

## Blok (b) — Ebeveyn deneyimi

**Durum: İyileşti — beceri ilerlemesi artık görünür, zorluk override hâlâ yok.**

- ❌ Ebeveyn panelinin hiçbir tab'ında Harf Avı'na özel bir zorluk override'ı veya harf havuzu seçimi yok. (Henüz ele alınmadı — bilinçli bir sonraki adım olabilir.)
- ✅ (2026-09-14) **`ProgressTab.tsx`'e "Beceri ilerlemesi" bölümü eklendi.** Yeni `getAllSkillProgress()` action'ı (`skills.ts`) her becerinin son-10-deneme başarı oranını (`detectErrorStreak`'in ham verisi) ilerleme çubuğuyla gösteriyor — yorum/sıralama içermiyor. Gerçek tarayıcıda doğrulandı (El Yazısı %100, Görsel Hafıza %40 gibi).
- ✅ Günlük süre limiti (global `levelStore`) doğru çalışıyor, "Başla" butonu bütçe dolunca kilitleniyor.
- ✅ (2026-09-14) Başlangıç ekranında "Bugün X/Y doğru" özeti var — küçük ama gerçek bir ilerleme sinyali.

**Öneri:** Harf-bazlı zorluk override (ör. ebeveynin belirli harfleri manuel olarak "sık sor" işaretlemesi) hâlâ yok — blok (a)'daki otomatik ağırlıklandırmayı tamamlayıcı bir sonraki adım olabilir.

---

## Blok (c) — UI/UX

**Durum: Bugün kapsamlı şekilde düzeltildi.**

- ✅ (2026-09-14) "Tur N" göstergesi eklendi, mobil/masaüstü HUD-kart çakışma bug'ı düzeltildi.
- ✅ (2026-09-14) Sonsuz round akışı: doğru cevap sonrası artık başlangıç ekranına dönmüyor.
- ✅ (2026-09-14) Sayfa yenilenince/tekrar girilince oyun ekranına otomatik dönüyor (sessionStorage).
- ✅ Dokunma hedefleri WCAG 44px standardını karşılıyor/aşıyor (`DraggableToken` mobilde 80px).
- ✅ `disabled` durumları görsel olarak net (opacity + renk farkı).
- ⚠️ Erişilebilirlik etiketleri eksik: sürüklenebilir kartlarda `role`/`aria-label` yok, doğru/yanlış durum değişimi `aria-live` ile duyurulmuyor — ekran okuyucu kullanıcıları için oyun büyük ölçüde erişilemez.
- ✅ (2026-09-14) `handleDragStart` tip güvenliği düzeltildi (`any` → `DragStartEvent`).
- ✅ (2026-09-14) **Erişilebilirlik etiketleri eklendi.** `DraggableToken`'a harf-özel `aria-label` ("X harfi, sürüklenebilir"), `TargetFrame`'e `aria-live="polite"` durum duyurusu ("Doğru!"/"Tekrar deneyelim"). Not: dnd-kit zaten `role`/`aria-roledescription`/`tabIndex` gibi temel özellikleri `attributes` ile sağlıyordu — eksik olan asıl harf-özel etiketti.

**Kalan:** Ekran okuyucu deneyimi kod-seviyesinde iyileşti ama gerçek bir ekran okuyucuyla (VoiceOver/NVDA) uçtan uca test edilmedi — bu bir insan/cihaz adımı.

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Kritik CDN sorunu bugün büyük ölçüde kapatıldı, içerik kapsamı hâlâ eksik.**

- ✅ (2026-09-14) Eski `static.fokusistatistik.com` CDN'i tamamen ölüydü (258 link, hepsi 404) — tespit edilip düzeltildi. 240 kelimenin **71'i** artık gerçek yerel görsele (`public/karsilastirma/`) bağlı, kalan 169'u `ImageWithFallback` sayesinde kırık ikon yerine zarif metin-fallback gösteriyor.
- ✅ (2026-09-14) `AUDIOS.wrong` (hâlâ ölü CDN'e bağlıydı, gözden kaçmıştı) bulunup `AUDIOS.sad`'e (yerel) birleştirildi.
- ✅ Piper TTS entegrasyonu sağlam: `/api/tts` önce denenir, başarısızsa sessizce tarayıcı `speechSynthesis`'ine düşer.
- ✅ (2026-09-14) **İpucu kelimesi artık sesli okunuyor.** `startRound`'da `askLetter(harf).then(() => speak(kelime))` — art arda, çakışmadan (`GameBoard.tsx`). Gerçek tarayıcıda 2 ayrı TTS isteği ile doğrulandı.
- ❌ 240 kelimenin 169'u hâlâ görselsiz — bkz. Faz 3.16 (roadmap), öncelik: F/Ğ/H/I/J/N/Ö/R/U/V (1 kelime), C/İ/L/M/O/Ş/Ü/Z (2 kelime). (Görsel bulma/üretme işi, kod değil — kullanıcı sürecinde devam ediyor.)

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: reduceMotion köprüsü kuruldu (tüm oyunları kapsıyor), sensoryProfile hâlâ bağlı değil.**

- ✅ (2026-09-14) **`reduceMotion` artık Framer Motion'a da bağlı.** Yeni `MotionPreference.tsx` (kök `layout.tsx`'te) Framer Motion'ın kendi `MotionConfig reducedMotion="always"` provider'ını kullanıyor — tek bir yerden TÜM oyunlardaki `motion.*` animasyonlarını (yalnızca Harf Avı değil, Hafıza Kartları/Sihirli Kelimeler/Gölge Eşleştirme dahil tüm oyunlar) kapsıyor. Daha önce yalnızca CSS geçiş süreleri (`--papatya-duration-*`) bu ayara bağlıydı. Gerçek tarayıcıda doğrulandı: `reduceMotion=true` iken oyun akışı (round geçişi, eşleşme, toast) bozulmadan devam ediyor.
- ❌ **`sensoryProfile` (ses/ışık/dokunma hassasiyeti JSON'u) hâlâ hiçbir oyun kodunda okunmuyor** — yalnızca yazılıyor. Bu daha karmaşık bir iş (JSON yorumlama gerektiriyor, `reduceMotion` gibi tek bir boolean değil), henüz ele alınmadı.
- ⚠️ İpucu gösterimindeki pulse+glow animasyonu artık `reduceMotion` açıkken duruyor (yukarıdaki köprü sayesinde), ama varsayılan (reduceMotion kapalı) durumda hâlâ sonsuz döngü — bu tasarım gereği, ebeveyn açıkça "hareketi azalt"ı seçmedikçe değişmiyor.

**Öneri:** `sensoryProfile` JSON'unun (`{sound, light, touch}`) oyun davranışına bağlanması hâlâ ayrı bir iş — ör. `sound: "high"` iken ses seviyesi otomatik kısılabilir. Kapsamlı bir tasarım kararı gerektiriyor, tek oturumda ele alınmadı.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Genel olarak sağlam, iki küçük tutarsızlık.**

- ✅ `recordSkillAttempt`/`getTodaySkillStats` doğru şekilde `getCurrentUser()` ile doğrulanıyor, sorgular `userId` ile filtreleniyor.
- ✅ Client'a sızan hassas veri yok.
- ⚠️ `getAdaptiveRoundConfig` auth yoksa `redirect` yerine sessizce `BASE_ADAPTIVE_CONFIG` döndürüyor — `getDailySession`'ın (`redirect('/giris')`) tersine bir davranış. Zararsız (en kolay zorluk döner) ama tutarsız. (Bilinçli bir tasarım kararı olarak bırakıldı — çocuk deneyimini bloklamamak için.)
- ✅ (2026-09-14) **`submitLevelResult`'a sahiplik kontrolü eklendi.** Artık `getCurrentUser()` çağırıp `session.userId === user.id` doğruluyor — önceden yalnızca `sessionId`'nin var olup olmadığına bakılıyordu. 2 yeni test eklendi (auth yok / başka kullanıcının session'ı).

**Kalan:** Auth-yoksa-davranış tutarsızlığı (bir action redirect, diğeri sessiz fallback) bilinçli bir tasarım tercihi olarak değerlendirildi, değiştirilmedi.

---

## Blok (g) — Ses/görsel efekt yeterliliği ve ihtiyaç tespiti

**Durum: Büyük ölçüde kapsanmış, bir sessiz nokta var.**

- ✅ Doğru cevap: ses + konfeti + ⭐ + rozet — tam kapsanmış.
- ✅ Yanlış cevap: ses (artık doğru kaynağa bağlı) + shake animasyonu + TTS teşvik + toast — tam kapsanmış.
- ✅ Sürükleme başlangıcı/bırakma: görsel geri bildirim var (büyüme, hedef üstünde renk değişimi).
- ⚠️ İpucu gösterimi hâlâ görsel-ağırlıklı (pulse animasyonu) — ama blok (d)'deki düzeltmeyle artık round başında kelime zaten sesli okunuyor, bu yüzden "tamamen sessiz" bulgusu kısmen kapandı. İpucuya özel ayrı bir "dikkat" sesi (chime) hâlâ yok — küçük bir iyileştirme alanı olarak kalıyor.

**Öneri:** İpucu belirdiği anda hafif bir chime eklenebilir — küçük, isteğe bağlı bir ekleme.

---

## Genel geliştirme önerileri — durum (2026-09-14 turunda 8/8 uygulandı)

1. ✅ Harf-bazlı zayıflık takibi (blok a).
2. ✅ `ProgressTab.tsx`'e beceri/harf bazlı ilerleme özeti (blok b).
3. ✅ Erişilebilirlik etiketleri — `aria-label`, `aria-live` (blok c). *(Gerçek ekran okuyucu testi hâlâ bir insan/cihaz adımı.)*
4. ✅ İpucu kelimesinin sesli okunması (blok d/g).
5. ⏳ Kalan 169 kelimenin görsel eksikliği (blok d) — Faz 3.16, roadmap'te takipte, kod dışı bir iş (görsel bulma/üretme).
6. ✅ `reduceMotion` → oyun davranışı köprüsü (blok e) — tüm oyunları kapsayacak şekilde kuruldu. *(`sensoryProfile` JSON'u hâlâ bağlı değil, ayrı ve daha karmaşık bir iş.)*
7. ✅ `submitLevelResult` yetki kontrolü sıkılaştırması (blok f).
8. ✅ `gameData.ts`'e "yalnızca seed kaynağı" notu (blok f/genel).

**Yeni ortaya çıkan, henüz ele alınmayan öneriler:**
- `sensoryProfile` JSON'unun oyun davranışına bağlanması (blok e) — `reduceMotion`'dan daha karmaşık, ayrı bir tasarım turu gerektiriyor.
- Ebeveyn panelinden harf-bazlı zorluk override'ı (blok b) — otomatik ağırlıklandırmayı (madde 1) tamamlayıcı manuel kontrol.
- Pekiştirme yoğunluğunun aralıklı hale getirilmesi (blok a) — her tek doğru cevapta değil, ör. her 2-3 doğruda bir tam kutlama.
- İpucuya özel bir "dikkat" sesi/chime (blok g) — küçük, isteğe bağlı.
- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi (blok c) — insan/cihaz adımı.

---

## Bugüne kadar kapatılan işler (özet, tarihli)

- 2026-09-14: Ğ harfi eklendi, `SIMILAR_MAPPING` tüm 29 harfi kapsayacak şekilde tamamlandı, dağılım dengesizlikleri (N/O/Ö/U/V) giderildi, çift-kelimeli kayıtlar temizlendi.
- 2026-09-14: Ölü CDN referansları (`static.fokusistatistik.com`) `LETTER_OBJECTS`'ten tamamen kaldırıldı; 71 kelime gerçek yerel görsele bağlandı (9 yeni görsel + 58 zaten var olan `karsilastirma/` görseliyle otomatik eşleştirme).
- 2026-09-14: Sonsuz-round bug'ı (her doğru cevaptan sonra başlangıç ekranına dönme) düzeltildi, "Tur N" göstergesi eklendi.
- 2026-09-14: Başarı sesleri yumuşatıldı (win.mp3/bonus.mp3); ayrı bir denetimde `AUDIOS.wrong`'un hâlâ ölü CDN'e bağlı kaldığı bulunup düzeltildi.
- 2026-09-14: Mobil/masaüstü HUD-kart çakışma bug'ı düzeltildi.
- 2026-09-14: Sayfa yenilenince "Başla" ekranına dönme sorunu (sessionStorage ile) ve "Bugün X/Y doğru" özeti eklendi.
- 2026-09-14: Arka plan bildirimi eşiği 15 saniyeden 5 dakikaya çıkarıldı.
- 2026-09-14: Denetimde bulunan `AUDIOS.wrong`'un hâlâ ölü CDN'e bağlı kalması ve `handleDragStart`'ın tip güvenliği düzeltildi.
- 2026-09-14: Kapsamlı denetimin 8 geliştirme önerisinin tamamı uygulandı — erişilebilirlik etiketleri, ipucu kelimesinin seslendirilmesi, `submitLevelResult` yetki kontrolü, `gameData.ts` notu (küçük); harf-bazlı zayıflık takibi, `ProgressTab`'e beceri ilerlemesi (orta); `reduceMotion` → Framer Motion köprüsü — tüm oyunları kapsıyor (mimari).

## Açık kalan işler (roadmap referansı)

- **Faz 3.16** — Harf Avı güçlendirilecek harfler (169 kelimenin görsel eksikliği). Kod dışı, görsel bulma/üretme işi.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması — henüz roadmap'e madde olarak işlenmedi.
- Ebeveyn panelinden harf-bazlı zorluk override'ı — henüz roadmap'e madde olarak işlenmedi.
- Gerçek ekran okuyucu testi ve klinik/pedagojik uzman denetimi (blok a, c) — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, ayrı insan/cihaz adımları.
