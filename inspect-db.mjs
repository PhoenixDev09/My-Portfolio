import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fullCheck() {
    const totalSessions = await prisma.visitSession.count();
    const totalThemes = await prisma.themeHistory.count();
    const totalInteractions = await prisma.interaction.count();
    const totalEvents = await prisma.visitorEvent.count();

    console.log('=== DATABASE COUNTS ===');
    console.log(`Sessions: ${totalSessions}`);
    console.log(`ThemeHistory rows: ${totalThemes}`);
    console.log(`Interactions: ${totalInteractions}`);
    console.log(`VisitorEvents: ${totalEvents}`);
    console.log('');
    
    console.log('=== RECENT SESSIONS (checking for nulls) ===');
    const sessions = await prisma.visitSession.findMany({
        take: 3,
        orderBy: { updatedAt: 'desc' },
        select: {
            sessionId: true,
            visitCount: true,
            device: true,
            browser: true,
            os: true,
            country: true,
            referrer: true,
            utmSource: true,
            userAgent: true,
        }
    });
    sessions.forEach(s => {
        const nullFields = Object.entries(s).filter(([k, v]) => v === null).map(([k]) => k);
        console.log(`  [Session ${s.sessionId.slice(0,12)}]  visits=${s.visitCount}  device=${s.device}  browser=${s.browser}  os=${s.os}  country=${s.country}  utm=${s.utmSource}  nullFields: [${nullFields.join(', ') || 'none'}]`);
    });
    console.log('');

    console.log('=== RECENT THEMES (checking pageArchitecture + performance label) ===');
    const themes = await prisma.themeHistory.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            themeName: true,
            sessionId: true,
            visitNumber: true,
            shapeLanguage: true,
            iconSet: true,
            animationStyle: true,
            engagementScore: true,
            performanceLabel: true,
            scrollDepth: true,
            timeSpent: true,
            clickCount: true,
            themeJson: true,
        }
    });

    themes.forEach(t => {
        let arch = 'MISSING';
        try { arch = JSON.parse(t.themeJson).layoutSchema?.pageArchitecture || 'MISSING'; } catch {}
        const nullFields = Object.entries(t).filter(([k, v]) => v === null || v === undefined).map(([k]) => k);
        console.log(`  [${t.id.slice(0,12)}] ${t.themeName} | arch=${arch} | shape=${t.shapeLanguage} | score=${t.engagementScore.toFixed(2)} | label=${t.performanceLabel} | scroll=${t.scrollDepth}% | time=${t.timeSpent}s | nulls=[${nullFields.join(', ') || 'none'}]`);
    });
    console.log('');

    console.log('=== THEME ARCHITECTURE DISTRIBUTION ===');
    const allThemes = await prisma.themeHistory.findMany({ select: { themeJson: true } });
    const archCount = {};
    allThemes.forEach(t => {
        try {
            const arch = JSON.parse(t.themeJson).layoutSchema?.pageArchitecture || 'standard';
            archCount[arch] = (archCount[arch] || 0) + 1;
        } catch {}
    });
    Object.entries(archCount).sort(([,a],[,b]) => b-a).forEach(([arch, count]) => {
        const bar = '█'.repeat(Math.round(count / allThemes.length * 30));
        console.log(`  ${arch.padEnd(14)}: ${bar} (${count}/${allThemes.length})`);
    });
    console.log('');

    console.log('=== INTERACTION TYPE DISTRIBUTION ===');
    const interactions = await prisma.interaction.groupBy({
        by: ['eventType'],
        _count: { eventType: true }
    });
    interactions.forEach(i => console.log(`  ${i.eventType.padEnd(12)}: ${i._count.eventType}`));
    console.log('');

    console.log('=== VISITOR EVENT TYPES ===');
    const events = await prisma.visitorEvent.groupBy({
        by: ['eventType'],
        _count: { eventType: true }
    });
    events.forEach(e => console.log(`  ${e.eventType.padEnd(16)}: ${e._count.eventType}`));
    
    await prisma.$disconnect();
}

fullCheck().catch(console.error);
