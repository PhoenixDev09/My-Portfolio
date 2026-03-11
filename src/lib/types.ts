// ─── Core Content (Source of Truth) ───────────────────────────────────────────
export interface CoreContent {
    name: string;
    title: string;
    tagline: string;
    bio: string;
    yearsOfExperience: number;
    skills: string[];
    projects: Project[];
    stats: Stat[];
    contact: ContactInfo;
    socialLinks: SocialLink[];
}

export interface Project {
    id: string;
    name: string;
    year: number;
    description: string;
    technologies: string[];
    metrics?: string;
    link?: string;
}

export interface Stat {
    label: string;
    value: string;
}

export interface ContactInfo {
    email: string;
    location: string;
    availability: string;
}

export interface SocialLink {
    platform: string;
    url: string;
}

// ─── Theme & Design System ────────────────────────────────────────────────────
export interface ColorPalette {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
}

export interface Typography {
    headingFont: string;
    bodyFont: string;
    scale: 'tight' | 'normal' | 'loose';
    headingWeight: string;
    bodyWeight: string;
}

export interface LayoutSchema {
    heroStyle: 'immersive-full' | 'minimal-centered' | 'split-screen' | 'typographic';
    sectionOrder: SectionName[];
    sectionStyle: 'prose-block' | 'card-mosaic' | 'timeline' | 'constellation';
    gridStyle: 'organic-flow' | 'rigid-grid' | 'radial' | 'asymmetric';
    contactStyle: 'minimal-form' | 'call-card' | 'constellation' | 'terminal';
    spacing: 'compact' | 'airy' | 'expansive';
}

export type SectionName = 'hero' | 'about' | 'projects' | 'contact' | 'footer';

export type AnimationStyle =
    | 'flowing'
    | 'mechanical'
    | 'rhythmic'
    | 'galactic'
    | 'ancient'
    | 'undulating'
    | 'electric';

export type ShapeLanguage = 'organic-curves' | 'sharp-cuts' | 'soundwaves' | 'ornate-borders' | 'none';

export type IconSet = 'minimal' | 'nature' | 'mechanical' | 'musical' | 'celestial' | 'archaic';

export interface Theme {
    themeName: string;
    philosophy: string;
    colorPalette: ColorPalette;
    typography: Typography;
    layoutSchema: LayoutSchema;
    animationStyle: AnimationStyle;
    shapeLanguage: ShapeLanguage;
    iconSet: IconSet;
    contentTone: string;
    symbolicReasoning: string;
}

// ─── Rewritten Content ────────────────────────────────────────────────────────
export interface RewrittenContent {
    heroHeadline: string;
    heroSubheadline: string;
    heroCTA: string;
    aboutTitle: string;
    aboutBody: string;
    projectsTitle: string;
    projectDescriptions: Record<string, string>;
    contactTitle: string;
    contactBody: string;
    footerTagline: string;
}

// ─── Interaction & Adaptive ───────────────────────────────────────────────────
export interface InteractionEvent {
    sessionId: string;
    themeHistoryId?: string;
    sectionId?: string;
    eventType: 'scroll' | 'click' | 'time' | 'section_view';
    value: number;
    metadata?: Record<string, unknown>;
}

export interface PreferenceContext {
    sessionId: string;
    visitCount: number;
    recentThemes: string[];
    avgEngagement: number;
    preferredComplexity: 'simple' | 'moderate' | 'complex';
    dominantInteraction: 'reader' | 'explorer' | 'scanner';
    // Top-performing structural patterns for this visitor type
    topThemePatterns: Array<{
        iconSet: string;
        shapeLanguage: string;
        engagementScore: number;
    }>;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ThemeResponse {
    theme: Theme;
    content: RewrittenContent;
    sessionId: string;
    visitNumber: number;
    // ID of the ThemeHistory DB row — used to link interactions back to this exact render
    themeHistoryId: string;
}
