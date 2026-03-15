import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Lightweight health check — does NOT touch the database.
 * Safe to hit every 5 min from a cron job to keep the Neon DB warm.
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        service: 'symbolic-ai-engine',
    }, { status: 200 });
}
