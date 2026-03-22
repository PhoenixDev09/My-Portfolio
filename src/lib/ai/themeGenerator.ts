import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { Theme, PreferenceContext, AnimationStyle } from '../types';
import { prisma } from '../db';

const THEME_CATALOG = [
    'Forest Trail',
    'Space Station',
    'Orchestra',
    'Ancient Temple',
    'Clockwork Machine',
    'Ocean Trench',
    'Neon Bazaar',
    'Desert Observatory',
    'Coral Reef',
    'Midnight Library',
];

const FALLBACK_THEME: Theme = {
    themeName: 'Midnight Library',
    philosophy: 'Knowledge preserved in the stillness between thoughts',
    colorPalette: {
        background: '#0d1117',
        surface: '#161b22',
        primary: '#58a6ff',
        secondary: '#8b949e',
        accent: '#f78166',
        text: '#e6edf3',
        textMuted: '#8b949e',
        border: '#30363d',
    },
    typography: {
        headingFont: "'Georgia', 'Times New Roman', serif",
        bodyFont: "'Inter', 'Segoe UI', sans-serif",
        scale: 'loose',
        headingWeight: '700',
        bodyWeight: '400',
    },
    layoutSchema: {
        pageArchitecture: 'standard',
        heroStyle: 'immersive-full',
        sectionOrder: ['hero', 'about', 'projects', 'contact', 'footer'],
        sectionStyle: 'prose-block',
        gridStyle: 'asymmetric',
        contactStyle: 'minimal-form',
        spacing: 'airy',
    },
    shapeLanguage: 'ornate-borders',
    iconSet: 'archaic',
    animationStyle: 'flowing' as AnimationStyle,
    contentTone: 'contemplative-scholar',
    symbolicReasoning:
        'The Midnight Library represents the liminal space where knowledge meets identity — a fitting vessel for a portfolio that bridges technical precision and creative depth.',
};

