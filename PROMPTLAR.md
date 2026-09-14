# Papatya — Görsel Üretim Promptları

Bu dosya, Papatya uygulamasının tüm görsellerini (logo → oyun içerikleri) üretmek için kullanılacak, kopyala-yapıştır hazır, İngilizce AI görsel üretim promptlarını içerir. Her prompt tek başına eksiksizdir; başka bir bölüme bakmaya gerek kalmadan doğrudan bir görsel üretim aracına (Midjourney, DALL·E 3, Gemini "Nano Banana", Adobe Firefly, vb.) yapıştırılabilir.

**Kapsam:** Logo/marka kimliği + Hafıza Kartları (ters çevirme) ve Görsel Eşleştirme oyunlarında kullanılacak, ebeveynin özelleştirebileceği en az 50 farklı fotoğrafik içerik görseli. Toplam **60 içerik görseli** + **5 logo/marka görseli** içerir.

---

## 0. Ortak Kurallar (tüm görseller için geçerli)

- **Hedef kullanıcı:** Otizmli bir çocuk (6-7 yaş). Görseller **sade, tek konulu, dağınık olmayan, ürkütücü olmayan, gerçekçi** olmalı — aşırı duyusal uyarandan (parlak flaş, keskin gölge, karmaşık arka plan) kaçınılmalı.
- **Stil:** İçerik görselleri **fotoğrafik** (illüstrasyon/çizgi film değil) — gerçek nesnelerin/hayvanların net, sıcak ışıklı stüdyo fotoğrafları gibi görünmeli.
- **Marka renk paleti** (arka plan/aksan için referans):
  - Krem (zemin): `#FBF8EF`
  - Beyaz (yüzey): `#FFFFFF`
  - Mürekkep (koyu metin): `#2A2722`
  - Papatya sarısı (petal): `#E8B33C`
  - Yaprak yeşili: `#5F7A52`
  - Gökyüzü mavisi: `#6B87A8`
  - Gül kurusu: `#C4756A`
- **Format:** Kare (1:1), yüksek çözünürlük, arka plan düz/yumuşak krem (`#FBF8EF`) veya beyaz — hiçbir zaman karmaşık/dolu arka plan yok.
- **Kesinlikle olmayacaklar:** metin/yazı, filigran, logo, marka damgası, insan yüzü/eli (mahremiyet), hareket bulanıklığı, birden fazla obje, ürkütücü/agresif ifade, aşırı parlak/flaş ışık.
- **Dosya adlandırma önerisi:** Türkçe karakterler ASCII'ye çevrilip küçük harfle yazılmalı (ör. `köpek` → `kopek.png`), mevcut `src/store/gameData.ts` içindeki adlandırma deseniyle tutarlı olacak şekilde.

---

## 1. Logo ve Marka Kimliği

Uygulama simgesi küçük boyutlarda (favicon 16px, PWA maskable icon) da okunur olmalı; bu yüzden ana marka işareti **düz vektör** stilinde tasarlanmalı — fotoğrafik değil. Fotoğrafik gereksinimi karşılamak için 1.5'te gerçek bir papatya çiçeği fotoğrafı da ekledim (açılış ekranı/arka plan dokusu için alternatif).

### 1.1 Ana Logo (yatay lockup)

```
A minimalist flat vector logo for a children's app called "papatya". On the left, a simple daisy flower icon: 7-8 soft rounded white petals arranged in a circle around a warm golden-yellow (#E8B33C) center circle, flat 2D geometric style, no gradients, no drop shadows, no outlines. To the right of the flower, the wordmark "papatya" in lowercase, in a warm rounded modern sans-serif typeface, colored dark ink brown (#2A2722). Transparent background. Wide horizontal composition with generous negative space around the mark, roughly 4:1 aspect ratio. Calm, friendly, gentle aesthetic suitable for a therapeutic app used by young autistic children. High resolution, crisp vector-style edges, absolutely no extra decoration, no text other than "papatya".
```

### 1.2 Uygulama Simgesi (App Icon, maskable)

