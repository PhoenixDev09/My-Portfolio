import { prisma } from '../db';
import { PreferenceContext, Theme, RewrittenContent } from '../types';

export interface VisitorContext {
    sessionId: string;
    url?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
}

export class AdaptiveIntelligence {
    async getPreferenceContext(context: VisitorContext): Promise<PreferenceContext> {
        try {
            // Very simple parser for device/browser from user agent (could be richer later)
            const ua = context.userAgent || '';
            const isMobile = ua.match(/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/) ? 'mobile' : 'desktop';
            
            let browser = 'Unknown';
            if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
            else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
            else if (ua.includes('Edg')) browser = 'Edge';

            let os = 'Unknown';
            if (ua.match(/Win/)) os = 'Windows';
            else if (ua.match(/Mac/)) os = 'macOS';
            else if (ua.match(/Linux/)) os = 'Linux';
            else if (ua.match(/Android/)) os = 'Android';
            else if (ua.match(/like Mac OS X/)) os = 'iOS';

            let utmSource = undefined;
            if (context.url) {
                try {
                    const urlObj = new URL(context.url);
                    utmSource = urlObj.searchParams.get('utm_source') || undefined;
                } catch { /* ignore */ }
            }

            const session = await prisma.visitSession.upsert({
                where: { sessionId: context.sessionId },
                update: {
                    visitCount: { increment: 1 },
                    userAgent: context.userAgent,
                    device: isMobile,
                    browser,
                    os,
                    country: context.country,
                    referrer: context.referrer,
                    utmSource,
                },
                create: {
                    sessionId: context.sessionId,
                    visitCount: 1,
                    userAgent: context.userAgent,
                    device: isMobile,
                    browser,
                    os,
                    country: context.country,
                    referrer: context.referrer,
                    utmSource,
                },
                include: {
                    themeHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
                    interactions: { orderBy: { createdAt: 'desc' }, take: 100 },
                },
            });

            const themeHistory = session.themeHistory;
            const interactions = session.interactions;

            // Recent themes (to avoid repetition)
            const recentThemes = themeHistory.slice(0, 5).map((t: { themeName: string }) => t.themeName);

            // Average engagement score from past theme visits
            const avgEngagement =
                themeHistory.length > 0
                    ? themeHistory.reduce((sum: number, t: { engagementScore: number }) => sum + t.engagementScore, 0) /
                    themeHistory.length
                    : 0.5;

            // Dominant interaction pattern
            const scrollEvents = interactions.filter((i: { eventType: string }) => i.eventType === 'scroll');
            const clickEvents = interactions.filter((i: { eventType: string }) => i.eventType === 'click');
            const timeEvents = interactions.filter((i: { eventType: string }) => i.eventType === 'time');

            const avgScroll =
                scrollEvents.length > 0
                    ? scrollEvents.reduce((s: number, i: { value: number }) => s + i.value, 0) / scrollEvents.length
                    : 0;
            const avgTime =
                timeEvents.length > 0
                    ? timeEvents.reduce((s: number, i: { value: number }) => s + i.value, 0) / timeEvents.length
                    : 0;
            const totalClicks = clickEvents.reduce((s: number, i: { value: number }) => s + i.value, 0);

            let dominantInteraction: 'reader' | 'explorer' | 'scanner' = 'scanner';
            if (avgScroll > 70 && avgTime > 60) {
                dominantInteraction = 'reader';
            } else if (totalClicks > 5) {
                dominantInteraction = 'explorer';
            }

            // Preferred complexity
            let preferredComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';
            if (avgEngagement > 0.65) preferredComplexity = 'complex';
            else if (avgEngagement < 0.3) preferredComplexity = 'simple';

            // ── New: Top-performing structural theme patterns for this user ────────
            // Parse themeJson from recent ThemeHistory and group by iconSet+shapeLanguage
            const patternMap = new Map<string, { iconSet: string; shapeLanguage: string; totalScore: number; count: number }>();
            for (const t of themeHistory) {
                try {
                    const parsed = JSON.parse((t as { themeJson?: string }).themeJson || '{}');
                    if (parsed.iconSet && parsed.shapeLanguage) {
                        const key = `${parsed.iconSet}::${parsed.shapeLanguage}`;
                        const existing = patternMap.get(key);
                        if (existing) {
                            existing.totalScore += (t as { engagementScore: number }).engagementScore;
                            existing.count += 1;
                        } else {
                            patternMap.set(key, {
                                iconSet: parsed.iconSet,
                                shapeLanguage: parsed.shapeLanguage,
                                totalScore: (t as { engagementScore: number }).engagementScore,
                                count: 1
                            });
                        }
                    }
                } catch { /* ignore parse errors */ }
            }
            const topThemePatterns = Array.from(patternMap.values())
                .map(p => ({ iconSet: p.iconSet, shapeLanguage: p.shapeLanguage, engagementScore: p.totalScore / p.count }))
                .sort((a, b) => b.engagementScore - a.engagementScore)
                .slice(0, 3);

            return {
                sessionId: context.sessionId,
                visitCount: session.visitCount,
                recentThemes,
                avgEngagement,
                preferredComplexity,
                dominantInteraction,
                topThemePatterns,
            };
        } catch (error) {
            console.error('[AdaptiveIntelligence] Error reading context:', error);
            return {
                sessionId: context.sessionId,
                visitCount: 1,
                recentThemes: [],
                avgEngagement: 0.5,
                preferredComplexity: 'moderate',
                dominantInteraction: 'scanner',
                topThemePatterns: [],
            };
        }
    }

