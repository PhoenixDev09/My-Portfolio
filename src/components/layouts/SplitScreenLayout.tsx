'use client';

import React from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import ProjectsSection from '../sections/ProjectsSection';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function SplitScreenLayout({ theme, content, core }: Props) {
    return (
        <div className={`layout-split-screen theme-transition`}>
            <div className="split-left">
                <div className="split-left-inner">
                    <HeroSection theme={theme} content={content} core={core} />
                    <AboutSection theme={theme} content={content} core={core} />
                    <ContactSection theme={theme} content={content} core={core} />
                    <FooterSection theme={theme} content={content} core={core} />
                </div>
            </div>
            
            <div className="split-right">
                <div className="split-right-inner">
                    <ProjectsSection theme={theme} content={content} core={core} />
                </div>
            </div>

            {/* Injected CSS strictly for Split Screen */}
            <style dangerouslySetInnerHTML={{ __html: `
                .layout-split-screen {
                    display: flex;
                    min-height: 100vh;
                    width: 100%;
                }
                .split-left {
                    width: 45%;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    border-right: 1px solid var(--border-color);
                    overflow-y: auto;
                    background: var(--surface-color);
                }
                .split-left::-webkit-scrollbar { width: 4px; }
                .split-left::-webkit-scrollbar-thumb { background: var(--border-color); }
                
                .split-left-inner {
                    padding: 2rem 4rem;
                }
                
                .split-right {
                    width: 55%;
                    min-height: 100vh;
                    background: var(--bg-color);
                }
                .split-right-inner {
                    padding: 4rem;
                }

                /* Neutralize normal section minimums within split screen to allow natural flow */
                .split-left section, .split-right section {
                    min-height: auto !important;
                    padding: 2rem 0 !important; border-bottom: none !important;
                }
                
                @media (max-width: 1024px) {
                    .layout-split-screen { flex-direction: column; }
                    .split-left { width: 100%; height: auto; position: static; border-right: none; border-bottom: 2px solid var(--color-primary); }
                    .split-right { width: 100%; }
                    .split-left-inner, .split-right-inner { padding: 2rem; }
                }
            `}} />
        </div>
    );
}
