import React, { useState, useEffect, useRef } from 'react';
import { ThemeResponse } from '@/lib/types';

interface EngineConsoleProps {
    currentTheme: ThemeResponse['theme'];
    isRefetching: boolean;
    onShiftLens: () => void;
    orbReasoning?: string;
    archetype?: string;
}

export function EngineConsole({ currentTheme, isRefetching, onShiftLens, orbReasoning, archetype }: EngineConsoleProps) {
    const [scrollDepth, setScrollDepth] = useState(0);
    const [clicks, setClicks] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    
    const [isReady, setIsReady] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [yPos, setYPos] = useState(-1000); 
    const [isMobile, setIsMobile] = useState(() =>
        // FE-01: Read synchronously at render time to avoid flash of desktop positioning on mobile
        typeof window !== 'undefined' ? window.innerWidth <= 768 : false
    );

    // Exponential Backoff Prompting State (45s+ engagement prompts)
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');
    const promptCount = useRef(0);
    // Thresholds: first at 45s, then exponential backoff (120s, 300s)
    const nextPromptAt = useRef(45);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);

    // Early Reject Prompt — shown at 5s to give immediate escape if user dislikes the theme
    const [showEarlyReject, setShowEarlyReject] = useState(false);
    const earlyRejectDismissed = useRef(false); // only show once per theme

    // ── Section-aware minimum reading time ─────────────────────────────────────
    // Based on avg. reading speed (~200 wpm) and typical section word counts:
    //   Hero (50 words)  → ~15s to absorb
    //   About (150 words) → ~45s to read
    //   Projects (300+ words) → ~90s across 3 cards
    //   Contact (30 words) → ~10s
    // We approximate: to have meaningfully seen content up to scroll depth D,
    // the user should have spent at least minTimeForDepth(D) seconds.
    const minTimeForDepth = (depth: number): number => {
        if (depth < 20) return 12;   // Still in hero — needs 12s minimum
        if (depth < 40) return 25;   // Entering About section
        if (depth < 60) return 45;   // Reading About fully / starting Projects
        if (depth < 80) return 65;   // Reading through Projects
        return 80;                    // Full page — at least 80s for a meaningful read
    };

    useEffect(() => {
        // Detect mobile
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile, { passive: true });

        const startTime = Date.now();
        let latestDepth = 0;

        const checkReadiness = (depth: number, seconds: number) => {
            const minRequired = minTimeForDepth(depth);
            const hasMetMinimum = seconds >= minRequired && depth >= 25;

            if (hasMetMinimum) {
                setIsReady(true);
            }

            // Only show prompt if user has met the minimum comprehension threshold
            // AND the exponential backoff timer has elapsed
            if (hasMetMinimum && seconds >= nextPromptAt.current && promptCount.current < 3) {
                // Progressively more informative messages
                const messages = [
                    { heading: 'I notice how you read.', body: 'Ready to adapt the layout to fit your style.' },
                    { heading: 'Still watching you explore.', body: 'Each scroll refines my understanding of you.' },
                    { heading: 'One last offer.', body: 'Shift the entire experience to match your reading pattern.' },
                ];
                const msg = messages[promptCount.current] || messages[0];
                setPromptMessage(`${msg.heading}||${msg.body}`);
                setShowPrompt(true);
                promptCount.current += 1;

                // Exponential backoff: 45s → 120s → 300s
                if (promptCount.current === 1) nextPromptAt.current = 120;
                else if (promptCount.current === 2) nextPromptAt.current = 300;
                else nextPromptAt.current = 9999;

                if (hideTimeout.current) clearTimeout(hideTimeout.current);
                hideTimeout.current = setTimeout(() => setShowPrompt(false), 8000);
            }
        };

        const handleScroll = () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const depth = maxScroll > 0 ? Math.min(100, Math.round((window.scrollY / maxScroll) * 100)) : 100;
            latestDepth = depth;
            setScrollDepth(depth);
            if (window.innerWidth > 768) {
                setYPos(window.scrollY + (window.innerHeight / 2) - 25);
            } else {
                setYPos(0);
            }
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            setTimeSpent(seconds);
            checkReadiness(depth, seconds);
        };

        // Tick every 5 seconds so readiness fires even when user has stopped scrolling
        // (they may be reading without moving the scroll position)
        const ticker = setInterval(() => {
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            setTimeSpent(seconds);
            checkReadiness(latestDepth, seconds);
        }, 5000);

        const handleClick = () => setClicks(c => c + 1);

        // Early reject prompt: show at 5s, auto-dismiss if ignored (implicit acceptance)
        const earlyRejectTimer = setTimeout(() => {
            if (!earlyRejectDismissed.current) {
                setShowEarlyReject(true);
                // Auto-hide after 8s — ignoring = user is okay with the theme
                setTimeout(() => {
                    setShowEarlyReject(false);
                    earlyRejectDismissed.current = true;
                }, 8000);
            }
        }, 5000);

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('click', handleClick, { passive: true });
        setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('resize', checkMobile);
            clearInterval(ticker);
            clearTimeout(earlyRejectTimer);
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
        };
    }, [currentTheme.themeName]);

    useEffect(() => {
        setScrollDepth(0);
        setClicks(0);
        setTimeSpent(0);
        setIsReady(false);
        setShowPrompt(false);
        setPromptMessage('');
        setShowEarlyReject(false);
        earlyRejectDismissed.current = false;
        promptCount.current = 0;
        nextPromptAt.current = 45;
    }, [currentTheme.themeName]);

    const handleEarlyReject = () => {
        // User actively disliked this theme — dismiss prompt and morph immediately
        setShowEarlyReject(false);
        earlyRejectDismissed.current = true;
        onShiftLens();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEarlyRejectDismiss = () => {
        // User dismissed the prompt without acting — implicit acceptance
        setShowEarlyReject(false);
        earlyRejectDismissed.current = true;
    };
    const handleShift = () => {
        setExpanded(false);
        setIsReady(false);
        onShiftLens();
        // Since we aren't hard-reloading, manually scroll to top so they see the new Hero section
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Don't render until positioned (desktop) or always render on mobile (fixed)
    if (!isMobile && yPos === -1000) return null;

    // Position styles: fixed bottom-right on mobile, scroll-tracked on desktop
    const containerStyle: React.CSSProperties = isMobile
        ? { position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 10000 }
        : { position: 'absolute', top: `${yPos}px`, right: '2rem', zIndex: 10000, transition: 'top 0.1s linear' };

    return (
        <div 
            className="ai-orb-container"
            style={containerStyle}
        >
            {/* The Orb Trigger */}
            <div 
                className={`ai-orb ${isReady ? 'ai-orb--ready' : ''} ${isRefetching ? 'ai-orb--thinking' : ''}`} 
                onClick={() => setExpanded(!expanded)}
                title="AI Engine Companion"
                role="button"
                aria-expanded={expanded}
            >
                <div className="ai-orb-core"></div>
                <div className="ai-orb-ring-1"></div>
                <div className="ai-orb-ring-2"></div>
            </div>

            {/* ── Early Reject Prompt (5 seconds) ─────────────────────────────── */}
            {showEarlyReject && !expanded && !isRefetching && (
                <div
                    className="ai-orb-speech-bubble right-aligned"
                    style={isMobile ? {
                        position: 'fixed', bottom: '5rem', left: '1rem', right: '1rem',
                        transform: 'none', top: 'auto', width: 'auto', maxWidth: '100%',
                        borderBottomRightRadius: '4px',
                    } : {}}
                >
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                        Not feeling this theme?
                    </p>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#c9d1d9', lineHeight: 1.4 }}>
                        We can generate a new one right now.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="ai-orb-btn primary"
                            onClick={handleEarlyReject}
                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                        >
                            Try Another
                        </button>
                        <button
                            onClick={handleEarlyRejectDismiss}
                            style={{
                                background: 'none', border: '1px solid #444', color: '#888',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                                padding: '0.4rem 0.6rem', minHeight: '36px',
                            }}
                            title="Keep this theme"
                        >
                            Keep it
                        </button>
                    </div>
                </div>
            )}

            {/* ── Engagement Prompt (45s+ exponential backoff) ─────────────────── */}
            {showPrompt && !expanded && !isRefetching && promptMessage && (() => {
                const [heading, body] = promptMessage.split('||');
                const bubbleStyle: React.CSSProperties = isMobile
                    ? {
                        position: 'fixed',
                        bottom: '5rem',
                        left: '1rem',
                        right: '1rem',
                        transform: 'none',
                        top: 'auto',
                        width: 'auto',
                        maxWidth: '100%',
                        borderBottomRightRadius: '4px',
                        cursor: 'pointer',
                    }
                    : { cursor: 'pointer' };
                return (
                    <div
                        className="ai-orb-speech-bubble right-aligned"
                        onClick={() => setExpanded(true)}
                        style={bubbleStyle}
                    >
                        <p style={{ margin: '0 0 0.35rem 0', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{heading}</p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#c9d1d9' }}>{body}</p>
                    </div>
                );
            })()}

            {/* Loading Indicator during soft morph */}
            {isRefetching && (
                <div className="ai-orb-speech-bubble right-aligned">
                    <div className="ai-orb-synth">
                        <span className="spinner-small" /> 
                        <p>Morphing layout structure...</p>
                    </div>
                </div>
            )}

            {/* The Intelligence Panel (Expanded View) */}
            {expanded && !isRefetching && (() => {
                const panelStyle: React.CSSProperties = isMobile
                    ? {
                        position: 'fixed',
                        bottom: '5rem',
                        right: '1rem',
                        left: '1rem',
                        width: 'auto',
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        cursor: 'default',
                        transform: 'none',
                        top: 'auto',
                        // Solid background on mobile — transparent looks bad over content
                        background: 'rgba(10, 10, 10, 0.97)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                    }
                    : { minWidth: '320px', cursor: 'default' };
                return (
                    <div className="ai-orb-speech-bubble right-aligned ai-orb-intelligence-panel" style={panelStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)' }}>
                                Symbolic Intelligence
                            </span>
                            <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', minHeight: '44px', minWidth: '44px' }}>✕</button>
                        </div>
                        
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                            <div><strong style={{ color: '#fff' }}>{scrollDepth}%</strong><br/><span style={{ color: '#aaa', fontSize: '0.7rem' }}>Scrolled</span></div>
                            <div><strong style={{ color: '#fff' }}>{timeSpent}s</strong><br/><span style={{ color: '#aaa', fontSize: '0.7rem' }}>Read Time</span></div>
                            <div><strong style={{ color: '#fff' }}>{clicks}</strong><br/><span style={{ color: '#aaa', fontSize: '0.7rem' }}>Interactions</span></div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            {archetype && (
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)', marginBottom: '0.4rem' }}>
                                    Profile: {archetype.replace('-', ' ')}
                                </div>
                            )}
                            <h4 style={{ fontSize: '0.8rem', color: '#fff', margin: '0 0 0.5rem 0' }}>Why this view?</h4>
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                                {orbReasoning || currentTheme.symbolicReasoning || 'Analyzing your interaction vectors...'}
                            </p>
                        </div>

                        {isReady ? (
                            <div style={{ borderTop: '1px solid #333', paddingTop: '1rem' }}>
                                <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 500, color: '#fff' }}>
                                    I have learned your interaction style.
                                </p>
                                <button className="ai-orb-btn primary" onClick={handleShift} style={{ width: '100%', justifyContent: 'center' }}>
                                    Morph to My Style
                                </button>
                            </div>
                        ) : (
                            <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', opacity: 0.6 }}>
                                <p style={{ fontSize: '0.8rem', margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
                                    Gathering data to personalize your layout...
                                </p>
                                <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', marginTop: '0.5rem' }}>
                                    <div style={{ width: `${Math.min(100, Math.max(scrollDepth, (timeSpent/8)*100))}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
}
