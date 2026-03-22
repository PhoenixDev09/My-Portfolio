'use client';

import React, { useState } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function AboutSection({ theme, content, core }: Props) {
    const style = theme.layoutSchema.sectionStyle;
    const [activeSkill, setActiveSkill] = useState<string | null>(null);

    const handleSkillClick = (skill: string) => {
        const newSkill = activeSkill === skill ? null : skill;
        setActiveSkill(newSkill);
        // Dispatch event for ProjectsSection to listen to
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sym_skill_filter', { detail: newSkill }));
        }
    };

    return (
        <section
            className={`about about--${style}`}
            id="about"
            aria-label="About"
            data-section="about"
            data-track="about-section"
        >
            <div className="section-inner">
                <div className="section-label">
                    <span className="section-label__line" />
                    <span className="section-label__text">About</span>
                </div>

                <h2 className="section-title">{content.aboutTitle}</h2>

                <div className="about__body">
                    <div className="about__text-col">
                        <p className="about__text">{content.aboutBody}</p>

                        <div className="about__meta">
                            <div className="about__meta-item">
                                <span className="about__meta-label">Location</span>
                                <span className="about__meta-value">{core.contact.location}</span>
                            </div>
                            <div className="about__meta-item">
                                <span className="about__meta-label">Experience</span>
                                <span className="about__meta-value">{core.yearsOfExperience} Years</span>
                            </div>
                            <div className="about__meta-item">
                                <span className="about__meta-label">Education</span>
                                <span className="about__meta-value">B.Tech, Computer Science — Ramachandra College of Engineering (2023)</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Metaphor Sidebar — symbolic reasoning woven into About content ── */}
                    <aside className="about__metaphor-sidebar" aria-label="Symbolic theme context">
                        <div className="metaphor-sidebar__icon-row">
                            <IconRenderer name="user" themeSet={theme.iconSet} width={32} height={32} />
                        </div>
                        <h4 className="metaphor-sidebar__title">{theme.themeName}</h4>
                        <p className="metaphor-sidebar__philosophy">&ldquo;{theme.philosophy}&rdquo;</p>
                        <div className="metaphor-sidebar__divider" />
                        <p className="metaphor-sidebar__reasoning">{theme.symbolicReasoning}</p>
                        <div className="metaphor-sidebar__palette">
                            {Object.entries(theme.colorPalette).slice(0, 5).map(([key, val]) => (
                                <span
                                    key={key}
                                    className="metaphor-sidebar__swatch"
                                    style={{ backgroundColor: val }}
                                    title={`${key}: ${val}`}
                                />
                            ))}
                        </div>
                    </aside>
                </div>

                <div className="skills-grid">
                    {core.skills.map((skill) => (
                        <button 
                            key={skill} 
                            className={`skill-pill ${activeSkill === skill ? 'skill-pill--active' : ''}`} 
                            data-track={`skill-filter-${skill}`}
                            onClick={() => handleSkillClick(skill)}
                            title="Click to locate projects using this skill"
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
