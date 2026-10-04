# Papatya — Oyun Dünyası (Eğlenceli Oyunlar Hub'ı) Detaylı İş Planı

**Sürüm:** 3.0 (Kullanıcı Onaylı & Mühürlenmiş)  
**Tarih:** 4 Ekim 2026  
**Hedef Kitle:** Melike Bostanoğlu (6–7 yaş) & Ebeveyn (Emre Bostanoğlu)  
**Temel İlke:** "Çocukların sevdiği popüler oyun mekanikleri, Papatya'nın katı otizm dostu pedagojisi ve anti-bağımlılık mimarisiyle yeniden inşa ediliyor."

---

## 1. Kesinleşen Tasarım ve Kullanıcı Tercihleri

| Konu | Alınan Karar | Pedagojik / Klinik Gerekçe |
|---|---|---|
| **Ana Kart Başlığı** | `Oyun Dünyası` (Alt Başlık: *Eğlenceli Oyunlar*) | Sade, pozitif ve çocuğa yönelik davetkâr dil. |
| **Süre Sınırı** | Ebeveyn panelinden 10–60 dk arası (varsayılan: 30 dk) | Anti-bağımlılık kuralı; hangi oyun oynanırsa oynansın tek bir havuzdan düşer. |
| **Kapanış Şekli** | **Yumuşak Bitiş:** Süre dolduğunda aktif turun bitmesine izin verilir, aniden kesilmez. | Ani ekran kesintisinin yaratacağı öfke patlaması (meltdown) ve kontrol kaybı hissi önlenir. |
| **Kapanış Ritüeli** | Ekran dışı gerçek hayat daveti + Türkçe sesli okuma: *"Oyun bitti, harika oynadın! Hadi şimdi babana kocaman sarılalım 🌼"* | Cihazı bırakırken yaşanan geçiş kaygısı (transition anxiety) şefkatli bir aile temasıyla çözülür. |
| **Arka Plan Sesi** | **Sessiz Varsayılan:** Arka plan müziği yok; yalnızca dokunma, su dalgası ve başarı sesleri. | İşitsel aşırı yüklenmeyi (sensory overload) önlemek için en güvenli pedagojik tercih. |
| **Ödül Sıklığı** | **Aralıklı & Ölçülü Ödül:** Her dokunuşta sade su/tıkırtı efekti; konfeti yalnızca tur sonlarında. | Duyusal doygunluk ve dikkat dağınıklığını önler. |
| **Havuz Oyunu** | **Serbest Su Keyfi (Sandbox)** ve **Hedefli Görev** modları birlikte sunulur. | Otizmli çocuklarda suyun akışkan hareketi güçlü bir duyusal regülasyon (stimming) aracıdır. |
| **Kişiselleştirme** | Melike'nin profildeki `favoriteColor` (favori rengi) ve `interests` (ilgi alanları) kullanılır. | Aidiyet ve tanıdıklık hissini pekiştirir. |

---

## 2. Dört Seçkin Oyun ve Mekanikleri

### 🌊 Oyun 1: "Neşeli Havuz" (Melike'nin Özel Sulu Havuz Oyunu)
* **Ölçülen Beceri:** `duyusal-su-etkilesimi`
* **Mekanik:**
  * Turkuaz, hafif ışıldayan berrak bir su havuzu.
  * Havuzda yüzen sevimli oyuncaklar: Sarı ördek (`ordek.jpg`), sevimli yunus (`yunus.jpg`), küçük gemi (`gemi.jpg`), deniz topu (`top.jpg`).
  * Dokunulan her noktada su dalgalanması (ripple efekti) ve su şıpırtısı (`pop.wav`).
  * İki Mod:
    1. *Serbest Su Keyfi:* Görevsiz, puansız; sadece suyu dalgalandırma, oyuncakları yüzdürme ve rahatlama.
    2. *Hedefli Görev:* "Ördeği nilüfere yüzdür" gibi nazik yönlendirme.
* **Görseller:** `public/karsilastirma/` altındaki gerçek nesneler + Canvas su dalgası.

### 🐸 Oyun 2: "Neşeli Kurbağa" (Nilüfer Zıplama & Zamanlama)
* **Ölçülen Beceri:** `ritim-zamanlama`
* **Mekanik:**
  * Nehir boyunca sakin bir tempoda salınan nilüfer yaprakları.
  * Ekrana dokununca kurbağanın yukarı zıplaması.
  * *No-Failure:* Yaprak kaçınca suya batmaz; sığ kıyıdaki can simidine konup *"Hop! Bir daha deneyelim"* der.
* **Görseller:** `kurbaga.jpg`, `yaprak.jpg` ve sakin SVG vektörleri.

### 🏹 Oyun 3: "Sapanla Papatya" (Angry Birds Mekaniği)
* **Ölçülen Beceri:** `motor-hedefleme`
* **Mekanik:**
  * Yumuşak sapan çek-bırak fiziği ve noktacıklı rota kılavuzu.
  * Topun rengi Melike'nin favori renginde parlar.
  * Karşıdaki yumuşak sepetleri bulma veya tahta blokları devirme; tok/tiz patlamalar yerine ahşap tıkırtısı ve konfeti kutlaması.
* **Görseller:** `top.jpg`, `yildiz.jpg`, sepet ve bloklar.

### 🎈 Oyun 4: "Sakin Balonlar" (Uçan Balon Patlatma & Görsel Takip)
* **Ölçülen Beceri:** `gorsel-takip`
* **Mekanik:**
  * Aşağıdan yukarıya sakin süzülen pastel renkli balonlar.
  * Dokunulunca tatlı bir "pıt" (`pop.wav`) sesiyle patlama ve içinden minik bir yıldız süzülmesi.
  * Serbest patlatma veya hedef renk/meyve yakalama modu.
