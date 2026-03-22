'use client';
import React, { useState, useEffect } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function EditorialLayout({ theme, content, core }: Props) {
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

    const toggleExpand = (id: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <main className={`layout layout--editorial anim-${theme.animationStyle}`}>

            {/* Issue header */}
            <header className="editorial__header" id="hero" data-section="hero">
                <div className="editorial__edition">
                    <span>{theme.themeName}</span>
                    <span className="editorial__dot">·</span>
                    <span>Vol. {new Date().getFullYear()}</span>
                    <span className="editorial__dot">·</span>
                    <span>{core.contact.location}</span>
                </div>
                <h1 className="editorial__masthead">{core.name}</h1>
                <p className="editorial__subtitle">{core.title}</p>
                <div className="editorial__rule" />
            </header>

            {/* Lead article — full bleed */}
            <article className="editorial__lead">
                <div className="editorial__lead-inner">
                    <div className="editorial__category">
                        <IconRenderer name="user" themeSet={theme.iconSet} width={14} height={14} />
                        <span>— About the Engineer</span>
                    </div>
                    <h2 className="editorial__lead-headline">{content.heroHeadline}</h2>
                    <p className="editorial__lead-deck">{content.heroSubheadline}</p>
                    <div className="editorial__body-columns">
                        <p className="editorial__drop-cap">{content.aboutBody}</p>
                    </div>
                    <div className="editorial__lead-cta">
                        <a href="#projects" className="btn btn--primary" data-track="editorial-cta">{content.heroCTA}</a>
                        <a href="#contact" className="btn btn--ghost" data-track="editorial-contact">Get in touch</a>
                    </div>
                </div>
                <aside className="editorial__sidebar" id="about">
                    <div className="editorial__sidebar-title">{content.aboutTitle}</div>
                    <div className="editorial__rule" />
                    {core.stats.map(s => (
                        <div key={s.label} className="editorial__stat">
                            <span className="editorial__stat-value">{s.value}</span>
                            <span className="editorial__stat-label">{s.label}</span>
                        </div>
                    ))}
                    <div className="editorial__rule" />
                    <div className="editorial__sidebar-title">Philosophy</div>
                    <p className="editorial__quote">&ldquo;{theme.philosophy}&rdquo;</p>
                </aside>
            </article>

            {/* Projects section — editorial cards */}
            <section className="editorial__projects" id="projects">
                <div className="editorial__section-header">
                    <span className="editorial__category">— Recent Work</span>
                    <h2 className="editorial__section-title">{content.projectsTitle}</h2>
                    <div className="editorial__rule" />
                </div>
                <div className="editorial__projects-list">
                    {core.projects.map((proj, i) => {
                        const isExpanded = expandedProjects.has(proj.id);
                        const hasSkill = highlightedSkill ? proj.technologies.includes(highlightedSkill) : false;
                        const isDimmed = highlightedSkill && !hasSkill;
                        const fullDesc = content.projectDescriptions[proj.id] || proj.description;
                        const summaryDesc = fullDesc.length > 80 ? fullDesc.substring(0, 80) + '...' : fullDesc;

                        return (
                            <article key={proj.id} className={`editorial__project editorial__project--${i % 2 === 0 ? 'left' : 'right'}`} style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                                <span className="editorial__project-num">{String(i + 1).padStart(2, '0')}</span>
                                <div className="editorial__project-content">
                                    <span className="editorial__project-year">{proj.year}</span>
                                    <h3 className="editorial__project-title" style={{ color: hasSkill ? 'var(--color-primary)' : 'inherit' }}>{proj.name}</h3>
                                    <p className="editorial__project-desc">{isExpanded ? fullDesc : summaryDesc}</p>
                                    
                                    <button 
                                        onClick={() => toggleExpand(proj.id)}
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '0.3rem 0.8rem', marginTop: '1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
                                    >
                                        {isExpanded ? '— Less' : '+ Read the full column'}
                                    </button>

                                    {isExpanded && (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            {proj.metrics && <p className="editorial__project-metrics">{proj.metrics}</p>}
                                            <div className="editorial__project-tags">
                                                {proj.technologies.map(t => <span key={t} className={`tech-tag ${t === highlightedSkill ? 'tech-tag--active' : ''}`}>{t}</span>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* Contact + Footer use standard sections */}
            <ContactSection theme={theme} content={content} core={core} />
            <FooterSection theme={theme} content={content} core={core} />
        </main>
    );
}
