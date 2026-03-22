'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface RichInteractionEvent {
    sessionId: string;
    themeHistoryId?: string;
    sectionId?: string;
    eventType:
        | 'scroll'
        | 'click'
        | 'time'
        | 'section_view'
        | 'section_dwell'
        | 'scroll_velocity'
        | 'active_time'
        | 'text_selection'
        | 'cta_hover';
    value: number;
    metadata?: Record<string, unknown>;
}

export function useInteractionTracker(sessionId: string | null, themeHistoryId: string | null) {
    const activeTimeStart = useRef<number>(Date.now());
    const accumulatedActiveMs = useRef<number>(0);
    const maxScroll = useRef<number>(0);
    const clickCount = useRef<number>(0);
    const eventQueue = useRef<RichInteractionEvent[]>([]);
    const flushTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Scroll velocity tracking
    const lastScrollY = useRef<number>(0);
    const lastScrollTime = useRef<number>(Date.now());
    const scrollSamples = useRef<number[]>([]);

    const flush = useCallback(async () => {
        if (!sessionId || eventQueue.current.length === 0) return;
        const events = [...eventQueue.current];
        eventQueue.current = [];
        try {
            await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(events),
            });
        } catch {
            // silently fail — tracking should never break the UX
        }
    }, [sessionId]);

    const queueEvent = useCallback(
        (
            eventType: RichInteractionEvent['eventType'],
            value: number,
            metadata?: Record<string, unknown>,
            sectionId?: string
        ) => {
            if (!sessionId) return;
            eventQueue.current.push({
                sessionId,
                themeHistoryId: themeHistoryId ?? undefined,
                sectionId,
                eventType,
                value,
                metadata,
            });
        },
        [sessionId, themeHistoryId]
    );

    const trackSectionView = useCallback(
        (sectionId: string) => {
            queueEvent('section_view', 1, { sectionId }, sectionId);
        },
        [queueEvent]
    );

    useEffect(() => {
        if (!sessionId) return;

        // ── Active Time Tracking (via visibilitychange) ──────────────────────
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Bank active time
                accumulatedActiveMs.current += Date.now() - activeTimeStart.current;
                queueEvent('active_time', Math.round(accumulatedActiveMs.current / 1000));

                // FE-03: Flush all open section dwell timers so we capture the last section
                // the user was reading when they closed the tab (critical for 'contact' dwell → investigator)
                sectionDwellTimers.forEach((startTime, sectionId) => {
                    const dwell = Math.round((Date.now() - startTime) / 1000);
                    if (dwell > 1) {
                        queueEvent('section_dwell', dwell, { sectionId }, sectionId);
                    }
                });

                flush();
            } else {
                // Page became visible again — reset the timer
                activeTimeStart.current = Date.now();
            }
        };

        // ── Scroll Velocity Tracking ─────────────────────────────────────────
        const handleScroll = () => {
            const now = Date.now();
            const scrollY = window.scrollY;
            const maxScrollHeight = document.body.scrollHeight - window.innerHeight;
            const depth = maxScrollHeight > 0
                ? Math.min(100, Math.round((scrollY / maxScrollHeight) * 100))
                : 100;

            if (depth > maxScroll.current) {
                maxScroll.current = depth;
                queueEvent('scroll', Math.round(depth));
            }

            // Compute instantaneous velocity (px/second)
            const deltaY = Math.abs(scrollY - lastScrollY.current);
            const deltaT = now - lastScrollTime.current;
            if (deltaT > 0) {
                const velocity = Math.round((deltaY / deltaT) * 1000); // px/second
                scrollSamples.current.push(velocity);
            }
            lastScrollY.current = scrollY;
            lastScrollTime.current = now;
        };

        // Flush scroll velocity as a median every 5 seconds
        const velocityFlushInterval = setInterval(() => {
            if (scrollSamples.current.length > 0) {
                const sorted = [...scrollSamples.current].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                queueEvent('scroll_velocity', median);
                scrollSamples.current = [];
            }
        }, 5000);

        // ── Click Tracking ────────────────────────────────────────────────────
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const tracked = target.closest('[data-track]');
            if (tracked) {
                const section = target.closest('[data-section]');
                const sectionId = section?.getAttribute('data-section') ?? undefined;
                const elementId = tracked.getAttribute('data-track') || 'unknown';
                clickCount.current += 1;
                queueEvent('click', clickCount.current, { element: elementId }, sectionId);

                fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        themeHistoryId: themeHistoryId ?? undefined,
                        eventType: elementId.includes('cta') ? 'cta_click' : 'element_click',
                        sectionId,
                        elementId,
                    }),
                }).catch(() => {});
            }
        };

        // ── Text Selection Tracking ──────────────────────────────────────────
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 10) {
                queueEvent('text_selection', 1, { text: selection.toString().slice(0, 50) });
            }
        };

        // ── CTA Hover Duration Tracking ──────────────────────────────────────
        let ctaHoverStart = 0;
        const handleCTAMouseEnter = (e: Event) => {
            const el = e.target as HTMLElement;
            // Guard: SVGs, text nodes, and shadow DOM elements don't have .matches()
            if (!el || typeof el.matches !== 'function') return;
            if (el.matches('[data-track*="cta"], .btn-primary, .cin-hero__actions a')) {
                ctaHoverStart = Date.now();
            }
        };
        const handleCTAMouseLeave = (e: Event) => {
            const el = e.target as HTMLElement;
            // Guard: same protection as mouseenter
            if (!el || typeof el.matches !== 'function') return;
            if (ctaHoverStart && el.matches('[data-track*="cta"], .btn-primary, .cin-hero__actions a')) {
                const duration = Math.round((Date.now() - ctaHoverStart) / 1000);
                if (duration > 0) queueEvent('cta_hover', duration);
                ctaHoverStart = 0;
            }
        };

        // ── Section Dwell (IntersectionObserver) ─────────────────────────────
        const sectionDwellTimers = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const sectionId = (entry.target as HTMLElement).dataset.section;
                    if (!sectionId) continue;
                    if (entry.isIntersecting) {
                        sectionDwellTimers.set(sectionId, Date.now());
                    } else {
                        const startTime = sectionDwellTimers.get(sectionId);
                        if (startTime) {
                            const dwell = Math.round((Date.now() - startTime) / 1000);
                            if (dwell > 1) {
                                queueEvent('section_dwell', dwell, { sectionId }, sectionId);
                            }
                            sectionDwellTimers.delete(sectionId);
                        }
                    }
                }
            },
            { threshold: 0.4 } // 40% of section must be visible to count
        );

        // Observe all sections with data-section attribute
        const sections = document.querySelectorAll('[data-section]');
        sections.forEach((s) => observer.observe(s));

        // ── Register All Listeners ────────────────────────────────────────────
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleClick);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mouseenter', handleCTAMouseEnter, true);
        document.addEventListener('mouseleave', handleCTAMouseLeave, true);

        // Auto-flush every 30 seconds
        flushTimer.current = setInterval(flush, 30000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mouseenter', handleCTAMouseEnter, true);
            document.removeEventListener('mouseleave', handleCTAMouseLeave, true);
            clearInterval(velocityFlushInterval);
            if (flushTimer.current) clearInterval(flushTimer.current);
            observer.disconnect();
        };
    }, [sessionId, queueEvent, flush, themeHistoryId]);

    return { trackSectionView };
}