* **Görseller:** `balon.jpg` ve pastel renkli SVG balonlar.

---

## 3. Veritabanı ve Şema Yapısı

> ✅ **Kullanıcı Yazılı Onayı Alındı (2026-10-04)**

1. **`prisma/schema.prisma`:**
   ```prisma
   /// Oyun Dünyası günlük süre bütçesi (saniye, varsayılan: 1800 sn = 30 dk, 10-60 dk arası ayarlanabilir).
   dailyArcadeScreenLimit Int @default(1800)
   ```
2. **`Skill` Tablosuna Eklenecek Beceriler (`seedSkills.ts`):**
   * `duyusal-su-etkilesimi`: "Neşeli Havuz" (🌊 Su & Oyuncaklar)
   * `ritim-zamanlama`: "Neşeli Kurbağa" (🐸 Ritim & Zamanlama)
   * `motor-hedefleme`: "Sapanla Papatya" (🏹 Sapan & Hedefleme)
   * `gorsel-takip`: "Sakin Balonlar" (🎈 Görsel Takip)
3. **`Session` Tablosu Entegrasyonu:**
   * Oyun Dünyası seansları (`arcade-water-pool`, `arcade-frog-jump`, `arcade-slingshot`, `arcade-bubble-pop`) `totalDuration` olarak toplanıp günlük sınıra karşı denetlenir.

---

## 4. UI/UX ve Navigasyon Yapısı

1. **`src/config/navAreas.ts`:**
   * `id: 'fun-games'`, `label: 'Oyun Dünyası'`, `subtitle: 'Eğlenceli Oyunlar'`, `href: '/games/fun-hub'`, `imageSrc: '/ikonlar/kupa.png'`.
2. **Sayfa Rotaları:**
   * `/games/fun-hub` — Oyun Dünyası Seçim Ekranı (4 oyun kartı, süre durumu).
   * `/games/fun-hub/water-pool` — Neşeli Havuz.
   * `/games/fun-hub/frog-jump` — Neşeli Kurbağa.
   * `/games/fun-hub/slingshot` — Sapanla Papatya.
   * `/games/fun-hub/bubble-pop` — Sakin Balonlar.
3. **Bileşen Standartları:**
   * `.min-h-app` (scroll engelleme).
   * `GameHud` (Hub'a ve ana sayfaya tek dokunuşla dönüş).
   * `useCalmingModeMonitor` (5 ardışık hatada sakinleştirme).
   * `useArcadeDayBudget` (10–60 dk süre takibi ve yumuşak bitiş).

---

## 5. Uygulama Adımları (Loop Fazları)

- [ ] **Faz 1:** Şema ve Veritabanı (dailyArcadeScreenLimit, db push, seedSkills, `arcade.ts` actions).
- [ ] **Faz 2:** Navigasyon ve Hub UI (navAreas kartı, `/games/fun-hub`, `useArcadeDayBudget`).
- [ ] **Faz 3:** Oyun 1 — Neşeli Havuz (Canvas su dalgası / ripple, yüzen oyuncaklar, serbest/görev modları).
- [ ] **Faz 4:** Oyun 2 — Neşeli Kurbağa (Nilüfer zıplama fiziği, No-failure kıyı tutunma).
- [ ] **Faz 5:** Oyun 3 — Sapanla Papatya (Çek-bırak sapan, kılavuz çizgi, yumuşak bloklar).
- [ ] **Faz 6:** Oyun 4 — Sakin Balonlar (Pastel süzülen balonlar, pıt sesi, serbest/hedef modu).
- [ ] **Faz 7:** Ebeveyn Yönetim Alanı (`ScreenTimeTab` 10–60 dk kaydırıcısı, `ProgressTab` beceri grafiği, AuditLog).
- [ ] **Faz 8:** Yumuşak Kapanış Ekranı (Sesli Türkçe okuma: "Babana sarıl" mesajı).
- [ ] **Faz 9:** Test & 3 Cihaz Doğrulaması (`dev:agent` / 3042, Playwright, Mobil/Tablet/PC, tsc temiz).

---

## 6. Pilot v2 — Sakin Balonlar (tam ekran, grafik zengin)

**Karar özeti (kullanıcı onaylı):** Cihaza maksimum, sunucuya minimum yük; 2D canvas + prosedürel grafik; mobilde tam ekran; gökyüzü/gün batımı teması; yumuşak sticker koleksiyonu; "hareketi azalt" desteği; mevcut oyunun üzerine yazıldı.

- **Mimari:** `balloonLogic.ts` (saf mantık) · `balloonCollection.ts` (cihaz-içi localStorage, DB yok) · `balloonArt.ts` (prosedürel sanat, sıfır görsel indirme) · `balloonEngine.ts` (tek canvas, React yeniden render yok, dt tabanlı, otomatik düşük-kalite) · `BubblePopGame.tsx` (kabuk).
- **Sunucu yükü:** Yeni görsel/ses/JS kütüphanesi yok. Beceri kaydı her patlatmada değil, her 5 başarılı patlatmada tek sunucu çağrısı. Sticker defteri sunucuya yazılmaz.
- **Otizm dostu:** Cezasız yanlış dokunuş (tek yumuşak nabız), titreşim/yanıp sönme yok, sabit yıldızlar, içindeki sticker baştan görünür (sürpriz yok), 10 sticker ile sonlu koleksiyon, yanlış dokunuş sesi en fazla 4 snde bir.
- **Bilinen sınır:** Koleksiyon cihaza bağlı; cihaz değişirse defter sıfırlanır (DB gerektirmemek için bilinçli).
