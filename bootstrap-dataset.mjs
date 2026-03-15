import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configuration
const GENERATION_BATCH_SIZE = 10;
const DELAY_BETWEEN_CALLS_MS = 3000;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const SYNTHETIC_PROFILES = [
  { sessionId: 'synthetic-user-alpha', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', country: 'US', referrer: 'https://github.com', utm: 'utm_source=github' },
  { sessionId: 'synthetic-user-beta', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) Safari/604.1', country: 'UK', referrer: 'https://twitter.com', utm: 'utm_source=twitter' },
  { sessionId: 'synthetic-user-gamma', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/115.0', country: 'DE', referrer: 'direct', utm: '' },
  { sessionId: 'synthetic-user-delta', userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/116.0.0.0 Mobile', country: 'IN', referrer: 'https://linkedin.com', utm: 'utm_source=linkedin' },
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Emulates a user visiting, generating a theme, and leaving interactions
async function simulateVisit(profileIndex) {
    const profile = SYNTHETIC_PROFILES[profileIndex % SYNTHETIC_PROFILES.length];
    
    console.log(`\n[Bootstrap] Emulating visit from ${profile.country} on ${profile.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}...`);

    try {
        // 1. Visit /api/theme to trigger generation and get the themeHistoryId
        const urlToFetch = profile.utm ? `${SITE_URL}/api/theme?${profile.utm}` : `${SITE_URL}/api/theme`;
        const themeRes = await fetch(urlToFetch, {
            headers: {
                'x-session-id': profile.sessionId,
                'user-agent': profile.userAgent,
                'x-vercel-ip-country': profile.country,
                'referer': profile.referrer
            }
        });

        if (!themeRes.ok) {
            console.error(`  -> Failed to generate theme: ${themeRes.status}`);
            return false;
        }

        const data = await themeRes.json();
        const themeHistoryId = data.themeHistoryId;
        const sessionId = data.sessionId;

        if (!themeHistoryId || themeHistoryId === 'fallback-id') {
             console.log(`  -> API rate limit likely hit (received fallback theme). Saving API credits and stopping.`);
             return 'RATE_LIMIT';
        }

        console.log(`  -> Theme generated: '${data.theme?.themeName}'. ID: ${themeHistoryId}`);

        // 2. Simulate random engagement (to give the LLM quality labels to train on)
        // High engagement > 0.6. Medium > 0.3. Low < 0.3.
        const scrollValue = Math.floor(Math.random() * 100); 
        const timeValue = Math.floor(Math.random() * 150);
        const clicks = Math.floor(Math.random() * 12);

        console.log(`  -> Emulating engagement: Scroll ${scrollValue}%, Time ${timeValue}s, Clicks ${clicks}`);

        const interactionsRes = await fetch(`${SITE_URL}/api/interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([
                { sessionId, themeHistoryId, eventType: 'scroll', value: scrollValue },
                { sessionId, themeHistoryId, eventType: 'time', value: timeValue },
                ...Array.from({ length: clicks }).map(() => ({ sessionId, themeHistoryId, eventType: 'click', value: 1 }))
            ])
        });

        if (interactionsRes.ok) {
            console.log(`  -> Recorded ${clicks + 2} low-level interactions.`);
            
            // 3. Simulate high-level semantic events
            if (clicks > 3) {
                const eventsRes = await fetch(`${SITE_URL}/api/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([
                        { sessionId, themeHistoryId, eventType: 'cta_click', sectionId: 'hero' },
                        { sessionId, themeHistoryId, eventType: 'project_expand', sectionId: 'projects', payload: { projectId: 'project-1' } }
                    ])
                });
                if (eventsRes.ok) console.log(`  -> Recorded semantic CTA click and Project expand events.`);
            }

            return true;
        } else {
            console.error(`  -> Failed to save interactions.`);
            return false;
        }

    } catch (error) {
         console.error(`  -> Error during simulation: ${error.message}`);
         return false;
    }
}

async function runBootstrapper() {
    console.log(`===============================================`);
    console.log(`  SYMBOLIC AI: SYNTHETIC DATASET BOOTSTRAPPER`);
    console.log(`===============================================`);
    console.log(`Targeting: ${SITE_URL}`);
    console.log(`Please ensure the local Next.js dev server is running on port 3000.`);

    let successCount = 0;
    
    for (let i = 0; i < GENERATION_BATCH_SIZE; i++) {
        console.log(`--- [Visit ${i + 1}/${GENERATION_BATCH_SIZE}] ---`);
        const status = await simulateVisit(i);
        
        if (status === 'RATE_LIMIT') {
             console.log(`\n🛑 Gemini API Quota Exceeded. Resuming tomorrow or use different key.`);
             break;
        } else if (status === true) {
             successCount++;
        }

        if (i < GENERATION_BATCH_SIZE - 1) {
            console.log(`  Waiting ${DELAY_BETWEEN_CALLS_MS}ms before next visit to respect API limits...`);
            await delay(DELAY_BETWEEN_CALLS_MS);
        }
    }

    console.log(`\n===============================================`);
    console.log(`  Done. Successfully generated ${successCount} new rows.`);
    console.log(`  Current Database Size:`);
    
    const count = await prisma.themeHistory.count();
    const high = await prisma.themeHistory.count({ where: { performanceLabel: 'high' } });
    console.log(`  - Total Themes: ${count}`);
    console.log(`  - High Performing: ${high}`);
    console.log(`===============================================`);
    process.exit(0);
}

runBootstrapper();
