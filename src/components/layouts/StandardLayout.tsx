'use client';
import React from 'react';
import { Theme, RewrittenContent, CoreContent, SectionName } from '@/lib/types';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import ProjectsSection from '../sections/ProjectsSection';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';
import { SectionDivider } from '../shapes/SectionDivider';
import { ShapeDecorations } from '../shapes/ShapeDecorations';

const SECTION_REGISTRY: Record<SectionName, React.ComponentType<{ theme: Theme; content: RewrittenContent; core: CoreContent }>> = {
    hero: HeroSection,
    about: AboutSection,
    projects: ProjectsSection,
    contact: ContactSection,
    footer: FooterSection,
};

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function StandardLayout({ theme, content, core }: Props) {
    const order = theme.layoutSchema.sectionOrder || ['hero', 'about', 'projects', 'contact', 'footer'];
    return (
        <main className={`layout layout--standard anim-${theme.animationStyle}`}>
            <ShapeDecorations shape={theme.shapeLanguage} color="var(--color-primary)" />
            {order.map((sectionName, index) => {
                const Section = SECTION_REGISTRY[sectionName];
                if (!Section) return null;
                const needsDivider = sectionName !== 'footer' && index !== order.length - 1;
                return (
                    <React.Fragment key={sectionName}>
                        <Section theme={theme} content={content} core={core} />
                        {needsDivider && (
                            <div className="relative w-full">
                                <SectionDivider shape={theme.shapeLanguage} fillColor="var(--color-bg)" position="bottom" />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </main>
    );
}
