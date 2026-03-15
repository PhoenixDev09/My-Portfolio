import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
    await prisma.interaction.deleteMany();
    await prisma.visitorEvent.deleteMany();
    await prisma.themeHistory.deleteMany();
    await prisma.visitSession.deleteMany();
}

clean()
    .then(() => console.log('Database truncated successfully! All nulls are gone.'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
