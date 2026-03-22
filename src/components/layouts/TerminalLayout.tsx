'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Theme, RewrittenContent, CoreContent } from '@/lib/types';

interface Props { theme: Theme; content: RewrittenContent; core: CoreContent; }

const BOOT_SEQUENCE = [
    'Initializing symbolic engine...',
    'Loading visitor preference context...',
    'Mapping behavioral signatures...',
    'Selecting metaphor...',
    'Compiling portfolio data...',
    'System ready.',
];

export default function TerminalLayout({ theme, content, core }: Props) {
    const [bootLines, setBootLines] = useState<string[]>([]);
    const [bootDone, setBootDone] = useState(false);
    const [activeSection, setActiveSection] = useState<'about' | 'projects' | 'contact' | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Phase 7 Interactive State
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleSkillFilter = (e: Event) => {
            const customEvent = e as CustomEvent<string | null>;
            setHighlightedSkill(customEvent.detail);
        };
        window.addEventListener('sym_skill_filter', handleSkillFilter);
        return () => window.removeEventListener('sym_skill_filter', handleSkillFilter);
    }, []);

    const handleSkillClick = (skill: string) => {
        const newSkill = activeSkill === skill ? null : skill;
        setActiveSkill(newSkill);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sym_skill_filter', { detail: newSkill }));
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setBootLines(prev => [...prev, BOOT_SEQUENCE[i]]);
            i++;
            if (i >= BOOT_SEQUENCE.length) {
                clearInterval(interval);
                setTimeout(() => setBootDone(true), 400);
            }
        }, 280);
        return () => clearInterval(interval);
    }, []);

    const handleCommand = (cmd: string) => {
        const c = cmd.trim().toLowerCase();
        if (c === 'about' || c === '--about') setActiveSection('about');
        else if (c === 'projects' || c === '--projects') setActiveSection('projects');
        else if (c === 'contact' || c === '--contact') setActiveSection('contact');
        else if (c === 'clear') setActiveSection(null);
    };

    return (
        <main className={`layout layout--terminal anim-${theme.animationStyle}`} id="hero">
            <div className="terminal">
                <div className="terminal__titlebar">
                    <span className="terminal__dot terminal__dot--red" />
                    <span className="terminal__dot terminal__dot--yellow" />
                    <span className="terminal__dot terminal__dot--green" />
                    <span className="terminal__filename">{theme.themeName.toLowerCase().replace(' ', '-')}-portfolio.sh</span>
                </div>
                <div className="terminal__body">

                    {/* Boot sequence */}
                    {bootLines.map((line, i) => (
                        <div key={i} className="terminal__line terminal__line--boot">
                            <span className="terminal__prompt">[{theme.themeName.slice(0,2).toLowerCase()}@sys]$</span>
                            <span> {line}</span>
                        </div>
                    ))}

                    {bootDone && (
                        <>
                            <div className="terminal__line terminal__line--divider">
                                <div className="terminal__rule" />
                            </div>
                            <div className="terminal__line terminal__line--intro">
                                <span className="terminal__key">NAME</span>
                                <span>           {core.name}</span>
                            </div>
                            <div className="terminal__line terminal__line--intro">
                                <span className="terminal__key">ROLE</span>
                                <span>           {core.title}</span>
                            </div>
                            <div className="terminal__line terminal__line--intro">
                                <span className="terminal__key">TAGLINE</span>
                                <span>        {content.heroHeadline}</span>
                            </div>
                            <div className="terminal__line terminal__line--intro">
                                <span className="terminal__key">STATUS</span>
                                <span>         {core.contact.availability}</span>
                            </div>
                            <div className="terminal__line terminal__line--divider">
                                <div className="terminal__rule" />
                            </div>
                            <div className="terminal__line terminal__line--hint">
                                <span>Available commands: </span>
                                <button className="terminal__cmd-btn" onClick={() => setActiveSection('about')}>about</button>
                                <button className="terminal__cmd-btn" onClick={() => setActiveSection('projects')}>projects</button>
                                <button className="terminal__cmd-btn" onClick={() => setActiveSection('contact')}>contact</button>
                            </div>

                            {/* Active section output */}
                            {activeSection === 'about' && (
                                <div className="terminal__output" id="about">
                                    <div className="terminal__line"><span className="terminal__prompt">$</span><span> cat about.md</span></div>
                                    <div className="terminal__line terminal__line--output">{content.aboutBody}</div>
                                    <div className="terminal__line">
                                        <span className="terminal__key">SKILLS</span>
                                        <span>   </span>
                                        {core.skills.slice(0, 6).map(s => (
                                            <button 
                                                key={s} 
                                                className={`skill-pill ${activeSkill === s ? 'skill-pill--active' : ''}`}
                                                style={{ marginRight: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '0.8rem', padding: '0.1rem 0.4rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                                onClick={() => handleSkillClick(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'projects' && (
                                <div className="terminal__output" id="projects">
                                    <div className="terminal__line"><span className="terminal__prompt">$</span><span> ls ./projects/</span></div>
                                    {core.projects.map((p, i) => {
                                        const isExpanded = expandedProjects.has(p.id);
                                        const hasSkill = highlightedSkill ? p.technologies.includes(highlightedSkill) : false;
                                        const isDimmed = highlightedSkill && !hasSkill;
                                        const fullDesc = content.projectDescriptions[p.id] || p.description;
                                        const summaryDesc = fullDesc.length > 50 ? fullDesc.substring(0, 50) + '...' : fullDesc;

                                        return (
                                            <div key={p.id} className="terminal__line terminal__line--output" style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.2s', marginBottom: '1rem', display: 'flex', flexDirection: 'column' }}>
                                                <div>
                                                    <span className="terminal__key" style={{ color: hasSkill ? 'var(--color-primary)' : 'var(--text-muted)' }}>{String(i + 1).padStart(2, '0')} {p.name}</span>
                                                    <span>  [{p.year}] {isExpanded ? fullDesc : summaryDesc}</span>
                                                </div>
                                                <button 
                                                    onClick={() => toggleExpand(p.id)}
                                                    style={{ alignSelf: 'flex-start', marginLeft: '120px', marginTop: '0.2rem', background: 'transparent', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}
                                                >
                                                    {isExpanded ? '-- less' : '++ expand'}
                                                </button>
                                                {isExpanded && (
                                                    <div style={{ marginLeft: '120px', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                                        Dependencies: {p.technologies.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeSection === 'contact' && (
                                <div className="terminal__output" id="contact">
                                    <div className="terminal__line"><span className="terminal__prompt">$</span><span> whoami --contact</span></div>
                                    <div className="terminal__line terminal__line--output"><span className="terminal__key">EMAIL</span><span>   {core.contact.email}</span></div>
                                    <div className="terminal__line terminal__line--output"><span className="terminal__key">LOC</span><span>     {core.contact.location}</span></div>
                                    {core.socialLinks.map(s => (
                                        <div key={s.platform} className="terminal__line terminal__line--output">
                                            <span className="terminal__key">{s.platform.toUpperCase()}</span>
                                            <span>   <a href={s.url} target="_blank" rel="noopener noreferrer" className="terminal__link">{s.url}</a></span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="terminal__input-row">
                                <span className="terminal__prompt">[{theme.themeName.slice(0,2).toLowerCase()}@portfolio]$</span>
                                <input
                                    ref={inputRef}
                                    className="terminal__input"
                                    type="text"
                                    placeholder="type a command..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleCommand((e.target as HTMLInputElement).value);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
