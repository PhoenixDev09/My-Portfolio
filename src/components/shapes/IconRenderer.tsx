import React from 'react';
import { IconSet } from '@/lib/types';

export type IconName = 'code' | 'user' | 'mail' | 'link' | 'star' | 'globe';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    themeSet: IconSet;
}

export function IconRenderer({ name, themeSet, ...props }: IconProps) {
    const defaultProps = {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        ...props
    };

    // --- Minimal Set (Default / Clean Tech) ---
    if (themeSet === 'minimal') {
        switch (name) {
            case 'code':
                return <svg {...defaultProps}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
            case 'user':
                return <svg {...defaultProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
            case 'mail':
                return <svg {...defaultProps}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
            case 'link':
                return <svg {...defaultProps}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
            case 'star':
                return <svg {...defaultProps}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
            case 'globe':
                return <svg {...defaultProps}><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>;
        }
    }

    // --- Nature Set (Forest Trail / Coral Reef) ---
    if (themeSet === 'nature') {
        switch (name) {
            case 'code': // Branching vine
                return <svg {...defaultProps}><path d="M12 22s-8-4.5-8-12c0-3.3 2-6 5-8 1 3 3 5 8 5" /><path d="M5 10c3-2 7 1 11 0" /><path d="M16 10c3 0 5-2 6-4" /></svg>;
            case 'user': // Tree trunk / Root
                return <svg {...defaultProps}><path d="M12 22V8M12 8c-3-4-7-6-7-6s4 2 7 6m0 0c3-4 7-6 7-6s-4 2-7 6" /><path d="M8 22c-2-3-4-4-6-4" /><path d="M16 22c2-3 4-4 6-4" /></svg>;
            case 'mail': // Leaf / Seed
                return <svg {...defaultProps}><path d="M12 22s8-5 8-12C20 4 12 2 12 2S4 4 4 10c0 7 8 12 8 12z" /><path d="M12 22V2" /></svg>;
            case 'link': // Vines intertwining
                return <svg {...defaultProps}><path d="M8 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" /><path d="M16 12c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z" /><path d="M9.5 7.5L14.5 16.5" /></svg>;
            case 'star': // Flower bloom
                return <svg {...defaultProps}><circle cx="12" cy="12" r="2" /><path d="M12 10C8 6 2 2 2 2s6 8 8 10M12 10c4-4 10-8 10-8s-6 8-8 10M14 12c4 4 8 10 8 10s-8-6-10-8M10 14c-4 4-10 8-10 8s6-8 8-10M12 10V2M14 12h8M12 14v8M10 12H2" /></svg>;
            case 'globe': // Earth topology
                return <svg {...defaultProps}><circle cx="12" cy="12" r="10" /><path d="M12 2c-3.3 5-3.3 15 0 20" /><path d="M12 2c3.3 5 3.3 15 0 20" /><path d="M2 12c5 3.3 15 3.3 20 0" /></svg>;
        }
    }

    // --- Mechanical Set (Clockwork / Space) ---
    if (themeSet === 'mechanical') {
        switch (name) {
            case 'code': // Circuit paths
                return <svg {...defaultProps}><path d="M4 12h4l2-4h4l2 4h4" /><circle cx="4" cy="12" r="2" /><circle cx="20" cy="12" r="2" /><path d="M12 8v-4" /><circle cx="12" cy="2" r="2" /></svg>;
            case 'user': // Hexagon avatar
                return <svg {...defaultProps}><polygon points="12 2 2 7 2 17 12 22 22 17 22 7" /><circle cx="12" cy="10" r="3" /><path d="M6 18l3-3h6l3 3" /></svg>;
            case 'mail': // Datapad
                return <svg {...defaultProps}><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M8 6h8M8 10h8M8 14h4" /><circle cx="16" cy="18" r="1" /></svg>;
            case 'link': // Interlocking gears / chains
                return <svg {...defaultProps}><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /><path d="M4 12h-2M20 12h2M8 8V6M8 18v2M16 8V6M16 18v2" /></svg>;
            case 'star': // Gear / cog
                return <svg {...defaultProps}><circle cx="12" cy="12" r="4" /><path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83M19.07 19.07l-2.83-2.83M7.76 7.76 4.93 4.93" /></svg>;
            case 'globe': // Wireframe sphere
                return <svg {...defaultProps}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2v20" /><path d="M12 2a10 10 0 0 1 5 10 10 10 0 0 1-5 10" /><path d="M12 2a10 10 0 0 0-5 10 10 10 0 0 0 5 10" /></svg>;
        }
    }

    // --- Musical Set (Orchestra / Symphony) ---
    if (themeSet === 'musical') {
        switch (name) {
            case 'code': // Double barline / Sheet music syntax
                return <svg {...defaultProps}><path d="M4 6h16M4 10h16M4 14h16M4 18h16M4 6v12M20 6v12M16 6v12" /></svg>;
            case 'user': // Conductor / Soloist silhouette abstraction
                return <svg {...defaultProps}><path d="M12 14c-4 0-7 2-7 6v2h14v-2c0-4-3-6-7-6zM12 12a4 4 0 100-8 4 4 0 000 8z" /><path d="M19 8l-4 4" /></svg>;
            case 'mail': // Folded sheet music / envelope
                return <svg {...defaultProps}><path d="M4 4h16v16H4zM4 8h16M4 12h16M4 16h16" /><path d="M4 4l8 8 8-8" /></svg>;
            case 'link': // Slur / Tie mark
                return <svg {...defaultProps}><path d="M4 14c4-6 12-6 16 0" /><circle cx="4" cy="14" r="1" /><circle cx="20" cy="14" r="1" /></svg>;
            case 'star': // Treble clef or accent mark
                return <svg {...defaultProps}><path d="M15 8a4 4 0 10-4-4v16a3 3 0 11-3-3l3-3" /><path d="M8 12h8" /></svg>;
            case 'globe': // Soundwave radiating globally
                return <svg {...defaultProps}><path d="M12 4v16M8 8v8M16 8v8M4 10v4M20 10v4" /></svg>;
        }
    }

    // --- Celestial Set (Observatory / Cosmos) ---
    if (themeSet === 'celestial') {
        switch (name) {
            case 'code': // Constellation array
                return <svg {...defaultProps}><circle cx="4" cy="4" r="1" /><circle cx="20" cy="4" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="6" cy="20" r="1" /><circle cx="18" cy="18" r="1" /><path d="M4 4l8 8 8-8M12 12l-6 8M12 12l6 6" /></svg>;
            case 'user': // Orbiting body
                return <svg {...defaultProps}><circle cx="12" cy="12" r="4" /><path d="M12 2a10 10 0 1 1 0 20M12 2A10 10 0 1 0 12 22" /><circle cx="2" cy="12" r="1.5" fill="currentColor" /></svg>;
            case 'mail': // Satellite dish / transmission
                return <svg {...defaultProps}><path d="M4 22h16M12 22v-4M12 18a8 8 0 0 0-8-8M8 18a4 4 0 0 0-4-4M12 6V2M8 4l2 2M16 4l-2 2" /></svg>;
            case 'link': // Gravity well / orbital pull
                return <svg {...defaultProps}><circle cx="12" cy="12" r="2" /><path d="M22 12a10 10 0 00-10-10C6.5 2 2 6.5 2 12s4.5 10 10 10" /><path d="M22 12h-4" /></svg>;
            case 'star': // Supernova / Sparkle
                return <svg {...defaultProps}><path d="M12 2L14 10l8 2-8 2-2 8-2-8-8-2 8-2z" /></svg>;
            case 'globe': // Saturn / Planetary body
                return <svg {...defaultProps}><circle cx="12" cy="12" r="6" /><path d="M22 10a14.3 14.3 0 0 0-20 4 14.3 14.3 0 0 0 20-4z" /></svg>;
        }
    }

    // --- Archaic Set (Temple / Mystic) ---
    if (themeSet === 'archaic') {
        switch (name) {
            case 'code': // Runes / Obelisk inscriptions
                return <svg {...defaultProps}><path d="M8 4v16M16 4v16M8 8l8 8M16 8l-8 8" /></svg>;
            case 'user': // Eye / Hieroglyph avatar
                return <svg {...defaultProps}><path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="3" /></svg>;
            case 'mail': // Scroll / Tablet
                return <svg {...defaultProps}><path d="M4 6s-2-2-2-4h18c0 2-2 4-2 4M4 6v12M20 6v12M4 18s-2 2-2 4h18c0-2-2-4-2-4" /><path d="M8 10h8M8 14h8" /></svg>;
            case 'link': // Infinite knot / ouroboros
                return <svg {...defaultProps}><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M8 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /></svg>;
            case 'star': // Compass rose / mystic star
                return <svg {...defaultProps}><path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" /><path d="M6 6l5 5M18 6l-5 5M6 18l5-5M18 18l-5-5" /></svg>;
            case 'globe': // Astrolabe
                return <svg {...defaultProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19 5l-2.8 2.8M7.8 16.2L5 19M19 19l-2.8-2.8M7.8 7.8L5 5" /></svg>;
        }
    }

    // Fallback: minimal set if unknown
    return <IconRenderer name={name} themeSet="minimal" {...props} />;
}
