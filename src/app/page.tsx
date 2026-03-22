'use client';

import { useEffect, useState, useCallback } from 'react';
import { ThemeResponse } from '@/lib/types';
import { coreContent } from '@/lib/coreContent';
import LayoutCompiler from '@/components/LayoutCompiler';
import { useInteractionTracker } from '@/hooks/useInteractionTracker';
import { EngineConsole } from '@/components/ui/EngineConsole';
import { LayoutFeedback } from '@/components/ui/LayoutFeedback';


function applyThemeCSSVars(theme: ThemeResponse['theme']) {
  const root = document.documentElement;
  const p = theme.colorPalette;
  const t = theme.typography;
  const s = theme.layoutSchema.spacing;

  const spacingMap = { compact: '1rem', normal: '1.4rem', airy: '1.8rem', expansive: '2.4rem' };

  let radiusValues = { main: '12px', sm: '6px' };
  if (theme.shapeLanguage === 'organic-curves') {
    radiusValues = { main: '32px', sm: '16px' };
  } else if (theme.shapeLanguage === 'sharp-cuts') {
    radiusValues = { main: '0px', sm: '0px' };
  }

  root.style.setProperty('--color-bg', p.background);
  root.style.setProperty('--color-surface', p.surface);
  root.style.setProperty('--color-primary', p.primary);
  root.style.setProperty('--color-secondary', p.secondary);
  root.style.setProperty('--color-accent', p.accent);
  root.style.setProperty('--color-text', p.text);
  root.style.setProperty('--color-text-muted', p.textMuted);
  root.style.setProperty('--color-border', p.border);
  root.style.setProperty('--font-heading', t.headingFont);
  root.style.setProperty('--font-body', t.bodyFont);
  root.style.setProperty('--font-heading-weight', t.headingWeight);
  root.style.setProperty('--font-body-weight', t.bodyWeight);
  root.style.setProperty('--spacing-unit', spacingMap[s] || spacingMap.normal);
  root.style.setProperty('--anim-style', theme.animationStyle);
  root.style.setProperty('--radius', radiusValues.main);
  root.style.setProperty('--radius-sm', radiusValues.sm);
}

export default function HomePage() {
  const [themeResponse, setThemeResponse] = useState<ThemeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = themeResponse?.sessionId ?? null;
  const themeHistoryId = themeResponse?.themeHistoryId ?? null;
  const orbReasoning = themeResponse?.orbReasoning;
  const archetype = themeResponse?.archetype;

  useInteractionTracker(sessionId, themeHistoryId);

  const fetchThemeData = useCallback(async (isSoftReload = false) => {
    if (isSoftReload) setIsRefetching(true);
    try {
      const res = await fetch('/api/theme', {
        cache: 'no-store',
        // AL-02: signal to server that this is a user-triggered morph, not a page load
        // so visitCount is not incremented mid-session
        headers: isSoftReload ? { 'x-morph': '1' } : {},
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || 'Theme generation failed');
      }
      const data: ThemeResponse = await res.json();
      setThemeResponse(data);
      applyThemeCSSVars(data.theme);
    } catch (err) {
      setError(String(err));
    } finally {
      if (isSoftReload) setIsRefetching(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemeData();
  }, [fetchThemeData]);

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-screen__inner">
          <div className="loading-orbs">
            <span className="loading-orb" />
            <span className="loading-orb" />
            <span className="loading-orb" />
          </div>
          <p className="loading-screen__text">Composing your symbolic experience…</p>
          <p className="loading-screen__sub">The AI is selecting your metaphor</p>
        </div>
      </div>
    );
  }

  if (error || !themeResponse) {
    return (
      <div className="error-screen" role="alert">
        <div className="error-screen__inner">
          <h1>⚠ Theme engine encountered an anomaly</h1>
          <p>{error || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>
            Regenerate Experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LayoutCompiler
        theme={themeResponse.theme}
        content={themeResponse.content}
        core={coreContent}
      />
      <LayoutFeedback themeHistoryId={themeHistoryId} />
      <EngineConsole 
        currentTheme={themeResponse.theme} 
        isRefetching={isRefetching} 
        onShiftLens={() => fetchThemeData(true)}
        orbReasoning={orbReasoning}
        archetype={archetype}
      />
    </>
  );
}
