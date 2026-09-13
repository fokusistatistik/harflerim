# Papatya — Yapılanlar

**13 Eylül 2026 itibarıyla**

Bu belge, [YOL-HARITASI.md](YOL-HARITASI.md)'de tamamlanan maddelerin özetini tutar. Ayrım şu şekildedir: **YOL-HARITASI.md** yalnızca planlanan/henüz açık işi tarif eder; bu belge ise tamamlanmış işlerin kısa bir kaydıdır — roadmap'in kendisi her tamamlanan maddenin uzun açıklamasıyla şişmesin diye buraya taşınmıştır (kopyalanmamıştır — roadmap'teki karşılıkları kısaltılıp buraya yönlendirilmiştir).

Süreç kuralları (nasıl çalışıldığı) için [GENEL-KURALLAR.md](GENEL-KURALLAR.md) ve [LOOP-KURALLARI.md](LOOP-KURALLARI.md) geçerliliğini korur.

---

## Faz 1 — Temel & Kimlik (27/27 madde tamamlandı)

Eski **1.15** (hesap silme akışı), Faz 3.11'in şifreli yedekleme mekanizmasına bağımlı olduğu için 2026-09-13'te **Faz 3'e taşındı** (bkz. YOL-HARITASI.md, madde 3.11b) — Faz 1'in kendi listesinde artık açık bir kalem yok.

| # | İş | Özet |
|---|---|---|
| 1.1 | Kullanıcı ve kimlik altyapısı | `User`/`UserSettings`/`AuthSession` şeması, bcrypt hash'li parola, 30 günlük oturum çerezi. Seed kullanıcısı Melike Bostanoğlu (`Melike`/`1234`). Kayıt ekranı yok — ileride e-posta/telefon/Gmail doğrulamalı kayıt eklenecek. |
| 1.2 | Dinamik kimlik: "Adının Dünyası" | `brand.ts` Türkçe ünlü uyumuna göre isimden başlık türetir (Melike → *Melike'nin Dünyası*). Uygulama adı ve kişi adları tek kaynaktan okunur. |
| 1.3 | Tek giriş, korumalı yönetim alanı | Header logosuna ~700ms uzun basma ebeveyn PIN istemini açar. `parentPin` artık bcrypt hash (önceden düz metin "0000"). PIN değiştirme formu ve çıkış kontrolü aynı panelde. |
| 1.4 | İçeriği veritabanına taşı | `gameData.ts`'teki 28 harf grubu/230 kelime `ContentSet`/`ContentItem`'a taşındı (idempotent, doğrulanmış tohumlama betiği). Oyunlar artık `getGameContent()` ile veritabanından besleniyor. |
| 1.4b | Çocuk profili şeması | `UserSettings`'e opsiyonel alanlar (yaş, cinsiyet, favori renk, ilgi alanları, öğrenme kanalı, duyusal profil, tetikleyiciler/sakinleştiriciler, iletişim düzeyi), tip güvenceli yardımcılarla (`childProfile.ts`). Tanı aracı değil; henüz hiçbir UI'dan doldurulmuyor (Faz 2.1 bekliyor). |
| 1.5 | Seslendirmeyi aç | `AudioProvider` etkinleştirildi, üç oyuna Türkçe seslendirme bağlandı. İlk kullanıcı etkileşimine kadar sessiz (autoplay politikası). |
| 1.6 | Tasarım tokeni katmanı | Renk/boşluk/yarıçap/animasyon süresi CSS değişkenlerine taşındı, açık+koyu mod birlikte, Tailwind `papatya.*` namespace. Bileşen içi tam migrasyon 1.9'da tamamlandı. |
| 1.7 | Üç cihaz ölçeklemesi | Akışkan tipografi (`clamp()`), 44px dokunma hedefi, `lg:`/`xl:` kırılma noktaları — Header, ana sayfa ve dört oyunun tamamında. |
| 1.8 | Ortak oyun soyutlaması | "Ortak kabuk, ayrı ilerleme modelleri" (kullanıcı onaylı karar): `GameHud`, `useRewardMoment` (papatya renkli konfeti), `useHintTimer` paylaşılan bileşenler; `useGameDayBudget` ile dört oyun da günlük süre bütçesine bağlı. Visual Match'in bozuk ses dosyaları düzeltilip 4. oyun olarak eklendi. |
| 1.9 | Papatya görsel kimliği (teknik iskele) | Açılış animasyonu (yapraklar sırayla açılır, `prefers-reduced-motion` uyumlu) ve zaman oranına göre dolan sekiz yapraklı ilerleme göstergesi. Gerçek logo/marka görseli üretimi bilerek kapsam dışı — placeholder (864×864) kullanımda, kullanıcı kendi görselini hazırlayınca paylaşacak. |
| 1.10 | Ekran sağlığı temeli | Doğal bitiş ekranı (`DayComplete`) temadan bağımsız tokenlere taşındı. Denetimde gerçek bir ihlal bulundu ve düzeltildi: Sihirli Kelimeler'deki "SKOR" göstergesi (puan/sıralama yasağını ihlal ediyordu) kaldırıldı. |
| 1.11 | Gerçek çevrimdışı çalışma | `next-pwa`'ya kendi içerik alan adımız ve sabit ses efektleri için önceliklendirilmiş, yüksek kapasiteli `runtimeCaching` kuralları eklendi (repoya dosya kopyalanmadı). Prod build ile doğrulandı. |
| 1.12 | Test ve deneme protokolü | Vitest + RTL kuruldu, kritik akışlar için 20 otomatik test. Playwright/uçtan-uca test ayrı bırakıldı. |
| 1.13 | Audit log altyapısı | `AuditLog` tablosu + `logAudit()`; giriş/çıkış/başarısız giriş/ebeveyn kapısı/PIN değişimi olaylarına bağlandı. Gelecekteki olaylar "provisional" tanımlı. |
| 1.14 | Merkezi bildirim altyapısı | Toast kuyruğu ve `ToastHost`; üç oyunun geri bildirimi buradan geçiyor. `'parent'` kapsamı 1.16'da gerçek tüketicisine kavuştu. |
| 1.16 | Arka plan geçiş bildirimi | Page Visibility API ile ~15sn+ arka planda kalınıp geri dönüldüğünde ebeveyne toast gider (`useBackgroundAwareness`) — `'parent'` bildirim kanalının ilk gerçek tüketicisi. |
| 1.17 | Duyusal ayarların merkezi bağlanması | `dailyScreenLimit` artık tüm oyunlar genelinde tek bir günlük bütçe (yeni `DailyUsage` tablosu); `reduceMotion`/`highContrast`/`speechEnabled` gerçekten bağlandı. |
| 1.18 | Navigasyon iskeleti ve çıkış kontrolü | Çıkış kontrolü ebeveyn kapısına eklendi. `navAreas.ts` + `NavGrid`: Faz 1-3'te planlanan 10 alanın tamamı en az bir yuva olarak menüde. `Header`/`ParentFooter` token katmanına taşındı. |
| 1.19 | Aile/Guardian veri modeli (yalnızca şema) | Yeni `Guardian` tablosu + `User.guardianId` (nullable) — Faz 3.12'nin "tek bir ebeveyn PIN'i tüm çocuk profillerini yönetir" gerekliliği için hazır bekliyor. Mevcut `parentPin`/`ParentGate` akışına dokunulmadı, 1.4b ile aynı desen. |
| 1.20 | Beceri/kazanım (Skill) katmanı | Oyun-bağımsız `Skill`/`SkillAttempt` tabloları + `recordSkillAttempt()`. **Dört oyunun tamamı** (Harf Avı, Hafıza Kartları, Sihirli Kelimeler, Görsel Eşleştirme) kendi denemesini buraya da yazıyor — Faz 3.1/3.2/3.8/2.8b'nin dayanacağı ölçüm temeli. Zorluk ayarlama mantığı hâlâ Faz 3.1'in işi. |
| 1.21 | Dil/metin katmanını tekilleştir | `src/locales/tr.json` artık gerçek tek kaynak (`t()`/`tArray()` yardımcılarıyla, `src/lib/i18n.ts`); `useTurkishSpeech.ts`'teki hardcoded/çakışan diziler kaldırıldı. Çoklu dile geçiş (Faz 4.3) için temel hazır, dil seçme UI'ı kapsam dışı. |
| 1.22 | Oyun ilerlemesini tam veritabanına taşı | Hafıza Kartları ve Sihirli Kelimeler artık `localStorage` kullanmıyor — ilerleme `Session` tablosunda (yeni `advanceGameLevel()`), deneme kayıtları `SkillAttempt`'te. "İlerlemesi hesabına kaydedilir" vaadi artık dört oyun için de gerçek. |
| 1.23 | Kişiselleştirme: hardcoded "Melike" metni | Harf Avı'ndaki sabit "Melike ile Harfleri Keşfet" metni oturumdaki kullanıcının `firstName`'ine bağlandı. Avatar görseli kasıtlı olarak değiştirilmedi (Faz 2.2'nin işi). |
| 1.24 | ParentFooter'ı oyun-bağımsız hale getir | "Seviye X/24" (yalnızca Harf Avı'na özeldi) yerine `dailyScreenSeconds`/`dailyScreenLimit` tabanlı genel "Bugün: X/Y dk" göstergesi — hangi oyun oynanırsa oynansın doğru bilgi gösteriyor. |
| 1.25 | Ekran sağlığı test kapsamı | `src/lib/dailyUsage.ts` için 9 birim test (limit altı/üstü/tam sınırda/zaten tamamlanmış senaryoları) — daha önce yalnızca dolaylı test ediliyordu. |
| 1.26 | Küçük temizlik | `README.md` gerçek Papatya mimarisini anlatacak şekilde yeniden yazıldı. `magic-words`/`memory-match` sayfalarındaki Next.js `viewport` metadata uyarısı giderildi. |

*(Uzman denetimi ve gerçek-cihaz QA notları 2026-09-13'te Faz 3'e taşındı — bkz. YOL-HARITASI.md'nin Faz 3 kapanışındaki birleştirilmiş notlar.)*

---

## Faz 2 — Zenginleşme (10/10 madde tamamlandı)

| # | İş | Özet |
|---|---|---|
| 2.1 | Ebeveyn yönetim alanı | ParentGate'in kilit-açık paneli sekmeli hale getirildi (Genel/Aile Bireyleri/Müzik/Videolar/Çocuk Profili/Duyusal/Ekran Süresi/İlerleme). Yeni server action'lar: `getUsageStats` (toplam/ortalama/bugün), Faz 1.4b'nin çocuk profili alanları için ilk gerçek okuma/yazma yolu (`getChildProfile`/`updateChildProfile`), mevcut `dailyScreenLimit`/duyusal toggle'lar için `getParentPreferences`/`updateScreenTimeLimit`/`updateSensoryToggles`. |
| 2.2 | Aile bireyleri kaydı | Yeni `FamilyMember` modeli + yeni yerel dosya depolama altyapısı (`src/lib/mediaStorage.ts`, `public/uploads/` — katı yerel işleme ilkesi gereği asla buluta/DB'ye/repoya gitmez). Fotoğraf zorunlu, ses kaydı tarayıcı MediaRecorder API'siyle isteğe bağlı. Yalnızca ebeveyn ekler/siler. |
| 2.3 | Müzik köşesi | Yeni `Song`/`SongPlayCount` modelleri, YouTube oEmbed ile (API anahtarı gerekmeden) başlık/kapak çekme, IFrame Player API ile kontrollü oynatma (otomatik sonraki şarkı yok). Her şarkı için genel günlük ekran bütçesine ek, şarkı bazlı bir günlük tekrar hakkı. İçerik kontrol listesi onayı zorunlu. |
| 2.4 | Melike'nin çizgi filmi | **Kapsamı daraltıldı**: gerçek AI video/görsel üretimi bu loop'ta yapılmadı (dış API/bütçe kararı gerektiriyor, Faz 4.2'ye ertelendi). Bunun yerine ebeveynin yüklediği hazır video/resimli hikâyeyi 2.3 ile aynı kontrollü kabukta oynatan bir `Video` modeli ve native `<video>` oynatıcı. |
| 2.5 | Aile albümü oyunu | 2.2'deki gerçek aile fotoğraflarıyla "bu kim?" eşleştirmesi — ortak kabuk deseni (GameHud/useRewardMoment/useHintTimer/useGameDayBudget). Yeni skillKey `sosyal-tanima`. 2'den az aile bireyi varken nazik bir uyarı gösterir. |
| 2.6 | Çizim tahtası | Native canvas + pointer events (harici kütüphane yok). Sınırlı/sakin papatya paleti, vuruş-bazlı tek adımlık geri alma. PNG olarak yerel dosya sistemine kaydedilir (yeni `Drawing` modeli), geçmiş çizimler galeri olarak gösterilir — başarı ölçütü değil. |
| 2.7 | Yazı alıştırması | opentype.js ile Patrick Hand yazı tipinden (OFL lisanslı) 28 harfin glyph outline'ları derleme zamanında SVG path'lerine çevrilip `src/data/letterPaths.json`'a yazıldı (`npm run generate:letter-paths` ile yeniden üretilebilir) — çalışma zamanında font parse edilmez. Kılavuzlu ve serbest yazma modları. Yeni skillKey `el-yazisi` (doğru/yanlış yok, yalnızca pratik kaydı). |
| 2.8 | Günlük rutin ve oyunlaştırma | Ana sayfaya "Bugün" özeti eklendi: sekiz sabit etkinlik — bilerek Faz 1.9'daki sekiz yapraklı papatya metaforuyla örtüşüyor. "Yapıldı" durumu SkillAttempt/SongPlayCount/Drawing tablolarından çıkarılıyor. Puan/sıralama/seri yok. |
| 2.8b | Beceri rozetleri | Yeni `Badge` modeli (`@@unique([userId, skillId])`) — bir beceri ilk kez `isCorrect:true` ile tamamlandığında `recordSkillAttempt()` içinde otomatik, emoji tabanlı ve sabit bir rozet kazanılır. Puan/sıralama/seri yok. İlerleme sekmesine rozet listesi eklendi. |
| 2.9 | Sözlü onay mekanizması | Sihirli Kelimeler'in konuşma tanıma altyapısı genel bir hook'a çıkarıldı: `useVoiceConfirm(targetWord, onConfirmed, enabled)`. Aile Albümü oyununa EK bir onay yolu olarak bağlandı — dokunmatik yol her zaman birincil ve çalışır durumda kalır. |
| 2.10 | İlgi alanı aksan katmanı | 1.4b'deki `interests` alanına göre lucide-react'ten (özel illüstrasyon yok) uygun bir ikon seçilip ana sayfada avatarın üzerine küçük bir rozet olarak eklendi. Papatya logosu/renk paleti/sekiz yapraklı metafor sabit kalır. |

**Kapanış notu (2026-09-13)** — Faz 2'nin tamamı bir loop'ta tamamlandı. Hiçbir Python servisi kurulmadı (Faz 3'e bırakıldı, baştan kesin sınır olarak belirlendi). Yeni Prisma modelleri: `FamilyMember`, `Song`/`SongPlayCount`, `Video`, `Drawing`, `Badge`. `src/lib/mediaStorage.ts` yerel dosya depolama katmanı artık tüm kullanıcı-yüklenen medyanın (fotoğraf, ses, video, çizim) tek kaynağı.

---

## Faz 3 — Zeka Katmanı (7/17 madde tamamlandı, sürüyor)

Her madde ayrı bir loop'ta, kendi kapsam/karar turuyla tamamlandı — Faz 1'in çok-loop'lu deseni (Faz 2'nin tek-loop'ta 10/10 deseninin AKSİNE). Kalan maddeler (3.6, 3.6b, 3.8, 3.9-3.15) sırayla aynı desenle ele alınacak.

| # | İş | Özet |
|---|---|---|
| — | Python temel altyapısı | `papatya-python` servisi (FastAPI, Docker, port 8030, auth key header, healthcheck) — 3.3/3.5'in ve gelecekteki 3.14'ün üzerine kurulduğu ortak iskelet. Next.js istemcisi `src/lib/papatyaPythonClient.ts`. nöbetçim/dersplani'deki aynı desenden salt-okunur incelenip kopyalandı. |
| 3.1 | Beceri/kazanım ölçüm-analiz katmanı | `src/lib/skillAnalytics.ts` — `getSkillHistory`/`getCrossGameValidation`/`detectErrorStreak` (ham veri döner, eşik/yorum İÇERMEZ — bu bilerek 3.2b'ye bırakıldı). `SkillAttempt.hintsUsed` eklendi (yalnızca Harf Avı doldurur). |
| 3.2 | Uyarlanabilir zorluk | Harf Avı'nın sabit 24-seviyeli merdiveni TAMAMEN kaldırıldı — `src/lib/adaptiveDifficulty.ts` son performansa göre çeldirici sayısı/benzerliğini canlı ayarlıyor. Diğer oyunlar gibi artık seviyesiz, günlük bütçe içinde sınırsız. `Session.levelReached` yıkıcı silinmedi, analitik alana dönüştü. |
| 3.3 | Konuşmacı tanıma servisi | Resemblyzer tabanlı hafif embedding (`python/services/speaker_service.py`), `/speaker/enroll`+`/speaker/identify`. Aile bireyi eklerken (ses örneği varsa) otomatik tetiklenir, best-effort. Eşik altı eşleşme her zaman "tanınmadı" döner. |
| 3.4 | Kamera → karakter animasyonu | Tamamen istemci tarafında (`@mediapipe/tasks-vision`, Pose Landmarker Lite) — kamera karesi hiçbir zaman ağa/sunucuya gitmez. `src/components/character/PapatyaPuppet.tsx` — SVG+Framer Motion, birkaç parçalı basit bir "papatya kuklası". `cameraEnabled` (Faz 2'den) kapalıyken kamera hiç istenmez. |
| 3.5 | Doğal Türkçe seslendirme | Piper TTS (`tr_TR-dfki-medium` sesi), dosya-hash önbellekli. `src/app/api/tts/route.ts` auth key'i tarayıcıya sızdırmadan proxy'ler. `useTurkishSpeech` önce Piper dener, başarısız olursa tarayıcı `speechSynthesis`'ine sessizce düşer. |
| 3.7 | İletişim tahtası (AAC) | `/aac-board` — ARASAAC piktogramları (CC BY-NC-SA 4.0, Papatya'nın "ticari amaç taşımaz" ilkesiyle uyumlu), 3 kategori (İhtiyaçlar/Duygular/Günlük Yaşam) × 6 sembol. Tek dokunuş → `useAudio().speak()` ile seslendirme. Bilerek bir oyun DEĞİL: SkillAttempt'e yazılmaz, günlük ekran bütçesine katkı yapmaz (iletişim aracı, kilitlenmemeli). |
| 3.2b | Sakinleştirme modu | 5 ardışık yanlış cevapta (adaptiveDifficulty'nin 3'lük zorluk-düşürme eşiğinden SONRA) otomatik devreye girer: tüm ses/müzik anında durur (`AudioProvider.stop()`), tam-ekran sakin bir nefes-alma daveti gösterilir (`CalmingMode.tsx`, `DayComplete.tsx` deseniyle), mevcut `notificationStore`'un önceden hazırlanmış `scope:'parent'` toast kanalıyla ebeveyne bildirim gider. Kapanış YALNIZCA çocuğun kendi "Devam Edelim" dokunuşuyla — süre/zorlama/ebeveyn-PIN yok. Dört oyuna da `useCalmingModeMonitor(skillKey)` ile bağlandı. **Eşik şimdilik sabit kodlu (5), ebeveyn tarafından ayarlanabilir değil** — roadmap'in bu ilkesi bilerek v1 dışı bırakıldı, ayrı bir iştir. |

**UX denetimi turu 2 (2026-09-13, roadmap numarası dışı)** — kullanıcının canlı kullanımda bulduğu ikinci bir dizi Faz 1/2 eksikliği:
1. **Ana sayfa/navbar arası aşırı boşluk** — `main`'in `pt-24/32/40` değerleri `pt-20/24/28`'e düşürüldü.
2. **Profil fotoğrafı tıklanamıyor/yönetilemiyordu, kullanıcı adı hiçbir yerden değiştirilemiyordu** — yeni `User.avatarUrl` alanı + `src/actions/identity.ts` (`getIdentity`/`updateIdentity`/`updateAvatar`) + ParentGate'in Genel sekmesinin en üstüne yeni bir "Kimlik" bölümü (`IdentitySection.tsx`) eklendi. Ana sayfadaki avatar artık `HomeAvatar.tsx` (client) — tıklanınca ebeveyn kapısını açıyor. Eski hardcoded ölü CDN görseli (`static.fokusistatistik.com/melike/melike.png`) kaldırıldı.
3. **Ebeveyn Yönetim Alanı modalı çok dardı (`max-w-lg`), 8 sekme 3 satıra bölünüyordu** — masaüstünde `lg:w-[75vw]` (max `lg:max-w-5xl`) oldu, tek satırda sığıyor.
4. **Güneş/ay ikonu ve papatya ilerleme göstergesi buton gibi görünüp hiçbir şey yapmıyordu** — gerçek bir tema anahtarı EKLENMEDİ (kullanıcı kararı: bilinçli olarak Faz 5'e ertelendi, bkz. YOL-HARITASI.md "Gerçek koyu tema" notu); bunun yerine ikisine de `title`/`aria-label` ile ne olduklarını açıklayan bir ipucu eklendi, buton gibi görünmeyecek şekilde `cursor-default` verildi.
5. **KÖK NEDEN BULUNDU — sistem koyu modu sessizce tüm uygulamayı test edilmemiş bir koyu paletle render ediyordu**: `globals.css`'teki `@media (prefers-color-scheme: dark)` bloğu, kullanıcının cihaz/tarayıcı ayarına göre TÜM `papatya-*` renk token'larını koyuya çeviriyordu (kullanıcının ekran görüntülerindeki gizemli siyah "Bugün" kartı ve "sarı nokta" aslında ışıksız/görünmez yapraklarla render olan DaisyProgress'ti). CSS'te zaten hazır bekleyen bir `data-theme="light"` kaçış kapısı vardı (yazılmış ama hiç bağlanmamıştı) — `layout.tsx`'teki `<html>` etiketine `data-theme="light"` eklenerek palet artık sistem tercihinden bağımsız her zaman krem/açık modda kilitleniyor.
6. **"Bugün" özet paneli ana sayfada çok büyük/öne çıkıyordu** — projenin "rekabet/baskı yok" ilkesiyle çelişiyordu. `TodaySummary.tsx` artık varsayılan KAPALI, küçük bir "Bugün: X/8 tamamlandı" şeridi; dokununca ızgara açılıyor.
7. **Aile bireyi DÜZENLENEMİYORDU** (yalnızca ekle/sil vardı, dosya başlığındaki yorum yanlışlıkla "düzenler" diyordu) — `familyMembers.ts`'e `updateFamilyMember()` eklendi (isim/ilişki her zaman güncellenir, fotoğraf/ses yalnızca yeni dosya seçilirse değişir ve eskisi silinir), `FamilyMembersTab.tsx`'e düzenleme modu (kalem ikonu → form doldurulur → "Güncelle") eklendi. Yeni `FAMILY_MEMBER_UPDATED` audit olayı.

Tüm değişiklikler gerçek tarayıcıda (Playwright, `colorScheme:'dark'` zorlanarak) doğrulandı — tema kilidi çalışıyor, isim/avatar kaydı DB'ye yansıyor, aile bireyi düzenleme uçtan uca test edildi. `tsc`/`next lint` temiz, 211/211 test geçti (13 yeni test: `identity.test.ts` 8, `familyMembers.test.ts`'e 5 yeni `updateFamilyMember` testi eklendi).

**UX denetimi turu 3 (2026-09-13, `/loop` ile, roadmap numarası dışı)** — turu 2'de "ayrı bir iş" diye ertelenen 4 kalemin tamamı bu loop'ta kapatıldı:
1. **`User.username` artık değiştirilebiliyor** — `identity.ts`'e `updateUsername()` eklendi (benzersizlik `@unique` kısıtına dayanır, kendi mevcut adına eşitse DB'ye sorgu atmaz), `IdentitySection.tsx`'te "Kimlik" bölümüne ad/soyad'ın altına eklendi, giriş ekranında kullanılacağına dair açık bir uyarı var.
2. **`Song` (şarkı) artık düzenlenebiliyor** — yalnızca `dailyLoopLimit` (başlık/thumbnail YouTube'dan otomatik geldiği için kasıtlı olarak düzenlenmiyor). `music.ts`'e `updateSongLoopLimit()` eklendi, `MusicTab.tsx`'te liste satırında doğrudan inline bir sayı kutusu — sil-yeniden ekleme gerekmiyor.
3. **`Drawing` (çizim) galerisi eklendi** — `listDrawings`/`deleteDrawing` action'ları zaten vardı ama hiçbir UI çağırmıyordu. Yeni `DrawingsTab.tsx` (ParentGate'e yeni "Çizimler" sekmesi) bir ızgara galerisi + silme sunuyor; yükleme formu YOK (çizimler yalnızca çocuk tarafında DrawingBoard'da üretilir).
4. **`AuditLog` artık ebeveyne görünüyor** — yeni `src/actions/auditLogView.ts` (`listRecentAuditLog`, yalnızca kendi kayıtları, en yeni 50) + "İlerleme" sekmesinin altına Türkçe etiketli bir "Son değişiklikler" listesi eklendi (ProgressTab.tsx).

Tüm değişiklikler gerçek tarayıcıda doğrulandı (yeni sekme sırası tek satırda sığıyor, audit log gerçek DB olaylarını doğru gösteriyor). `tsc` temiz, 222/222 test geçti (11 yeni test: `updateUsername` 5, `updateSongLoopLimit` 3, `listRecentAuditLog` 3).

**Bu turda bilerek dokunulmayan/dışarıda bırakılan:** `Song`'un başlığı/thumbnail'i hâlâ düzenlenemiyor (kasıtlı — YouTube kaynaklı). Middleware güvenlik açığı (önceki turlardan, hâlâ ayrı bir iş).

**Hafıza Kartları yeniden tasarımı (2026-09-13, roadmap numarası dışı, kullanıcı kararıyla)** — İki değişiklik:
1. **Sabit 24-seviyeli kilitli harita kaldırıldı.** Harf Avı'nın Faz 3.2'de benimsediği "sonsuz + uyarlanabilir zorluk" ilkesiyle tutarlı hale getirildi: yeni `getAdaptiveMemoryConfig`/`getAdaptiveMemoryRoundConfig` (bkz. `src/lib/adaptiveDifficulty.ts`, `src/actions/gameProgress.ts`) her round'un çift sayısını (3-8 arası) `detectErrorStreak('gorsel-hafiza')` üzerinden son performansa göre canlı ayarlıyor. Oyun artık "bitmiyor" — günlük süre bütçesi içinde sınırsız devam ediyor. Eski `advanceGameLevel`/`LEVEL_CAPS` (24 sabit) kaldırıldı, yerine `submitMemoryRoundResult` (yalnızca süre/analitik kaydı, kapı yok) geldi.
2. **Yeni "Nesnelerle" modu** — harf havuzu (mevcut `ContentItem` harf-kelime eşleştirmesi) AYNEN korundu ("Harflerle" modu), ayrıca harf-bağımsız, doğrudan görsel eşleştirme modu eklendi: yeni `src/actions/comparisonPairs.ts` (`getComparisonPairsPool`) 88 `ComparisonItem` nesnesinden çocuğun kayıtlı ilgi alanlarına (`ChildProfileTab` → interests) göre ağırlıklandırılmış rastgele bir havuz döndürüyor (eşleşen nesneler önce, kalan havuzdan tamamlanır). Oyuncu her round başında iki moddan birini seçiyor.

Ayrıca aynı turda küçük UX düzeltmeleri: kartlar kare görsellere uygun `aspect-square` oldu (önceden `aspect-[3/4]`), mod seçim ekranındaki aşırı üst boşluk azaltıldı, "Ana Sayfaya Dön" düğmesi eski harita görünümündeki gibi alt-ortada sabit bir düğmeye geri getirildi (yalnızca üstte küçük bir ev ikonuna indirgenmemiş).

`tsc`/`next lint` temiz, 236/236 test geçti (14 yeni test: `getAdaptiveMemoryConfig` 5, `submitMemoryRoundResult`+`getAdaptiveMemoryRoundConfig` 9, `getComparisonPairsPool` 8 — toplamda gameProgress.test.ts yeniden yazıldı). Gerçek tarayıcıda doğrulandı (mod seçimi, nesne modu round'u, eşleştirme, ödül toast'u).

**İçerik eklemesi (2026-09-13, roadmap numarası dışı)** — Kullanıcının "melike" klasöründeki 88 kare (888×888) gerçek fotoğrafik nesne görseli `public/karsilastirma/` altına işlendi ve yeni `ComparisonItem` Prisma modeline (`prisma/seedComparisonItems.ts`) tohumlandı — `/games/memory-match` ve gelecekteki "hangisi kırmızı/daha büyük/daha ağır" gibi karşılaştırma oyunları için. Geniş sütun yapısı: `category` (10 sabit kategori: hayvan/meyve-sebze/yiyecek/giyim/arac/esya/oyuncak/mobilya/gezegen-gokyuzu/doga), `color`, `approxWeightKg`/`approxVolumeL`/`approxSizeCm` (kaba eğitim amaçlı yaklaşıklar — oyuncak-stilinde çekilen nesnelerde oyuncak ölçeği, gerçek hayvan/meyvede gerçek dünya ölçeği, "dunya"/"saturn" bilinçli olarak astronomik gezegen ölçeğinde), `sizeCategory` (kucuk/orta/buyuk/kocaman — ham cm/kg yerine sezgisel kaba karşılaştırma), `tags`, `readingText` (Piper TTS için), ve gelecekteki öngörülemeyen nitelikler için `attributesJson` kaçış kapısı. **Bu oyunlara nasıl bağlanacağı (eşleştirme/karşılaştırma mekaniği) henüz TASARLANMADI** — yalnızca veri katmanı hazır, ayrı bir loop/karar turu gerektirir.

**Önemli altyapı notu (2026-09-13)** — Bu WSL kurulumunda Docker'ın NAT/bridge ağı büyük Python bağımlılığı indirmelerinde (torch, onnxruntime) rastgele bağlantı kesintileri yaşatıyordu; kök nedeni bulunup `docker-compose.yml`'e `build.network: host` eklenerek kalıcı çözüldü — gelecekteki Python-bağımlı maddeler (3.14 gibi) bu sorunla tekrar karşılaşmamalı.

**Güvenlik bulgusu — DÜZELTİLDİ (2026-09-13, Faz 1-2 final denetiminde)** — Kök neden bulundu: proje `src/` dizin yapısı kullanıyor (`src/app`, `src/actions`, ...) ama `middleware.ts` yanlışlıkla REPO KÖKÜNDE duruyordu — Next.js'in `src/` dizin konvansiyonunda middleware'in `src/middleware.ts`'te olması gerekiyor, aksi halde dosya derlemeye HİÇ dahil edilmiyor (matcher regex'i doğru olsa bile). Bu yüzden `/` dışındaki hiçbir rota (`/aac-board`, `/music-corner`, `/drawing-board`, `/writing-practice`, `/cartoon`, tüm `/games/*`) korunmuyordu — `/`'in "korunması" yalnızca `page.tsx`'in kendi `getDailySession()` çağrısındaki `redirect('/giris')`'ten geliyordu, middleware'den değil. **Düzeltme:** `middleware.ts` → `src/middleware.ts` (git mv, içerik değişmedi). `npm run build && npx next start` ile PROD BUILD'DE gerçek HTTP istekleriyle doğrulandı: build çıktısında artık "ƒ Middleware 26.6 kB" görünüyor, önceden korunmasız 11 rotanın TAMAMI artık girişsiz istekte 307 ile `/giris`'e yönleniyor, gerçek oturumlu bir Playwright akışında ise hepsi 200 dönüyor (aşırı-engelleme yok). Faz 1.3'ün ("tek giriş, korumalı yönetim alanı") temel vaadiydi — artık gerçekten tutuluyor.

*(Uzman denetimi ve gerçek-cihaz QA notları 2026-09-13'te Faz 3'e taşındı — bkz. YOL-HARITASI.md'nin Faz 3 kapanışındaki birleştirilmiş notlar.)*

---

## Faz 1-2 Final Denetimi (2026-09-13) — Faz 1 ve Faz 2 artık TAMAMEN "yapılanlara" taşındı

Kullanıcının "Faz 1-2'den eksik/bozuk bir şey kaldı mı" talebiyle yapılan son bir tarama: tüm roadmap maddeleri (1.1-1.26, 2.1-2.10) kod/import zinciri üzerinden tek tek doğrulandı, `tsc`/`next lint`/`npm run build` temiz, 222/222 test geçiyor. Tarama sonunda bulunan TEK gerçek, kodla kapatılabilir açık (middleware konumu) hemen düzeltildi — yukarıdaki nota bkz.

**3 kalem Faz 3'e TAŞINDI** (kullanıcı kararı, 2026-09-13) — bunlar "yapılmadı" değil, "insan kararı bekliyor"; koda dokunarak kapatılamadıkları için Faz 1-2'de asılı bırakılmak yerine artık Faz 3'ün kendi listesinde yaşıyorlar:
1. **1.15 (hesap silme akışı)** → **YOL-HARITASI.md madde 3.11b** — Faz 3.11'in şifreli yedekleme mekanizması bir ön koşul, bilinçli bir sıralama kararı.
2. **Uzman denetimi** (Faz 1 ve Faz 2'nin ayrı notları) → **Faz 3'ün "Uzman denetimi" notuna birleştirildi** — çocuk gelişimi uzmanının resmi onayını bekliyor.
3. **Tam gerçek-cihaz QA** → **Faz 3'ün "Tam gerçek-cihaz QA" notuna birleştirildi** — telefon/tablet/PC'de eksiksiz interaktif click-through henüz yapılmadı (bu oturumda kısmi Playwright doğrulaması yapıldı).

Faz 1-2'nin geri kalan HER maddesi artık kod + gerçek tarayıcı doğrulamasıyla kapalı, hiçbir açık kalem taşımıyor. YOL-HARITASI.md'den itibaren yalnızca Faz 3+ açık iş içeriyor.
