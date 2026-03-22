import { prisma } from '../db';
import {
    PreferenceContext,
    Theme,
    RewrittenContent,
    ColorDNA,
    UserArchetype,
    TypographicTone,
    DensityPreference,
    IntentSignal,
    GenerationDirective,
    PageArchitecture
} from '../types';

export interface VisitorContext {
    sessionId: string;
    url?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
    isMorph?: boolean; // AL-02: true when user clicked "Morph to My Style" (not a page reload)
}

// ── Helper: Hex color to HSL ─────────────────────────────────────────────────
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Validate: must be a 6-char hex (AL-06)
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return { h: 210, s: 0.8, l: 0.08 };
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100) / 100, l: Math.round(l * 100) / 100 };
}

// ── Helper: Classify font as a typographic tone ──────────────────────────────
function classifyFont(headingFont: string): 'narrative' | 'technical' | 'expressionist' {
    const f = headingFont.toLowerCase();
    if (f.includes('mono') || f.includes('courier') || f.includes('code')) return 'technical';
    if (f.includes('georgia') || f.includes('times') || f.includes('serif') || f.includes('playfair') || f.includes('garamond')) return 'narrative';
    return 'expressionist';
}

// ── Helper: Map architecture to density ─────────────────────────────────────
function archToDensity(arch: string): DensityPreference {
    if (['bento-grid', 'terminal', 'manifesto'].includes(arch)) return 'dense';
    if (['editorial', 'timeline'].includes(arch)) return 'moderate';
    return 'minimal'; // standard, cinematic, split-screen
}

// ── Layer 3: Aesthetic DNA Extractor ─────────────────────────────────────────
function extractAestheticDNA(themeHistory: { themeJson?: string; engagementScore: number; explicitFeedback?: string | null }[]) {
    let totalWeight = 0;
    let hSum = 0, sSum = 0, lSum = 0;
    const fontVotes: Record<TypographicTone, number> = { narrative: 0, technical: 0, expressionist: 0 };
    const densityVotes: Record<DensityPreference, number> = { minimal: 0, moderate: 0, dense: 0 };
    const archScores: Record<string, { score: number; count: number }> = {};
    // AL-01: track explicit feedback anti-architectures
    const feedbackAntiArchitectures = new Set<string>();

    for (const t of themeHistory) {
        try {
            const parsed = JSON.parse(t.themeJson || '{}');
            let w = t.engagementScore;

            // AL-01: Apply explicit feedback multiplier — wire the feedback signal into DNA
            if (t.explicitFeedback === 'perfect') {
                w *= 1.5; // user loved it — reinforce strongly
            } else if (t.explicitFeedback === 'too_complex' || t.explicitFeedback === 'too_simple') {
                w *= 0.3; // user disliked it — treat as weak signal
                // Mark architecture as negative for future generation
                const arch = parsed.layoutSchema?.pageArchitecture;
                if (arch) feedbackAntiArchitectures.add(arch);
            }

            if (w <= 0) continue;
            totalWeight += w;

            // Color DNA
            const primary = parsed.colorPalette?.primary || '#58a6ff';
            const bg = parsed.colorPalette?.background || '#0d1117';
            const hsl = hexToHsl(primary.startsWith('#') ? primary : '#58a6ff');
            const bgHsl = hexToHsl(bg.startsWith('#') ? bg : '#0d1117');
            hSum += hsl.h * w;
            sSum += hsl.s * w;
            lSum += bgHsl.l * w;

            // Typographic tone voting
            const tone = classifyFont(parsed.typography?.headingFont || '');
            fontVotes[tone] += w;

            // Density voting
            const arch = parsed.layoutSchema?.pageArchitecture || 'standard';
            const density = archToDensity(arch);
            densityVotes[density] += w;

            // Architecture scoring for best/worst
            if (!archScores[arch]) archScores[arch] = { score: 0, count: 0 };
            archScores[arch].score += w;
            archScores[arch].count += 1;
        } catch { /* ignore parse errors */ }
    }

    if (totalWeight === 0) return null;

    const colorDNA: ColorDNA = {
        hueDeg: Math.round(hSum / totalWeight),
        saturation: Math.round((sSum / totalWeight) * 100) / 100,
        luminance: Math.round((lSum / totalWeight) * 100) / 100,
    };

    const typographicTone = (Object.entries(fontVotes).sort((a, b) => b[1] - a[1])[0][0]) as TypographicTone;
    const densityPreference = (Object.entries(densityVotes).sort((a, b) => b[1] - a[1])[0][0]) as DensityPreference;

    const sortedArchs = Object.entries(archScores)
        .map(([arch, v]) => ({ arch, avg: v.score / v.count }))
        .sort((a, b) => b.avg - a.avg);

    const bestArchitecture = (sortedArchs[0]?.arch || 'standard') as PageArchitecture;
    const worstArchitectures = [
        ...sortedArchs.filter(a => a.avg < 0.25).map(a => a.arch as PageArchitecture),
        ...[...feedbackAntiArchitectures] as PageArchitecture[],
    ].filter((v, i, a) => a.indexOf(v) === i);

    return { colorDNA, typographicTone, densityPreference, bestArchitecture, worstArchitectures };
}

