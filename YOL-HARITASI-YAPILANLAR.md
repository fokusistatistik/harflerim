# Papatya — Yapılanlar

**13 Eylül 2026 itibarıyla**

Bu belge, [YOL-HARITASI.md](YOL-HARITASI.md)'de tamamlanan maddelerin özetini tutar. Ayrım şu şekildedir: **YOL-HARITASI.md** yalnızca planlanan/henüz açık işi tarif eder; bu belge ise tamamlanmış işlerin kısa bir kaydıdır — roadmap'in kendisi her tamamlanan maddenin uzun açıklamasıyla şişmesin diye buraya taşınmıştır (kopyalanmamıştır — roadmap'teki karşılıkları kısaltılıp buraya yönlendirilmiştir).

Süreç kuralları (nasıl çalışıldığı) için [GENEL-KURALLAR.md](GENEL-KURALLAR.md) ve [LOOP-KURALLARI.md](LOOP-KURALLARI.md) geçerliliğini korur.

---

## Faz 1 — Temel & Kimlik (26/27 madde tamamlandı)

Yalnızca **1.15** (hesap silme akışı) açık kaldı — Faz 3.11'in şifreli yedekleme mekanizmasını bekliyor, bilerek ertelendi. Ayrıntısı hâlâ [YOL-HARITASI.md](YOL-HARITASI.md)'de.

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

**Uzman denetimi notu** — Faz 1'in tamamı için arayüz sadeliği, giriş ritüelinin bilişsel yükü ve süre limitinin uygulanışı henüz çocuk gelişimi bakış açısıyla resmi olarak gözden geçirilmedi; bu, YOL-HARITASI.md'deki "Uzman denetim kapısı" ilkesi gereği faz tam kapanmadan önce yapılmalı. Ayrıca gerçek bir tarayıcıda üç cihaz (telefon/tablet/PC) görsel kontrolü de bu ortamda yapılamadı (yalnızca CSS derleme + HTTP durum kontrolü) — gerçek cihazlarda son bir görsel QA önerilir.
