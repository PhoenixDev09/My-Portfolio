'use client';

import React, { useState } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function ExperienceSection({ theme, content, core }: Props) {
    const [openId, setOpenId] = useState<string | null>(
        core.experiences?.[0]?.id ?? null
    );

    if (!core.experiences || core.experiences.length === 0) return null;

    return (
        <section
            className="experience"
            id="experience"
            aria-label="Work Experience"
            data-section="experience"
            data-track="experience-section"
        >
            <div className="section-inner">
                <div className="section-label">
                    <span className="section-label__line" />
                    <span className="section-label__text">Experience</span>
                </div>

                <h2 className="section-title">
                    {content.experienceTitle || 'Work Experience'}
                </h2>

                <div className="exp-list">
                    {core.experiences.map((exp) => {
                        const isOpen = openId === exp.id;
                        return (
                            <div
                                key={exp.id}
                                className={`exp-card ${isOpen ? 'exp-card--open' : ''}`}
                            >
                                <button
                                    className="exp-card__header"
                                    onClick={() => setOpenId(isOpen ? null : exp.id)}
                                    aria-expanded={isOpen}
                                    data-track={`exp-toggle-${exp.id}`}
                                >
                                    <div className="exp-card__meta">
                                        <span className="exp-card__role">{exp.role}</span>
                                        <span className="exp-card__company">
                                            {exp.company}
                                            <span className="exp-card__location"> · {exp.location}</span>
                                        </span>
                                    </div>
                                    <div className="exp-card__right">
                                        <span className="exp-card__period">{exp.period}</span>
                                        <span className="exp-card__chevron" aria-hidden="true">
                                            {isOpen ? '−' : '+'}
                                        </span>
                                    </div>
                                </button>

                                {isOpen && (
                                    <ul className="exp-card__bullets">
                                        {exp.bullets.map((bullet, i) => (
                                            <li key={i} className="exp-card__bullet">
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
