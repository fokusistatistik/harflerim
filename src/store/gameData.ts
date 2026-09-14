export interface LetterAsset {
    word: string;
    img: string;
}

// Collection of objects for each letter
export const LETTER_OBJECTS: Record<string, LetterAsset[]> = {
    'A': [
        { word: 'Araba', img: '/karsilastirma/araba.jpg' },
        { word: 'Arı', img: '/karsilastirma/ari.jpg' },
        { word: 'Ayakkabı', img: '/karsilastirma/ayakkabi.jpg' },
        { word: 'Anahtar', img: '/karsilastirma/anahtar.jpg' },
        { word: 'At', img: '/karsilastirma/at.jpg' }
    ],
    'B': [
        { word: 'Balık', img: '/karsilastirma/balik.jpg' },
        { word: 'Balon', img: '/karsilastirma/balon.jpg' },
        { word: 'Bisiklet', img: '/karsilastirma/bisiklet.jpg' }
    ],
    'C': [
        { word: 'Civciv', img: '/karsilastirma/civciv.jpg' },
        { word: 'Ceviz', img: '/karsilastirma/ceviz.jpg' }
    ],
    'Ç': [
        { word: 'Çiçek', img: '/karsilastirma/cicek.jpg' },
        { word: 'Çanta', img: '/karsilastirma/canta.jpg' },
        { word: 'Çorap', img: '/karsilastirma/corap.jpg' }
    ],
    'D': [
        { word: 'Dondurma', img: '/karsilastirma/dondurma.jpg' },
        { word: 'Domates', img: '/karsilastirma/domates.jpg' },
        { word: 'Deve', img: '/karsilastirma/deve.jpg' }
    ],
    'E': [
        { word: 'Elma', img: '/karsilastirma/elma.jpg' },
        { word: 'Eldiven', img: '/karsilastirma/eldiven.jpg' },
        { word: 'Ekmek', img: '/karsilastirma/ekmek.jpg' },
        { word: 'Elbise', img: '/karsilastirma/elbise.jpg' },
        { word: 'Eşek', img: '/karsilastirma/esek.jpg' }
    ],
    'F': [
        { word: 'Fil', img: '/karsilastirma/fil.jpg' }
    ],
    'G': [
        { word: 'Güneş', img: '/karsilastirma/gunes.jpg' },
        { word: 'Gemi', img: '/karsilastirma/gemi.jpg' },
        { word: 'Gitar', img: '/karsilastirma/gitar.jpg' },
        { word: 'Gökkuşağı', img: '/karsilastirma/gokkusagi.jpg' }
    ],
    'Ğ': [
        { word: 'Ağaç', img: '/karsilastirma/agac.jpg' }
    ],
    'H': [
        { word: 'Havuç', img: '/karsilastirma/havuc.jpg' }
    ],
    'I': [
        { word: 'Işık', img: '/karsilastirma/isik.jpg' }
    ],
    'İ': [
        { word: 'İnek', img: '/karsilastirma/inek.jpg' },
        { word: 'İp', img: '/karsilastirma/ip.jpg' }
    ],
    'J': [
        { word: 'Jelibon', img: '/karsilastirma/jelibon.jpg' }
    ],
    'K': [
        { word: 'Kedi', img: '/karsilastirma/kedi.jpg' },
        { word: 'Köpek', img: '/karsilastirma/kopek.jpg' },
        { word: 'Karpuz', img: '/karsilastirma/karpuz.jpg' },
        { word: 'Kaplumbağa', img: '/karsilastirma/kaplumbaga.jpg' }
    ],
    'L': [
        { word: 'Limon', img: '/karsilastirma/limon.jpg' },
        { word: 'Lale', img: '/karsilastirma/lale.jpg' }
    ],
    'M': [
        { word: 'Muz', img: '/karsilastirma/muz.jpg' },
        { word: 'Masa', img: '/karsilastirma/masa.jpg' }
    ],
    'N': [
        { word: 'Nar', img: '/karsilastirma/nar.jpg' }
    ],
    'O': [
        { word: 'Otobüs', img: '/karsilastirma/otobus.jpg' },
        { word: 'Olta', img: '/karsilastirma/olta.jpg' }
    ],
    'Ö': [
        { word: 'Ördek', img: '/karsilastirma/ordek2.jpg' }
    ],
    'P': [
        { word: 'Portakal', img: '/karsilastirma/portakal.jpg' },
        { word: 'Pantolon', img: '/karsilastirma/pantolon.jpg' },
        { word: 'Penguen', img: '/karsilastirma/penguen.jpg' },
        { word: 'Pasta', img: '/karsilastirma/pasta.jpg' },
        { word: 'Piyano', img: '/karsilastirma/piyano.jpg' }
    ],
    'R': [
        { word: 'Raket', img: '/karsilastirma/raket.jpg' }
    ],
    'S': [
        { word: 'Saat', img: '/karsilastirma/saat.jpg' },
        { word: 'Sandalye', img: '/karsilastirma/sandalye.jpg' },
        { word: 'Simit', img: '/karsilastirma/simit.jpg' },
        { word: 'Soğan', img: '/karsilastirma/sogan.jpg' }
    ],
    'Ş': [
        { word: 'Şemsiye', img: '/karsilastirma/semsiye.jpg' },
        { word: 'Şapka', img: '/karsilastirma/sapka.jpg' }
    ],
    'T': [
        { word: 'Tavşan', img: '/karsilastirma/tavsan.jpg' },
        { word: 'Top', img: '/karsilastirma/top.jpg' },
        { word: 'Tavuk', img: '/karsilastirma/tavuk.jpg' },
        { word: 'Tencere', img: '/karsilastirma/tencere.jpg' }
    ],
    'U': [
        { word: 'Uçak', img: '/karsilastirma/ucak.jpg' }
    ],
    'Ü': [
        { word: 'Üzüm', img: '/karsilastirma/uzum.jpg' },
        { word: 'Üçgen', img: '/karsilastirma/ucgen.jpg' }
    ],
    'V': [
        { word: 'Valiz', img: '/karsilastirma/valiz.jpg' }
    ],
    'Y': [
        { word: 'Yumurta', img: '/karsilastirma/yumurta.jpg' },
        { word: 'Yıldız', img: '/karsilastirma/yildiz.jpg' },
        { word: 'Yaprak', img: '/karsilastirma/yaprak.jpg' },
        { word: 'Yatak', img: '/karsilastirma/yatak.jpg' },
        { word: 'Yunus', img: '/karsilastirma/yunus.jpg' }
    ],
    'Z': [
        { word: 'Zeytin', img: '/karsilastirma/zeytin.jpg' },
        { word: 'Zürafa', img: '/karsilastirma/zurafa.jpg' }
    ]
};

