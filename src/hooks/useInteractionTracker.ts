'use client';

import { useEffect, useRef, useCallback } from 'react';
import { InteractionEvent } from '@/lib/types';

export function useInteractionTracker(sessionId: string | null, themeHistoryId: string | null) {
    const startTime = useRef<number>(Date.now());
    const maxScroll = useRef<number>(0);
    const clickCount = useRef<number>(0);
    const eventQueue = useRef<InteractionEvent[]>([]);
    const flushTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
            eventType: InteractionEvent['eventType'],
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

    // Expose queueEvent so sections can fire section_view events
    const trackSectionView = useCallback(
        (sectionId: string) => {
            queueEvent('section_view', 1, { sectionId }, sectionId);
        },
        [queueEvent]
    );

    useEffect(() => {
        if (!sessionId) return;

        // Track scroll depth
        const handleScroll = () => {
            const scrolled =
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrolled > maxScroll.current) {
                maxScroll.current = scrolled;
                queueEvent('scroll', Math.round(scrolled));
            }
        };

        // Track clicks on tracked elements — carry sectionId from nearest section
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const tracked = target.closest('[data-track]');
            if (tracked) {
                const section = target.closest('[data-section]');
                const sectionId = section?.getAttribute('data-section') ?? undefined;
                clickCount.current += 1;
                queueEvent('click', clickCount.current, {
                    element: tracked.getAttribute('data-track') || 'unknown',
                }, sectionId);
            }
        };

        // Flush on page hide
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const timeSpent = (Date.now() - startTime.current) / 1000;
                queueEvent('time', Math.round(timeSpent));
                flush();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleClick);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Auto-flush every 30 seconds
        flushTimer.current = setInterval(flush, 30000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (flushTimer.current) clearInterval(flushTimer.current);
        };
    }, [sessionId, queueEvent, flush]);

    return { trackSectionView };
}
