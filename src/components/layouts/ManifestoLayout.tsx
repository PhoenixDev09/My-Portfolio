'use client';
import React, { useState, useEffect } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function ManifestoLayout({ theme, content, core }: Props) {
    // Phase 7 Interactive State
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleSkillFilter = (e: Event) => {
            const customEvent = e as CustomEvent<string | null>;
            setHighlightedSkill(customEvent.detail);
        };
        window.addEventListener('sym_skill_filter', handleSkillFilter);
        return () => window.removeEventListener('sym_skill_filter', handleSkillFilter);
    }, []);

    const handleSkillClick = (skill: string) => {
        const newSkill = activeSkill === skill ? null : skill;
        setActiveSkill(newSkill);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sym_skill_filter', { detail: newSkill }));
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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
                <div className="mani-hero__marquee">
                    <div className="mani-marquee__track">
                        {[...core.skills, ...core.skills].map((s, i) => (
                            <React.Fragment key={i}>
                                <button
                                    onClick={() => handleSkillClick(s)}
                                    style={{
                                        background: 'transparent', border: 'none', color: activeSkill === s ? 'var(--color-primary)' : 'inherit',
                                        fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', padding: 0
                                    }}
                                    className="skill-pill"
                                >{s}</button>
                                <span className="mani-sep">—</span>
                            </React.Fragment>
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
                {core.projects.map((p, i) => {
                    const isExpanded = expandedProjects.has(p.id);
                    const hasSkill = highlightedSkill ? p.technologies.includes(highlightedSkill) : false;
                    const isDimmed = highlightedSkill && !hasSkill;
                    const fullDesc = content.projectDescriptions[p.id] || p.description;
                    const summaryDesc = fullDesc.length > 80 ? fullDesc.substring(0, 80) + '...' : fullDesc;

                    return (
                        <div key={p.id} className="mani-project" style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                            <div className="mani-project__num">{String(i + 1).padStart(2, '0')}</div>
                            <div className="mani-project__divider" />
                            <div className="mani-project__content">
                                <h3 className="mani-project__name" style={{ color: hasSkill ? 'var(--color-primary)' : 'inherit' }}>{p.name.toUpperCase()}</h3>
                                <p className="mani-project__desc">{isExpanded ? fullDesc : summaryDesc}</p>
                                
                                <button 
                                    onClick={() => toggleExpand(p.id)}
                                    style={{
                                        background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)',
                                        padding: '0.4rem 1rem', marginTop: '1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600
                                    }}
                                >
                                    {isExpanded ? 'COLLAPSE' : 'INSPECT'}
                                </button>

                                {isExpanded && (
                                    <div style={{ marginTop: '2rem' }}>
                                        {p.metrics && <p className="mani-project__metrics">{p.metrics}</p>}
                                        <div className="mani-project__tags">
                                            {p.technologies.map(t => <span key={t} className={`tech-tag ${t === highlightedSkill ? 'tech-tag--active' : ''}`}>{t}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="mani-project__year">{p.year}</span>
                        </div>
                    );
                })}
            </section>

            <ContactSection theme={theme} content={content} core={core} />
            <FooterSection theme={theme} content={content} core={core} />
        </main>
    );
}
