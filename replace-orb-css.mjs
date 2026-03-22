import fs from 'fs';
import path from 'path';

const targetPath = path.resolve('d:/Antigravity_agent_manager/symbolic-ai-engine/src/app/globals.css');
let css = fs.readFileSync(targetPath, 'utf-8');

const marker1 = '/* ═══════════════════════════════════════════════════════════════════════════\n   ENGINE CONSOLE';
const marker2 = '/* ═══════════════════════════════════════════════════════════════════════════\n   AI ORB COMPANION';

let parts = css.split(marker1);
if (parts.length > 1) css = parts[0];

parts = css.split(marker2);
if (parts.length > 1) css = parts[0];

const newCss = `
/* ═══════════════════════════════════════════════════════════════════════════
   AI ORB COMPANION (Left Side Scroll Track)
   ═══════════════════════════════════════════════════════════════════════════ */

.ai-companion-wrapper {
  position: fixed;
  top: 0; left: 0;
  width: 100px;
  height: 100vh;
  z-index: 10000;
  pointer-events: none; /* Let clicks pass through empty space */
}

.ai-companion-track {
  position: absolute;
  top: 20%; bottom: 20%;
  left: 3.5rem; /* Center of orb (2rem + 25px) */
  width: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1px;
}

.ai-companion-track-fill {
  width: 100%;
  background: rgba(88, 166, 255, 0.4);
  transition: height 0.3s ease-out;
}

.ai-orb-container {
  position: absolute; /* Relative to fixed wrapper */
  pointer-events: auto; /* Re-enable clicks for the orb */
  transition: top 0.4s ease-out;
  display: flex;
  align-items: center;
}

.ai-orb {
  position: relative;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-orb-core {
  width: 20px;
  height: 20px;
  background: var(--color-primary, #58a6ff);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(88, 166, 255, 0.8), inset 0 0 10px rgba(255,255,255,0.8);
  z-index: 3;
  transition: all 0.3s ease;
  animation: orbBreathe 3s ease-in-out infinite alternate;
}

.ai-orb:hover .ai-orb-core {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(88, 166, 255, 1), inset 0 0 10px rgba(255,255,255,1);
}

.ai-orb-ring-1, .ai-orb-ring-2 {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(88, 166, 255, 0.4);
  pointer-events: none;
}

.ai-orb-ring-1 {
  width: 32px; height: 32px;
  animation: spinRing 8s linear infinite;
  border-top-color: transparent;
  border-bottom-color: transparent;
}

.ai-orb-ring-2 {
  width: 44px; height: 44px;
  animation: spinRingReverse 12s linear infinite;
  border-left-color: transparent;
  border-right-color: transparent;
}

@keyframes orbBreathe {
  0% { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1.05); opacity: 1; }
}

@keyframes spinRing { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes spinRingReverse { 100% { transform: translate(-50%, -50%) rotate(-360deg); } }

/* Ready State (Excited) */
.ai-orb--ready .ai-orb-core {
  background: #a371f7;
  box-shadow: 0 0 25px rgba(163, 113, 247, 0.9), inset 0 0 10px rgba(255,255,255,0.8);
  animation: orbBounce 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) infinite alternate;
}
.ai-orb--ready .ai-orb-ring-1, .ai-orb--ready .ai-orb-ring-2 {
  border-color: rgba(163, 113, 247, 0.6);
  border-top-color: transparent; border-bottom-color: transparent;
  animation-duration: 2s;
}

@keyframes orbBounce {
  0% { transform: scale(1) translateY(0); }
  100% { transform: scale(1.1) translateY(-6px); }
}

/* Thinking State */
.ai-orb--thinking .ai-orb-core {
  background: #febc2e;
  box-shadow: 0 0 20px rgba(254, 188, 46, 0.8);
  animation: orbFlicker 0.1s infinite;
}
@keyframes orbFlicker {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.9); }
  100% { opacity: 0.9; transform: scale(1.05); }
}

/* Speech Bubble (Pops out to the right) */
.ai-orb-speech-bubble.left-aligned {
  position: absolute;
  left: 60px; /* Space for the orb */
  top: 50%;
  transform: translateY(-50%);
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  border-top-left-radius: 4px; /* points to orb on left */
  padding: 1.25rem;
  width: 280px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: popInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: left center;
}

@keyframes popInLeft {
  from { opacity: 0; transform: translateY(-50%) scale(0.8) translateX(-20px); }
  to { opacity: 1; transform: translateY(-50%) scale(1) translateX(0); }
}

.ai-orb-speech-bubble p { margin: 0 0 0.5rem; color: #c9d1d9; }
.ai-orb-speech-bubble .ai-orb-greeting { font-weight: 600; color: #fff; font-size: 1rem; margin-bottom: 0.75rem; }

.ai-orb-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.ai-orb-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.ai-orb-btn.primary {
  background: var(--color-primary, #58a6ff);
  color: #000;
  box-shadow: 0 0 10px rgba(88, 166, 255, 0.3);
}
.ai-orb-btn.primary:hover { background: #79c0ff; transform: translateY(-1px); }

.ai-orb-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #c9d1d9;
}
.ai-orb-btn.secondary:hover { background: rgba(255, 255, 255, 0.15); }

.ai-orb-synth {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.ai-orb-synth p { margin: 0; font-weight: 500; font-style: italic; }

.spinner-small {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #febc2e;
  border-radius: 50%;
  animation: spinRing 0.8s linear infinite;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .ai-companion-wrapper { display: none; /* Hide on small screens to avoid blocking content entirely, can fallback to standard bottom floating if desired */ }
}
`;

fs.writeFileSync(targetPath, css + newCss);
console.log('Replaced console CSS with Vertical AI Companion CSS.');
