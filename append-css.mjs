import fs from 'fs';
import path from 'path';

const cssToAdd = `
/* ═══════════════════════════════════════════════════════════════════════════
   ENGINE CONSOLE (Draggable Glassmorphism UI)
   ═══════════════════════════════════════════════════════════════════════════ */

.engine-console {
  position: fixed;
  width: 320px;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  z-index: 10000;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  user-select: none;
  animation: floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes floatIn {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.engine-console--dragging {
  cursor: grabbing !important;
  opacity: 0.85;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
  transition: none;
}

.engine-console--ready {
  border-color: rgba(88, 166, 255, 0.4);
  box-shadow: 0 0 40px rgba(88, 166, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.engine-console__drag-handle {
  cursor: grab;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.engine-console__drag-handle:active { cursor: grabbing; }

.engine-console__drag-edge {
  width: 32px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  margin: 0 auto;
}

.engine-console__header-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.engine-console__dot {
  width: 8px;
  height: 8px;
  background: #28c840;
  border-radius: 50%;
  animation: pulseData 2s infinite;
  box-shadow: 0 0 10px rgba(40, 200, 64, 0.6);
}

.engine-console--refetching .engine-console__dot {
  background: #febc2e;
  animation: pulseFast 0.5s infinite;
  box-shadow: 0 0 10px rgba(254, 188, 46, 0.8);
}

@keyframes pulseData { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
@keyframes pulseFast { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }

.engine-console__title {
  flex: 1;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8b949e;
  font-weight: 700;
}

.engine-console__drag-icon {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1;
}

.engine-console__body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.engine-console__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.engine-console__label { color: #8b949e; font-size: 0.8rem; }
.engine-console__val { font-weight: 600; color: #c9d1d9; font-size: 0.8rem; text-transform: capitalize; }

.engine-console__telemetry {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.engine-console__metrics {
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #58a6ff;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  margin-bottom: 0.6rem;
}

.engine-console__progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.engine-console__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #58a6ff, #a371f7);
  transition: width 0.3s ease-out;
}

.engine-console__actions {
  padding: 0 1.25rem 1.25rem;
}

.engine-console__btn {
  width: 100%;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.engine-console__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.engine-console__btn--glow {
  background: rgba(88, 166, 255, 0.15);
  border-color: rgba(88, 166, 255, 0.4);
  color: #fff;
  box-shadow: 0 0 20px rgba(88, 166, 255, 0.2);
}

.engine-console__btn--glow:hover:not(:disabled) {
  background: rgba(88, 166, 255, 0.3);
  box-shadow: 0 0 30px rgba(88, 166, 255, 0.4);
}

.engine-console__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.engine-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.engine-pulse-ring {
  position: absolute;
  top: 50%; left: 50%;
  width: 100%; height: 100%;
  border: 2px solid rgba(88, 166, 255, 0.5);
  border-radius: 12px;
  transform: translate(-50%, -50%);
  animation: expandRing 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  pointer-events: none;
  z-index: -1;
}
.engine-pulse-ring.delay { animation-delay: 1s; }

@keyframes expandRing {
  0% { width: 100%; height: 100%; opacity: 0.8; }
  100% { width: 120%; height: 130%; opacity: 0; }
}

@media (max-width: 768px) {
  .engine-console {
    width: auto;
  }
}
`;

const targetPath = path.resolve('d:/Antigravity_agent_manager/symbolic-ai-engine/src/app/globals.css');
fs.appendFileSync(targetPath, '\\n' + cssToAdd);
console.log('Appended console CSS successfully.');
