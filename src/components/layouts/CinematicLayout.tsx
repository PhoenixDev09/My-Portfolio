'use client';
import React, { useEffect, useRef } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function CinematicLayout({ theme, content, core }: Props) {
    const heroRef = useRef<HTMLDivElement>(null);

    // Subtle parallax on scroll
    useEffect(() => {
        const onScroll = () => {
            if (heroRef.current) {
                heroRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <main className={`layout layout--cinematic anim-${theme.animationStyle}`}>

            {/* ── ACT 1 HERO: Full-screen immersive ── */}
            <section className="cin-act cin-act--hero" id="hero" data-section="hero">
                <div className="cin-hero__bg" ref={heroRef} aria-hidden="true" />
                <div className="cin-hero__overlay" aria-hidden="true" />
                <div className="cin-hero__content">
                    <div className="cin-hero__meta">
                        <span className="cin-chapter">Opening Act</span>
                        <span className="cin-theme-name">{theme.themeName}</span>
                    </div>
                    <h1 className="cin-hero__headline">{content.heroHeadline}</h1>
                    <p className="cin-hero__deck">{content.heroSubheadline}</p>
                    <p className="cin-hero__philosophy">&ldquo;{theme.philosophy}&rdquo;</p>
                    <div className="cin-hero__actions">
                        <a href="#about" className="btn btn--primary" data-track="cin-cta">{content.heroCTA}</a>
                        <a href="#contact" className="btn btn--ghost" data-track="cin-contact">Get in touch</a>
                    </div>
                </div>
                <div className="cin-scroll-hint" aria-hidden="true">
                    <span className="cin-scroll-hint__line" />
                    <span className="cin-scroll-hint__text">scroll</span>
                </div>
            </section>

            {/* ── ACT 2: About — side-by-side with number ── */}
            <section className="cin-act cin-act--about" id="about" data-section="about">
                <div className="cin-act__number" aria-hidden="true">02</div>
                <div className="cin-act__inner">
                    <span className="cin-chapter">The Engineer</span>
                    <h2 className="cin-act__title">{content.aboutTitle}</h2>
                    <p className="cin-act__body">{content.aboutBody}</p>
                    <div className="cin-stats">
                        {core.stats.map(s => (
                            <div key={s.label} className="cin-stat">
                                <span className="cin-stat__value">{s.value}</span>
                                <span className="cin-stat__label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ACT 3: Projects ── */}
            <section className="cin-act cin-act--projects" id="projects" data-section="projects">
                <div className="cin-act__number" aria-hidden="true">03</div>
                <div className="cin-act__inner">
                    <span className="cin-chapter">The Work</span>
                    <h2 className="cin-act__title">{content.projectsTitle}</h2>
                    <div className="cin-projects">
                        {core.projects.map((p, i) => (
                            <div key={p.id} className="cin-project" style={{ '--i': i } as React.CSSProperties}>
                                <div className="cin-project__num">{String(i + 1).padStart(2, '0')}</div>
                                <div className="cin-project__body">
                                    <h3 className="cin-project__name">{p.name}
                                        <span className="cin-project__year"> — {p.year}</span>
                                    </h3>
                                    <p className="cin-project__desc">{content.projectDescriptions[p.id] || p.description}</p>
                                    {p.metrics && <p className="cin-project__metrics">{p.metrics}</p>}
                                    <div className="cin-project__stack">
                                        {p.technologies.map(t => <span key={t} className="tech-tag">{t}</span>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Acts 4 & 5: Reuse standard sections ── */}
            <ContactSection theme={theme} content={content} core={core} />
            <FooterSection theme={theme} content={content} core={core} />
        </main>
    );
}
