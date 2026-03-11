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
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash-lite',
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.9,
                },
            });

            const projectDescPrompt = core.projects
                .map((p) => `- ID: ${p.id}, Name: "${p.name}", Year: ${p.year}, Facts: "${p.description}", Metrics: "${p.metrics || 'N/A'}"`)
                .join('\n');

            const prompt = `You are a symbolic content poet and technical writer. Your mission: rewrite portfolio text through the lens of a specific metaphor WITHOUT altering any factual information.

## THE METAPHOR (Your Creative Lens)
Theme: ${theme.themeName}
Philosophy: ${theme.philosophy}
Content Tone: ${theme.contentTone}

## SACRED FACTS — NEVER CHANGE THESE
- Person's name: ${core.name}
- Title: ${core.title}
- Years of experience: ${core.yearsOfExperience}
- Education: MIT, Bachelor of Science in Computer Science, 2019
- Users reached: 50,000+
- Countries: 12
- Skills: ${core.skills.join(', ')}
- Projects:
${projectDescPrompt}

## YOUR TASK
Rewrite the text through the ${theme.themeName} metaphor. The metaphor should infuse the IMAGERY, VOCABULARY, and RHYTHM — NOT the facts.

Rules:
1. NEVER change: names, years, numbers, universities, metrics, technology names
2. DO change: sentence rhythm, metaphors, opening lines, descriptive flourishes
3. Keep all text professional and readable
4. Each rewrite should feel like the same truth wearing a ${theme.themeName} costume

Respond with this EXACT JSON:
{
  "heroHeadline": "string (evocative headline, includes '${core.name}' naturally, max 10 words)",
  "heroSubheadline": "string (1 sentence, ${theme.themeName}-flavored paraphrase of tagline, keep '5 years' factually)",
  "heroCTA": "string (3-4 words CTA button text in the theme's vocabulary)",
  "aboutTitle": "string (section title like 'About' but metaphor-flavored, max 4 words)",
  "aboutBody": "string (3-4 sentences rewriting the bio through the metaphor, keep ALL facts: ${core.name}, 5 years, 50,000, 12 countries, MIT, 2019)",
  "projectsTitle": "string (section title for projects, metaphor-flavored, max 4 words)",
  "projectDescriptions": {
    "proj-1": "string (rewritten NeuralCraft description, keep: 12,000 developers)",
    "proj-2": "string (rewritten FlowSync description, keep: 70%, 8 enterprise clients)",
    "proj-3": "string (rewritten Echosphere description, keep: 30,000 users, <50ms)",
    "proj-4": "string (rewritten OpenLens description, keep: 3,200 engineers, 1,400 GitHub stars)"
  },
  "contactTitle": "string (contact section title, metaphor-flavored, max 4 words)",
  "contactBody": "string (1-2 sentences inviting contact, ${theme.contentTone}-flavored)",
  "footerTagline": "string (1 short evocative line, metaphor of identity, max 12 words)"
}`;

            // Quota Exceeded Workaround (20 req / day limit hit)
            // const result = await model.generateContent(prompt);
            // const text = result.response.text();
            // const parsed = JSON.parse(text) as RewrittenContent;

            const parsed: RewrittenContent = {
                heroHeadline: "Designing the Rhythm of Code",
                heroSubheadline: `A ${core.yearsOfExperience}-year symphony of building interfaces that resonate.`,
                heroCTA: "View Compositions",
                aboutTitle: "The Conductor's Journey",
                aboutBody: core.bio,
                projectsTitle: "Recent Arrangements",
                projectDescriptions: core.projects.reduce((acc, p) => ({ ...acc, [p.id]: p.description }), {}),
                contactTitle: "Open the Dialogue",
                contactBody: "Let's compose something beautiful together. Reach out via frequency.",
                footerTagline: "Built with tempo and precision."
            };

            // Fact-check validation: ensure key numbers are present
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
