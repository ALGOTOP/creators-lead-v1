@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg-base: #131316;
  --bg-panel: #1b1b1f;
  --bg-panel-raised: #202024;
  --bg-inset: #0c0c0e;
  --border-subtle: #2c2c33;
  --border-strong: #37373f;

  --accent: #f26207;
  --accent-dim: #c24e04;
  --accent-glow: rgba(242, 98, 7, 0.35);

  --led-green: #3ecf8e;
  --led-amber: #f2b705;
  --led-red: #ff5c5c;
  --led-blue: #4d9dff;

  --text-primary: #edeef0;
  --text-secondary: #9a9aa5;
  --text-tertiary: #64646d;

  --mono: 'IBM Plex Mono', ui-monospace, monospace;
  --sans: 'Inter', system-ui, sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--sans);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

/* subtle noise/vignette texture on the base so pure black panels don't look flat */
body {
  background-image:
    radial-gradient(ellipse at top, rgba(255,255,255,0.025), transparent 60%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.008) 0px, transparent 1px, transparent 2px);
}

a { color: var(--led-blue); }

button, input, select, textarea { font-family: inherit; font-size: inherit; }

/* ---------- layout ---------- */
.app-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #17171b, #131316);
  border-right: 1px solid var(--border-subtle);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 20px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(145deg, var(--accent), var(--accent-dim));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 3px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.4);
  flex-shrink: 0;
}

.brand-text { font-family: var(--mono); font-weight: 600; font-size: 13.5px; line-height: 1.25; }
.brand-text small { display: block; color: var(--text-tertiary); font-weight: 400; font-size: 11px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.12s ease, color 0.12s ease;
}
.nav-item:hover { background: var(--bg-panel-raised); color: var(--text-primary); }
.nav-item.active {
  background: var(--bg-panel-raised);
  color: var(--text-primary);
  box-shadow: inset 0 0 0 1px var(--border-strong), inset 0 1px 0 rgba(255,255,255,0.03);
}
.nav-item.active .nav-dot { background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
.nav-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-tertiary); flex-shrink: 0; }

.sidebar-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--mono);
}

main {
  padding: 28px 34px 60px;
  max-width: 1180px;
}

.page { display: none; }
.page.active { display: block; }

h1 { font-family: var(--mono); font-size: 20px; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.01em; }
.page-subtitle { color: var(--text-secondary); margin: 0 0 24px; font-size: 13px; }

/* ---------- skeuomorphic panels ---------- */
.panel {
  background: linear-gradient(180deg, var(--bg-panel-raised), var(--bg-panel));
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 20px rgba(0,0,0,0.25);
  padding: 22px;
  margin-bottom: 20px;
}

.panel-title {
  font-family: var(--mono);
  font-size: 12.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* recessed "slot" inputs -- pressed into the panel rather than sitting on it */
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }

input[type="text"], input[type="number"], select {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 9px 11px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.02);
  outline: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
input[type="text"]:focus, input[type="number"]:focus, select:focus {
  border-color: var(--accent);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.45), 0 0 0 3px var(--accent-glow);
}
input::placeholder { color: var(--text-tertiary); }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

/* raised, tactile buttons with a press animation */
.btn {
  font-family: var(--mono);
  font-weight: 600;
  font-size: 13px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  cursor: pointer;
  color: #1a0d02;
  background: linear-gradient(180deg, #ff8a3d, var(--accent));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 2px rgba(0,0,0,0.2), 0 3px 8px rgba(242,98,7,0.3);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.btn:hover { filter: brightness(1.05); }
.btn:active {
  transform: translateY(1px);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(242,98,7,0.25);
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  cursor: pointer;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.btn-ghost:hover { color: var(--text-primary); border-color: var(--border-strong); }

.checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
.checkbox-row input { accent-color: var(--accent); width: 15px; height: 15px; }
.checkbox-row label { font-size: 12.5px; color: var(--text-secondary); }

/* ---------- LED-style stat cards ---------- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.led {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--text-tertiary);
}
.led.on-green { background: var(--led-green); box-shadow: 0 0 6px rgba(62,207,142,0.6); }
.led.on-amber { background: var(--led-amber); box-shadow: 0 0 6px rgba(242,183,5,0.6); }
.led.on-red { background: var(--led-red); box-shadow: 0 0 6px rgba(255,92,92,0.6); }
.led.on-blue { background: var(--led-blue); box-shadow: 0 0 6px rgba(77,157,255,0.6); }

.stat-value {
  font-family: var(--mono);
  font-size: 26px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ---------- lead cards / table ---------- */
.lead-list { display: flex; flex-direction: column; gap: 10px; }

.lead-card {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 44px 1fr auto auto auto;
  gap: 14px;
  align-items: center;
}

.lead-avatar {
  width: 44px; height: 44px; border-radius: 8px; object-fit: cover;
  border: 1px solid var(--border-subtle);
  background: var(--bg-inset);
}

.lead-title { font-weight: 600; font-size: 13.5px; }
.lead-title a { color: var(--text-primary); text-decoration: none; }
.lead-title a:hover { color: var(--accent); }
.lead-meta { color: var(--text-secondary); font-size: 11.5px; margin-top: 3px; font-family: var(--mono); }

.score-pill {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 20px;
  text-align: center;
  min-width: 34px;
}
.score-hot { background: rgba(255,92,92,0.15); color: var(--led-red); border: 1px solid rgba(255,92,92,0.3); }
.score-warm { background: rgba(242,183,5,0.15); color: var(--led-amber); border: 1px solid rgba(242,183,5,0.3); }
.score-cold { background: rgba(62,207,142,0.15); color: var(--led-green); border: 1px solid rgba(62,207,142,0.3); }
.score-none { background: var(--bg-inset); color: var(--text-tertiary); border: 1px solid var(--border-subtle); }

select.status-select {
  font-family: var(--mono);
  font-size: 12px;
  padding: 6px 8px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: var(--text-secondary);
}
.empty-state .glyph { font-size: 28px; margin-bottom: 10px; opacity: 0.6; }

.toast-region {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}
.toast {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-strong);
  border-left: 3px solid var(--led-green);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 12.5px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  animation: slide-in 0.18s ease;
}
.toast.error { border-left-color: var(--led-red); }
@keyframes slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: none; align-items: center; justify-content: center; z-index: 200;
}
.modal-backdrop.open { display: flex; }
.modal {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 22px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.modal h3 { font-family: var(--mono); font-size: 14px; margin: 0 0 14px; }
.modal textarea {
  width: 100%;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 10px;
  font-family: var(--mono);
  font-size: 12px;
  min-height: 220px;
  resize: vertical;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.45);
}
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

.quota-note {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

@media (max-width: 800px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { display: flex; flex-direction: row; overflow-x: auto; }
  .lead-card { grid-template-columns: 36px 1fr; grid-template-rows: auto auto; }
}
