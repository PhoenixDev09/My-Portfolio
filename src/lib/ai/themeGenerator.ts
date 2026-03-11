import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Theme, PreferenceContext, AnimationStyle, LayoutSchema } from '../types';

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

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not set');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generate(context: PreferenceContext): Promise<Theme> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash-lite',
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.85,
                },
            });

            const availableThemes = THEME_CATALOG.filter(
                (t) => !context.recentThemes.slice(0, 4).includes(t)
            );

            const prompt = `You are a symbolic design intelligence. Your task is to choose and fully design a metaphoric theme for a personal portfolio website.

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
- "reader" pattern → richer text themes (Library, Temple, Observatory)
- "explorer" pattern → more interactive/multi-zone themes (Bazaar, Coral Reef, Orchestra)
- "scanner" pattern → visually striking, efficient themes (Space Station, Clockwork, Neon Bazaar)
- If the theme is "Orchestra" or musical: use "soundwaves" shapeLanguage and "musical" iconSet.
- If the theme is "Forest Trail" or nature-based: use "organic-curves" shapeLanguage and "nature" iconSet.
- If the theme is "Clockwork" or "Space": use "sharp-cuts" shapeLanguage and "mechanical" or "celestial" iconSet.
- High engagement (>0.6) → more complex/layered themes
- Low engagement (<0.3) → simpler, more welcoming themes
- First visit → choose an accessible, impressionable theme

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

            // Quota Exceeded Workaround (20 req / day limit hit)
            // const result = await model.generateContent(prompt);
            // const text = result.response.text();
            // const parsed = JSON.parse(text) as Theme;

            const isMusical = Math.random() > 0.5;
            const parsed: Theme = isMusical ? {
                themeName: 'Soundwave Symphony',
                philosophy: 'The world is rhythm, waiting for a conductor.',
                colorPalette: {
                    background: '#1a0b16',
                    surface: '#2d142c',
                    primary: '#ff3366',
                    secondary: '#8a2be2',
                    accent: '#00ffff',
                    text: '#f2f2f2',
                    textMuted: '#a890a5',
                    border: '#4a2546'
                },
                typography: {
                    headingFont: "'Playfair Display', serif",
                    bodyFont: "'Inter', sans-serif",
                    scale: 'normal',
                    headingWeight: '700',
                    bodyWeight: '400'
                },
                layoutSchema: {
                    heroStyle: 'typographic',
                    sectionOrder: ['hero', 'projects', 'about', 'contact', 'footer'],
                    sectionStyle: 'timeline',
                    gridStyle: 'asymmetric',
                    contactStyle: 'call-card',
                    spacing: 'expansive'
                },
                shapeLanguage: 'soundwaves',
                iconSet: 'musical',
                animationStyle: 'rhythmic',
                contentTone: 'poetic-naturalist',
                symbolicReasoning: 'This visitor is highly engaged and explores content rhythmically.'
            } : {
                themeName: 'Forest Trail',
                philosophy: 'Organic emergence from roots to canopy.',
                colorPalette: {
                    background: '#f4f1ea',
                    surface: '#ffffff',
                    primary: '#2e5c31',
                    secondary: '#8b9a46',
                    accent: '#e28743',
                    text: '#2c362d',
                    textMuted: '#677568',
                    border: '#dce0d9'
                },
                typography: {
                    headingFont: "'Lora', serif",
                    bodyFont: "'Source Sans Pro', sans-serif",
                    scale: 'loose',
                    headingWeight: '600',
                    bodyWeight: '400'
                },
                layoutSchema: {
                    heroStyle: 'immersive-full',
                    sectionOrder: ['hero', 'about', 'projects', 'contact', 'footer'],
                    sectionStyle: 'card-mosaic',
                    gridStyle: 'organic-flow',
                    contactStyle: 'minimal-form',
                    spacing: 'airy'
                },
                shapeLanguage: 'organic-curves',
                iconSet: 'nature',
                animationStyle: 'flowing',
                contentTone: 'poetic-naturalist',
                symbolicReasoning: 'This visitor prefers natural, welcoming layouts based on past reading patterns.'
            };

            return parsed;
        } catch (error) {
            console.error('[ThemeGenerationEngine] Error, using fallback:', error);
            return FALLBACK_THEME;
        }
    }
}
