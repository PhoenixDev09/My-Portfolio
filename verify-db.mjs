import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const sessions = await prisma.visitSession.findMany({ take: 3, orderBy: { createdAt: 'desc'} });
    const themes = await prisma.themeHistory.findMany({ take: 3, orderBy: { createdAt: 'desc'} });
    const events = await prisma.visitorEvent.findMany({ take: 3, orderBy: { createdAt: 'desc'} });
    const interactions = await prisma.interaction.findMany({ take: 3, orderBy: { createdAt: 'desc'} });

    console.log("=== RECENT SESSIONS ===");
    console.log(JSON.stringify(sessions, null, 2));

    console.log("=== RECENT THEMES ===");
    console.log(JSON.stringify(themes, null, 2));

    console.log("=== RECENT VISITOR EVENTS ===");
    console.log(JSON.stringify(events, null, 2));

    console.log("=== RECENT INTERACTIONS ===");
    console.log(JSON.stringify(interactions, null, 2));

    await prisma.$disconnect();
}

check().catch(console.error);
