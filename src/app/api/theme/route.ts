import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { ThemeGenerationEngine } from '@/lib/ai/themeGenerator';
import { SymbolicContentRewriter } from '@/lib/ai/contentRewriter';
import { AdaptiveIntelligence } from '@/lib/ai/adaptiveIntelligence';
import { coreContent } from '@/lib/coreContent';
import { ThemeResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
        // ── Session Management ─────────────────────────────────────────────────────
        const cookieStore = await cookies();
        // Allow clients (like our bootstrapper) to pass session IDs via header
        let sessionId = request.headers.get('x-session-id') || cookieStore.get('sym_session')?.value;
        const isNewSession = !sessionId;
        if (!sessionId) {
            sessionId = uuidv4();
        }

        // ── Adaptive Intelligence ──────────────────────────────────────────────────
        const adaptiveAI = new AdaptiveIntelligence();
        const visitorContext = {
            sessionId,
            url: request.url,
            userAgent: request.headers.get('user-agent') || undefined,
            country: request.headers.get('x-vercel-ip-country') || undefined,
            referrer: request.headers.get('referer') || undefined,
        };
        const preferenceContext = await adaptiveAI.getPreferenceContext(visitorContext);

        // ── Theme Generation ───────────────────────────────────────────────────────
        const themeEngine = new ThemeGenerationEngine();
        const theme = await themeEngine.generate(preferenceContext);

        // ── Content Rewriting ──────────────────────────────────────────────────────
        const contentRewriter = new SymbolicContentRewriter();
        const content = await contentRewriter.rewrite(coreContent, theme);

        // ── Record Full Theme Snapshot to DB (LLM Training Data) ──────────────────
        // Stores: full theme JSON, full content JSON, sessionId, visitNumber
        // Returns: themeHistoryId to link all subsequent user interactions to this render
        const themeHistoryId = await adaptiveAI.recordThemeVisit(
            sessionId,
            theme,
            content,
            preferenceContext
        );

        // ── Response ───────────────────────────────────────────────────────────────
        const responseData: ThemeResponse = {
            theme,
            content,
            sessionId,
            visitNumber: preferenceContext.visitCount,
            themeHistoryId,
        };

        const response = NextResponse.json(responseData);

        // Prevent Next.js from aggressively caching this route
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        if (isNewSession) {
            response.cookies.set('sym_session', sessionId, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
        }

        return response;
    } catch (error) {
        console.error('[/api/theme] Critical error:', error);
        return NextResponse.json(
            { error: 'Failed to generate theme', details: String(error) },
            { status: 500 }
        );
    }
}
