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

    private shouldUseGroq(): boolean {
        return this.groq !== null && Math.random() < 0.5;
    }

    private buildPrompt(context: PreferenceContext, availableThemes: string[]): string {
        return `You are a symbolic design intelligence. Your task is to choose and fully design a metaphoric theme for a personal portfolio website.

## Context About This Visitor
- Visit number: ${context.visitCount}
- Engagement level: ${context.avgEngagement.toFixed(2)} (0-1 scale, higher = more engaged)
- Interaction style: ${context.dominantInteraction} (reader=reads deeply, explorer=clicks around, scanner=quick scroll)
- Preferred complexity: ${context.preferredComplexity}
- Recent themes shown (avoid repeating): ${context.recentThemes.join(', ') || 'None yet'}

## Available Themes to Choose From
${availableThemes.join(', ')}

## Your Task
Select the MOST SYMBOLICALLY APPROPRIATE theme from the list above based on the visitor's behavior pattern. Then fully design the visual and content system for that theme.

Symbolic reasoning rules:
- "reader" pattern -> richer text themes (Library, Temple, Observatory)
- "explorer" pattern -> more interactive/multi-zone themes (Bazaar, Coral Reef, Orchestra)
- "scanner" pattern -> visually striking, efficient themes (Space Station, Clockwork, Neon Bazaar)
- If the theme is "Orchestra" or musical: use "soundwaves" shapeLanguage and "musical" iconSet.
- If the theme is "Forest Trail" or nature-based: use "organic-curves" shapeLanguage and "nature" iconSet.
- If the theme is "Clockwork" or "Space": use "sharp-cuts" shapeLanguage and "mechanical" or "celestial" iconSet.
- High engagement (>0.6) -> more complex/layered themes
- Low engagement (<0.3) -> simpler, more welcoming themes
- First visit -> choose an accessible, impressionable theme

Architecture rules (choose a pageArchitecture that is DIFFERENT from visit to visit):
- "terminal" works best for "scanner" interaction types or technical themes (Space Station, Clockwork Machine).
- "editorial" works best for "reader" types (Library, Temple, Observatory).
- "bento-grid" works best for "explorer" types (Bazaar, Coral Reef, Orchestra).
- "cinematic" works best for high-engagement returning visitors who appreciate visual storytelling (Forest Trail, Ocean Trench).
- "manifesto" works best for bold, statement-making themes with high confidence visitors (Neon Bazaar, Ancient Temple, Desert Observatory).
- "standard" is the safe default for first visits.

Respond with a single JSON object matching this EXACT structure:
{
  "themeName": "string (must be one of the available themes)",
  "philosophy": "string (one evocative sentence describing the metaphor's essence)",
  "colorPalette": {
    "background": "hex color",
    "surface": "hex color (slightly lighter/darker than bg)",
    "primary": "hex color (dominant accent)",
    "secondary": "hex color",
    "accent": "hex color (highlight)",
    "text": "hex color (primary readable text)",
    "textMuted": "hex color (secondary text)",
    "border": "hex color (subtle borders)"
  },
  "typography": {
    "headingFont": "CSS font-family string",
    "bodyFont": "CSS font-family string",
    "scale": "tight|normal|loose",
    "headingWeight": "CSS font-weight string",
    "bodyWeight": "CSS font-weight string"
  },
  "layoutSchema": {
    "pageArchitecture": "standard|bento-grid|terminal|editorial|cinematic|manifesto",
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
  "contentTone": "string (e.g. 'poetic-naturalist', 'precise-engineer', 'ancient-sage')",
  "symbolicReasoning": "string (2-3 sentences explaining WHY this theme fits this visitor)"
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
        const prompt = this.buildPrompt(context, availableThemes);

        try {
            const usedModel = this.shouldUseGroq() ? 'groq-llama3-70b' : 'gemini-2.5-flash-lite';
            console.log(`[ThemeGenerationEngine] Using model: ${usedModel}`);

            if (usedModel === 'groq-llama3-70b') {
                return await this.generateWithGroq(prompt);
            } else {
                return await this.generateWithGemini(prompt);
            }
        } catch (error) {
            console.warn('[ThemeGenerationEngine] API failed (rate limit/quota). Attempting DB fallback...', error);

            try {
                const highPerformingTheme = await prisma.themeHistory.findFirst({
                    where: {
                        engagementScore: { gt: 0.7 },
                        themeName: { notIn: context.recentThemes },
                    },
                    orderBy: { engagementScore: 'desc' }
                });

                const finalFallbackTheme = highPerformingTheme || await prisma.themeHistory.findFirst({
                    where: { engagementScore: { gt: 0.7 } },
                    orderBy: { engagementScore: 'desc' }
                });

                if (finalFallbackTheme && finalFallbackTheme.themeJson) {
                    console.log(`[ThemeGenerationEngine] DB Fallback: Serving '${finalFallbackTheme.themeName}'`);
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
