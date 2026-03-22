'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function CinematicLayout({ theme, content, core }: Props) {
    const heroRef = useRef<HTMLDivElement>(null);

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
                    <div style={{ marginTop: '3rem' }}>
                        <span className="cin-chapter" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Technical Repertoire</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            {core.skills.map(skill => (
                                <button 
                                    key={skill} 
                                    className={`skill-pill ${activeSkill === skill ? 'skill-pill--active' : ''}`}
                                    onClick={() => handleSkillClick(skill)}
                                    style={{
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'transparent',
                                        color: '#fff',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
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
                        {core.projects.map((p, i) => {
                            const isExpanded = expandedProjects.has(p.id);
                            const hasSkill = highlightedSkill ? p.technologies.includes(highlightedSkill) : false;
                            const isDimmed = highlightedSkill && !hasSkill;
                            const fullDesc = content.projectDescriptions[p.id] || p.description;
                            const summaryDesc = fullDesc.length > 80 ? fullDesc.substring(0, 80) + '...' : fullDesc;

                            return (
                                <div key={p.id} className="cin-project" style={{ '--i': i, opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s' } as React.CSSProperties}>
                                    <div className="cin-project__num">{String(i + 1).padStart(2, '0')}</div>
                                    <div className="cin-project__body">
                                        <h3 className="cin-project__name" style={{ color: hasSkill ? 'var(--color-primary)' : 'inherit' }}>{p.name}
                                            <span className="cin-project__year"> — {p.year}</span>
                                        </h3>
                                        <p className="cin-project__desc">{isExpanded ? fullDesc : summaryDesc}</p>
                                        
                                        <button 
                                            onClick={() => toggleExpand(p.id)}
                                            style={{
                                                background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                                                padding: '0.3rem 0.8rem', borderRadius: '4px', marginTop: '1rem', cursor: 'pointer', fontFamily: 'inherit'
                                            }}
                                        >
                                            {isExpanded ? '— Less' : '+ Read Details'}
                                        </button>

                                        {isExpanded && (
                                            <div style={{ marginTop: '1.5rem', animation: 'fadeInDown 0.3s forwards' }}>
                                                {p.metrics && <p className="cin-project__metrics">{p.metrics}</p>}
                                                <div className="cin-project__stack">
                                                    {p.technologies.map(t => (
                                                        <span key={t} className={`tech-tag ${t === highlightedSkill ? 'tech-tag--active' : ''}`}>{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Acts 4 & 5: Reuse standard sections ── */}
            <ContactSection theme={theme} content={content} core={core} />
            <FooterSection theme={theme} content={content} core={core} />
        </main>
    );
}