// ── Layer 2: Profile Vector Builder ─────────────────────────────────────────
function buildArchetype(params: {
    visitCount: number;
    avgEngagement: number;
    recentEngagement: number;
    avgScroll: number;
    avgTime: number;
    totalClicks: number;
    scrollVelocityMedian: number;
    directionChanges: number;
    selectedText: boolean;
    contactDwellTime: number;
}): { archetype: UserArchetype; intentSignal: IntentSignal } {
    const { visitCount, avgEngagement, recentEngagement, avgScroll, avgTime, totalClicks, scrollVelocityMedian, directionChanges, selectedText, contactDwellTime } = params;

    // AL-08: Positive signals checked FIRST — strong engagement overrides visit history.
    // Window Shopper is now LAST (only when zero positive engagement signals exist).

    // Investigator: dwells on contact, selects text, deep scroll + many clicks
    if (selectedText || contactDwellTime > 15 || (avgScroll > 80 && totalClicks > 3)) {
        return { archetype: 'investigator', intentSignal: 'deciding' };
    }

    // Reader: slow scroll, long time, re-reads (direction changes)
    if (avgScroll > 60 && avgTime > 60 && (scrollVelocityMedian < 300 || directionChanges > 3)) {
        return { archetype: 'reader', intentSignal: avgEngagement > 0.6 ? 'evaluating' : 'browsing' };
    }

    // Explorer: high clicks, section jumping
    if (totalClicks > 5) {
        return { archetype: 'explorer', intentSignal: 'browsing' };
    }

    // Window Shopper: only if RECENT engagement (last 3 themes) is low AND no positive signals above.
    // Checked last so a user who selected text or read deeply is never wrongly classified here.
    if (visitCount > 3 && recentEngagement < 0.15) {
        return { archetype: 'window-shopper', intentSignal: 'browsing' };
    }

    // Scanner: default — fast scroll, low time, no other strong signal
    return { archetype: 'scanner', intentSignal: 'browsing' };
}