```
A flat vector app icon for a children's learning app. A single simple daisy flower centered in a square frame: 7-8 soft rounded white petals evenly arranged around a warm golden-yellow (#E8B33C) circular center, set against a solid soft cream background (#FBF8EF) that fills the entire square edge-to-edge. The flower is scaled to sit within the center 80% "safe zone" of the square (for Android maskable icon cropping), with even padding on all sides. Flat 2D geometric illustration style, no gradients, no shadows, no outlines, no text, no other elements. Extremely simple, clean, and instantly recognizable at very small sizes (down to 16x16px). Square 1:1 aspect ratio, high resolution (at least 1024x1024).
```

### 1.3 Favicon / Ultra Küçük Boyut Simgesi

```
An extremely simplified flat vector icon of a daisy flower reduced to its most essential geometric shapes: a single circle center in warm golden-yellow (#E8B33C) surrounded by 6 simple rounded petal shapes in white with a thin soft outline only where needed for contrast against a light background. Absolute minimum detail so the icon stays legible at 16x16 and 32x32 pixels. Solid cream background (#FBF8EF), square 1:1 aspect ratio, centered composition, no gradients, no text, no shadows.
```

### 1.4 Papatya Maskot Karakteri (açılış / boş durum ekranları için)

```
A simple, friendly flat vector mascot character for a children's app: a small round daisy flower with a cheerful minimal face (two small dot eyes, a small gentle closed-mouth smile, no other facial detail), soft rounded white petals, warm golden-yellow (#E8B33C) center/face area, two small simple stick-like green leaf "arms" optionally resting at its sides, no legs needed — floating/sitting pose. Extremely soft, calm, non-stimulating expression (never wide-eyed, never open-mouthed, never exaggerated). Flat 2D vector illustration, solid cream background (#FBF8EF), centered composition, square 1:1 aspect ratio, no text, no gradients, no harsh outlines, gentle and reassuring mood suitable for an autistic child's loading/empty-state screen.
```

### 1.5 Gerçek Papatya Çiçeği Fotoğrafı (fotoğrafik alternatif — arka plan dokusu / splash görseli için)

```
A close-up macro photograph of a single real daisy (Bellis perennis / Leucanthemum) flower, white petals with a soft golden-yellow center, photographed from directly above, centered in frame, soft natural diffused daylight with no harsh shadows, shallow depth of field with a very gently blurred plain light cream/beige background, dew-free clean petals, calm and gentle mood, no other flowers or clutter in frame, no text, no watermark, square 1:1 aspect ratio, high resolution professional photography.
```

---

## 1b. Harf Avı — 29 Harf Görseli (Türk Alfabesinin Tamamı)

2026-09-14 — kullanıcı raporu: Harf Avı'nda ("linkler patlak") kullanılan eski harf görselleri (`static.fokusistatistik.com/melike/harfler/`) tamamen ölü CDN'e işaret ediyordu, `public/`'te hiç yerel kopyası yoktu. `src/store/gameData.ts`'teki `LETTER_IMAGES` artık yerel yollara (`/harfler/harf_a.png` vb.) işaret ediyor — bu bölümdeki promptlarla üretilen görseller **aşağıdaki dosya adlarıyla** `public/harfler/` klasörüne konmalı. Ayrıca eksik olan **Ğ** harfi hem bu listeye hem oyunun veri katmanına eklendi (29/29 — Türk alfabesinin tamamı).

Stil, Bölüm 0'daki Ortak Kurallar'dan **farklı**: harf görselleri fotoğrafik değil, **büyük/net/tek renkli düz vektör harf kartı** olmalı — oyun bu görseli hem sürüklenebilir bir "harf kartı" hem de hedef çerçevedeki "hayalet harf" olarak kullanıyor (bkz. `DraggableToken.tsx`, `TargetFrame.tsx`), bu yüzden küçük boyutta da (80x80px) okunur kalmalı.

Ortak taban formül (her promptun içine gömülü): *tek büyük harf, düz vektör/flat illustration, kalın yuvarlak hatlı sans-serif harf biçimi, papatya sarısı (#E8B33C) harf rengi, düz krem (#FBF8EF) veya şeffaf zemin, gölge/gradyan/3D efekt yok, dekorasyon yok.*

**Dosya adlandırma:** `src/store/gameData.ts`'teki `LETTER_IMAGES` sözlüğüyle birebir eşleşmeli (Türkçe özel karakterler ASCII'ye çevrilip alt çizgiyle yazılmış):

