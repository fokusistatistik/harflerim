# Harf Avı (`/games/letter-hunt`)

> Bu dosya, `moduller/` klasöründeki modül denetim dokümanlarının ilkidir — diğer oyun/araçlar (Hafıza Kartları, Sihirli Kelimeler, Gölge Eşleştirme, Aile Albümü, Çizim Tahtası, Yazı Alıştırması, Müzik Köşesi, AAC Tahtası, Kamera Karakteri, Çizgi Filmim) için de aynı yapı kullanılacak. Amaç: her modülün Faz 2.11 denetim çeklistindeki (bkz. [YOL-HARITASI.md](../YOL-HARITASI.md)) yedi bloğa göre güncel durumunu tek yerde, kanıta dayalı ve güncellenebilir şekilde tutmak.
>
> Son güncelleme: 2026-09-14.

## Özet

Sürükle-bırak mekaniğiyle çalışan bir harf tanıma oyunu: hedef harf sesli/yazılı sorulur, çocuk doğru harf kartını hedef çerçeveye sürükler. Ölçtüğü beceri `harf-tanima` (SkillAttempt), amacı harf tanıma + görsel olarak birbirine karışan harfleri (b/d, o/ö gibi) ayırt etme. Faz 3.2'de sabit 24-seviyeli sistemden adaptif zorluğa (sonsuz round) geçirildi.

