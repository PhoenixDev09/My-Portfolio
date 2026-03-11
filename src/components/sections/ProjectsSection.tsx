'use client';

import React from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function ProjectsSection({ theme, content, core }: Props) {
    const gridStyle = theme.layoutSchema.gridStyle;

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
                    {core.projects.map((project, idx) => (
                        <article
                            key={project.id}
                            className="project-card"
                            style={{ '--card-index': idx } as React.CSSProperties}
                            data-track={`project-${project.id}`}
                        >
                            <div className="project-card__header">
                                <span className="project-card__year">{project.year}</span>
                                {/* ── Theme icon replaces the generic diamond ◆ ── */}
                                <span className="project-card__icon" aria-hidden="true">
                                    <IconRenderer name="code" themeSet={theme.iconSet} width={20} height={20} />
                                </span>
                            </div>

                            <h3 className="project-card__name">{project.name}</h3>

                            <p className="project-card__desc">
                                {content.projectDescriptions[project.id] || project.description}
                            </p>

                            {project.metrics && (
                                <div className="project-card__metrics">
                                    <IconRenderer name="globe" themeSet={theme.iconSet} width={16} height={16} />
                                    {project.metrics}
                                </div>
                            )}

                            <div className="project-card__tech">
                                {project.technologies.map((tech) => (
                                    <span key={tech} className="tech-tag">
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
                                    View Project
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
