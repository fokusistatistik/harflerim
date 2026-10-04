# Papatya (harflerim) — Başlangıç Promptu

Bu dosyayı yeni bir Claude Code oturumuna yapıştırarak başla. Amaç: projeyi, çalışma kurallarını ve seni önceki oturumlardaki gibi çalıştırmayı tek promptla yeniden kurmak.

---

## Proje

**Papatya (harflerim)** — otizmli bir çocuk (Melike, 6-7 yaş) için babası Emre Bostanoğlu tarafından geliştirilen kişiselleştirilmiş öğrenme/iletişim uygulaması. Next.js 14 (App Router) + TypeScript (strict) + Prisma/SQLite + Zustand + Tailwind + Framer Motion. Harf tanıma, hafıza kartları, AAC iletişim tahtası, çizim, yazı alıştırması gibi oyun/araçlardan oluşuyor.

Proje kökünde şu dosyaları **önce oku**, konuşmaya başlamadan:
- `YOL-HARITASI.md` — fazlar, roadmap, mimari kararlar, riskler
- `YOL-HARITASI-YAPILANLAR.md` — tamamlanan işlerin günlüğü
- `LOOP-KURALLARI.md` — varsa, /loop kullanımının kuralları
- `moduller/*.md` (ör. `harfavi.md`) — her oyun/aracın denetim/durum dokümanı, Faz 2.11 çeklistine göre

## Çalışma dili

**Kullanıcıyla her zaman Türkçe konuş.** Kod, commit mesajları, yorum satırları da Türkçe yazılıyor (proje genelinde tutarlı).

## Kritik kurallar

1. **Her değişiklik sonrası gerçek doğrulama yap** — sadece `tsc --noEmit` ve `npm run test` değil, **gerçek tarayıcıda Playwright ile** (bu ortamda çalışıyor) giriş yapıp ilgili ekranı ziyaret et, ekran görüntüsü al, konsol hatalarını kontrol et. "Kod doğru görünüyor" yeterli değil — çalıştığını göster.
2. **Kök nedeni bul, yüzeysel yama yapma.** Bu oturumda defalarca "görünürdeki sorun" ile "gerçek kök neden" farklı çıktı (örnek: "eski ikonlar geliyor" → önce SW cache sanıldı, sonra middleware'in `/sw.js`'i bloke ettiği, sonra `predev` hook'suz kalıcı dosya kalıntısı olduğu bulundu). Bir bulguyu "muhtemelen budur" diyerek kapatma — curl/Playwright/DB sorgusuyla doğrula.
3. **Belirsiz istekleri netleştir, tahmin etme.** Kapsam, eşik değerleri, davranış tercihleri gibi kullanıcının kararı olması gereken noktalarda `AskUserQuestion` kullan (2-4 net seçenek, birini "Önerilen" işaretle). Ama küçük/bariz teknik kararları (değişken adı, dosya konumu) sormadan ilerlet.
4. **Sadece istenen kapsamda çalış.** Kullanıcı bir bug bildirdiğinde onu düzelt; yanına "bu arada şunu da temizledim" gibi istenmeyen ek işler ekleme. Kapsam genişletmek gerekiyorsa önce sor.
5. **git commit yalnızca açıkça istendiğinde.** Ama bu projede kullanıcı neredeyse her değişiklik sonrası "commit et push et" deseninde ilerliyor — değişiklik tamamlanıp doğrulanınca commit+push yapmak bu projede normal akışın bir parçası, çekinme. Commit mesajları: Türkçe, kök nedeni ve neyin doğrulandığını anlatan, `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` ile biten uzun-form mesajlar.
6. **Persistent memory'yi kullan.** `/home/fokusistatistik/.claude/projects/.../memory/` altındaki `MEMORY.md` ve ilişkili dosyalar önceki oturumlardan kalma kararları/hataları içeriyor — çelişkili bir şey yapmadan önce oraya bak, yeni önemli bir karar/hata/tercih öğrendiğinde oraya yaz.

## Teknik desenler (bu projeye özgü)

- **`ImageWithFallback`** component'i — 404/timeout'ta zarif fallback gösterir, tüm çocuk-yüzü görsellerde kullanılır.
- **Middleware (`src/middleware.ts`)** auth kontrolü yapıyor — `matcher`'a yeni bir statik asset klasörü eklerken (görsel, ses, SW dosyası) unutma, yoksa o dosyalar oturumsuz erişilemez hale gelir (bu oturumda 2 kere bu yüzden "kırık görsel" bug'ı çıktı).
- **`prisma/seedContent.ts`** — `gameData.ts`'teki statik içerik DB'nin gerçek kaynağı değil, yalnızca seed kaynağı. Kod değişikliği + DB senkronizasyonu (`npx tsx prisma/seedContent.ts`) ayrı adımlar, biri unutulursa görsel gelmez.
- **`min-h-app`** (globals.css) — `min-h-screen` KULLANMA, `<body>`'nin Header/ParentFooter için ayırdığı padding'le çakışıp gereksiz scroll yaratıyor.
- **PWA/Service Worker** — yalnızca prod build'de aktif (`next.config.js`: `disable: NODE_ENV==="development"`). `predev` npm hook'u (`scripts/cleanDevServiceWorker.mjs`) her `npm run dev` başında eski `sw.js`/`workbox-*.js` kalıntılarını siler — bu dosyalar olmadan dev modda SW hiç devreye giremez.
- **`AskUserQuestion` ile karar noktaları**: ağırlıklı-rastgele vs katı-öncelik, reduceMotion kapsamı, ikon/görsel format kararları, günlük limit eşikleri (süre/round) — hep bu şekilde netleştirildi, kullanıcı genelde "Önerilen" seçeneği onaylıyor ama bazen kendi sayısını/kararını veriyor, onu birebir uygula.

## Ortam notları

- Proje: `/home/fokusistatistik/harflerim/harflerim` (WSL)
- Kullanıcı **yalnızca `npm run dev` ile** çalıştırıyor (port 3041), prod build/start kullanmıyor.
- Test kullanıcısı: `Melike` / PIN/şifre `1234`.
- Playwright bu ortamda çalışıyor — `chromium.launch({ args: ['--no-sandbox'] })` ile.
- Scratchpad dizini geçici script/ekran görüntüsü için kullanılıyor, proje köküne geçici dosya bırakma.

## Kullanıcının üslubu

Doğrudan, bazen sert/argo dille geri bildirim veriyor (özellikle bir şey tekrar tekrar düzelmediğinde). Bu bir sinyal — "gerçekten çöz, tahmin etme" demek. Savunmaya geçme, hemen daha derin araştırmaya dön, somut kanıtla (curl çıktısı, Playwright ölçümü, DB sorgusu) geri dön.

---

Şimdi projeyi tanıdın. Kullanıcının ilk isteğini bekle.
