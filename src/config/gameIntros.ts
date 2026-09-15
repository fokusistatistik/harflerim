/**
 * 2026-09-14 — her oyun/araç ekranına eklenen sade tanıtım kartının metin
 * kaynağı. Buradaki `description` çocuğa (ve yanındaki ebeveyne) hitap eder,
 * teknik olmayan sıcak bir dille yazılır. Hangi beceriyi ölçtüğü/diğer
 * oyunlardan farkı gibi teknik detaylar burada DEĞİL, ilgili oyun
 * komponentinin kod yorumunda tutulur (ör. MemoryMatchGame.tsx, GameBoard.tsx).
 */

export interface GameIntro {
    id: string;
    title: string;
    description: string;
}

export const GAME_INTROS: Record<string, GameIntro> = {
    'letter-hunt': {
        id: 'letter-hunt',
        title: 'Harf Avı',
        description: 'Söylenen harfi doğru yere sürükle. Harfleri tanımayı ve birbirine benzeyenleri ayırt etmeyi eğlenerek öğren.',
    },
    'memory-match': {
        id: 'memory-match',
        title: 'Hafıza Kartları',
        description: 'Kartları çevir, aynısını bul. Gördüğünü hatırlama gücünü güçlendiren bir eşleştirme oyunu.',
    },
    'magic-words': {
        id: 'magic-words',
        title: 'Sihirli Kelimeler',
        description: 'Duyduğun kelimeyi kendi sesinle tekrar et. Konuşma ve dinleme becerini birlikte geliştirir.',
    },
    'visual-match': {
        id: 'visual-match',
        title: 'Gölge Eşleştirme',
        description: 'Nesnenin gölgesine bak, doğru resmi bul ve gölgenin üzerine sürükle. Görsel tanımayı ve ayırt etmeyi öğretir.',
    },
    'family-album': {
        id: 'family-album',
        title: 'Aile Albümü',
        description: 'Ailenin fotoğraflarına bakıp "bu kim?" sorusuna cevap ver. Sevdiklerini tanımanı pekiştirir.',
    },
    'camera-character': {
        id: 'camera-character',
        title: 'Kamera Karakteri',
        description: 'Hareket ettikçe kendi çizgi film karakterin de hareket eder. Ekranda sen değil, karakterin görünür.',
    },
    'drawing-board': {
        id: 'drawing-board',
        title: 'Çizim Tahtası',
        description: 'İstediğin gibi serbestçe çiz. Hayal gücünü ve el becerini geliştiren, tamamen senin alanın.',
    },
    'music-corner': {
        id: 'music-corner',
        title: 'Müzik Köşesi',
        description: 'Sevdiğin şarkıları dinle. Ritim ve dinleme keyfini bir araya getirir.',
    },
    'writing-practice': {
        id: 'writing-practice',
        title: 'Yazı Alıştırması',
        description: 'Harfleri kılavuzu takip ederek ya da serbestçe yaz. El becerini ve harf hafızanı güçlendirir.',
    },
    'aac-board': {
        id: 'aac-board',
        title: 'İletişim Tahtası',
        description: 'Dokunduğun simge senin yerine konuşur. İstediğin an, istediğin kadar kullanabileceğin bir yardımcı.',
    },
    cartoon: {
        id: 'cartoon',
        title: 'Çizgi Filmim',
        description: 'Kendine ayrılmış videoları izle. Sana özel seçilmiş, sakin bir izleme molası.',
    },
};