// ── Layer 4: Orchestrator ────────────────────────────────────────────────────
function orchestrate(params: {
    archetype: UserArchetype;
    intentSignal: IntentSignal;
    visitCount: number;
    bestArchitecture: PageArchitecture;
    worstArchitectures: PageArchitecture[];
    colorDNA: ColorDNA | undefined;
    typographicTone: TypographicTone;
    densityPreference: DensityPreference;
    recentArchitectures: string[];
    topSection: string;
}): GenerationDirective {
    const { archetype, intentSignal, visitCount, bestArchitecture, worstArchitectures, colorDNA,
        typographicTone, densityPreference, recentArchitectures, topSection } = params;

    const antiArchitectures = [
        ...worstArchitectures,
        ...(recentArchitectures.slice(0, 2) as PageArchitecture[])
    ]
        .filter((v, i, a) => a.indexOf(v) === i)  // deduplicate
        .filter(a => a !== 'standard')             // AL-04: never blacklist 'standard' — always a valid fallback
        .slice(0, 5);                              // AL-04: hard cap at 5 to prevent impossible constraints

    // ── Archetype Overrides ──────────────────────────────────────────────────
    if (archetype === 'window-shopper') {
        return {
            mode: 'shock',
            antiArchitectures,
            orbReasoning: 'You are exploring rapidly. I am generating maximum visual contrast to showcase the engine\'s full range.',
        };
    }

    if (archetype === 'investigator') {
        return {
            mode: 'exploit',
            architecture: 'editorial',
            typographicTone: 'narrative',
            densityPreference: 'moderate',
            colorDNA: colorDNA ? { ...colorDNA, luminance: colorDNA.luminance > 0.5 ? 0.92 : 0.08 } : undefined,
            antiArchitectures,
            orbReasoning: topSection === 'contact'
                ? 'You spent significant time on the Contact section. I am optimizing for a professional, information-dense layout.'
                : 'You appear to be carefully evaluating the portfolio. I am switching to a clean editorial layout for easier decision-making.',
        };
    }

    // ── Epsilon-Greedy with Single-Axis Explore ────────────────────────────
    // Exploration pressure rises linearly with sessions (max 40%)
    const explorationPressure = Math.min(0.15 + visitCount * 0.04, 0.40);
    const roll = Math.random();

    if (roll > explorationPressure) {
        // EXPLOIT: Reinforce all winning traits
        return {
            mode: 'exploit',
            colorDNA,
            architecture: bestArchitecture,
            typographicTone,
            densityPreference,
            antiArchitectures,
            orbReasoning: `Your behavioral profile shows strong preference for ${bestArchitecture} architecture and ${colorDNA?.luminance && colorDNA.luminance < 0.2 ? 'dark' : 'light'} color schemes. I have engineered this view to match your aesthetic fingerprint.`,
        };
    }

    // EXPLORE: Break exactly ONE dimension
    const axes: Array<'architecture' | 'colorHue' | 'density' | 'typographicTone'> = ['architecture', 'colorHue', 'density', 'typographicTone'];
    const breakAxis = axes[Math.floor(Math.random() * axes.length)];

    const reasoningMap: Record<string, string> = {
        architecture: `You have been comfortable with the ${bestArchitecture} structure. Same aesthetics, but I am giving you a structural surprise to keep the experience fresh.`,
        colorHue: 'I am keeping your preferred layout structure but rotating the color palette to explore new territories.',
        density: 'Same feel, different information density. Exploring whether you prefer a more sparse or compact arrangement.',
        typographicTone: 'Experimenting with a different typographic personality while keeping your preferred layout and colors.',
    };

    return {
        mode: 'explore',
        exploreAxis: breakAxis,
        // Keep all OTHER axes the same as exploit
        colorDNA: breakAxis !== 'colorHue' ? colorDNA : undefined,
        architecture: breakAxis !== 'architecture' ? bestArchitecture : undefined,
        typographicTone: breakAxis !== 'typographicTone' ? typographicTone : undefined,
        densityPreference: breakAxis !== 'density' ? densityPreference : undefined,
        antiArchitectures,
        orbReasoning: reasoningMap[breakAxis],
    };
}

