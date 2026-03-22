'use client';
import React from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function FooterSection({ theme, content, core }: Props) {
    return (
        <footer className="footer" aria-label="Footer">
            <div className="footer__inner">
                <p className="footer__tagline">{content.footerTagline}</p>
                <div className="footer__meta">
                    <span className="footer__name">{core.name}</span>
                    <span className="footer__sep">·</span>
                    <span className="footer__theme">
                        Theme: <em>{theme.themeName}</em>
                    </span>
                    <span className="footer__sep">·</span>
                    <span className="footer__year">{new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    );
}
