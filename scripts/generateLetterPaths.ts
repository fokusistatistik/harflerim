/**
 * Faz 2.7 — bir kerelik, yeniden çalıştırılabilir üretim betiği. Yazı
 * alıştırmasındaki noktalı kılavuz çizgileri için, `src/store/gameData.ts`
 * ALPHABET_ORDER ile birebir aynı 28 harfin glyph outline'larını
 * opentype.js ile Patrick Hand yazı tipinden (el yazısı görünümü, projede
 * zaten `font-hand` olarak kullanılıyor) SVG path stringlerine çevirir.
 *
 * opentype.js/font koordinat sistemi y-yukarı, SVG y-aşağıdır. Bunu manuel
 * path komutu çevirmeden çözmek için: path RAW (font uzayında) saklanır,
 * `viewBox` ise `scale(1,-1)` transformuyla birlikte doğru çerçeveleyecek
 * şekilde önceden hesaplanır — bileşen yalnızca `<path transform="scale(1,-1)">`
 * uygular, hiçbir komut satırını tek tek çevirmez.
 *
 * Çalışma zamanında opentype.js/font dosyası parse ETMEZ — çıktı
 * src/data/letterPaths.json'a yazılır ve uygulama yalnızca bu statik JSON'u
 * okur. Harf seti değişirse (gameData.ts) bu betik tekrar çalıştırılmalı.
 *
 * Çalıştırma: npx tsx scripts/generateLetterPaths.ts
 */
import * as opentype from 'opentype.js';
import fs from 'fs';
import path from 'path';

const FONT_PATH = path.join(__dirname, 'fonts', 'PatrickHand-Regular.ttf');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'letterPaths.json');

const LETTERS = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N',
    'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
];

const FONT_SIZE = 200;
const PADDING = 20;

function main() {
    const buffer = fs.readFileSync(FONT_PATH);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const font = opentype.parse(arrayBuffer as ArrayBuffer);

    const result: Record<string, { path: string; viewBox: string }> = {};

    for (const letter of LETTERS) {
        const glyph = font.charToGlyph(letter);
        const glyphPath = glyph.getPath(0, 0, FONT_SIZE);
        const bbox = glyphPath.getBoundingBox();

        const width = bbox.x2 - bbox.x1;
        const height = bbox.y2 - bbox.y1;

        // scale(1,-1) sonrası bir font-uzayı noktası (x, y) ekranda (x, -y)'e
        // düşer — bu yüzden viewBox'ın y aralığı [-bbox.y2, -bbox.y1] olmalı.
        const viewX = bbox.x1 - PADDING;
        const viewY = -bbox.y2 - PADDING;
        const viewW = width + PADDING * 2;
        const viewH = height + PADDING * 2;

        result[letter] = {
            path: glyphPath.toPathData(2),
            viewBox: `${round(viewX)} ${round(viewY)} ${round(viewW)} ${round(viewH)}`,
        };
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n');
    console.log(`Üretilen harf yolu: ${Object.keys(result).length} (beklenen: ${LETTERS.length}) -> ${OUTPUT_PATH}`);
}

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

main();