    async recordThemeVisit(
        sessionId: string,
        theme: Theme,
        content: RewrittenContent,
        preferenceContext: PreferenceContext
    ): Promise<string> {
        try {
            const record = await prisma.themeHistory.create({
                data: {
                    sessionId,
                    themeName: theme.themeName,
                    visitNumber: preferenceContext.visitCount,
                    themeJson: JSON.stringify(theme),
                    contentJson: JSON.stringify(content),
                    preferenceContextJson: JSON.stringify(preferenceContext),
                    shapeLanguage: theme.shapeLanguage,
                    iconSet: theme.iconSet,
                    animationStyle: theme.animationStyle,
                    engagementScore: 0,
                },
            });
            return record.id;
        } catch (error) {
            console.error('[AdaptiveIntelligence] Error recording theme visit:', error);
            return 'fallback-id';
        }
    }

    async updateEngagementScore(sessionId: string, themeHistoryId: string): Promise<void> {
        try {
            if (!themeHistoryId || themeHistoryId === 'fallback-id') return;

            // Get interactions linked to this specific theme render
            const interactions = await prisma.interaction.findMany({
                where: { themeHistoryId },
            });

            // Also grab any recent unlinked interactions as fallback
            const cutoff = new Date(Date.now() - 10 * 60 * 1000);
            const fallbackInteractions = interactions.length === 0
                ? await prisma.interaction.findMany({ where: { sessionId, createdAt: { gte: cutoff } } })
                : interactions;

            if (fallbackInteractions.length === 0) return;

            const scrollDepth =
                fallbackInteractions
                    .filter((i: { eventType: string }) => i.eventType === 'scroll')
                    .reduce((s: number, i: { value: number }) => Math.max(s, i.value), 0) / 100;
            const timeSpent =
                fallbackInteractions
                    .filter((i: { eventType: string }) => i.eventType === 'time')
                    .reduce((s: number, i: { value: number }) => s + i.value, 0);
            const clickCount = fallbackInteractions.filter((i: { eventType: string }) => i.eventType === 'click').length;

            // Engagement formula: 0.4 scrollDepth + 0.4 time (capped 120s) + 0.2 clicks (capped 10)
            const score = Math.min(
                1,
                scrollDepth * 0.4 + Math.min(timeSpent / 120, 1) * 0.4 + Math.min(clickCount / 10, 1) * 0.2
            );
            
            // LLM Training Label
            let performanceLabel = 'low';
            if (score > 0.65) performanceLabel = 'high';
            else if (score > 0.35) performanceLabel = 'medium';

            await prisma.themeHistory.update({
                where: { id: themeHistoryId },
                data: {
                    engagementScore: score,
                    scrollDepth: scrollDepth * 100,
                    timeSpent,
                    clickCount,
                    performanceLabel,
                },
            });
        } catch (error) {
            console.error('[AdaptiveIntelligence] Error updating engagement:', error);
        }
    }
}