| Harf | Dosya adı | Harf | Dosya adı | Harf | Dosya adı |
|---|---|---|---|---|---|
| A | `harf_a.png` | I | `harf_i_noktasiz.png` | S | `harf_s.png` |
| B | `harf_b.png` | İ | `harf_i.png` | Ş | `harf_s_noktali.png` |
| C | `harf_c.png` | J | `harf_j.png` | T | `harf_t.png` |
| Ç | `harf_c_cedil.png` | K | `harf_k.png` | U | `harf_u.png` |
| D | `harf_d.png` | L | `harf_l.png` | Ü | `harf_u_noktali.png` |
| E | `harf_e.png` | M | `harf_m.png` | V | `harf_v.png` |
| F | `harf_f.png` | N | `harf_n.png` | Y | `harf_y.png` |
| G | `harf_g.png` | O | `harf_o.png` | Z | `harf_z.png` |
| Ğ | `harf_g_breve.png` | Ö | `harf_o_noktali.png` | | |

### Tek prompt şablonu (harf değiştirilerek 29 kez kullanılır)

```
A single large uppercase Turkish letter "{HARF}" as a flat vector illustration, thick rounded friendly sans-serif letterform, solid warm golden-yellow color (#E8B33C), centered in frame, filling about 70% of the canvas, solid soft cream background (#FBF8EF), no gradients, no drop shadows, no 3D effects, no outline, no decoration, no other letters or symbols, extremely simple and instantly legible even at very small sizes (down to 80x80px), square 1:1 aspect ratio, high resolution, calm and non-stimulating aesthetic suitable for an autistic child's letter-learning game.
```

**Harf listesi (şablondaki `{HARF}` yerine sırayla yazılacak, 29 harf):**
A, B, C, Ç, D, E, F, G, Ğ, H, I, İ, J, K, L, M, N, O, Ö, P, R, S, Ş, T, U, Ü, V, Y, Z

**Özel karakter notu:** Ç/Ğ/İ/Ö/Ş/Ü üretilirken modele "the Turkish letter" ve tam Unicode karakteri (Ç, Ğ, İ, Ö, Ş, Ü) açıkça verilmeli — bazı modeller aksan işaretini (cedilla/breve/diaeresis) atlayabilir; üretilen görsel oyuna eklenmeden önce doğru harf olduğu gözle kontrol edilmeli (ör. Ğ üzerindeki breve/"şapka" işareti, İ'nin noktası, I'nın noktasız olması).

**Sonraki adım:** Üretilen 29 PNG, yukarıdaki tablodaki dosya adlarıyla birebir `public/harfler/` klasörüne konmalı. Dosya oraya konar konmaz oyun otomatik olarak kullanır — kod tarafında başka bir değişiklik gerekmez (`ImageWithFallback` zaten dosya eksikken zarif bir yer tutucu gösteriyor, dosya eklenince otomatik gerçek görsele geçer).

---

## 2. Oyun İçerik Kütüphanesi (Hafıza Kartları + Görsel Eşleştirme — ortak havuz, 60 görsel)

Bu görseller hem **Hafıza Kartları** (kart çevirme/eşleştirme) hem de **Görsel Eşleştirme** oyununda içerik havuzu olarak kullanılabilir; ebeveyn bunların arasından çocuğa özel bir alt küme seçebilir. Her görsel tek bir nesneyi/canlıyı net biçimde göstermeli ki kartlar birbirinden kolayca ayırt edilebilsin.

Ortak taban formül (her promptun içine gömülü): *gerçekçi fotoğrafik stil, düz krem/beyaz zemin, yumuşak stüdyo ışığı, kare kadraj, tek obje, metin/filigran yok.*

### A. Hayvanlar (10)

