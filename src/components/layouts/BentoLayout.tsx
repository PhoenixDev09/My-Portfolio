'use client';
import React, { useState, useEffect } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

export default function BentoLayout({ theme, content, core }: Props) {
    const p = theme.colorPalette;
    
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
        <main className={`layout layout--bento anim-${theme.animationStyle}`}>
            <div className="bento-grid">

                {/* Card 1: Identity — large spanning */}
                <div className="bento-card bento-card--hero">
                    <div className="bento-card__tag">
                        <IconRenderer name="user" themeSet={theme.iconSet} width={14} height={14} />
                        <span>{theme.themeName}</span>
                    </div>
                    <h1 className="bento-hero__headline">{content.heroHeadline}</h1>
                    <p className="bento-hero__sub">{content.heroSubheadline}</p>
                    <div className="bento-hero__actions">
                        <a href="#contact" className="btn btn--primary" data-track="bento-cta">{content.heroCTA}</a>
                        <a href="#projects" className="btn btn--ghost" data-track="bento-projects">View Work</a>
                    </div>
                </div>

                {/* Card 2: Philosophy strip */}
                <div className="bento-card bento-card--philosophy">
                    <p className="bento-philosophy__text">&ldquo;{theme.philosophy}&rdquo;</p>
                </div>

                {/* Card 3: Stats */}
                <div className="bento-card bento-card--stats">
                    {core.stats.map((stat) => (
                        <div key={stat.label} className="bento-stat">
                            <span className="bento-stat__value">{stat.value}</span>
                            <span className="bento-stat__label">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Card 4: About */}
                <div className="bento-card bento-card--about" id="about">
                    <h2 className="bento-card__title">{content.aboutTitle}</h2>
                    <p className="bento-card__body">{content.aboutBody}</p>
                </div>

                {/* Card 5–8: Projects — each in its own cell */}
                {core.projects.slice(0, 4).map((proj, i) => {
                    const isExpanded = expandedProjects.has(proj.id);
                    const hasSkill = highlightedSkill ? proj.technologies.includes(highlightedSkill) : false;
                    const isDimmed = highlightedSkill && !hasSkill;
                    const fullDesc = content.projectDescriptions[proj.id] || proj.description;
                    const summaryDesc = fullDesc.length > 80 ? fullDesc.substring(0, 80) + '...' : fullDesc;

                    return (
                        <div 
                            key={proj.id} 
                            className={`bento-card bento-card--project bento-card--project-${i} ${isDimmed ? 'project-card--dimmed' : ''} ${hasSkill ? 'project-card--highlighted' : ''}`} 
                            id={i === 0 ? 'projects' : undefined}
                            data-track={`project-view-${proj.id}`}
                        >
                            <span className="bento-project__year">{proj.year}</span>
                            <h3 className="bento-project__name">{proj.name}</h3>
                            <p className="bento-project__desc">{isExpanded ? fullDesc : summaryDesc}</p>
                            
                            <button 
                                className="project-card__expand-btn" 
                                onClick={() => toggleExpand(proj.id)}
                            >
                                {isExpanded ? '— Less details' : '+ View details'}
                            </button>

                            {isExpanded && (
                                <div className="bento-project__tags" style={{marginTop: '1rem'}}>
                                    {proj.technologies.slice(0, 3).map(t => (
                                        <span key={t} className={`tech-tag ${t === highlightedSkill ? 'tech-tag--active' : ''}`}>{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Card 9: Skills */}
                <div className="bento-card bento-card--skills">
                    <h3 className="bento-card__title">Tools &amp; Stack</h3>
                    <div className="bento-skills">
                        {core.skills.map(s => (
                            <button 
                                key={s} 
                                className={`skill-pill ${activeSkill === s ? 'skill-pill--active' : ''}`} 
                                onClick={() => handleSkillClick(s)}
                                data-track={`skill-filter-${s}`}
                                style={{
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-color)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card 10: Contact */}
                <div className="bento-card bento-card--contact" id="contact">
                    <h2 className="bento-card__title">{content.contactTitle}</h2>
                    <p className="bento-card__body">{content.contactBody}</p>
                    <a href={`mailto:${core.contact.email}`} className="btn btn--primary bento-contact__cta" data-track="contact-email">
                        <IconRenderer name="mail" themeSet={theme.iconSet} width={16} height={16} />
                        {core.contact.email}
                    </a>
                    <div className="bento-contact__socials">
                        {core.socialLinks.map(s => (
                            <a key={s.platform} href={s.url} className="bento-social" target="_blank" rel="noopener noreferrer">{s.platform}</a>
                        ))}
                    </div>
                </div>

                {/* Card 11: Footer strip */}
                <div className="bento-card bento-card--footer">
                    <span style={{ opacity: 0.5 }}>{theme.contentTone} · visit {core.name}</span>
                </div>
            </div>
        </main>
    );
}
