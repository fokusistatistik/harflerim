/**
 * Faz 1.4 — bir kerelik içerik taşıma betiği. `src/store/gameData.ts`'teki
 * LETTER_OBJECTS/LETTER_IMAGES/ALPHABET_ORDER içeriğini ContentSet/ContentItem
 * tablolarına aktarır. Kelime/harf İÇERİĞİ değişmez, yalnızca taşınır.
 *
 * Çalıştırma: npx tsx prisma/seedContent.ts
 * Idempotent: zaten var olan bir harf `upsert` ile güncellenir, tekrar
 * çalıştırmak veri çoğaltmaz.
 */
import { PrismaClient } from '@prisma/client';
import { ALPHABET_ORDER, LETTER_OBJECTS, LETTER_IMAGES } from '../src/store/gameData';

const db = new PrismaClient();

async function main() {
    let totalItemsBefore = 0;
    for (const letter of ALPHABET_ORDER) totalItemsBefore += LETTER_OBJECTS[letter].length;

    for (let i = 0; i < ALPHABET_ORDER.length; i++) {
        const letter = ALPHABET_ORDER[i];
        const words = LETTER_OBJECTS[letter];
        const imageUrl = LETTER_IMAGES[letter];

        const set = await db.contentSet.upsert({
            where: { letter },
            create: { letter, order: i, imageUrl },
            update: { order: i, imageUrl },
        });

        // Idempotency: bu harfin eski kelimelerini silip yeniden yaz (sıra korunur).
        await db.contentItem.deleteMany({ where: { contentSetId: set.id } });
        await db.contentItem.createMany({
            data: words.map((w, idx) => ({
                contentSetId: set.id,
                word: w.word,
                imageUrl: w.img,
                order: idx,
            })),
        });
    }

    const totalSetsAfter = await db.contentSet.count();
    const totalItemsAfter = await db.contentItem.count();

    console.log(`Taşınan harf grubu: ${totalSetsAfter} / ${ALPHABET_ORDER.length}`);
    console.log(`Taşınan kelime: ${totalItemsAfter} / ${totalItemsBefore}`);

    if (totalSetsAfter !== ALPHABET_ORDER.length || totalItemsAfter !== totalItemsBefore) {
        throw new Error('Veri kaybı kontrolü BAŞARISIZ: taşınan kayıt sayısı orijinal veriyle eşleşmiyor.');
    }
    console.log('Doğrulama başarılı: taşınan kayıt sayısı orijinal veriyle eşleşiyor.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
