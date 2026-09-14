/**
 * 2026-09-13 — bir kerelik, idempotent tohumlama betiği. Kullanıcının
 * "melike" klasöründeki 88 kare (888×888) fotoğrafik görseli karşılaştırma/
 * tanımlama oyunları (ör. /games/memory-match, "hangisi kırmızı", "hangisi
 * daha büyük") için ComparisonItem tablosuna işler (slug üzerinden upsert).
 *
 * ÖLÇEK KARARI (önemli, ileride gözden geçirilebilir): `approxWeightKg` /
 * `approxVolumeL` / `approxSizeCm` alanları görselin OYUNCAK mı yoksa
 * GERÇEK nesne/canlı mı olduğuna göre karışık bir ölçekte dolduruldu —
 * görsel bir oyuncak stiliyle çekilmişse (ör. araba, gemi, traktör, uçak,
 * vinç, ayıcık, top, paten) OYUNCAK ölçeği; gerçek bir hayvan/meyve/eşya
 * ise GERÇEK DÜNYA ölçeği kullanıldı. "dunya" (Dünya) ve "saturn" (Satürn)
 * bilinçli olarak GERÇEK gezegen ölçeğinde (astronomik kg/cm) tutuldu —
 * kategori adı "gezegen-gokyuzu" olduğu için. Bu, kategoriler arası ham
 * kg/cm karşılaştırmasını (ör. Satürn vs simit) anlamsız kılabilir; bu
 * yüzden oyun tasarımı ham değerler yerine `sizeCategory` alanını veya
 * AYNI KATEGORİ içi karşılaştırmayı tercih etmeli (bkz. şemadaki model
 * notu). Tüm sayısal değerler eğitim amaçlı KABA yaklaşıklardır, hassas
 * ölçüm değildir — gerekirse tek tek düzeltilebilir.
 *
 * Çalıştırma: npx tsx prisma/seedComparisonItems.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface ComparisonItemSeed {
    slug: string;
    name: string;
    category: string;
    color: string;
    approxWeightKg: number;
    approxVolumeL: number;
    approxSizeCm: number;
    sizeCategory: 'kucuk' | 'orta' | 'buyuk' | 'kocaman';
    tags: string[];
}

// Kategori kümesi (sabit — yeni bir kategori eklenirse burada genişletilmeli):
// hayvan | meyve-sebze | yiyecek | giyim | arac | esya | oyuncak | mobilya | gezegen-gokyuzu | doga
const ITEMS: ComparisonItemSeed[] = [
    { slug: 'nar', name: 'Nar', category: 'meyve-sebze', color: 'kırmızı', approxWeightKg: 0.3, approxVolumeL: 0.3, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['meyve', 'kırmızı', 'yuvarlak'] },
    { slug: 'toka', name: 'Toka', category: 'esya', color: 'pembe', approxWeightKg: 0.02, approxVolumeL: 0.03, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['aksesuar', 'pembe', 'saç'] },
    { slug: 'agac', name: 'Ağaç', category: 'doga', color: 'yeşil', approxWeightKg: 300, approxVolumeL: 800, approxSizeCm: 400, sizeCategory: 'kocaman', tags: ['doğa', 'yeşil', 'bitki'] },
    { slug: 'anahtar', name: 'Anahtar', category: 'esya', color: 'gri', approxWeightKg: 0.02, approxVolumeL: 0.005, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['ev', 'metal', 'gri'] },
    { slug: 'ananas', name: 'Ananas', category: 'meyve-sebze', color: 'sarı', approxWeightKg: 1.5, approxVolumeL: 1.5, approxSizeCm: 25, sizeCategory: 'orta', tags: ['meyve', 'sarı', 'tropik'] },
    { slug: 'araba', name: 'Araba', category: 'oyuncak', color: 'kırmızı', approxWeightKg: 0.3, approxVolumeL: 0.6, approxSizeCm: 15, sizeCategory: 'kucuk', tags: ['oyuncak', 'taşıt', 'kırmızı'] },
    { slug: 'ari', name: 'Arı', category: 'hayvan', color: 'sarı', approxWeightKg: 0.0001, approxVolumeL: 0.0001, approxSizeCm: 1.5, sizeCategory: 'kucuk', tags: ['böcek', 'uçan', 'sarı'] },
    { slug: 'at', name: 'At', category: 'hayvan', color: 'kahverengi', approxWeightKg: 400, approxVolumeL: 350, approxSizeCm: 220, sizeCategory: 'kocaman', tags: ['hayvan', 'çiftlik', 'kahverengi'] },
    { slug: 'ayakkabi', name: 'Ayakkabı', category: 'giyim', color: 'mavi', approxWeightKg: 0.3, approxVolumeL: 0.6, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['giyim', 'ayak', 'mavi'] },
    { slug: 'ayicik', name: 'Ayıcık', category: 'oyuncak', color: 'kahverengi', approxWeightKg: 0.3, approxVolumeL: 3, approxSizeCm: 30, sizeCategory: 'orta', tags: ['oyuncak', 'yumuşak', 'kahverengi'] },
    { slug: 'balik', name: 'Balık', category: 'hayvan', color: 'turuncu', approxWeightKg: 0.02, approxVolumeL: 0.03, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['hayvan', 'su', 'turuncu'] },
    { slug: 'balon', name: 'Balon', category: 'oyuncak', color: 'siyah', approxWeightKg: 0.01, approxVolumeL: 5, approxSizeCm: 25, sizeCategory: 'orta', tags: ['oyuncak', 'uçan', 'siyah'] },
    { slug: 'bisiklet', name: 'Bisiklet', category: 'arac', color: 'pembe', approxWeightKg: 7, approxVolumeL: 60, approxSizeCm: 100, sizeCategory: 'buyuk', tags: ['taşıt', 'tekerlekli', 'pembe'] },
    { slug: 'canta', name: 'Çanta', category: 'esya', color: 'mavi', approxWeightKg: 0.5, approxVolumeL: 15, approxSizeCm: 35, sizeCategory: 'orta', tags: ['okul', 'renkli', 'mavi'] },
    { slug: 'cicek', name: 'Çiçek', category: 'doga', color: 'kırmızı', approxWeightKg: 0.2, approxVolumeL: 1, approxSizeCm: 30, sizeCategory: 'orta', tags: ['doğa', 'renkli', 'buket'] },
    { slug: 'cikolata', name: 'Çikolata', category: 'yiyecek', color: 'kahverengi', approxWeightKg: 0.1, approxVolumeL: 0.06, approxSizeCm: 12, sizeCategory: 'kucuk', tags: ['yiyecek', 'tatlı', 'kahverengi'] },
    { slug: 'civciv', name: 'Civciv', category: 'hayvan', color: 'sarı', approxWeightKg: 0.05, approxVolumeL: 0.1, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['hayvan', 'kuş', 'sarı'] },
    { slug: 'corap', name: 'Çorap', category: 'giyim', color: 'turuncu', approxWeightKg: 0.05, approxVolumeL: 0.2, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['giyim', 'ayak', 'turuncu'] },
    { slug: 'deve', name: 'Deve', category: 'hayvan', color: 'kahverengi', approxWeightKg: 500, approxVolumeL: 450, approxSizeCm: 230, sizeCategory: 'kocaman', tags: ['hayvan', 'çöl', 'kahverengi'] },
    { slug: 'dis_fircasi', name: 'Diş Fırçası', category: 'esya', color: 'mavi', approxWeightKg: 0.02, approxVolumeL: 0.02, approxSizeCm: 18, sizeCategory: 'kucuk', tags: ['banyo', 'temizlik', 'mavi'] },
    { slug: 'domates', name: 'Domates', category: 'meyve-sebze', color: 'kırmızı', approxWeightKg: 0.1, approxVolumeL: 0.1, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['sebze', 'kırmızı', 'yuvarlak'] },
    { slug: 'dondurma', name: 'Dondurma', category: 'yiyecek', color: 'pembe', approxWeightKg: 0.15, approxVolumeL: 0.2, approxSizeCm: 14, sizeCategory: 'kucuk', tags: ['yiyecek', 'tatlı', 'pembe'] },
    { slug: 'donut', name: 'Donut', category: 'yiyecek', color: 'kahverengi', approxWeightKg: 0.08, approxVolumeL: 0.1, approxSizeCm: 10, sizeCategory: 'kucuk', tags: ['yiyecek', 'tatlı', 'kahverengi'] },
    { slug: 'dunya', name: 'Dünya', category: 'gezegen-gokyuzu', color: 'mavi', approxWeightKg: 5.97e24, approxVolumeL: 1.083e21, approxSizeCm: 1_274_200_000, sizeCategory: 'kocaman', tags: ['gezegen', 'gökyüzü', 'mavi'] },
    { slug: 'ekmek', name: 'Ekmek', category: 'yiyecek', color: 'kahverengi', approxWeightKg: 0.4, approxVolumeL: 1.2, approxSizeCm: 25, sizeCategory: 'orta', tags: ['yiyecek', 'kahverengi', 'fırın'] },
    { slug: 'elbise', name: 'Elbise', category: 'giyim', color: 'sarı', approxWeightKg: 0.2, approxVolumeL: 1, approxSizeCm: 40, sizeCategory: 'orta', tags: ['giyim', 'sarı', 'kız'] },
    { slug: 'eldiven', name: 'Eldiven', category: 'giyim', color: 'sarı', approxWeightKg: 0.1, approxVolumeL: 0.3, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['giyim', 'el', 'sarı'] },
    { slug: 'elma', name: 'Elma', category: 'meyve-sebze', color: 'kırmızı', approxWeightKg: 0.15, approxVolumeL: 0.15, approxSizeCm: 7, sizeCategory: 'kucuk', tags: ['meyve', 'kırmızı', 'yuvarlak'] },
    { slug: 'esek', name: 'Eşek', category: 'hayvan', color: 'gri', approxWeightKg: 200, approxVolumeL: 180, approxSizeCm: 150, sizeCategory: 'buyuk', tags: ['hayvan', 'çiftlik', 'gri'] },
    { slug: 'fil', name: 'Fil', category: 'hayvan', color: 'gri', approxWeightKg: 4000, approxVolumeL: 3500, approxSizeCm: 300, sizeCategory: 'kocaman', tags: ['hayvan', 'vahşi', 'gri'] },
    { slug: 'gemi', name: 'Gemi', category: 'oyuncak', color: 'turuncu', approxWeightKg: 0.5, approxVolumeL: 5, approxSizeCm: 30, sizeCategory: 'orta', tags: ['oyuncak', 'taşıt', 'turuncu'] },
    { slug: 'gitar', name: 'Gitar', category: 'esya', color: 'kahverengi', approxWeightKg: 1.2, approxVolumeL: 8, approxSizeCm: 90, sizeCategory: 'buyuk', tags: ['müzik', 'çalgı', 'kahverengi'] },
    { slug: 'gokkusagi', name: 'Gökkuşağı', category: 'doga', color: 'çok renkli', approxWeightKg: 0, approxVolumeL: 0, approxSizeCm: 100_000, sizeCategory: 'kocaman', tags: ['doğa', 'gökyüzü', 'renkli'] },
    { slug: 'gozluk', name: 'Güneş Gözlüğü', category: 'esya', color: 'siyah', approxWeightKg: 0.03, approxVolumeL: 0.05, approxSizeCm: 14, sizeCategory: 'kucuk', tags: ['aksesuar', 'göz', 'siyah'] },
    { slug: 'gunes', name: 'Güneş', category: 'gezegen-gokyuzu', color: 'sarı', approxWeightKg: 1.989e30, approxVolumeL: 1.41e27, approxSizeCm: 139_100_000_000, sizeCategory: 'kocaman', tags: ['gökyüzü', 'yıldız', 'sarı'] },
    { slug: 'havuc', name: 'Havuç', category: 'meyve-sebze', color: 'turuncu', approxWeightKg: 0.07, approxVolumeL: 0.06, approxSizeCm: 18, sizeCategory: 'kucuk', tags: ['sebze', 'turuncu', 'uzun'] },
    { slug: 'hindi', name: 'Hindi', category: 'hayvan', color: 'kahverengi', approxWeightKg: 8, approxVolumeL: 15, approxSizeCm: 60, sizeCategory: 'orta', tags: ['hayvan', 'kuş', 'kahverengi'] },
    { slug: 'inek', name: 'İnek', category: 'hayvan', color: 'siyah-beyaz', approxWeightKg: 600, approxVolumeL: 550, approxSizeCm: 240, sizeCategory: 'kocaman', tags: ['hayvan', 'çiftlik', 'siyah-beyaz'] },
    { slug: 'kalem', name: 'Kalemler', category: 'esya', color: 'çok renkli', approxWeightKg: 0.1, approxVolumeL: 0.15, approxSizeCm: 18, sizeCategory: 'kucuk', tags: ['okul', 'renkli', 'kalem'] },
    { slug: 'kaplumbaga', name: 'Kaplumbağa', category: 'hayvan', color: 'yeşil', approxWeightKg: 5, approxVolumeL: 4, approxSizeCm: 30, sizeCategory: 'orta', tags: ['hayvan', 'sürüngen', 'yeşil'] },
    { slug: 'karinca', name: 'Karınca', category: 'hayvan', color: 'siyah', approxWeightKg: 0.000005, approxVolumeL: 0.000005, approxSizeCm: 0.8, sizeCategory: 'kucuk', tags: ['böcek', 'siyah', 'küçük'] },
    { slug: 'karpuz', name: 'Karpuz', category: 'meyve-sebze', color: 'yeşil', approxWeightKg: 5, approxVolumeL: 5, approxSizeCm: 30, sizeCategory: 'buyuk', tags: ['meyve', 'yeşil', 'yuvarlak'] },
    { slug: 'kasik', name: 'Kaşık', category: 'esya', color: 'gri', approxWeightKg: 0.05, approxVolumeL: 0.02, approxSizeCm: 18, sizeCategory: 'kucuk', tags: ['mutfak', 'metal', 'gri'] },
    { slug: 'kavun', name: 'Kavun', category: 'meyve-sebze', color: 'sarı', approxWeightKg: 1.5, approxVolumeL: 1.5, approxSizeCm: 20, sizeCategory: 'orta', tags: ['meyve', 'sarı', 'yuvarlak'] },
    { slug: 'kayisi', name: 'Kayısı', category: 'meyve-sebze', color: 'turuncu', approxWeightKg: 0.05, approxVolumeL: 0.05, approxSizeCm: 5, sizeCategory: 'kucuk', tags: ['meyve', 'turuncu', 'yuvarlak'] },
    { slug: 'kedi', name: 'Kedi', category: 'hayvan', color: 'turuncu', approxWeightKg: 4, approxVolumeL: 4, approxSizeCm: 45, sizeCategory: 'orta', tags: ['hayvan', 'evcil', 'turuncu'] },
    { slug: 'kelebek', name: 'Kelebek', category: 'hayvan', color: 'turuncu', approxWeightKg: 0.0005, approxVolumeL: 0.001, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['böcek', 'uçan', 'turuncu'] },
    { slug: 'kirpi', name: 'Kirpi', category: 'hayvan', color: 'kahverengi', approxWeightKg: 0.5, approxVolumeL: 0.6, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['hayvan', 'dikenli', 'kahverengi'] },
    { slug: 'kivi', name: 'Kivi', category: 'meyve-sebze', color: 'yeşil', approxWeightKg: 0.08, approxVolumeL: 0.08, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['meyve', 'yeşil', 'yuvarlak'] },
    { slug: 'kopek', name: 'Köpek', category: 'hayvan', color: 'sarı', approxWeightKg: 5, approxVolumeL: 6, approxSizeCm: 40, sizeCategory: 'orta', tags: ['hayvan', 'evcil', 'sarı'] },
    { slug: 'koyun', name: 'Koyun', category: 'hayvan', color: 'beyaz', approxWeightKg: 70, approxVolumeL: 90, approxSizeCm: 120, sizeCategory: 'buyuk', tags: ['hayvan', 'çiftlik', 'beyaz'] },
    { slug: 'kurbaga', name: 'Kurbağa', category: 'hayvan', color: 'yeşil', approxWeightKg: 0.05, approxVolumeL: 0.05, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['hayvan', 'su', 'yeşil'] },
    { slug: 'kuzu', name: 'Kuzu', category: 'hayvan', color: 'beyaz', approxWeightKg: 10, approxVolumeL: 12, approxSizeCm: 60, sizeCategory: 'orta', tags: ['hayvan', 'çiftlik', 'beyaz'] },
    { slug: 'masa', name: 'Masa', category: 'mobilya', color: 'kahverengi', approxWeightKg: 5, approxVolumeL: 40, approxSizeCm: 60, sizeCategory: 'orta', tags: ['mobilya', 'ahşap', 'kahverengi'] },
    { slug: 'muhabbet', name: 'Muhabbet Kuşu', category: 'hayvan', color: 'yeşil', approxWeightKg: 0.03, approxVolumeL: 0.05, approxSizeCm: 18, sizeCategory: 'kucuk', tags: ['hayvan', 'kuş', 'yeşil'] },
    { slug: 'muz', name: 'Muz', category: 'meyve-sebze', color: 'sarı', approxWeightKg: 0.12, approxVolumeL: 0.15, approxSizeCm: 18, sizeCategory: 'kucuk', tags: ['meyve', 'sarı', 'uzun'] },
    { slug: 'ordek', name: 'Ördek Yavrusu', category: 'hayvan', color: 'sarı', approxWeightKg: 0.1, approxVolumeL: 0.15, approxSizeCm: 10, sizeCategory: 'kucuk', tags: ['hayvan', 'kuş', 'sarı'] },
    { slug: 'panda', name: 'Panda', category: 'hayvan', color: 'siyah-beyaz', approxWeightKg: 100, approxVolumeL: 90, approxSizeCm: 120, sizeCategory: 'buyuk', tags: ['hayvan', 'vahşi', 'siyah-beyaz'] },
    { slug: 'pantolon', name: 'Pantolon', category: 'giyim', color: 'turuncu', approxWeightKg: 0.3, approxVolumeL: 1, approxSizeCm: 50, sizeCategory: 'orta', tags: ['giyim', 'turuncu', 'bacak'] },
    { slug: 'pasta', name: 'Pasta', category: 'yiyecek', color: 'pembe', approxWeightKg: 0.5, approxVolumeL: 1, approxSizeCm: 15, sizeCategory: 'orta', tags: ['yiyecek', 'tatlı', 'pembe'] },
    { slug: 'patates', name: 'Patates', category: 'meyve-sebze', color: 'kahverengi', approxWeightKg: 0.15, approxVolumeL: 0.15, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['sebze', 'kahverengi', 'yuvarlak'] },
    { slug: 'paten', name: 'Paten', category: 'oyuncak', color: 'mavi', approxWeightKg: 1, approxVolumeL: 3, approxSizeCm: 25, sizeCategory: 'kucuk', tags: ['oyuncak', 'spor', 'mavi'] },
    { slug: 'penguen', name: 'Penguen', category: 'hayvan', color: 'siyah-beyaz', approxWeightKg: 5, approxVolumeL: 8, approxSizeCm: 60, sizeCategory: 'orta', tags: ['hayvan', 'kuş', 'siyah-beyaz'] },
    { slug: 'piyano', name: 'Piyano', category: 'esya', color: 'siyah', approxWeightKg: 5, approxVolumeL: 30, approxSizeCm: 100, sizeCategory: 'buyuk', tags: ['müzik', 'çalgı', 'siyah'] },
    { slug: 'portakal', name: 'Portakal', category: 'meyve-sebze', color: 'turuncu', approxWeightKg: 0.2, approxVolumeL: 0.2, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['meyve', 'turuncu', 'yuvarlak'] },
    { slug: 'raket', name: 'Raket', category: 'esya', color: 'mavi', approxWeightKg: 0.25, approxVolumeL: 0.5, approxSizeCm: 60, sizeCategory: 'orta', tags: ['spor', 'renkli', 'mavi'] },
    { slug: 'saat', name: 'Saat', category: 'esya', color: 'beyaz', approxWeightKg: 0.5, approxVolumeL: 1, approxSizeCm: 25, sizeCategory: 'kucuk', tags: ['ev', 'duvar', 'beyaz'] },
    { slug: 'sandalye', name: 'Sandalye', category: 'mobilya', color: 'kahverengi', approxWeightKg: 3, approxVolumeL: 25, approxSizeCm: 80, sizeCategory: 'orta', tags: ['mobilya', 'ahşap', 'kahverengi'] },
    { slug: 'sapka', name: 'Şapka', category: 'giyim', color: 'kırmızı', approxWeightKg: 0.1, approxVolumeL: 3, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['giyim', 'baş', 'kırmızı'] },
    { slug: 'saturn', name: 'Satürn', category: 'gezegen-gokyuzu', color: 'sarı', approxWeightKg: 5.68e26, approxVolumeL: 8.27e26, approxSizeCm: 12_050_000_000, sizeCategory: 'kocaman', tags: ['gezegen', 'gökyüzü', 'sarı'] },
    { slug: 'semsiye', name: 'Şemsiye', category: 'esya', color: 'sarı', approxWeightKg: 0.3, approxVolumeL: 3, approxSizeCm: 90, sizeCategory: 'orta', tags: ['yağmur', 'sarı', 'ev'] },
    { slug: 'simit', name: 'Simit', category: 'yiyecek', color: 'kahverengi', approxWeightKg: 0.1, approxVolumeL: 0.4, approxSizeCm: 16, sizeCategory: 'kucuk', tags: ['yiyecek', 'kahverengi', 'yuvarlak'] },
    { slug: 'tabak', name: 'Tabak', category: 'esya', color: 'yeşil', approxWeightKg: 0.3, approxVolumeL: 0.3, approxSizeCm: 22, sizeCategory: 'kucuk', tags: ['mutfak', 'yeşil', 'yuvarlak'] },
    { slug: 'tavsan', name: 'Tavşan', category: 'hayvan', color: 'beyaz', approxWeightKg: 2, approxVolumeL: 2.5, approxSizeCm: 35, sizeCategory: 'orta', tags: ['hayvan', 'evcil', 'beyaz'] },
    { slug: 'tavuk', name: 'Tavuk', category: 'hayvan', color: 'beyaz', approxWeightKg: 2, approxVolumeL: 3, approxSizeCm: 45, sizeCategory: 'orta', tags: ['hayvan', 'kuş', 'beyaz'] },
    { slug: 'tencere', name: 'Tencere', category: 'esya', color: 'gri', approxWeightKg: 1.5, approxVolumeL: 5, approxSizeCm: 25, sizeCategory: 'orta', tags: ['mutfak', 'metal', 'gri'] },
    { slug: 'top', name: 'Top', category: 'oyuncak', color: 'çok renkli', approxWeightKg: 0.3, approxVolumeL: 5, approxSizeCm: 22, sizeCategory: 'kucuk', tags: ['oyuncak', 'renkli', 'yuvarlak'] },
    { slug: 'traktor', name: 'Traktör', category: 'oyuncak', color: 'yeşil', approxWeightKg: 0.5, approxVolumeL: 3, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['oyuncak', 'taşıt', 'yeşil'] },
    { slug: 'ucak', name: 'Uçak', category: 'oyuncak', color: 'beyaz', approxWeightKg: 0.3, approxVolumeL: 2, approxSizeCm: 25, sizeCategory: 'kucuk', tags: ['oyuncak', 'taşıt', 'beyaz'] },
    { slug: 'uzum', name: 'Üzüm', category: 'meyve-sebze', color: 'mor', approxWeightKg: 0.3, approxVolumeL: 0.3, approxSizeCm: 15, sizeCategory: 'kucuk', tags: ['meyve', 'mor', 'salkım'] },
    { slug: 'vinc', name: 'Vinç', category: 'oyuncak', color: 'sarı', approxWeightKg: 0.4, approxVolumeL: 2, approxSizeCm: 20, sizeCategory: 'kucuk', tags: ['oyuncak', 'taşıt', 'sarı'] },
    { slug: 'yaprak', name: 'Yaprak', category: 'doga', color: 'yeşil', approxWeightKg: 0.005, approxVolumeL: 0.01, approxSizeCm: 10, sizeCategory: 'kucuk', tags: ['doğa', 'yeşil', 'bitki'] },
    { slug: 'yatak', name: 'Yatak', category: 'mobilya', color: 'ahşap', approxWeightKg: 30, approxVolumeL: 400, approxSizeCm: 190, sizeCategory: 'kocaman', tags: ['mobilya', 'ahşap', 'oda'] },
    { slug: 'yildiz', name: 'Yıldız', category: 'gezegen-gokyuzu', color: 'sarı', approxWeightKg: 0.05, approxVolumeL: 0.1, approxSizeCm: 10, sizeCategory: 'kucuk', tags: ['gökyüzü', 'sarı', 'oyuncak'] },
    { slug: 'yumurta', name: 'Yumurta', category: 'yiyecek', color: 'kahverengi', approxWeightKg: 0.06, approxVolumeL: 0.06, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['yiyecek', 'kahverengi', 'yuvarlak'] },
    { slug: 'yunus', name: 'Yunus', category: 'hayvan', color: 'gri', approxWeightKg: 200, approxVolumeL: 220, approxSizeCm: 250, sizeCategory: 'kocaman', tags: ['hayvan', 'deniz', 'gri'] },
    { slug: 'zeytin', name: 'Zeytin', category: 'yiyecek', color: 'yeşil-siyah', approxWeightKg: 0.1, approxVolumeL: 0.15, approxSizeCm: 2, sizeCategory: 'kucuk', tags: ['yiyecek', 'yeşil', 'küçük'] },
    { slug: 'zurafa', name: 'Zürafa', category: 'hayvan', color: 'sarı-kahverengi', approxWeightKg: 800, approxVolumeL: 600, approxSizeCm: 500, sizeCategory: 'kocaman', tags: ['hayvan', 'vahşi', 'sarı-kahverengi'] },

    // 2026-09-14 — ikinci tur ekleme (8 görsel), kullanıcının aynı kaynak
    // klasöre eklediği yeni fotoğraflar. Harf Avı'nın 0-1 kelimeli zayıf
    // harflerini (L, İ, U, Ü, O, N, V, R vb.) güçlendirmek amacıyla seçildi.
    { slug: 'sogan', name: 'Soğan', category: 'meyve-sebze', color: 'kahverengi', approxWeightKg: 0.15, approxVolumeL: 0.15, approxSizeCm: 7, sizeCategory: 'kucuk', tags: ['sebze', 'kahverengi', 'yuvarlak'] },
    { slug: 'limon', name: 'Limon', category: 'meyve-sebze', color: 'sarı', approxWeightKg: 0.1, approxVolumeL: 0.1, approxSizeCm: 6, sizeCategory: 'kucuk', tags: ['meyve', 'sarı', 'ekşi'] },
    { slug: 'olta', name: 'Olta', category: 'esya', color: 'mavi', approxWeightKg: 0.2, approxVolumeL: 0.3, approxSizeCm: 60, sizeCategory: 'orta', tags: ['balıkçılık', 'mavi', 'oyuncak'] },
    { slug: 'ordek2', name: 'Ördek', category: 'hayvan', color: 'yeşil-kahverengi', approxWeightKg: 1.2, approxVolumeL: 1.5, approxSizeCm: 25, sizeCategory: 'orta', tags: ['hayvan', 'kuş', 'yeşil'] },
    { slug: 'ucgen', name: 'Üçgen', category: 'oyuncak', color: 'ahşap', approxWeightKg: 0.05, approxVolumeL: 0.05, approxSizeCm: 8, sizeCategory: 'kucuk', tags: ['oyuncak', 'şekil', 'ahşap'] },
    { slug: 'otobus', name: 'Otobüs', category: 'oyuncak', color: 'mavi', approxWeightKg: 0.4, approxVolumeL: 2, approxSizeCm: 25, sizeCategory: 'orta', tags: ['oyuncak', 'taşıt', 'mavi'] },
    { slug: 'jelibon', name: 'Jelibon', category: 'yiyecek', color: 'kırmızı', approxWeightKg: 0.01, approxVolumeL: 0.01, approxSizeCm: 3, sizeCategory: 'kucuk', tags: ['yiyecek', 'şeker', 'kırmızı'] },
    { slug: 'ceviz', name: 'Ceviz', category: 'yiyecek', color: 'kahverengi', approxWeightKg: 0.01, approxVolumeL: 0.01, approxSizeCm: 4, sizeCategory: 'kucuk', tags: ['yiyecek', 'kuruyemiş', 'kahverengi'] },
    { slug: 'isik', name: 'Trafik Işığı', category: 'esya', color: 'kırmızı-sarı-yeşil', approxWeightKg: 15, approxVolumeL: 20, approxSizeCm: 200, sizeCategory: 'buyuk', tags: ['trafik', 'renkli', 'oyuncak'] },

    // 2026-09-14 — üçüncü tur ekleme (3 yeni görsel + ucak.jpg güncellemesi).
    { slug: 'ip', name: 'İp', category: 'esya', color: 'mor', approxWeightKg: 0.05, approxVolumeL: 0.05, approxSizeCm: 10, sizeCategory: 'kucuk', tags: ['ev', 'mor', 'sarım'] },
    { slug: 'lale', name: 'Lale', category: 'doga', color: 'kırmızı', approxWeightKg: 0.02, approxVolumeL: 0.02, approxSizeCm: 30, sizeCategory: 'kucuk', tags: ['çiçek', 'kırmızı', 'bitki'] },
    { slug: 'valiz', name: 'Valiz', category: 'esya', color: 'yeşil', approxWeightKg: 3, approxVolumeL: 40, approxSizeCm: 55, sizeCategory: 'orta', tags: ['seyahat', 'yeşil', 'çanta'] },
];

async function main() {
    for (const item of ITEMS) {
        await db.comparisonItem.upsert({
            where: { slug: item.slug },
            create: {
                slug: item.slug,
                name: item.name,
                category: item.category,
                color: item.color,
                approxWeightKg: item.approxWeightKg,
                approxVolumeL: item.approxVolumeL,
                approxSizeCm: item.approxSizeCm,
                sizeCategory: item.sizeCategory,
                imageUrl: `/karsilastirma/${item.slug}.jpg`,
                readingText: item.name,
                tags: item.tags.join(','),
            },
            update: {
                name: item.name,
                category: item.category,
                color: item.color,
                approxWeightKg: item.approxWeightKg,
                approxVolumeL: item.approxVolumeL,
                approxSizeCm: item.approxSizeCm,
                sizeCategory: item.sizeCategory,
                imageUrl: `/karsilastirma/${item.slug}.jpg`,
                readingText: item.name,
                tags: item.tags.join(','),
            },
        });
    }

    const count = await db.comparisonItem.count();
    console.log(`Tohumlanan karşılaştırma nesnesi: ${count} (beklenen: ${ITEMS.length})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
