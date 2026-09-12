import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('1234', 10);
    const parentPin = await bcrypt.hash('0000', 10);

    const melike = await db.user.upsert({
        where: { username: 'Melike' },
        update: {},
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
