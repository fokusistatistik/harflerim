# HarfArkadaşım 🎯

**Türkçe Harf Tanıma ve İşitsel-Görsel Eşleştirme Uygulaması**

ASD (Otizm Spektrum Bozukluğu) tanılı 6 yaşındaki çocuklar için özel olarak tasarlanmış, mobil uyumlu Progressive Web App (PWA).

---

## 🎨 Özellikler

### 🧩 ASD Odaklı Tasarım
- **Yumuşak Renkler**: Saf beyaz (#FFFFFF) yerine krem (#FFFDD0) ve pastel tonlar
- **Duyusal Geri Bildirim**: Doğru harf için "nefes alma" animasyonu
- **Açık Görsel Sınırlar**: Net kenarlıklar ve yüksek kontrast
- **Dokunmatik Optimize**: Büyük, kolay tıklanabilir kartlar

### 🔊 Türkçe Sesli Rehberlik
- Web Speech API ile `tr-TR` dil desteği
- Ayarlanabilir ses tonu (pitch) ve hız (rate)
- Rastgele pozitif geri bildirimler ("Harika!", "Aferin!", vb.)
- Her harf için özel sesli yönlendirme

### 📊 İstatistiksel Veri Toplama
- Her tıklama için telemetri kaydı:
  - Hedef harf vs. seçilen harf
  - Tepki süresi (milisaniye)
  - Başarı/başarısızlık durumu
  - Ekran yönelimi (portrait/landscape)
- CSV formatında dışa aktarma
- Harf bazında doğruluk analizi
- localStorage ile kalıcı veri saklama

### 🎮 Oyun Döngüsü
1. **IDLE**: Başlangıç durumu
2. **LISTENING**: İki rastgele harf gösteriliyor, hedef harf sesli olarak soruluyor
3. **FEEDBACK**: Kullanıcı seçimi sonrası geri bildirim
4. **SUCCESS**: Başarılı seçim sonrası kutlama
5. 2 saniye sonra yeni tur başlıyor

---

## 🏗️ Teknik Mimari

### Teknoloji Stack
- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Animasyon**: Framer Motion
- **Styling**: Tailwind CSS + Inline Styles
- **PWA**: Manifest.json ile yüklenebilir uygulama

### Proje Yapısı

```
harflerim/
├── app/
│   ├── layout.tsx          # Root layout + AudioProvider
│   ├── page.tsx            # Ana sayfa (GameCanvas)
│   └── globals.css         # Global stiller
├── components/
│   ├── AudioProvider.tsx   # Ses yönetimi context
│   ├── GameCanvas.tsx      # Ana oyun bileşeni
│   └── LetterCard.tsx      # Harf kartı bileşeni
├── hooks/
│   ├── useTurkishSpeech.ts # Web Speech API hook
│   └── useGameAnalytics.ts # Telemetri ve analitik hook
├── types/
│   └── game.ts             # TypeScript interface'leri
├── config/
│   └── theme.ts            # ASD dostu tema yapılandırması
├── locales/
│   └── tr.json             # Türkçe çeviriler
└── public/
    └── manifest.json       # PWA manifest
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç
# http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## 📱 PWA Kurulumu

1. Uygulamayı tarayıcıda açın
2. Tarayıcı adres çubuğundaki "Yükle" butonuna tıklayın
3. Uygulama cihazınıza yüklenecek ve çevrimdışı çalışabilecek

---

## 🎯 Kullanım

### Oyun Akışı
1. Uygulama açıldığında otomatik olarak oyun başlar
2. Ekranda iki harf görünür
3. Sesli yönlendirme hedef harfi sorar: "Hadi A harfini bulalım!"
4. Çocuk doğru harfe dokunur
5. Başarı durumunda: Yeşil renk + "Harika!" sesi
6. Hata durumunda: Pembe renk + "Tekrar deneyelim mi?" sesi
7. 2 saniye sonra yeni tur başlar

### İpucu Sistemi
- Eğer 5 saniye içinde tıklama olmazsa, doğru harf "nefes alma" animasyonu gösterir
- Mavi kenarlık ve büyüme-küçülme efekti

### İstatistikler
- Ekranın altında anlık istatistikler görünür:
  - Toplam deneme sayısı
  - Başarı oranı (%)

---

## 📊 Veri Analizi

### Telemetri Verisi

Her etkileşim şu bilgileri kaydeder:

```typescript
{
  sessionID: "uuid",
  attemptID: "uuid",
  target: "A",
  chosen: "B",
  isSuccess: false,
  timeToReactMS: 2340,
  screenOrientation: "portrait",
  timestamp: 1706112000000
}
```

### CSV Dışa Aktarma

`useGameAnalytics` hook'u `exportCSV()` metodu sağlar:

```typescript
const { exportCSV } = useGameAnalytics(sessionID);
const csvData = exportCSV();
// CSV formatında tüm telemetri verileri
```

### Harf Bazında Analiz

```typescript
const { getAnalytics } = useGameAnalytics(sessionID);
const analytics = getAnalytics();

console.log(analytics.letterAccuracy['A']);
// {
//   attempts: 10,
//   successes: 8,
//   averageTime: 1850
// }
```

---

## 🎨 Tema Özelleştirme

`config/theme.ts` dosyasından tema renklerini değiştirebilirsiniz:

```typescript
export const ASD_THEME: ThemeConfig = {
  background: '#FFFDD0',      // Arka plan
  cardBackground: '#F5F5DC',  // Kart arka planı
  correctColor: '#98D8C8',    // Doğru cevap
  incorrectColor: '#FFB6C1',  // Yanlış cevap
  textColor: '#2C3E50',       // Metin rengi
  accentColor: '#87CEEB',     // Vurgu rengi
};
```

---

## 🔊 Ses Ayarları

`useTurkishSpeech` hook'u ses parametrelerini özelleştirmenize olanak tanır:

```typescript
const { updateConfig } = useAudio();

updateConfig({
  pitch: 1.2,  // Ses tonu (0.1 - 2.0)
  rate: 0.9,   // Konuşma hızı (0.1 - 10.0)
  volume: 0.8, // Ses seviyesi (0.0 - 1.0)
});
```

---

## 🧪 Geliştirme Notları

### State Machine

Oyun durumu şu şekilde ilerler:

```
IDLE → LISTENING → FEEDBACK → SUCCESS → (2s delay) → LISTENING
```

### Harf Seçimi

- Her turda 29 Türkçe harften rastgele 2 tanesi seçilir
- Hedef harf bu ikisinden biri olarak belirlenir
- Kartların sırası rastgeledir

### Animasyon Süreleri

```typescript
ANIMATION_DURATIONS = {
  breathe: 2000,     // İpucu animasyonu
  feedback: 1500,    // Geri bildirim süresi
  transition: 500,   // Kart geçişleri
  delay: 2000,       // Turlar arası bekleme
}
```

---

## 🐛 Bilinen Sorunlar

1. **Safari iOS**: Web Speech API bazı iOS sürümlerinde sınırlı destek
2. **Çevrimdışı Mod**: İlk yüklemeden sonra PWA olarak çalışır, ancak ses sentezi internet gerektirebilir

---

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

## 👥 Katkıda Bulunanlar

- **Tasarım**: ASD uzmanları ile işbirliği
- **Geliştirme**: Next.js + TypeScript
- **Ses**: Web Speech API (tr-TR)

---

## 📧 İletişim

Sorularınız için lütfen proje sahibi ile iletişime geçin.

---

**Melike için sevgiyle yapıldı 💙**