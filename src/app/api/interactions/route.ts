import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { InteractionEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const events: InteractionEvent[] = Array.isArray(body) ? body : [body];

        if (events.length === 0) {
            return NextResponse.json({ error: 'No events provided' }, { status: 400 });
        }

        // Batch insert interactions — now with themeHistoryId and sectionId linking
        await prisma.interaction.createMany({
            data: events.map((event) => ({
                sessionId: event.sessionId,
                themeHistoryId: event.themeHistoryId ?? null,
                sectionId: event.sectionId ?? null,
                eventType: event.eventType,
                value: event.value,
                metadata: event.metadata ? JSON.stringify(event.metadata) : null,
            })),
        });

        // Trigger async engagement score update using themeHistoryId
        const { AdaptiveIntelligence } = await import('@/lib/ai/adaptiveIntelligence');
        const ai = new AdaptiveIntelligence();
        const themeHistoryId = events[0]?.themeHistoryId;
        const sessionId = events[0]?.sessionId;
        if (sessionId && themeHistoryId) {
            ai.updateEngagementScore(sessionId, themeHistoryId).catch(console.error);
        }

        return NextResponse.json({ success: true, recorded: events.length });
    } catch (error) {
        console.error('[/api/interactions] Error:', error);
        return NextResponse.json(
            { error: 'Failed to record interactions' },
            { status: 500 }
        );
    }
}
