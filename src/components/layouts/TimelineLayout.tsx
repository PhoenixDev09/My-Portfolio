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

export default function TimelineLayout({ theme, content, core }: Props) {
    return (
        <div className={`layout-timeline theme-transition`}>
            {/* The central spine */}
            <div className="timeline-spine"></div>

            <div className="timeline-node timeline-hero">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                    <HeroSection theme={theme} content={content} core={core} />
                </div>
            </div>

            <div className="timeline-node timeline-about">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                    <AboutSection theme={theme} content={content} core={core} />
                </div>
            </div>

            <div className="timeline-node timeline-projects">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                    <ProjectsSection theme={theme} content={content} core={core} />
                </div>
            </div>

            <div className="timeline-node timeline-contact">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                    <ContactSection theme={theme} content={content} core={core} />
                    <FooterSection theme={theme} content={content} core={core} />
                </div>
            </div>

            {/* Injected CSS strictly for Timeline */}
            <style dangerouslySetInnerHTML={{ __html: `
                .layout-timeline {
                    position: relative;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 4rem 2rem;
                }
                .timeline-spine {
                    position: absolute;
                    top: 0; bottom: 0;
                    left: 2rem;
                    width: 2px;
                    background: var(--border-color);
                    z-index: 0;
                }
                .timeline-node {
                    position: relative;
                    padding-left: 4rem;
                    margin-bottom: 6rem;
                    z-index: 1;
                }
                .timeline-marker {
                    position: absolute;
                    left: 1.6rem; /* 2rem spine minus half marker */
                    top: 4rem;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--bg-color);
                    border: 2px solid var(--color-primary);
                    box-shadow: 0 0 10px rgba(88, 166, 255, 0.5);
                    transition: all 0.3s ease;
                }
                .timeline-node:hover .timeline-marker {
                    background: var(--color-primary);
                    transform: scale(1.3);
                }
                .timeline-content {
                    background: rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 2rem;
                }
                /* Hide default section padding inside timeline */
                .timeline-content section {
                    padding: 0 !important;
                    min-height: auto !important;
                }
                
                @media (max-width: 768px) {
                    .timeline-spine { left: 1rem; }
                    .timeline-marker { left: 0.6rem; }
                    .timeline-node { padding-left: 2rem; margin-bottom: 3rem; }
                    .timeline-content { padding: 1rem; }
                }
            `}} />
        </div>
    );
}
