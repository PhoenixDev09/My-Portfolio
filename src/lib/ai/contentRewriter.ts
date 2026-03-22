import { GoogleGenerativeAI } from '@google/generative-ai';
import { CoreContent, RewrittenContent, Theme } from '../types';

export class SymbolicContentRewriter {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not set');
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async rewrite(core: CoreContent, theme: Theme): Promise<RewrittenContent> {
        try {
            const projectDescPrompt = core.projects
                .map((p) => `- ID: ${p.id}, Name: "${p.name}", Year: ${p.year}, Facts: "${p.description}", Metrics: "${p.metrics || 'N/A'}"`)
                .join('\n');

            const prompt = `You are a symbolic content poet and technical writer. Your mission: rewrite portfolio text through the lens of a specific metaphor WITHOUT altering any factual information.

## THE METAPHOR (Your Creative Lens)
Theme: ${theme.themeName}
Philosophy: ${theme.philosophy}
Content Tone: ${theme.contentTone}
Architecture: ${theme.layoutSchema.pageArchitecture}

## SACRED FACTS — NEVER CHANGE THESE
- Person's name: ${core.name}
- Title: ${core.title}
- Background & Education: ${core.bio}
- Years of experience: ${core.yearsOfExperience}
- Users reached: 50,000+
- Countries: 12
- Skills: ${core.skills.join(', ')}
- Projects:
${projectDescPrompt}

## YOUR TASK
Rewrite the text through the ${theme.themeName} metaphor.
CRITICAL TONE INSTRUCTION: You MUST heavily adapt the writing style to match the Architecture (${theme.layoutSchema.pageArchitecture}):
- "terminal": Write like Unix man pages, CLI system logs, or raw code comments. Brutally direct, technical, and aggressive.
- "manifesto": Write like a punk zine or revolutionary essay. Bold declarations, philosophical demands, unapologetic, all-caps emphasis on keywords.
- "cinematic": Write like sweeping movie trailer lore. Dramatic, atmospheric scene-setting, grand narrative.
- "bento-grid": Write like an ultra-modern app dashboard. Extremely concise, punchy, scannable fragments.
- "editorial": Write like a high-end magazine profile (e.g. Wired, New Yorker). Thoughtful, literary, deep narrative flow.

Rules:
1. NEVER change facts, numbers, metrics, technology names, or core features.
2. DO change: sentence rhythm, metaphors, opening lines, descriptive flourishes.
3. Keep all text professional and readable.
4. If writing for "terminal", rewrite project descriptions to sound like CLI logs or system specs.
5. You MUST rewrite the project descriptions based on the tone.

Respond with this EXACT JSON:
{
  "heroHeadline": "string (evocative headline. CRITICAL: MUST include exactly '${core.name}' with absolutely NO modifications, additions, nicknames, or changes to the name text itself)",
  "heroSubheadline": "string (1 sentence, ${theme.themeName}-flavored paraphrase of tagline)",
  "heroCTA": "string (3-4 words CTA)",
  "aboutTitle": "string (section title like 'About' but metaphor-flavored)",
  "aboutBody": "string (3-4 sentences rewriting the bio through the metaphor, keep ALL facts)",
  "projectsTitle": "string (section title for projects, metaphor-flavored)",
  "projectDescriptions": {
    "proj-1": "string (rewritten description emphasizing the architectural tone)",
    "proj-2": "string (rewritten description)",
    "proj-3": "string (rewritten description)",
    "proj-4": "string (rewritten description)"
  },
  "contactTitle": "string (contact title, metaphor-flavored)",
  "contactBody": "string (1-2 sentences inviting contact)",
  "footerTagline": "string (short evocative line)"
}`;

            let parsed: RewrittenContent;
            
            // Prefer Groq to save Gemini quotas
            if (process.env.GROQ_API_KEY) {
                const { Groq } = require('groq-sdk');
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const completion = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.9,
                    response_format: { type: 'json_object' },
                });
                parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
            } else {
                const model = this.genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash-lite',
                    generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
                });
                const result = await model.generateContent(prompt);
                parsed = JSON.parse(result.response.text());
            }

            this.validateFacts(parsed, core);
            return parsed;
        } catch (error) {
            console.error('[SymbolicContentRewriter] Error, using fallback:', error);
            return this.getFallbackContent(core, theme);
        }
    }

    private validateFacts(content: RewrittenContent, core: CoreContent): void {
        const allText = JSON.stringify(content);
        const requiredFacts = [core.name, `${core.yearsOfExperience}`];

        for (const fact of requiredFacts) {
            if (!allText.includes(fact)) {
                console.warn(`[ContentRewriter] Fact validation: "${fact}" not found in rewritten content`);
            }
        }
    }

    private getFallbackContent(core: CoreContent, theme: Theme): RewrittenContent {
        const projectDescriptions: Record<string, string> = {};
        core.projects.forEach((p) => {
            projectDescriptions[p.id] = p.description;
        });

        return {
            heroHeadline: `${core.name} — ${core.title}`,
            heroSubheadline: core.tagline,
            heroCTA: 'Explore My Work',
            aboutTitle: 'About',
            aboutBody: core.bio,
            projectsTitle: 'Projects',
            projectDescriptions,
            contactTitle: 'Contact',
            contactBody: `Reach out at ${core.contact.email}. ${core.contact.availability}.`,
            footerTagline: `${core.name} · ${new Date().getFullYear()}`,
        };
    }
}
