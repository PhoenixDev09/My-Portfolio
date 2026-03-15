'use client';
import React from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function ManifestoLayout({ theme, content, core }: Props) {
    return (
        <main className={`layout layout--manifesto anim-${theme.animationStyle}`}>

            {/* ── Hero: Bold typographic statement ── */}
            <section className="mani-hero" id="hero" data-section="hero">
                <div className="mani-hero__eyebrow">
                    <span>{theme.themeName.toUpperCase()}</span>
                    <span className="mani-sep">×</span>
                    <span>{core.name.toUpperCase()}</span>
                </div>
                <h1 className="mani-hero__headline">
                    {content.heroHeadline.split(' ').map((word, i) => (
                        <span key={i} className={`mani-word mani-word--${i % 2 === 0 ? 'filled' : 'outline'}`}>
                            {word}
                        </span>
                    ))}
                </h1>
                <div className="mani-hero__strip">
                    <p className="mani-hero__sub">{content.heroSubheadline}</p>
                    <div className="mani-hero__actions">
                        <a href="#projects" className="btn btn--primary" data-track="mani-cta">{content.heroCTA}</a>
                        <a href="#contact" className="btn btn--ghost" data-track="mani-contact">Make Contact</a>
                    </div>
                </div>
                <div className="mani-hero__marquee" aria-hidden="true">
                    <div className="mani-marquee__track">
                        {[...core.skills, ...core.skills].map((s, i) => (
                            <React.Fragment key={i}><span>{s}</span><span className="mani-sep">—</span></React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Philosophy Interlude ── */}
            <div className="mani-interlude">
                <p className="mani-interlude__text">&ldquo;{theme.philosophy}&rdquo;</p>
            </div>

            {/* ── About: Bold headline + stats bar ── */}
            <section className="mani-about" id="about" data-section="about">
                <div className="mani-about__header">
                    <span className="mani-label">I. BIOGRAPHY</span>
                    <div className="mani-rule" />
                </div>
                <h2 className="mani-about__title">{content.aboutTitle}</h2>
                <p className="mani-about__body">{content.aboutBody}</p>
                <div className="mani-stats-bar">
                    {core.stats.map(s => (
                        <div key={s.label} className="mani-stat-bar__item">
                            <div className="mani-stat-bar__value">{s.value}</div>
                            <div className="mani-stat-bar__label">{s.label.toUpperCase()}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Projects: Numbered full-bleed list ── */}
            <section className="mani-projects" id="projects" data-section="projects">
                <div className="mani-about__header">
                    <span className="mani-label">II. SELECTED WORKS</span>
                    <div className="mani-rule" />
                </div>
                <h2 className="mani-about__title">{content.projectsTitle}</h2>
                {core.projects.map((p, i) => (
                    <div key={p.id} className="mani-project">
                        <div className="mani-project__num">{String(i + 1).padStart(2, '0')}</div>
                        <div className="mani-project__divider" />
                        <div className="mani-project__content">
                            <h3 className="mani-project__name">{p.name.toUpperCase()}</h3>
                            <p className="mani-project__desc">{content.projectDescriptions[p.id] || p.description}</p>
                            {p.metrics && <p className="mani-project__metrics">{p.metrics}</p>}
                            <div className="mani-project__tags">
                                {p.technologies.map(t => <span key={t} className="tech-tag">{t}</span>)}
                            </div>
                        </div>
                        <span className="mani-project__year">{p.year}</span>
                    </div>
                ))}
            </section>

            <ContactSection theme={theme} content={content} core={core} />
            <FooterSection theme={theme} content={content} core={core} />
        </main>
    );
}