export class AdaptiveIntelligence {
    async getPreferenceContext(context: VisitorContext): Promise<PreferenceContext> {
        try {
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

            let utmSource: string | undefined;
            if (context.url) {
                try {
                    const urlObj = new URL(context.url);
                    utmSource = urlObj.searchParams.get('utm_source') || undefined;
                } catch { /* ignore */ }
            }

            const session = await prisma.visitSession.upsert({
                where: { sessionId: context.sessionId },
                update: {
                    // AL-02: Only increment visitCount on real page loads, not user-triggered morphs.
                    // Morphs within the same session are tracked via morphCount to prevent premature
                    // Window Shopper classification and inflated exploration pressure.
                    ...(context.isMorph ? {} : { visitCount: { increment: 1 } }),
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
                    visitCount: 1, // First real page load
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
                    interactions: { orderBy: { createdAt: 'desc' }, take: 200 },
                },
            });

            const themeHistory = session.themeHistory as { themeJson?: string; themeName: string; engagementScore: number; explicitFeedback?: string | null }[];
            const interactions = session.interactions as { eventType: string; value: number; sectionId?: string | null }[];

            // Recent themes & architectures
            const recentThemes = themeHistory.slice(0, 5).map(t => t.themeName);
            const recentArchitectures = themeHistory.slice(0, 5).map(t => {
                try {
                    const parsed = JSON.parse(t.themeJson || '{}');
                    return parsed?.layoutSchema?.pageArchitecture;
                } catch { return null; }
            }).filter(Boolean) as string[];

            // Average engagement score
            const avgEngagement = themeHistory.length > 0
                ? themeHistory.reduce((sum, t) => sum + t.engagementScore, 0) / themeHistory.length
                : 0.5;

            // Interaction signal extraction
            const scrollEvents = interactions.filter(i => i.eventType === 'scroll');
            const clickEvents = interactions.filter(i => i.eventType === 'click');
            const timeEvents = interactions.filter(i => i.eventType === 'time');
            const velocityEvents = interactions.filter(i => i.eventType === 'scroll_velocity');
            const activeTimeEvents = interactions.filter(i => i.eventType === 'active_time');
            const dwellEvents = interactions.filter(i => i.eventType === 'section_dwell');
            const selectionEvents = interactions.filter(i => i.eventType === 'text_selection');

            const avgScroll = scrollEvents.length > 0
                ? scrollEvents.reduce((s, i) => s + i.value, 0) / scrollEvents.length : 0;
            const avgTime = timeEvents.length > 0
                ? timeEvents.reduce((s, i) => s + i.value, 0) / timeEvents.length : 0;
            const totalClicks = clickEvents.reduce((s, i) => s + i.value, 0);
            const scrollVelocityMedian = velocityEvents.length > 0
                ? [...velocityEvents].sort((a, b) => a.value - b.value)[Math.floor(velocityEvents.length / 2)]?.value ?? 300
                : 300;
            const activeTimeSeconds = activeTimeEvents.length > 0
                ? activeTimeEvents.reduce((s, i) => s + i.value, 0) / activeTimeEvents.length : avgTime;

            // Direction changes: any scroll event where scroll goes significantly upward (AL-07: threshold 10%, not 5%)
            const directionChanges = scrollEvents.reduce((count, _, i) => {
                if (i > 0 && scrollEvents[i].value < scrollEvents[i - 1].value - 10) count++;
                return count;
            }, 0);

            // Section dwell analysis
            const sectionDwellProfile: Record<string, number> = {};
            dwellEvents.forEach(e => {
                if (e.sectionId) {
                    sectionDwellProfile[e.sectionId] = (sectionDwellProfile[e.sectionId] || 0) + e.value;
                }
            });
            const topSection = Object.entries(sectionDwellProfile).sort((a, b) => b[1] - a[1])[0]?.[0] || 'hero';
            const contactDwellTime = sectionDwellProfile['contact'] || 0;
            const selectedText = selectionEvents.length > 0;

            // Preferred complexity
            let preferredComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';
            if (avgEngagement > 0.65) preferredComplexity = 'complex';
            else if (avgEngagement < 0.3) preferredComplexity = 'simple';

            // Recent engagement — last 3 theme visits only (prevents archetype lock-in)
            const recentThreeHistory = themeHistory.slice(0, 3);
            const recentEngagement = recentThreeHistory.length > 0
                ? recentThreeHistory.reduce((sum, t) => sum + t.engagementScore, 0) / recentThreeHistory.length
                : avgEngagement;

            // ── Layer 2: Archetype Classification ──────────────────────────
            const { archetype, intentSignal } = buildArchetype({
                visitCount: session.visitCount,
                avgEngagement,
                recentEngagement,
                avgScroll,
                avgTime,
                totalClicks,
                scrollVelocityMedian,
                directionChanges,
                selectedText,
                contactDwellTime,
            });

            // ── Layer 3: Aesthetic DNA Extraction ──────────────────────────
            const dna = extractAestheticDNA(themeHistory);
            const colorDNA = dna?.colorDNA;
            const typographicTone: TypographicTone = dna?.typographicTone || 'expressionist';
            const densityPreference: DensityPreference = dna?.densityPreference || 'moderate';
            const bestArchitecture: PageArchitecture = dna?.bestArchitecture || 'standard';
            const worstArchitectures: PageArchitecture[] = dna?.worstArchitectures || [];

            // Top-performing structural patterns (iconSet + shapeLanguage)
            const patternMap = new Map<string, { iconSet: string; shapeLanguage: string; totalScore: number; count: number }>();
            for (const t of themeHistory) {
                try {
                    const parsed = JSON.parse(t.themeJson || '{}');
                    if (parsed.iconSet && parsed.shapeLanguage) {
                        const key = `${parsed.iconSet}::${parsed.shapeLanguage}`;
                        const existing = patternMap.get(key);
                        if (existing) {
                            existing.totalScore += t.engagementScore;
                            existing.count += 1;
                        } else {
                            patternMap.set(key, { iconSet: parsed.iconSet, shapeLanguage: parsed.shapeLanguage, totalScore: t.engagementScore, count: 1 });
                        }
                    }
                } catch { /* ignore */ }
            }
            const topThemePatterns = Array.from(patternMap.values())
                .map(p => ({ iconSet: p.iconSet, shapeLanguage: p.shapeLanguage, engagementScore: p.totalScore / p.count }))
                .sort((a, b) => b.engagementScore - a.engagementScore)
                .slice(0, 3);

            // ── Layer 4: Orchestrator ───────────────────────────────────────
            // AL-05: First-visit referrer/UTM heuristic — use known entry signals
            // to seed the directive with a meaningful starting architecture.
            let firstVisitArchOverride: PageArchitecture | undefined;
            if (session.visitCount === 1 && themeHistory.length === 0) {
                const ref = (context.referrer || '').toLowerCase();
                const utm = (utmSource || '').toLowerCase();
                if (ref.includes('linkedin') || utm === 'linkedin' || utm === 'resume') {
                    firstVisitArchOverride = 'editorial'; // Professional evaluator
                } else if (ref.includes('github') || utm === 'github' || utm === 'devto') {
                    firstVisitArchOverride = 'terminal';  // Developer auditing the stack
                } else if (ref.includes('behance') || ref.includes('dribbble') || utm === 'design') {
                    firstVisitArchOverride = 'cinematic'; // Creative appreciating aesthetics
                }
            }

            const directive = orchestrate({
                archetype,
                intentSignal,
                visitCount: session.visitCount,
                bestArchitecture: firstVisitArchOverride || bestArchitecture,
                worstArchitectures,
                colorDNA,
                typographicTone,
                densityPreference,
                recentArchitectures,
                topSection,
            });

            return {
                sessionId: context.sessionId,
                visitCount: session.visitCount,
                recentThemes,
                recentArchitectures,
                avgEngagement,
                preferredComplexity,
                archetype,
                intentSignal,
                topSection,
                scrollVelocityMedian,
                activeTimeSeconds,
                selectedText,
                colorDNA,
                typographicTone,
                densityPreference,
                topThemePatterns,
                directive,
            };
        } catch (error) {
            console.error('[AdaptiveIntelligence] Error reading context:', error);
            return {
                sessionId: context.sessionId,
                visitCount: 1,
                recentThemes: [],
                recentArchitectures: [],
                avgEngagement: 0.5,
                preferredComplexity: 'moderate',
                archetype: 'scanner',
                intentSignal: 'browsing',
                topSection: 'hero',
                scrollVelocityMedian: 300,
                activeTimeSeconds: 0,
                selectedText: false,
                typographicTone: 'expressionist',
                densityPreference: 'moderate',
                topThemePatterns: [],
                directive: {
                    mode: 'explore',
                    antiArchitectures: [],
                    orbReasoning: 'Welcome. Browse freely and I will adapt to your reading style.',
                },
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
                    preferenceContextJson: JSON.stringify({ archetype: preferenceContext.archetype, directive: preferenceContext.directive }),
                    engagementScore: 0,
                    shapeLanguage: theme.shapeLanguage,
                    iconSet: theme.iconSet,
                    animationStyle: theme.animationStyle,
                },
            });
            return record.id;
        } catch (error) {
            console.error('[AdaptiveIntelligence] Error recording theme visit:', error);
            return 'unknown';
        }
    }

    async updateEngagementScore(sessionId: string, themeHistoryId: string): Promise<void> {
        try {
            const interactions = await prisma.interaction.findMany({
                where: { themeHistoryId },
            });
            if (interactions.length === 0) return;

            const scrollEvents = interactions.filter(i => i.eventType === 'scroll');
            const timeEvents = interactions.filter(i => i.eventType === 'time' || i.eventType === 'active_time');
            const clickEvents = interactions.filter(i => i.eventType === 'click');
            const velocityEvents = interactions.filter(i => i.eventType === 'scroll_velocity');

            const avgScroll = scrollEvents.length > 0
                ? scrollEvents.reduce((s, i) => s + i.value, 0) / scrollEvents.length : 0;
            const avgTime = timeEvents.length > 0
                ? timeEvents.reduce((s, i) => s + i.value, 0) / timeEvents.length : 0;
            const totalClicks = clickEvents.reduce((s, i) => s + i.value, 0);

            // Velocity penalty: high median velocity reduces engagement score
            const medianVelocity = velocityEvents.length > 0
                ? [...velocityEvents].sort((a, b) => a.value - b.value)[Math.floor(velocityEvents.length / 2)]?.value ?? 300
                : 300;
            const velocityPenalty = Math.min(1, medianVelocity / 1500); // 0 = slow reader, 1 = very fast scanner

            // Compute velocity-corrected engagement
            const scrollScore = Math.min(avgScroll / 100, 1) * 0.35;
            const timeScore = Math.min(avgTime / 120, 1) * 0.40; // 2 minutes = full score
            const clickScore = Math.min(totalClicks / 10, 1) * 0.25;
            const rawScore = scrollScore + timeScore + clickScore;

            // Penalize for very high velocity (scanners)
            const engagementScore = Math.max(0, rawScore - velocityPenalty * 0.2);

            await prisma.themeHistory.update({
                where: { id: themeHistoryId },
                data: {
                    engagementScore,
                    scrollDepth: avgScroll,
                    timeSpent: avgTime,
                    clickCount: totalClicks,
                },
            });
        } catch (error) {
            console.error('[AdaptiveIntelligence] Error updating engagement score:', error);
        }
    }
}
