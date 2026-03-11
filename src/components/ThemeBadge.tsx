'use client';

import { Theme } from '@/lib/types';
import { useState } from 'react';

interface Props {
    theme: Theme;
    visitNumber: number;
}

export default function ThemeBadge({ theme, visitNumber }: Props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`theme-badge ${expanded ? 'theme-badge--expanded' : ''}`}
            role="complementary"
            aria-label="Current theme information"
        >
            <button
                className="theme-badge__trigger"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                data-track="theme-badge"
            >
                <span className="theme-badge__dot" />
                <span className="theme-badge__name">
                    {visitNumber > 1 ? `Visit ${visitNumber} · ` : ''}{theme.themeName}
                </span>
                <span className="theme-badge__arrow">{expanded ? '↑' : '↓'}</span>
            </button>

            {expanded && (
                <div className="theme-badge__panel" role="tooltip">
                    <h4 className="theme-badge__subtitle">Symbolic Reasoning</h4>
                    <p className="theme-badge__reasoning">{theme.symbolicReasoning}</p>
                    <div className="theme-badge__divider" />
                    <p className="theme-badge__philosophy">
                        <em>&ldquo;{theme.philosophy}&rdquo;</em>
                    </p>
                    <div className="theme-badge__colors">
                        {Object.entries(theme.colorPalette).slice(0, 5).map(([key, val]) => (
                            <span
                                key={key}
                                className="theme-badge__swatch"
                                style={{ backgroundColor: val }}
                                title={`${key}: ${val}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