**A1 — Kedi** `kedi.png`
```
A realistic photograph of a friendly orange tabby cat sitting upright in three-quarter view, tail curled neatly around its front paws, ears relaxed forward, calm gentle gaze toward the camera, soft studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 65% of the frame, soft natural shadow beneath the cat, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A2 — Köpek** `kopek.png`
```
A realistic photograph of a small golden retriever puppy sitting upright facing the camera, one ear slightly perked, mouth gently closed (not panting), soft warm studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 65% of the frame, soft natural shadow beneath the puppy, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A3 — Tavşan** `tavsan.png`
```
A realistic photograph of a small white rabbit sitting upright with long upright ears, pink nose, calm relaxed posture facing slightly toward the camera, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 60% of the frame, soft natural shadow beneath the rabbit, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A4 — İnek** `inek.png`
```
A realistic photograph of a black and white spotted dairy cow's head and shoulders, facing forward with a calm gentle expression, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 70% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A5 — Koyun** `koyun.png`
```
A realistic photograph of a fluffy white sheep with curly wool, standing in profile-to-three-quarter view, calm gentle expression, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A6 — Tavuk** `tavuk.png`
```
A realistic photograph of a white hen with a small red comb, standing in profile view, calm relaxed posture, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A7 — Kaplumbağa** `kaplumbaga.png`
```
A realistic photograph of a small green and brown patterned tortoise, viewed from a gentle three-quarter top angle, legs visible and still, calm and simple, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A8 — Fil** `fil.png`
```
A realistic photograph of a grey elephant's head and front, facing forward with trunk gently curved downward, calm friendly expression, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 70% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A9 — Penguen** `penguen.png`
```
A realistic photograph of a small penguin standing upright in profile-to-three-quarter view, black and white plumage, calm still posture, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**A10 — Kelebek** `kelebek.png`
```
A realistic close-up photograph of a single colorful butterfly with orange and black patterned wings fully spread open, resting on a small plain twig, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), single subject filling about 55% of the frame, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

### B. Meyveler ve Sebzeler (10)

**B1 — Elma** `elma.png`
```
A realistic photograph of a single whole red apple with a short brown stem and one small green leaf, standing upright, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B2 — Muz** `muz.png`
```
A realistic photograph of a single ripe yellow banana with a gentle natural curve, small brown stem end visible, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame diagonally, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B3 — Çilek** `cilek.png`
```
A realistic close-up photograph of a single ripe red strawberry with its green leafy top, sitting upright, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B4 — Karpuz** `karpuz.png`
```
A realistic photograph of a single triangular slice of watermelon, bright red-pink flesh with visible dark seeds and a thin green-white rind edge, standing upright on its rind, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B5 — Portakal** `portakal.png`
```
A realistic photograph of one whole orange fruit next to one half-cut orange showing its juicy segmented interior, both resting side by side, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subjects filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B6 — Üzüm** `uzum.png`
```
A realistic photograph of a small bunch of purple grapes with a short piece of green stem, hanging naturally, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B7 — Havuç** `havuc.png`
```
A realistic photograph of a single whole orange carrot with fresh green leafy top, lying diagonally, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B8 — Domates** `domates.png`
```
A realistic photograph of a single round red tomato with a small green stem and leaf on top, sitting upright, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B9 — Patates** `patates.png`
```
A realistic photograph of a single whole brown potato with natural smooth skin, resting on its side, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**B10 — Mısır** `misir.png`
```
A realistic photograph of a single ear of corn with its yellow kernels fully visible and pale green husk peeled back and folded beneath it, standing upright, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

### C. Taşıtlar (8)

**C1 — Otobüs** `otobus.png`
```
A realistic photograph of a toy-like small yellow school bus, viewed from a three-quarter front angle, clean simple design with visible windows and wheels, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C2 — Uçak** `ucak.png`
```
A realistic photograph of a small white and blue passenger airplane model, viewed from a three-quarter side angle as if gently gliding, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C3 — Tren** `tren.png`
```
A realistic photograph of a small red toy train locomotive, viewed from a three-quarter side angle, round friendly design with visible wheels and a small smokestack, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C4 — Gemi** `gemi.png`
```
A realistic photograph of a small white toy boat with a simple hull and single mast, viewed from a three-quarter side angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no water, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C5 — Helikopter** `helikopter.png`
```
A realistic photograph of a small white and red toy helicopter with visible top rotor and tail rotor, viewed from a three-quarter side angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C6 — İtfaiye Arabası** `itfaiye.png`
```
A realistic photograph of a small red fire truck toy with a visible ladder on top and simple wheels, viewed from a three-quarter front angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C7 — Traktör** `traktor.png`
```
A realistic photograph of a small green toy tractor with large rear wheels and small front wheels, viewed from a three-quarter side angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**C8 — Roket** `roket.png`
```
A realistic photograph of a small white and red toy rocket standing upright on three small fins, pointed nose cone at top, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no flames, no smoke, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

