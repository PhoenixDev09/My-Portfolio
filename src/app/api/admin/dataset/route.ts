import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Simple security: Require a secret token in the Authorization header
        // For local dev, we check for a specific test token. In production, use env var.
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.ADMIN_SECRET || 'local-dev-secret';

        if (authHeader !== `Bearer ${expectedToken}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Fetch all ThemeHistory rows that have a performance label (meaning they've been evaluated)
        const themeHistory = await prisma.themeHistory.findMany({
            where: {
                performanceLabel: { not: null }
            },
            include: {
                session: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format as JSONL for LLM instruction fine-tuning
        let jsonlData = '';

        for (const record of themeHistory) {
            try {
                const preferenceContext = JSON.parse(record.preferenceContextJson || '{}');
                const theme = JSON.parse(record.themeJson || '{}');
                const content = JSON.parse(record.contentJson || '{}');

                const trainingRow = {
                    input: {
                        visitorContext: {
                            visitCount: record.session.visitCount,
                            device: record.session.device || 'unknown',
                            country: record.session.country || 'unknown',
                            referrer: record.session.referrer || 'direct',
                        },
                        behaviorHistory: {
                            dominantInteraction: preferenceContext.dominantInteraction || 'scanner',
                            preferredComplexity: preferenceContext.preferredComplexity || 'moderate',
                            historicalAvgEngagement: preferenceContext.avgEngagement || 0.5,
                            topThemePatterns: preferenceContext.topThemePatterns || [],
                        }
                    },
                    output: {
                        theme: {
                            themeName: record.themeName,
                            shapeLanguage: record.shapeLanguage,
                            iconSet: record.iconSet,
                            animationStyle: record.animationStyle,
                            colorPalette: theme.colorPalette,
                            typography: theme.typography,
                            layoutSchema: theme.layoutSchema,
                            philosophy: theme.philosophy,
                            symbolicReasoning: theme.symbolicReasoning
                        },
                        contentRewrite: content
                    },
                    label: {
                        engagementScore: record.engagementScore,
                        timeSpent: record.timeSpent,
                        scrollDepth: record.scrollDepth,
                        clickCount: record.clickCount,
                        performanceLabel: record.performanceLabel
                    }
                };

                jsonlData += JSON.stringify(trainingRow) + '\n';
            } catch (err) {
                console.error(`Row parse error for ${record.id}:`, err);
                continue;
            }
        }

        // Return as a downloadable JSONL file
        return new NextResponse(jsonlData, {
            status: 200,
            headers: {
                'Content-Type': 'application/jsonlines',
                'Content-Disposition': `attachment; filename="symbolic_ai_dataset_${new Date().toISOString().split('T')[0]}.jsonl"`,
            },
        });

    } catch (error) {
        console.error('[/api/admin/dataset] Error exporting dataset:', error);
        return NextResponse.json({ error: 'Failed to export dataset' }, { status: 500 });
    }
}
