/**
 * Faz 1.3 — bir kerelik geri dönüşlü betik. `UserSettings.parentPin` bugüne
 * kadar düz metin olarak saklanıyordu (şema varsayılanı "0000"); ebeveyn
 * kapısı gerçek bir güvenlik sınırı olduğu için bundan böyle bcrypt hash
 * olarak saklanır. Bu betik, henüz bcrypt formatında olmayan (düz metin)
 * satırları hash'ler — idempotent, zaten hash'li satırlara dokunmaz.
 *
 * Çalıştırma: npx tsx prisma/backfillParentPin.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();
const BCRYPT_HASH_RE = /^\$2[aby]\$/;

async function main() {
    const rows = await db.userSettings.findMany();
    let updated = 0;

    for (const row of rows) {
        if (!BCRYPT_HASH_RE.test(row.parentPin)) {
            const hash = await bcrypt.hash(row.parentPin, 10);
            await db.userSettings.update({ where: { id: row.id }, data: { parentPin: hash } });
            updated++;
        }
    }

    console.log(`${updated}/${rows.length} parentPin alanı hash'lendi.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
