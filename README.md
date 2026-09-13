# Papatya 🌼

**Otizmli çocuklar için kişiselleştirilebilir öğrenme ve iletişim uygulaması**

Melike Bostanoğlu (6-7 yaş) için inşa ediliyor, herkes için tasarlanıyor. Ürün yönü ve klinik/güvenlik ilkeleri için [YOL-HARITASI.md](YOL-HARITASI.md) — bu dosya yalnızca teknik mimariyi anlatır.

---

## Teknoloji Stack

- **Framework**: Next.js 14 (App Router), TypeScript (strict)
- **Veritabanı**: Prisma ORM + SQLite (geliştirme dönemi)
- **State**: Zustand
- **Stil**: Tailwind CSS + `papatya-*` CSS değişken tabanlı tasarım tokenleri (açık/koyu mod)
- **Animasyon**: Framer Motion, `canvas-confetti`
- **Ses**: Web Speech API (`tr-TR`), `react-speech-recognition`, `use-sound`
- **PWA**: `@ducanh2912/next-pwa` — yalnızca prod build'de aktif (`disable: NODE_ENV === "development"`)
- **Test**: Vitest + React Testing Library

## Kimlik Doğrulama ve Ebeveyn Kapısı

- Kullanıcı adı/şifre girişi, bcrypt hash'li parola, 30 günlük oturum çerezi (`papatyaSession`). Seed kullanıcısı: `Melike` / `1234` (bkz. `prisma/seed.ts`).
- Ebeveyn ayarları ayrı bir hesap değil — Header'daki logoya ~700ms uzun basma bir PIN kapısı açar (`ParentGate`). PIN de bcrypt hash (`UserSettings.parentPin`).
- Her önemli olay (giriş, çıkış, PIN denemesi/değişimi) `AuditLog` tablosuna düşer (`src/lib/auditLog.ts`).

## Oyunlar ve GameShell

Dört oyun: Harf Avı (`GameBoard.tsx`, 24 seviyelik merdiven), Hafıza Kartları, Sihirli Kelimeler (sesli, seviyesiz), Görsel Eşleştirme (sürükle-bırak, seviyesiz). İlerleme modelleri kasıtlı olarak farklı — ama dördü de şu paylaşılan altyapıyı kullanır:

- `GameHud` — ortak geri/durum/aksiyon satırı
- `useRewardMoment` — konfeti + ses + konuşma + toast, tek çağrı
- `useHintTimer` — ipucu zamanlayıcısı (şu an yalnızca Harf Avı kullanıyor)
- `useGameDayBudget` — günlük süre bütçesine rapor verir (Harf Avı kendi hassas mekanizmasını kullanır, diğer üçü bu hook'u kullanır)

İçerik (harf/kelime/görsel) `ContentSet`/`ContentItem` tablolarında; `prisma/seedContent.ts` tek kerelik, idempotent bir tohumlama betiğidir.

## Ekran Sağlığı

`DailyUsage` tablosu tüm oyunlar genelindeki günlük toplam süreyi tutar (`UserSettings.dailyScreenLimit`'e karşı denetlenir, bkz. `src/lib/dailyUsage.ts`). Limit dolunca `DayComplete` bileşeni tüm uygulamayı kaplayan, sakin bir "gün bitti" ekranı gösterir — otomatik yönlendirme veya "biraz daha" seçeneği yoktur. Header'daki `DaisyProgress` sekiz yapraklı gösterge, günün ilerlemesini zaman oranına göre gösterir.

## Proje Yapısı

```
src/
├── app/                  # Next.js App Router sayfaları
│   ├── layout.tsx         # Root layout: AudioProvider, Header, ToastHost, ParentGate, DayComplete
│   ├── page.tsx            # Ana sayfa: NavGrid (oyun/alan menüsü)
│   └── games/<oyun>/       # Her oyunun sayfası
├── actions/               # Server actions (auth, game, parentGate, content, dailyUsage)
├── components/
│   ├── game/               # Oyun bileşenleri + paylaşılan GameHud
│   ├── games/visual-match/ # Görsel Eşleştirme (ayrı alt-yapı)
│   └── ui/                 # Header, ParentFooter, ParentGate, NavGrid, ToastHost, DaisyProgress, DayComplete
├── hooks/                 # useGameContent, useGameDayBudget, useHintTimer, useRewardMoment, useBackgroundAwareness, useLongPress
├── store/                 # Zustand: levelStore, notificationStore, parentGateStore
├── lib/                   # auth, db, auditLog, dailyUsage, childProfile
└── config/                # brand.ts (marka adı/başlık tek kaynağı)
prisma/
├── schema.prisma
├── migrations/
├── seed.ts                # Kullanıcı seed
└── seedContent.ts         # Oyun içeriği seed
```

## Kurulum ve Çalıştırma

```bash
npm install
npx prisma migrate deploy   # şema
npm run seed                # Melike/1234 kullanıcısı
npm run seed:content        # harf/kelime içeriği
npm run dev                 # http://localhost:3041
```

Diğer komutlar: `npm run dev:agent` (port 3042, ikinci bir doğrulama sunucusu), `npm run build`, `npm test` / `npm run test:watch`.

## Yönetişim Belgeleri

- [YOL-HARITASI.md](YOL-HARITASI.md) — ürün yol haritası, klinik/güvenlik ilkeleri
- [YOL-HARITASI-YAPILANLAR.md](YOL-HARITASI-YAPILANLAR.md) — tamamlanan maddelerin özeti
- [GENEL-KURALLAR.md](GENEL-KURALLAR.md) — genel çalışma kuralları
- [LOOP-KURALLARI.md](LOOP-KURALLARI.md) — `/loop` aracının işleyişi

---

**Melike için sevgiyle yapıldı 💙**