export class ThemeGenerationEngine {
    private genAI: GoogleGenerativeAI;
    private groq: Groq | null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not set');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
    }

    private parseThemeJSON(text: string): Theme {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed: Theme = JSON.parse(jsonStr);
        return {
            ...parsed,
            animationStyle: parsed.animationStyle || 'flowing',
            layoutSchema: {
                ...parsed.layoutSchema,
                pageArchitecture: parsed.layoutSchema?.pageArchitecture || 'standard',
            }
        };
    }

    // LM-01: Route by directive intent rather than random 50/50.
    // Groq (Llama 3.3 70b) excels at structured/technical output.
    // Gemini excels at narrative, emotional, and metaphorical themes.
    private shouldUseGroq(context: PreferenceContext): boolean {
        if (!this.groq) return false;
        const arch = context.directive.architecture;
        const archetype = context.archetype;
        // Technical archetypes and architectures → Groq
        const isTechnical =
            archetype === 'scanner' ||
            archetype === 'explorer' ||
            arch === 'terminal' ||
            arch === 'bento-grid';
        return isTechnical;
    }

    private buildPrompt(context: PreferenceContext, availableThemes: string[], availableArchitectures: string[]): string {
        const { directive, archetype, avgEngagement, topSection, scrollVelocityMedian, selectedText } = context;

        // ── A: Build the Constraint Block from the Orchestrator Directive ──────
        let constraintBlock = '';

        if (directive.mode === 'shock') {
            constraintBlock = `
## SHOCK MODE DIRECTIVE (Window Shopper Protocol)
This visitor has high visit count but near-zero engagement. They are exploring for visual impact, not information.
- Generate the most visually aggressive, structurally diverse theme possible.
- Use maximum contrast colors, bold typography, punchy single-sentence descriptions.
- Architecture MUST be one of: ${availableArchitectures.filter(a => ['manifesto', 'cinematic', 'bento-grid'].includes(a)).join(', ') || availableArchitectures[0]}
- Text should be action-oriented and immediate. No philosophy. No metaphor. Just facts and numbers.`;

        } else if (directive.mode === 'exploit') {
            const contrast = directive.colorDNA?.luminance !== undefined
                ? (directive.colorDNA.luminance < 0.2 ? 'DARK (luminance < 20%)' : 'LIGHT (luminance > 70%)')
                : null;

            constraintBlock = `
## EXPLOIT DIRECTIVE — Reinforce Winning Aesthetic DNA
This visitor has demonstrated measurable preference for specific design qualities. You MUST honor these constraints.
${directive.architecture ? `- Architecture: STRICTLY USE "${directive.architecture}". This is mathematically the highest-engagement structure for this user.` : ''}
${contrast && directive.colorDNA ? `- Color Palette: Generate a ${contrast} background. Primary hue should be near ${directive.colorDNA.hueDeg}° on the color wheel (±30° variation allowed). Saturation: ~${Math.round(directive.colorDNA.saturation * 100)}%.` : ''}
${directive.typographicTone === 'narrative' ? '- Typography: Use serif or literary typefaces (Georgia, Playfair Display, Lora). This user reads deeply.' : ''}
${directive.typographicTone === 'technical' ? '- Typography: Use monospace or geometric sans (JetBrains Mono, IBM Plex, Fira Code for headings). This user is a technical evaluator.' : ''}
${directive.typographicTone === 'expressionist' ? '- Typography: Use display or slab typefaces. Bold and expressive.' : ''}
${directive.densityPreference === 'dense' ? '- Content: Generate dense, metric-rich, information-packed copy.' : ''}
${directive.densityPreference === 'minimal' ? '- Content: Generate spacious, philosophical, minimalist copy. Large breathing room.' : ''}`;

        } else {
            // EXPLORE mode — single-axis surprise
            const exploredAxis = directive.exploreAxis || 'architecture';
            constraintBlock = `
## SINGLE-AXIS EXPLORATION DIRECTIVE
We are intentionally exploring ONE design dimension while keeping all others consistent with this user's preferences.
- BREAK AXIS: ${exploredAxis.toUpperCase()}
${exploredAxis === 'architecture' ? `- Architecture: Choose something completely different from recent experience. Pick from: ${availableArchitectures.join(', ')}` : `- Architecture: KEEP "${directive.architecture || 'standard'}" as the structure.`}
${exploredAxis === 'colorHue' ? `- Color: RADICALLY change the hue. If user is used to cool blues, go warm reds or earthy greens. Total palette inversion.` : directive.colorDNA ? `- Color: Maintain the user's preferred hue (~${directive.colorDNA.hueDeg}°) and ${directive.colorDNA.luminance < 0.3 ? 'dark' : 'light'} mode.` : ''}
${exploredAxis === 'density' ? '- Content density: Flip it. If they liked dense, go minimal. If minimal, go dense.' : directive.densityPreference ? `- Density: Keep "${directive.densityPreference}" density.` : ''}
${exploredAxis === 'typographicTone' ? '- Typography: Completely change the type personality. Try the opposite of what they normally see.' : directive.typographicTone ? `- Typography: Maintain the "${directive.typographicTone}" typographic tone.` : ''}`;
        }

        // ── B: Anti-affinity Block ────────────────────────────────────────────
        const antiBlock = directive.antiArchitectures.length > 0
            ? `\n## ANTI-AFFINITY (ABSOLUTE EXCLUSIONS)\nDo NOT use these architectures — they have been flagged as poor performers for this visitor:\n- Banned architectures: ${directive.antiArchitectures.join(', ')}`
            : '';

        // ── C: Behavioral Context ────────────────────────────────────────────
        const behaviorBlock = `
## Visitor Behavioral Profile
- Archetype: ${archetype} (reader=deep scroll+time, explorer=clicks, scanner=fast velocity, investigator=contact dwell+text select, window-shopper=high visits+no engagement)
- Visit number: ${context.visitCount}
- Engagement level: ${avgEngagement.toFixed(2)} (0-1 scale)
- Scroll velocity: ${scrollVelocityMedian} px/second (high = scanner, low = reader)
- Most engaged section: ${topSection}
- Copied/selected text: ${selectedText ? 'Yes — this user is deeply reading and investigating' : 'No'}
- Preferred complexity: ${context.preferredComplexity}
- Recent themes (avoid repeating): ${context.recentThemes.join(', ') || 'None yet'}`;

        return `You are a symbolic design intelligence. Your task is to choose and fully design a metaphoric theme for a personal portfolio website.
${behaviorBlock}
${constraintBlock}
${antiBlock}

## Available Themes
${availableThemes.join(', ')}

## Content Faceting Rules
- Rewrite ALL text fields to match the chosen metaphor and architecture.
- GOLDEN RECORD: Preserve all factual data (technologies, metrics, project names, years). Only change framing/tone/vocabulary.
- Dynamic headings: "aboutTitle" and "projectsTitle" must be creative and metaphorical, not generic.
- For "terminal" or "manifesto": technical, precise, metric-forward text.
- For "editorial" or "cinematic": human impact, narrative journeys, philosophical depth.
- For "bento-grid": short punchy descriptions, scannable, headline-driven.

## symbolicReasoning
The "symbolicReasoning" field MUST explain to the user why this specific theme was chosen for THEM based on their behavioral data. Be specific: mention their archetype, scroll behaviour, or section preferences if relevant. This is displayed directly to the visitor.

Respond with a SINGLE JSON object matching this EXACT structure:
{
  "themeName": "string (must be one of the available themes)",
  "philosophy": "string (one evocative sentence)",
  "colorPalette": {
    "background": "hex color",
    "surface": "hex color",
    "primary": "hex color",
    "secondary": "hex color",
    "accent": "hex color",
    "text": "hex color",
    "textMuted": "hex color",
    "border": "hex color"
  },
  "typography": {
    "headingFont": "CSS font-family string",
    "bodyFont": "CSS font-family string",
    "scale": "tight|normal|loose",
    "headingWeight": "CSS font-weight string",
    "bodyWeight": "CSS font-weight string"
  },
  "layoutSchema": {
    "pageArchitecture": "${availableArchitectures.join('|')}",
    "heroStyle": "immersive-full|minimal-centered|split-screen|typographic",
    "sectionOrder": ["hero","about","projects","contact","footer"],
    "sectionStyle": "prose-block|card-mosaic|timeline|constellation",
    "gridStyle": "organic-flow|rigid-grid|radial|asymmetric",
    "contactStyle": "minimal-form|call-card|constellation|terminal",
    "spacing": "compact|airy|expansive"
  },
  "shapeLanguage": "organic-curves|sharp-cuts|soundwaves|ornate-borders|none",
  "iconSet": "minimal|nature|mechanical|musical|celestial|archaic",
  "animationStyle": "flowing|mechanical|rhythmic|galactic|ancient|undulating|electric",
  "contentTone": "string",
  "symbolicReasoning": "string (2-3 sentences referencing their actual behavioral data)"
}`;
    }

    private async generateWithGemini(prompt: string): Promise<Theme> {
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
        });
        const result = await model.generateContent(prompt);
        return this.parseThemeJSON(result.response.text());
    }

    private async generateWithGroq(prompt: string): Promise<Theme> {
        const completion = await this.groq!.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.9,
            response_format: { type: 'json_object' },
        });
        const text = completion.choices[0]?.message?.content || '{}';
        return this.parseThemeJSON(text);
    }

    async generate(context: PreferenceContext): Promise<Theme> {
        const availableThemes = THEME_CATALOG.filter(
            (t) => !context.recentThemes.slice(0, 4).includes(t)
        );

        // Exclude anti-affinity architectures AND recent 2 architectures
        const ALL_ARCHITECTURES = ['standard', 'bento-grid', 'terminal', 'editorial', 'cinematic', 'manifesto', 'timeline', 'split-screen'];
        const banned = new Set([
            ...context.directive.antiArchitectures,
            ...context.recentArchitectures.slice(0, 2),
        ]);
        let availableArchitectures = ALL_ARCHITECTURES.filter(a => !banned.has(a));
        if (availableArchitectures.length === 0) availableArchitectures = ['standard'];

        const prompt = this.buildPrompt(context, availableThemes, availableArchitectures);

        try {
            const usedModel = this.shouldUseGroq(context) ? 'groq-llama3-70b' : 'gemini-2.5-flash-lite';
            console.log(`[ThemeGenerationEngine] Using model: ${usedModel} | Archetype: ${context.archetype} | Directive: ${context.directive.mode}`);

            if (this.shouldUseGroq(context)) {
                return await this.generateWithGroq(prompt);
            } else {
                return await this.generateWithGemini(prompt);
            }
        } catch (error) {
            console.warn('[ThemeGenerationEngine] API failed. Attempting DB fallback...', error);

            try {
                // LM-02: Threshold lowered to 0.3 (was 0.7) — 0.7 was never met in early sessions
                // since engagementScore needs 84s + 70% scroll + 7 clicks to reach 0.7.
                const highPerformingTheme = await prisma.themeHistory.findFirst({
                    where: {
                        engagementScore: { gt: 0.3 },
                        themeName: { notIn: context.recentThemes },
                    },
                    orderBy: { engagementScore: 'desc' }
                });

                const finalFallbackTheme = highPerformingTheme || await prisma.themeHistory.findFirst({
                    where: { engagementScore: { gt: 0.3 } },
                    orderBy: { engagementScore: 'desc' }
                });

                if (finalFallbackTheme && finalFallbackTheme.themeJson) {
                    console.log(`[ThemeGenerationEngine] DB Fallback: '${finalFallbackTheme.themeName}'`);
                    const dbTheme = JSON.parse(finalFallbackTheme.themeJson) as Theme;
                    return {
                        ...dbTheme,
                        animationStyle: dbTheme.animationStyle || 'flowing',
                        layoutSchema: {
                            ...dbTheme.layoutSchema,
                            pageArchitecture: dbTheme.layoutSchema?.pageArchitecture || 'standard',
                        }
                    };
                }
            } catch (dbError) {
                console.error('[ThemeGenerationEngine] DB fallback also failed:', dbError);
            }

            console.warn('[ThemeGenerationEngine] Returning static FALLBACK_THEME');
            return FALLBACK_THEME;
        }
    }
}
