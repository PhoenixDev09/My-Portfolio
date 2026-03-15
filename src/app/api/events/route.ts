import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const events = Array.isArray(body) ? body : [body];

        if (events.length === 0) {
            return NextResponse.json({ error: 'No events provided' }, { status: 400 });
        }

        // Batch insert semantic visitor events
        await prisma.visitorEvent.createMany({
            data: events.map((event: any) => ({
                sessionId: event.sessionId,
                themeHistoryId: event.themeHistoryId ?? null,
                eventType: event.eventType,
                sectionId: event.sectionId ?? null,
                dwellSeconds: event.dwellSeconds ?? null,
                elementId: event.elementId ?? null,
                payload: event.payload ? JSON.stringify(event.payload) : null,
            })),
        });

        // We don't necessarily update the engagement score for these semantic events instantly,
        // but we could if we wanted to weight CTA clicks heavily.
        // For now, they are just securely saved for future LLM training labelling.

        return NextResponse.json({ success: true, recorded: events.length });
    } catch (error) {
        console.error('[/api/events] Error:', error);
        return NextResponse.json(
            { error: 'Failed to record events' },
            { status: 500 }
        );
    }
}