### D. Ev Eşyaları ve Mutfak (8)

**D1 — Kaşık** `kasik.png`
```
A realistic photograph of a single simple metal spoon, resting diagonally, soft even studio lighting with a gentle reflective highlight, isolated on a seamless soft cream background (#FBF8EF), subject filling about 45% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D2 — Çatal** `catal.png`
```
A realistic photograph of a single simple metal fork, resting diagonally, soft even studio lighting with a gentle reflective highlight, isolated on a seamless soft cream background (#FBF8EF), subject filling about 45% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D3 — Tabak** `tabak.png`
```
A realistic photograph of a single plain round white ceramic plate, viewed from directly above, centered, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no food on the plate, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D4 — Fincan** `fincan.png`
```
A realistic photograph of a single simple ceramic mug with a handle, plain solid warm color, viewed from a three-quarter angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, empty (no liquid), no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D5 — Yastık** `yastik.png`
```
A realistic photograph of a single soft square pillow with a plain solid pastel-colored fabric cover, slightly puffy and rounded, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D6 — Duvar Saati** `saat.png`
```
A realistic photograph of a single simple round wall clock with a plain white face, black clock hands, and minimal hour markers, viewed straight-on, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D7 — Çocuk Sandalyesi** `sandalye.png`
```
A realistic photograph of a small simple wooden children's chair, plain natural wood or soft solid color, viewed from a three-quarter front angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**D8 — Diş Fırçası** `dis-fircasi.png`
```
A realistic photograph of a single children's toothbrush with a simple colorful plastic handle and white bristles, resting diagonally, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no toothpaste, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

### E. Giyim ve Aksesuar (8)

**E1 — Şapka** `sapka.png`
```
A realistic photograph of a single simple soft cotton sun hat in a plain solid warm color, standing as if placed on an invisible head form, viewed from a three-quarter angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E2 — Atkı** `atki.png`
```
A realistic photograph of a single soft knitted scarf in a plain solid color, gently coiled into a neat loose spiral shape, viewed from above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E3 — Eldiven** `eldiven.png`
```
A realistic photograph of a single pair of soft knitted mittens in a plain solid color, placed neatly side by side, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E4 — Çorap** `corap.png`
```
A realistic photograph of a single pair of soft cotton socks in a plain solid bright color, placed neatly side by side, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E5 — Tişört** `tisort.png`
```
A realistic photograph of a single plain solid-colored children's t-shirt, laid flat and neatly folded, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no patterns, no text on shirt, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E6 — Şemsiye** `semsiye.png`
```
A realistic photograph of a single small open umbrella in a plain solid bright color, viewed from a gentle three-quarter angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no rain, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E7 — Sırt Çantası** `canta.png`
```
A realistic photograph of a single small children's backpack in a plain solid color with simple straps, standing upright, viewed from a three-quarter front angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**E8 — Güneş Gözlüğü** `gozluk.png`
```
A realistic photograph of a single pair of simple round sunglasses with plain dark lenses and a solid-colored frame, resting flat, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

### F. Doğa ve Hava Durumu (8)

**F1 — Güneş** `gunes.png`
```
A realistic photograph-style rendering of a warm glowing sun disc with soft simple light rays extending outward, centered in frame, warm golden-orange tones, soft even lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, no harsh glare, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution.
```

**F2 — Gökkuşağı** `gokkusagi.png`
```
A realistic photograph-style rendering of a simple clean rainbow arc with clearly separated soft color bands, centered in frame against a plain pale sky-toned area that fades into a seamless soft cream background (#FBF8EF) at the edges, soft even lighting, subject filling about 60% of the frame, no clouds, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution.
```

**F3 — Kar Tanesi** `kartanesi.png`
```
A realistic macro photograph of a single delicate white snowflake with clear six-pointed symmetrical detail, centered in frame, soft even cool-toned lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, no other snowflakes, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**F4 — Yağmur Damlası** `yagmur-damlasi.png`
```
A realistic macro photograph of a single clear water droplet shaped like a gentle teardrop, resting on a smooth green leaf surface beneath it, soft even lighting with a small natural highlight reflection, isolated on a seamless soft cream background (#FBF8EF) surrounding the leaf, subject filling about 50% of the frame, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**F5 — Ağaç** `agac.png`
```
A realistic photograph of a single small round-canopy deciduous tree with a simple brown trunk and full green leaves, centered in frame, soft even natural lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**F6 — Papatya Çiçeği** `papatya-cicek.png`
```
A realistic photograph of a single daisy flower on a short green stem with one or two simple leaves, standing upright, white petals with a golden-yellow center, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other flowers, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**F7 — Deniz Kabuğu** `deniz-kabugu.png`
```
A realistic photograph of a single spiral seashell in soft cream and peach tones, resting on its side, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no sand, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**F8 — Yıldız** `yildiz.png`
```
A realistic photograph-style rendering of a single smooth five-pointed star shape in warm golden-yellow (#E8B33C), centered in frame, soft even lighting with a subtle gentle glow, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, no other stars, no night sky, no text, no watermark, square 1:1 aspect ratio, high resolution.
```

### G. Oyuncaklar ve Günlük Eşyalar (8)

**G1 — Top** `top.png`
```
A realistic photograph of a single round rubber play ball with simple colorful stripes or solid bright color, centered in frame, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G2 — Oyuncak Ayı** `oyuncak-ayi.png`
```
A realistic photograph of a single soft plush teddy bear sitting upright, warm brown fur, simple stitched features, calm friendly expression, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 65% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G3 — Yapı Blokları** `bloklar.png`
```
A realistic photograph of three simple colorful wooden building blocks (one red, one blue, one yellow cube) stacked neatly on top of each other, centered in frame, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text on blocks, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G4 — Uçurtma** `ucurtma.png`
```
A realistic photograph of a single simple diamond-shaped kite with a plain bright solid color and a short tail with two small bow ribbons, resting flat, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 60% of the frame, soft natural shadow beneath, no string, no sky, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G5 — Resimli Çocuk Kitabı** `kitap.png`
```
A realistic photograph of a single closed children's picture book with a plain solid-colored cover (no visible text or images on the cover), standing upright at a slight angle, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no readable text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G6 — Renkli Kalemler** `kalemler.png`
```
A realistic photograph of a small bundle of five thick chunky crayons in different bright solid colors (red, yellow, blue, green, orange), standing upright and gently fanned out, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G7 — Yapboz Parçası** `yapboz-parcasi.png`
```
A realistic photograph of a single large chunky cardboard jigsaw puzzle piece with a plain solid warm color and simple rounded interlocking tabs, resting flat, viewed from directly above, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 55% of the frame, soft natural shadow beneath, no other pieces, no image printed on the piece, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

**G8 — Çıngırak** `cingirak.png`
```
A realistic photograph of a single small baby rattle toy with a simple round head in a plain bright solid color and a short handle, resting diagonally, soft even studio lighting, isolated on a seamless soft cream background (#FBF8EF), subject filling about 50% of the frame, soft natural shadow beneath, no other objects, no text, no watermark, square 1:1 aspect ratio, high resolution photographic realism.
```

---

## 3. Kullanım Notları

- **Tutarlılık için:** Aynı üretim oturumunda / aynı model sürümünde çalışmak, tüm 60 görselin ışık-arka plan tonunu birbirine yakın tutar. Midjourney kullanılıyorsa `--style raw` + sabit bir `--sref` (style reference) tüm sette tutarlılığı artırır.
- **Elde 60 görsel olması** (50 zorunluluğunun üzerinde), üretim sırasında beğenilmeyen/başarısız çıkan görseller elenip yine de 50+ ile kalınabilmesi için kasıtlı bir tampon.
- **Sonraki adım:** Üretilen PNG'ler arka planı kaldırılmış/şeffaf ya da düz krem zeminli biçimde, mevcut `LETTER_IMAGES`/`ContentItem.imageUrl` deseniyle aynı şekilde bir CDN/`public/uploads` konumuna yüklenip veritabanına (veya ileride eklenecek özelleştirme tablosuna) bağlanabilir.
- **Öneri:** Yeni bir görsel kategorisi eklenecekse, bu dosyadaki "Ortak Kurallar" (Bölüm 0) taban formülünü koru — tutarlılık çocuğun görsel tanıma yükünü azaltır.
