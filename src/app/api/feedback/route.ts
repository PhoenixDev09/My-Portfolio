import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { themeHistoryId, rating } = body;

        if (!themeHistoryId || !rating) {
            return NextResponse.json({ error: 'Missing rating payload' }, { status: 400 });
        }

        const validRatings = ['too_complex', 'perfect', 'too_simple'];
        if (!validRatings.includes(rating)) {
            return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
        }

        await prisma.themeHistory.update({
            where: { id: themeHistoryId },
            data: { explicitFeedback: rating }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[API Feedback]', e);
        return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
    }
}
