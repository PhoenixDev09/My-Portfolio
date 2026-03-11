import React from 'react';
import { ShapeLanguage } from '@/lib/types';

interface ShapeDecorationsProps {
    shape: ShapeLanguage;
    color: string;
}

/**
 * Renders extremely subtle SVG atmosphere decorations in the document background.
 * These MUST stay behind all content (z-index: -1). They are texture, not foreground.
 */
export function ShapeDecorations({ shape, color }: ShapeDecorationsProps) {
    if (shape === 'none' || shape === 'ornate-borders') return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,           // always behind everything
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
            aria-hidden="true"
        >
            {shape === 'organic-curves' && (
                <>
                    {/* Soft leaf silhouettes — barely visible texture */}
                    <svg
                        style={{ position: 'absolute', top: '8%', left: '3%', width: 80, height: 80, opacity: 0.05 }}
                        fill={color} viewBox="0 0 24 24"
                    >
                        <path d="M12 2S4 4 4 10c0 7 8 12 8 12s8-5 8-12C20 4 12 2 12 2z" />
                    </svg>
                    <svg
                        style={{ position: 'absolute', bottom: '15%', right: '5%', width: 120, height: 120, opacity: 0.03 }}
                        fill={color} viewBox="0 0 24 24"
                    >
                        <path d="M12 2S4 4 4 10c0 7 8 12 8 12s8-5 8-12C20 4 12 2 12 2z" />
                    </svg>
                </>
            )}

            {shape === 'sharp-cuts' && (
                <>
                    {/* Geometric prisms — minimal stroke only */}
                    <svg
                        style={{ position: 'absolute', top: '15%', right: '4%', width: 90, height: 90, opacity: 0.05 }}
                        fill="none" stroke={color} strokeWidth="0.5" viewBox="0 0 24 24"
                    >
                        <polygon points="12 2 22 17 2 17" />
                    </svg>
                    <svg
                        style={{ position: 'absolute', bottom: '12%', left: '6%', width: 140, height: 140, opacity: 0.03 }}
                        fill="none" stroke={color} strokeWidth="0.5" viewBox="0 0 24 24"
                    >
                        <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" />
                    </svg>
                </>
            )}

            {shape === 'soundwaves' && (
                <>
                    {/* Musical note — very faint, top-right corner only */}
                    <svg
                        style={{ position: 'absolute', top: '10%', right: '3%', width: 60, height: 60, opacity: 0.06 }}
                        fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24"
                    >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                </>
            )}
        </div>
    );
}
