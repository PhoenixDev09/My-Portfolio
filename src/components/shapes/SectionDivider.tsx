import React from 'react';
import { ShapeLanguage } from '@/lib/types';

interface SectionDividerProps {
    shape: ShapeLanguage;
    fillColor: string;
    className?: string;
    position?: 'top' | 'bottom';
}

export function SectionDivider({ shape, fillColor, className = '', position = 'bottom' }: SectionDividerProps) {
    if (shape === 'none') return null;

    const baseClasses = `absolute left-0 w-full overflow-hidden leading-none z-10 ${position === 'top' ? 'top-0 rotate-180' : 'bottom-0'
        } ${className}`;

    // SVG Height standard is 100px width 1200px (standard viewport mapping)
    switch (shape) {
        case 'organic-curves':
            return (
                <div className={baseClasses}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="relative block w-full h-[60px] md:h-[120px]"
                    >
                        <path
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,124.71,130.4,188,114.6c59.8-15,113.8-39.2,171.6-56.1z"
                            fill={fillColor}
                        />
                    </svg>
                </div>
            );

        case 'sharp-cuts':
            return (
                <div className={baseClasses}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="relative block w-full h-[40px] md:h-[80px]"
                    >
                        <path d="M1200 120L0 12V120z" fill={fillColor} />
                    </svg>
                </div>
            );

        case 'soundwaves':
            return (
                <div className={baseClasses}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="relative block w-full h-[50px] md:h-[100px] opacity-80"
                    >
                        {/* A series of vertical bars evoking audio amplitudes */}
                        <path d="M0 120v-20h20v20z" fill={fillColor} />
                        <path d="M40 120V80h20v40z" fill={fillColor} />
                        <path d="M80 120V30h20v90z" fill={fillColor} />
                        <path d="M120 120v-50h20v50z" fill={fillColor} />
                        <path d="M160 120v-80h20v80z" fill={fillColor} />
                        <path d="M200 120V10h20v110z" fill={fillColor} />
                        <path d="M240 120v-40h20v40z" fill={fillColor} />
                        <path d="M280 120v-90h20v90z" fill={fillColor} />
                        <path d="M320 120V40h20v80z" fill={fillColor} />
                        <path d="M360 120V20h20v100z" fill={fillColor} />
                        <path d="M400 120v-60h20v60z" fill={fillColor} />
                        <path d="M440 120V50h20v70z" fill={fillColor} />
                        <path d="M480 120v-80h20v80z" fill={fillColor} />
                        <path d="M520 120V10h20v110z" fill={fillColor} />
                        <path d="M560 120v-40h20v40z" fill={fillColor} />
                        <path d="M600 120V60h20v60z" fill={fillColor} />
                        <path d="M640 120V30h20v90z" fill={fillColor} />
                        <path d="M680 120v-50h20v50z" fill={fillColor} />
                        <path d="M720 120v-80h20v80z" fill={fillColor} />
                        <path d="M760 120v-20h20v20z" fill={fillColor} />
                        <path d="M800 120V70h20v50z" fill={fillColor} />
                        <path d="M840 120v-90h20v90z" fill={fillColor} />
                        <path d="M880 120V40h20v80z" fill={fillColor} />
                        <path d="M920 120V10h20v110z" fill={fillColor} />
                        <path d="M960 120v-60h20v60z" fill={fillColor} />
                        <path d="M1000 120V30h20v90z" fill={fillColor} />
                        <path d="M1040 120v-80h20v80z" fill={fillColor} />
                        <path d="M1080 120V50h20v70z" fill={fillColor} />
                        <path d="M1120 120v-20h20v20z" fill={fillColor} />
                        <path d="M1160 120V90h20v30z" fill={fillColor} />
                        <path d="M1200 120v-40h20v40z" fill={fillColor} />
                    </svg>
                </div>
            );

        case 'ornate-borders':
            return (
                <div className={baseClasses}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="xMidYMax meet"
                        className="relative block w-full h-[60px]"
                    >
                        {/* Symmetrical repeating archaic border */}
                        <defs>
                            <pattern id="ornate" x="0" y="0" width="100" height="120" patternUnits="userSpaceOnUse">
                                <path d="M50 120 L0 70 L50 20 L100 70 Z" fill="none" stroke={fillColor} strokeWidth="4" />
                                <circle cx="50" cy="70" r="10" fill={fillColor} />
                                <path d="M0 120 L100 120" stroke={fillColor} strokeWidth="8" />
                                <path d="M50 20 L50 0" stroke={fillColor} strokeWidth="2" />
                            </pattern>
                        </defs>
                        <rect width="1200" height="120" fill="url(#ornate)" />
                    </svg>
                </div>
            );
        default:
            return null;
    }
}
