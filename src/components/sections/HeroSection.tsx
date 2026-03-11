'use client';

import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function HeroSection({ theme, content, core }: Props) {
    const style = theme.layoutSchema.heroStyle;

    return (
        <section
            className={`hero hero--${style}`}
            id="hero"
            aria-label="Introduction"
            data-section="hero"
            data-track="hero-section"
        >
            <div className="hero__inner">
                {/* ── Inline Theme Emblem — metaphor lives here, not in a badge ── */}
                <div className="theme-emblem" aria-label={`Active metaphor: ${theme.themeName}`}>
                    <IconRenderer name="user" themeSet={theme.iconSet} width={14} height={14} />
                    <span className="theme-emblem__name">{theme.themeName}</span>
                    <span className="theme-emblem__sep">·</span>
                    <span className="theme-emblem__philosophy">&ldquo;{theme.philosophy}&rdquo;</span>
                </div>

                <div className="hero__badge">
                    <span className="hero__badge-dot" />
                    <span>{core.contact.availability}</span>
                </div>

                <h1 className="hero__headline">{content.heroHeadline}</h1>
                <p className="hero__sub">{content.heroSubheadline}</p>

                <div className="hero__stats">
                    {core.stats.map((stat) => (
                        <div key={stat.label} className="hero__stat">
                            <span className="hero__stat-value">{stat.value}</span>
                            <span className="hero__stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="hero__actions">
                    <a href="#projects" className="btn btn--primary" data-track="hero-cta">
                        <IconRenderer name="code" themeSet={theme.iconSet} width={18} height={18} />
                        {content.heroCTA}
                    </a>
                    <a href="#contact" className="btn btn--ghost" data-track="hero-contact">
                        <IconRenderer name="mail" themeSet={theme.iconSet} width={18} height={18} />
                        Get in touch
                    </a>
                </div>

                <div className="hero__skills">
                    {core.skills.slice(0, 8).map((skill) => (
                        <span key={skill} className="skill-tag">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="hero__visual" aria-hidden="true">
                <div className="hero__orb hero__orb--1" />
                <div className="hero__orb hero__orb--2" />
                <div className="hero__orb hero__orb--3" />
            </div>
        </section>
    );
}
