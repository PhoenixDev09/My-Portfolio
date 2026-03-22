'use client';
import React, { useState, useEffect } from 'react';


export function LayoutFeedback({ themeHistoryId }: { themeHistoryId: string | null }) {
    const [feedback, setFeedback] = useState<string | null>(null);

    // Reset feedback prompt every time a new theme is rendered
    useEffect(() => {
        setFeedback(null);
    }, [themeHistoryId]);

    const handleFeedback = async (rating: string) => {
        setFeedback(rating);
        if (!themeHistoryId) return;

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeHistoryId, rating })
            });
        } catch (e) {
            console.error('Failed to submit ground-truth telemetry', e);
        }
    };

    if (!themeHistoryId) return null;

    return (
        <div className="global-feedback-box" data-track="feedback-checkpoint">
            <p>How does this AI-generated architectural layout feel to you?</p>
            <div className="feedback-actions">
                <button 
                    className={`feedback-btn ${feedback ? 'done' : ''}`} 
                    onClick={() => handleFeedback('too_complex')}
                    disabled={feedback !== null}
                    data-track="feedback-rating-complex"
                >
                    Too Complex
                </button>
                <button 
                    className={`feedback-btn ${feedback ? 'done' : ''}`} 
                    onClick={() => handleFeedback('perfect')}
                    disabled={feedback !== null}
                    data-track="feedback-rating-perfect"
                >
                    {feedback ? 'Captured ✓' : 'Just Right'}
                </button>
                <button 
                    className={`feedback-btn ${feedback ? 'done' : ''}`} 
                    onClick={() => handleFeedback('too_simple')}
                    disabled={feedback !== null}
                    data-track="feedback-rating-simple"
                >
                    Too Simple
                </button>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .global-feedback-box {
                    position: relative;
                    z-index: 1000;
                    margin: 0 auto;
                    max-width: 800px;
                    padding: 2rem;
                    text-align: center;
                    background: transparent;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .global-feedback-box p {
                    margin-top: 0;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    color: var(--text-muted, #8b949e);
                    font-family: var(--font-body, sans-serif);
                }
            `}} />
        </div>
    );
}

