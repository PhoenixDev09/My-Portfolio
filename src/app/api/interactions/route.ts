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

        // AL-03: Group events by themeHistoryId and update engagement for ALL unique themes.
        // Previously only events[0].themeHistoryId was used — if a 30-event batch spanned two
        // themes (user morphed mid-session), only the first theme got its score updated.
        const { AdaptiveIntelligence } = await import('@/lib/ai/adaptiveIntelligence');
        const ai = new AdaptiveIntelligence();

        // Build a map of themeHistoryId → sessionId from the batch
        const themeSessionMap = new Map<string, string>();
        for (const e of events) {
            if (e.themeHistoryId && e.sessionId) {
                themeSessionMap.set(e.themeHistoryId, e.sessionId);
            }
        }

        // Fire engagement updates for every unique theme in this batch (non-blocking)
        await Promise.allSettled(
            [...themeSessionMap.entries()].map(([themeHistoryId, sessionId]) =>
                ai.updateEngagementScore(sessionId, themeHistoryId).catch(console.error)
            )
        );

        return NextResponse.json({ success: true, recorded: events.length });
    } catch (error) {
        // Interaction tracking is non-critical telemetry — a DB connectivity failure
        // (e.g., Neon cold-start, transient network blip) must never propagate as a
        // client-visible 500. Return 202 so the tracker doesn't surface console errors
        // to Sandeep's visitors while still logging the issue server-side for debugging.
        const message = error instanceof Error ? error.message : String(error);
        const isConnectError = message.includes("Can't reach database") || message.includes('connect');
        if (isConnectError) {
            console.warn('[/api/interactions] DB unreachable — interaction data dropped for this batch:', message);
            return NextResponse.json({ success: false, dropped: true, reason: 'db_unavailable' }, { status: 202 });
        }
        console.error('[/api/interactions] Error:', error);
        return NextResponse.json(
            { error: 'Failed to record interactions' },
            { status: 500 }
        );
    }
}
