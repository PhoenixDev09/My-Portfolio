'use client';

import React from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import StandardLayout from './layouts/StandardLayout';
import BentoLayout from './layouts/BentoLayout';
import TerminalLayout from './layouts/TerminalLayout';
import EditorialLayout from './layouts/EditorialLayout';
import CinematicLayout from './layouts/CinematicLayout';
import ManifestoLayout from './layouts/ManifestoLayout';

interface LayoutCompilerProps {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function LayoutCompiler({ theme, content, core }: LayoutCompilerProps) {
    const arch = theme.layoutSchema.pageArchitecture || 'standard';

    switch (arch) {
        case 'bento-grid':
            return <BentoLayout theme={theme} content={content} core={core} />;
        case 'terminal':
            return <TerminalLayout theme={theme} content={content} core={core} />;
        case 'editorial':
            return <EditorialLayout theme={theme} content={content} core={core} />;
        case 'cinematic':
            return <CinematicLayout theme={theme} content={content} core={core} />;
        case 'manifesto':
            return <ManifestoLayout theme={theme} content={content} core={core} />;
        case 'standard':
        default:
            return <StandardLayout theme={theme} content={content} core={core} />;
    }
}