**Ana dosyalar:** `src/components/game/GameBoard.tsx`, `DraggableToken.tsx`, `TargetFrame.tsx`, `HintImage.tsx`, `GameHud.tsx` · `src/store/gameData.ts` (`LETTER_OBJECTS`/`LETTER_IMAGES`/`AUDIOS`, yalnızca DB'nin seed kaynağı) · `src/actions/game.ts`, `skills.ts` · `src/lib/adaptiveDifficulty.ts`, `skillAnalytics.ts` · `prisma/seedContent.ts` (`ContentSet`/`ContentItem` — oyunun gerçek çalışma zamanı içerik kaynağı).

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Kısmen sağlam, harf-özel zekâ eksik.**

- ✅ Zorluk kademeli ve güvenli: ilk round her zaman en kolay (`BASE_ADAPTIVE_CONFIG`), 3 ardışık yanlışta anında en kolaya düşer (`adaptiveDifficulty.ts:21,30-32`).
- ✅ Sakinleştirme modu doğru bağlı: `useCalmingModeMonitor('harf-tanima')` her `handleDragEnd`'de çağrılıyor (`GameBoard.tsx`), 5 ardışık yanlışta tüm sesi kesip ebeveyne bildirim gönderiyor (çocuğa değil) — doğru tasarım.
- ✅ Rozet mekanizması spam değil: bir beceri yalnızca ilk kez doğru yapıldığında bir kez rozet veriyor (`skills.ts`).
- ⚠️ **Zorluk sistemi genel performans-bazlı, harf-bazlı değil.** `getAdaptiveConfig`/`detectErrorStreak` yalnızca `harf-tanima` skillKey'inin genel son-10-deneme başarı oranına bakıyor; "hangi harflerde zorlanıyor" bilgisi hiç kullanılmıyor. Hedef harf tamamen rastgele seçiliyor (`alphabetOrder[Math.random()...]`, `GameBoard.tsx`).
- ⚠️ Pekiştirme her tek doğru cevapta tetikleniyor (ses + konfeti + ⭐ + 1sn sonra ikinci ses) — aralıklı pekiştirme yok, aşırı-uyarıcı olma riski düşük ama var.

**Öneri:** `Event`/`SkillAttempt` tablosunda zaten `targetLetter` tutuluyor — harf-bazlı hata oranı hesaplanıp zayıf harflere ağırlıklı seçim eklenebilir (Faz 3.16'nın içerik eksikliğinden bağımsız bir iyileştirme).

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Zayıf — bu oyuna özel hiçbir ebeveyn kontrolü yok.**

- ❌ Ebeveyn panelinin hiçbir tab'ında (`ChildProfileTab`, `ScreenTimeTab`, `SensoryTab`, `ProgressTab` dahil) Harf Avı'na özel bir ayar yok: zorluk override, harf havuzu seçimi, içerik özelleştirmesi mevcut değil.
- ❌ `ProgressTab.tsx` genel kullanım süresi + rozet + audit log gösteriyor ama **beceri/harf bazlı ilerleme yok** — "hangi harflerde zorlanıyor" ebeveyn tarafından görülemiyor. `getSkillHistory`/`getCrossGameValidation` (`skillAnalytics.ts`) bu rapor için hazır ama hiçbir UI'da çağrılmıyor.
- ✅ Günlük süre limiti (global `levelStore`) doğru çalışıyor, "Başla" butonu bütçe dolunca kilitleniyor.
- ✅ (2026-09-14 eklendi) Başlangıç ekranında "Bugün X/Y doğru" özeti var — küçük ama gerçek bir ilerleme sinyali.

**Öneri:** `getSkillHistory` sonucunu `ProgressTab.tsx`'e bağlayan bir "beceri bazlı ilerleme" bölümü — bu zaten Faz 3.8'in ("içgörü raporu") kapsamına giriyor, altyapı hazır.

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

**Öneri:** `aria-live="polite"` bölgesi (durum değişimlerini duyurmak için) ve sürüklenebilir kartlara `role="button" aria-label="{harf} harfini sürükle"` — ekran okuyucu erişilebilirliği hiç ele alınmamış bir alan, ayrı bir denetim gerektirir.

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Kritik CDN sorunu bugün büyük ölçüde kapatıldı, içerik kapsamı hâlâ eksik.**

- ✅ (2026-09-14) Eski `static.fokusistatistik.com` CDN'i tamamen ölüydü (258 link, hepsi 404) — tespit edilip düzeltildi. 240 kelimenin **71'i** artık gerçek yerel görsele (`public/karsilastirma/`) bağlı, kalan 169'u `ImageWithFallback` sayesinde kırık ikon yerine zarif metin-fallback gösteriyor.
- ✅ (2026-09-14) `AUDIOS.wrong` (hâlâ ölü CDN'e bağlıydı, gözden kaçmıştı) bulunup `AUDIOS.sad`'e (yerel) birleştirildi.
- ✅ Piper TTS entegrasyonu sağlam: `/api/tts` önce denenir, başarısızsa sessizce tarayıcı `speechSynthesis`'ine düşer.
- ⚠️ **Yalnızca hedef harf sesli okunuyor, ipucu kelimesi (`currentObject.word`) hiç seslendirilmiyor** — yalnızca ekranda yazı olarak gösteriliyor. Çoklu-duyusal pekiştirme (görsel+işitsel) eksik.
- ❌ 240 kelimenin 169'u hâlâ görselsiz — bkz. Faz 3.16 (roadmap), öncelik: F/Ğ/H/I/J/N/Ö/R/U/V (1 kelime), C/İ/L/M/O/Ş/Ü/Z (2 kelime).

**Öneri:** İpucu kelimesi gösterildiğinde `speak(currentObject.word)` ile de seslendirilebilir — küçük bir ekleme, çoklu-duyusal öğrenmeyi güçlendirir.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: Zayıf — ebeveynin girdiği duyusal ayarlar oyunla hiç bağlı değil.**

- ❌ **`sensoryProfile` (Prisma, ebeveyn panelinden dolduruluyor) hiçbir oyun kodunda okunmuyor** — yalnızca yazılıyor, hiç tüketilmiyor.
- ❌ **`UserSettings.reduceMotion` alanı var ama Harf Avı'nın hiçbir bileşeninde kontrol edilmiyor** — Framer Motion animasyonları (ipucu pulse'ı `repeat: Infinity`, hata shake'i) bu ayardan tamamen bağımsız çalışıyor.
- ⚠️ İpucu gösterimindeki pulse+glow animasyonu **sonsuz döngü** (`repeat: Infinity, repeatDelay: 1`) — ipucu görünür kaldığı sürece durmuyor, duyusal hassasiyeti olan bir çocuk için potansiyel rahatsızlık kaynağı.
- Renk kontrastı kod-seviyesinde kesin ölçülemedi (tahmini: metin kontrastı yeterli, dolgu renkleri dekoratif).

**Öneri:** Bu proje genelinde bir "duyusal profil → oyun davranışı" köprüsü eksik. `reduceMotion=true` iken global bir Framer Motion `transition={{duration:0}}` override'ı mantıklı bir ilk adım olur; bu tek oyuna özel değil, mimari bir boşluk.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Genel olarak sağlam, iki küçük tutarsızlık.**

- ✅ `recordSkillAttempt`/`getTodaySkillStats` doğru şekilde `getCurrentUser()` ile doğrulanıyor, sorgular `userId` ile filtreleniyor.
- ✅ Client'a sızan hassas veri yok.
- ⚠️ `getAdaptiveRoundConfig` auth yoksa `redirect` yerine sessizce `BASE_ADAPTIVE_CONFIG` döndürüyor — `getDailySession`'ın (`redirect('/giris')`) tersine bir davranış. Zararsız (en kolay zorluk döner) ama tutarsız.
- ⚠️ `submitLevelResult`, `sessionId`'nin var olup olmadığını kontrol ediyor ama **çağıranın o session'ın gerçek sahibi olduğunu (`userId` eşleşmesi) doğrulamıyor** — düşük risk (UUID tahmin edilemez) ama açık bir yetki kontrolü eksik.

**Öneri:** `submitLevelResult`'a `session.userId === user.id` kontrolü eklenmesi; auth-yoksa-davranış tutarsızlığının bilinçli mi yoksa gözden kaçmış mı olduğunun netleştirilmesi.

---

## Blok (g) — Ses/görsel efekt yeterliliği ve ihtiyaç tespiti

**Durum: Büyük ölçüde kapsanmış, bir sessiz nokta var.**

- ✅ Doğru cevap: ses + konfeti + ⭐ + rozet — tam kapsanmış.
- ✅ Yanlış cevap: ses (artık doğru kaynağa bağlı) + shake animasyonu + TTS teşvik + toast — tam kapsanmış.
- ✅ Sürükleme başlangıcı/bırakma: görsel geri bildirim var (büyüme, hedef üstünde renk değişimi).
- ❌ **İpucu gösterimi tamamen sessiz** — yalnızca görsel pulse animasyonu, hiçbir ses/TTS tetiklenmiyor.

**Öneri:** İpucu belirdiğinde hafif bir "dikkat" sesi (chime) eklenebilir — blok (d)'deki "ipucu kelimesi seslendirilmiyor" bulgusuyla aynı kökten, birlikte ele alınabilir.

---

## Genel geliştirme önerileri (öncelik sırasıyla değil)

1. Harf-bazlı zayıflık takibi (blok a) — mevcut veri altyapısı yeterli, yalnızca `startRound`'da seçim mantığı eklenmeli.
2. `ProgressTab.tsx`'e beceri/harf bazlı ilerleme özeti (blok b) — `skillAnalytics.ts` fonksiyonları hazır, bağlanmamış.
3. Ekran okuyucu erişilebilirliği (blok c) — `aria-live`, `role`/`aria-label` hiç yok.
4. İpucu kelimesinin sesli okunması (blok d/g) — küçük, yüksek etkili bir ekleme.
5. Kalan 169 kelimenin görsel eksikliği (blok d) — Faz 3.16, roadmap'te zaten takipte.
6. `sensoryProfile`/`reduceMotion` → oyun davranışı köprüsü (blok e) — mimari boşluk, tek oyuna özel değil.
7. `submitLevelResult` yetki kontrolü sıkılaştırması (blok f).
8. `gameData.ts`'in yalnızca "seed kaynağı" olduğunu netleştiren bir dosya-başı not — gerçek çalışma zamanı içeriği DB'den (`ContentSet`/`ContentItem`) geliyor, bu ayrım koda yeni bakan biri için açık değil.

---

## Bugüne kadar kapatılan işler (özet, tarihli)

- 2026-09-14: Ğ harfi eklendi, `SIMILAR_MAPPING` tüm 29 harfi kapsayacak şekilde tamamlandı, dağılım dengesizlikleri (N/O/Ö/U/V) giderildi, çift-kelimeli kayıtlar temizlendi.
- 2026-09-14: Ölü CDN referansları (`static.fokusistatistik.com`) `LETTER_OBJECTS`'ten tamamen kaldırıldı; 71 kelime gerçek yerel görsele bağlandı (9 yeni görsel + 58 zaten var olan `karsilastirma/` görseliyle otomatik eşleştirme).
- 2026-09-14: Sonsuz-round bug'ı (her doğru cevaptan sonra başlangıç ekranına dönme) düzeltildi, "Tur N" göstergesi eklendi.
- 2026-09-14: Başarı sesleri yumuşatıldı (win.mp3/bonus.mp3); ayrı bir denetimde `AUDIOS.wrong`'un hâlâ ölü CDN'e bağlı kaldığı bulunup düzeltildi.
- 2026-09-14: Mobil/masaüstü HUD-kart çakışma bug'ı düzeltildi.
- 2026-09-14: Sayfa yenilenince "Başla" ekranına dönme sorunu (sessionStorage ile) ve "Bugün X/Y doğru" özeti eklendi.
- 2026-09-14: Arka plan bildirimi eşiği 15 saniyeden 5 dakikaya çıkarıldı.

## Açık kalan işler (roadmap referansı)

- **Faz 3.16** — Harf Avı güçlendirilecek harfler (169 kelimenin görsel eksikliği).
- Bu dokümandaki blok (b), (e) bulguları henüz roadmap'e madde olarak işlenmedi — gerekirse Faz 3'e yeni bir madde olarak eklenebilir.
