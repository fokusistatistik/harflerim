/**
 * Faz 1.20 — bir kerelik, idempotent tohumlama betiği. Dört oyunun her biri
 * için bir Skill satırı oluşturur/günceller (key üzerinden upsert).
 *
 * Çalıştırma: npx tsx prisma/seedSkills.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const SKILLS = [
    { key: 'harf-tanima', label: 'Harf Tanıma' },
    { key: 'gorsel-hafiza', label: 'Görsel Hafıza' },
    { key: 'sesli-kelime-tanima', label: 'Sesli Kelime Tanıma' },
    { key: 'golge-eslestirme', label: 'Gölge Eşleştirme' },
];

async function main() {
    for (const skill of SKILLS) {
        await db.skill.upsert({
            where: { key: skill.key },
            create: skill,
            update: { label: skill.label },
        });
    }

    const count = await db.skill.count();
    console.log(`Tohumlanan beceri: ${count} (beklenen: ${SKILLS.length})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
