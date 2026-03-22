'use client';

import React, { useState, useEffect } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function ProjectsSection({ theme, content, core }: Props) {
    const gridStyle = theme.layoutSchema.gridStyle;
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);

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
        <section
            className={`projects projects--${gridStyle}`}
            id="projects"
            aria-label="Projects"
            data-section="projects"
            data-track="projects-section"
        >
            <div className="section-inner">
                <div className="section-label">
                    <span className="section-label__line" />
                    <span className="section-label__text">Work</span>
                </div>
                <h2 className="section-title">{content.projectsTitle}</h2>

                <div className="projects__grid">
                    {core.projects.map((project, idx) => {
                        const isExpanded = expandedProjects.has(project.id);
                        const hasSkill = highlightedSkill ? project.technologies.includes(highlightedSkill) : false;
                        const isDimmed = highlightedSkill && !hasSkill;
                        const fullDesc = content.projectDescriptions[project.id] || project.description;
                        
                        // Progressive Disclosure: Create a short punchy summary from the first 80 chars
                        const summaryDesc = fullDesc.length > 80 ? fullDesc.substring(0, 80) + '...' : fullDesc;

                        return (
                            <article
                                key={project.id}
                                className={`project-card ${isDimmed ? 'project-card--dimmed' : ''} ${hasSkill ? 'project-card--highlighted' : ''}`}
                                style={{ '--card-index': idx } as React.CSSProperties}
                                data-track={`project-view-${project.id}`}
                            >
                                <div className="project-card__header">
                                    <span className="project-card__year">{project.year}</span>
                                    <span className="project-card__icon" aria-hidden="true">
                                        <IconRenderer name="code" themeSet={theme.iconSet} width={20} height={20} />
                                    </span>
                                </div>

                                <h3 className="project-card__name">{project.name}</h3>

                                <p className="project-card__desc">
                                    <span>{isExpanded ? fullDesc : summaryDesc}</span>
                                </p>
                                
                                <button 
                                    type="button"
                                    className="project-card__expand-btn btn" 
                                    onClick={() => toggleExpand(project.id)}
                                    data-track={isExpanded ? `project-collapse-${project.id}` : `project-expand-${project.id}`}
                                    style={{ position: 'relative', zIndex: 10, cursor: 'pointer', marginTop: '1rem', display: 'inline-block', border: '1px solid var(--color-primary)', background: 'transparent', padding: '0.4rem 1rem', borderRadius: '4px', color: 'var(--color-primary)' }}
                                >
                                    {isExpanded ? '— Less details' : '+ View structural details'}
                                </button>

                                {isExpanded && (
                                    <div className="project-card__expanded-content">
                                        {project.metrics && (
                                            <div className="project-card__metrics">
                                                <IconRenderer name="globe" themeSet={theme.iconSet} width={16} height={16} />
                                                {project.metrics}
                                            </div>
                                        )}

                                        <div className="project-card__tech">
                                            {project.technologies.map((tech) => (
                                                <span key={tech} className={`tech-tag ${tech === highlightedSkill ? 'tech-tag--active' : ''}`}>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        {project.link && (
                                            <a
                                                href={project.link}
                                                className="project-card__link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                data-track={`project-link-${project.id}`}
                                            >
                                                <IconRenderer name="link" themeSet={theme.iconSet} width={14} height={14} />
                                                View Live Entity
                                            </a>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
