import {
    Cat, Dog, Bird, Fish, Turtle, Rabbit, Bug, Car, Rocket, Orbit,
    Flower2, TreePine, Music2, Palette, Puzzle, Gamepad2, BookOpen, Star,
    type LucideIcon,
} from 'lucide-react';

/**
 * Faz 2.10 — ilgi alanı aksan katmanı. 1.4b'deki `interests` alanına
 * (childProfile.ts, serbest metin) göre lucide-react'ten mevcut bir ikon
 * seçilir — özel illüstrasyon YOK, yalnızca açık kaynak ikon kütüphanesi
 * (kullanıcı kararı). Eşleşme yoksa `Star` fallback'i kullanılır.
 *
 * Papatya logosu, ana renk paleti ve sekiz yapraklı ilerleme metaforu HER
 * ZAMAN sabit kalır — bu yalnızca üstüne giyilen küçük bir dekoratif katman,
 * marka kimliğinin veya GameShell'in kendisinin yerini almaz.
 */
const INTEREST_ICON_MAP: Record<string, LucideIcon> = {
    'kedi': Cat,
    'kediler': Cat,
    'köpek': Dog,
    'köpekler': Dog,
    'kuş': Bird,
    'kuşlar': Bird,
    'balık': Fish,
    'balıklar': Fish,
    'dinozor': Turtle,
    'dinozorlar': Turtle,
    'tavşan': Rabbit,
    'tavşanlar': Rabbit,
    'böcek': Bug,
    'böcekler': Bug,
    'araba': Car,
    'arabalar': Car,
    'uzay': Rocket,
    'roket': Rocket,
    'gezegen': Orbit,
    'gezegenler': Orbit,
    'çiçek': Flower2,
    'çiçekler': Flower2,
    'ağaç': TreePine,
    'ağaçlar': TreePine,
    'doğa': TreePine,
    'müzik': Music2,
    'resim': Palette,
    'boyama': Palette,
    'bulmaca': Puzzle,
    'oyun': Gamepad2,
    'oyunlar': Gamepad2,
    'kitap': BookOpen,
    'kitaplar': BookOpen,
};

export function getInterestIcon(interests: string[]): LucideIcon {
    for (const interest of interests) {
        const normalized = interest.toLocaleLowerCase('tr-TR').trim();
        const icon = INTEREST_ICON_MAP[normalized];
        if (icon) return icon;
    }
    return Star;
}
