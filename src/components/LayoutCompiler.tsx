'use client';

import React from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';
import FooterSection from './sections/FooterSection';
import { SectionDivider } from './shapes/SectionDivider';
import { ShapeDecorations } from './shapes/ShapeDecorations';
import { SectionName } from '@/lib/types';

interface LayoutCompilerProps {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

const SECTION_REGISTRY: Record<
    SectionName,
    React.ComponentType<{ theme: Theme; content: RewrittenContent; core: CoreContent }>
> = {
    hero: HeroSection,
    about: AboutSection,
    projects: ProjectsSection,
    contact: ContactSection,
    footer: FooterSection,
};

export default function LayoutCompiler({ theme, content, core }: LayoutCompilerProps) {
    const order = theme.layoutSchema.sectionOrder || ['hero', 'about', 'projects', 'contact', 'footer'];

    return (
        <main className={`layout anim-${theme.animationStyle}`}>
            <ShapeDecorations shape={theme.shapeLanguage} color="var(--color-primary)" />
            {order.map((sectionName, index) => {
                const Section = SECTION_REGISTRY[sectionName];
                if (!Section) return null;

                // Determine if we need a divider after this section
                const needsDivider = sectionName !== 'footer' && index !== order.length - 1;
                // Alternate fill color for the divider depending on section index to hide hard CSS backgrounds
                // For simplicity here, we'll let CSS variables map `var(--color-bg)`

                return (
                    <React.Fragment key={sectionName}>
                        <Section theme={theme} content={content} core={core} />
                        {needsDivider && (
                            <div className="relative w-full">
                                <SectionDivider
                                    shape={theme.shapeLanguage}
                                    fillColor="var(--color-bg)"
                                    position="bottom"
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </main>
    );
}
