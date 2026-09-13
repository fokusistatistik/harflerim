import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('1234', 10);
    // Dev/test kolaylığı için giriş şifresiyle AYNI değer (2026-09-13,
    // kullanıcı kararı — gerçek bir dağıtımdan önce mutlaka değiştirilmeli).
    const parentPin = await bcrypt.hash('1234', 10);

    const melike = await db.user.upsert({
        where: { username: 'Melike' },
        update: {
            // Var olan kullanıcıda da PIN'i senkron tutar — geliştirme
            // sırasında `npm run seed` tekrar çalıştırıldığında ebeveyn
            // PIN'i şaşırtıcı biçimde eski değerinde kalmasın diye.
            settings: { upsert: { create: { parentPin }, update: { parentPin } } },
        },
        create: {
            username: 'Melike',
            passwordHash,
            firstName: 'Melike',
            lastName: 'Bostanoğlu',
            settings: { create: { parentPin } },
        },
    });

    console.log(`Seed hazır: ${melike.firstName} ${melike.lastName} (${melike.username})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
