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

export type PageArchitecture = 'standard' | 'bento-grid' | 'terminal' | 'editorial' | 'cinematic' | 'manifesto' | 'timeline' | 'split-screen';

export interface LayoutSchema {
    pageArchitecture: PageArchitecture;
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
    // EC-04: Synced with RichInteractionEvent in useInteractionTracker — all 9 types
    eventType: 'scroll' | 'click' | 'time' | 'section_view' | 'section_dwell' | 'scroll_velocity' | 'active_time' | 'text_selection' | 'cta_hover';
    value: number;
    metadata?: Record<string, unknown>;
}

export interface ColorDNA {
    hueDeg: number;        // 0–360 dominant hue of primary color
    saturation: number;    // 0–1 normalized CSS saturation
    luminance: number;     // 0–1, low = dark, high = light
}

// The 5 psychological archetypes
export type UserArchetype = 'reader' | 'explorer' | 'scanner' | 'investigator' | 'window-shopper';

export type TypographicTone = 'narrative' | 'technical' | 'expressionist';

export type DensityPreference = 'minimal' | 'moderate' | 'dense';

export type IntentSignal = 'browsing' | 'evaluating' | 'deciding';

export type ExploreAxis = 'architecture' | 'colorHue' | 'density' | 'typographicTone';

export interface GenerationDirective {
    mode: 'exploit' | 'explore' | 'shock';
    // For exploit: precise constraints
    colorDNA?: ColorDNA;
    architecture?: PageArchitecture;
    typographicTone?: TypographicTone;
    densityPreference?: DensityPreference;
    // For explore: which single axis to break
    exploreAxis?: ExploreAxis;
    // Anti-affinity: hard exclusions regardless of mode
    antiArchitectures: PageArchitecture[];
    antiColorContrast?: 'dark' | 'light';
    // Human-readable reasoning for the Orb UI
    orbReasoning: string;
}

export interface PreferenceContext {
    sessionId: string;
    visitCount: number;
    recentThemes: string[];
    recentArchitectures: string[];
    avgEngagement: number;
    preferredComplexity: 'simple' | 'moderate' | 'complex';
    // Layer 2 fields
    archetype: UserArchetype;
    intentSignal: IntentSignal;
    topSection: string;
    scrollVelocityMedian: number;
    activeTimeSeconds: number;
    selectedText: boolean;
    // Layer 3 fields
    colorDNA?: ColorDNA;
    typographicTone: TypographicTone;
    densityPreference: DensityPreference;
    topThemePatterns: Array<{
        iconSet: string;
        shapeLanguage: string;
        engagementScore: number;
    }>;
    // Layer 4 Orchestrator output
    directive: GenerationDirective;
}


// ─── API Response ─────────────────────────────────────────────────────────────
export interface ThemeResponse {
    theme: Theme;
    content: RewrittenContent;
    sessionId: string;
    visitNumber: number;
    themeHistoryId: string;
    orbReasoning?: string;
    archetype?: string;
}