export const ALPHABET_ORDER = Object.keys(LETTER_OBJECTS);

// 2026-09-14 — eski static.fokusistatistik.com/melike/harfler/ CDN'i tamamen
// öldü (tüm 23 harf linki 404, kullanıcı testinde "linkler patlak" olarak
// bulundu). Yeni harf görselleri artık YEREL (public/harfler/) — bkz.
// PROMPTLAR.md Bölüm 1b (AI üretim promptları) ve dokumantasyon/harf-gorselleri.md.
// Dosya henüz yoksa ImageWithFallback zarif bir yer tutucu gösterir (kırık
// resim ikonu değil) — bkz. src/components/ui/ImageWithFallback.tsx.
export const LETTER_IMAGES: Record<string, string> = {
    'A': '/harfler/harf_a.png',
    'B': '/harfler/harf_b.png',
    'C': '/harfler/harf_c.png',
    'Ç': '/harfler/harf_c_cedil.png',
    'D': '/harfler/harf_d.png',
    'E': '/harfler/harf_e.png',
    'F': '/harfler/harf_f.png',
    'G': '/harfler/harf_g.png',
    'Ğ': '/harfler/harf_g_breve.png',
    'H': '/harfler/harf_h.png',
    'I': '/harfler/harf_i_noktasiz.png',
    'İ': '/harfler/harf_i.png',
    'J': '/harfler/harf_j.png',
    'K': '/harfler/harf_k.png',
    'L': '/harfler/harf_l.png',
    'M': '/harfler/harf_m.png',
    'N': '/harfler/harf_n.png',
    'O': '/harfler/harf_o.png',
    'Ö': '/harfler/harf_o_noktali.png',
    'P': '/harfler/harf_p.png',
    'R': '/harfler/harf_r.png',
    'S': '/harfler/harf_s.png',
    'Ş': '/harfler/harf_s_noktali.png',
    'T': '/harfler/harf_t.png',
    'U': '/harfler/harf_u.png',
    'Ü': '/harfler/harf_u_noktali.png',
    'V': '/harfler/harf_v.png',
    'Y': '/harfler/harf_y.png',
    'Z': '/harfler/harf_z.png'
};

export const AUDIOS = {
    correct: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3',
    wrong: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
    complete: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    // UX düzeltmesi (2026-09-13) — eski freesound.org linki 404 veriyordu
    // (kullanıcı testinde bulundu). Diğer oyunların zaten kullandığı yerel
    // dosyaya (public/sounds/error.wav) taşındı — "yanlış/pas" hissi için uygun.
    sad: '/sounds/error.wav',
};
