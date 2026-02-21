/**
 * ui/styles.js
 * 面板 CSS 样式定义
 */

const PANEL_STYLES = `
<style>
/* ===== CSS 变量 ===== */
.sa-overlay, .sa-panel, .sa-panel * {
  --sa-bg:          #0d0f1a;
  --sa-bg2:         #131627;
  --sa-bg3:         #1a1e35;
  --sa-surface:     rgba(255,255,255,0.04);
  --sa-surface2:    rgba(255,255,255,0.07);
  --sa-border:      rgba(255,255,255,0.10);
  --sa-border2:     rgba(255,255,255,0.06);
  --sa-text:        #e2e4f0;
  --sa-text2:       #9499b8;
  --sa-text3:       #5c6080;
  --sa-accent:      #6c63ff;
  --sa-accent2:     #8b83ff;
  --sa-accent-glow: rgba(108,99,255,0.25);
  --sa-teal:        #00d4aa;
  --sa-red:         #ff5c7a;
  --sa-red-dim:     rgba(255,92,122,0.15);
  --sa-radius:      12px;
  --sa-radius-sm:   8px;
  box-sizing: border-box;
}

/* ===== 基础布局 ===== */
.sa-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(5,6,15,0.80); z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
}

.sa-panel {
  background: var(--sa-bg2); color: var(--sa-text);
  border: 1px solid var(--sa-border);
  border-radius: var(--sa-radius);
  width: 800px; max-width: 96vw; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 80px rgba(108,99,255,0.08) inset;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px; line-height: 1.5;
}

.sa-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--sa-border);
  font-size: 15px; font-weight: 700; flex-shrink: 0;
}
.sa-header span { 
  background: linear-gradient(135deg, var(--sa-accent2), var(--sa-teal));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sa-close {
  cursor: pointer; font-size: 20px; background: none; border: none; color: var(--sa-text2);
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border-radius: var(--sa-radius-sm); transition: all 0.2s;
}
.sa-close:hover { color: var(--sa-text); background: var(--sa-surface2); }

.sa-body {
  flex: 1; overflow-y: auto; padding: 14px 16px;
}

.sa-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-top: 1px solid var(--sa-border);
  background: rgba(0,0,0,0.2); flex-shrink: 0;
}

/* ===== 主标签页导航 ===== */
.sa-tabs {
  display: flex; padding: 10px 16px 0;
  border-bottom: 1px solid var(--sa-border);
  background: var(--sa-bg);
  gap: 8px;
  flex-shrink: 0;
}
.sa-tab-item {
  all: unset; box-sizing: border-box; cursor: pointer;
  padding: 8px 16px; 
  font-size: 14px; font-weight: 600; color: var(--sa-text2);
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.sa-tab-item:hover { color: var(--sa-text); }
.sa-tab-item.active {
  color: var(--sa-accent);
  border-bottom-color: var(--sa-accent);
}
.sa-tab-pane { display: none; }
.sa-tab-pane.active { 
  display: block; 
  animation: sa-fade-in 0.3s ease;
}

/* ===== 设置页布局 (二级导航) ===== */
.sa-settings-layout {
  display: flex;
  gap: 16px;
}
.sa-settings-nav {
  display: flex; flex-direction: column;
  gap: 4px;
  width: 150px;
  flex-shrink: 0;
}
.sa-settings-nav-item {
  all: unset; box-sizing: border-box; cursor: pointer;
  display: block; padding: 8px 12px;
  border-radius: var(--sa-radius-sm);
  color: var(--sa-text2); font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.sa-settings-nav-item:hover { background: var(--sa-surface2); color: var(--sa-text); }
.sa-settings-nav-item.active {
  background: var(--sa-accent-glow);
  color: var(--sa-accent2);
  font-weight: 600;
}
.sa-settings-content { flex: 1; min-width: 0; }
.sa-settings-pane { display: none; }
.sa-settings-pane.active { display: block; }


/* ===== 通用组件 ===== */
@keyframes sa-fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

.sa-section {
  margin-bottom: 12px;
  border: 1px solid var(--sa-border);
  border-radius: var(--sa-radius);
  overflow: hidden;
  background: var(--sa-bg);
}
.sa-section:last-child { margin-bottom: 0; }
.sa-section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px;
  background: var(--sa-surface);
  font-weight: 600; font-size: 13px;
  color: var(--sa-text);
}
.sa-section-body { padding: 14px; border-top: 1px solid var(--sa-border2); }

.sa-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sa-row:last-child { margin-bottom: 0; }
.sa-row-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sa-pair-item { display: flex; align-items: center; gap: 8px; }
.sa-label { min-width: 80px; font-size: 12px; color: var(--sa-text2); flex-shrink: 0; font-weight: 500; }

.sa-input, .sa-select {
  all: unset; box-sizing: border-box; flex: 1; min-width: 0;
  background: rgba(0,0,0,0.35) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  border-radius: var(--sa-radius-sm) !important; color: var(--sa-text) !important;
  padding: 8px 12px !important; font-size: 13px !important; min-height: 36px !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}
.sa-input:focus, .sa-select:focus {
  border-color: var(--sa-accent) !important;
  box-shadow: 0 0 0 3px var(--sa-accent-glow) !important;
}
.sa-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239499b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important; background-position: right 10px center !important;
  padding-right: 30px !important; cursor: pointer !important;
}
.sa-select option { background: #1a1e35 !important; color: #e2e4f0 !important; }

.sa-btn {
  all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
  gap: 5px; padding: 7px 16px; border: 1px solid var(--sa-border2);
  border-radius: var(--sa-radius-sm); background: var(--sa-surface2);
  color: var(--sa-text); cursor: pointer; font-size: 13px; font-weight: 500;
  white-space: nowrap; transition: all 0.15s; min-height: 34px;
}
.sa-btn:hover { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.2); color: #fff; }
.sa-btn:active { transform: scale(0.97); }
.sa-btn-group { display: flex; gap: 8px; flex-wrap: wrap; }

.sa-btn-primary { background: linear-gradient(135deg, var(--sa-accent), #8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 2px 12px rgba(108,99,255,0.35); }
.sa-btn-primary:hover { background: linear-gradient(135deg, var(--sa-accent2), #9d6fff); box-shadow: 0 4px 18px rgba(108,99,255,0.5); }
.sa-btn-danger { background: var(--sa-red-dim); border-color: rgba(255,92,122,0.3); color: var(--sa-red); }
.sa-btn-danger:hover { background: rgba(255,92,122,0.25); border-color: rgba(255,92,122,0.5); color: #ff7a93; }
.sa-btn-sm { padding: 5px 11px; font-size: 12px; min-height: 28px; }

.sa-checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin-top: 12px; }
.sa-checkbox-grid label, .sa-radio-group label {
  display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;
  color: var(--sa-text2); transition: color 0.15s;
}
.sa-checkbox-grid label:hover, .sa-radio-group label:hover { color: var(--sa-text); }

input[type="checkbox"], input[type="radio"] {
  all: unset; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2);
  flex-shrink: 0; cursor: pointer; transition: all 0.15s; position: relative;
  display: inline-flex; align-items: center; justify-content: center;
}
input[type="radio"] { border-radius: 50%; }
input[type="checkbox"] { border-radius: 4px; }

input[type="radio"]:checked, input[type="checkbox"]:checked {
  border-color: var(--sa-accent); background: var(--sa-accent);
  box-shadow: 0 0 0 3px var(--sa-accent-glow);
}
input[type="checkbox"]:checked::after {
  content: '✓'; color: #fff; font-size: 11px; font-weight: 700; line-height: 1;
}

.sa-hint { font-size: 11px; color: var(--sa-text3); line-height: 1.5; padding: 5px 8px; background: var(--sa-surface); border-left: 2px solid var(--sa-accent); border-radius: 0 var(--sa-radius-xs) var(--sa-radius-xs) 0; margin-top: 5px; }

/* ===== 特定组件样式 ===== */
.sa-status-grid { display: grid; grid-template-columns: auto 1fr; gap: 5px 14px; align-items: center; }
.sa-status-grid .sa-status-label { text-align: right; white-space: nowrap; color: var(--sa-text2); }
.sa-progress-bar { width: 100%; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; margin-top: 4px; }
.sa-progress-fill { height: 100%; background: var(--sa-accent); border-radius: 3px; transition: width 0.3s ease; }

.sa-entry-list { max-height: 300px; overflow-y: auto; }
.sa-entry-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; border-bottom: 1px solid var(--sa-border2); transition: background 0.15s; }
.sa-entry-item:last-child { border-bottom: none; }
.sa-entry-item:hover { background: rgba(108,99,255,0.07); }
.sa-entry-item.sa-entry-selectable { cursor: pointer; }
.sa-entry-item.sa-entry-selectable:hover { background: rgba(108,99,255,0.12); }
.sa-entry-checkbox { margin-right: 8px; cursor: pointer; }
.sa-entry-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sa-entry-disabled { opacity: 0.4; text-decoration: line-through; }
.sa-entry-actions { display: flex; gap: 5px; flex-shrink: 0; }
.sa-empty { text-align: center; padding: 28px 16px; color: var(--sa-text3); }
.sa-mega-entry-item { background: rgba(0,212,170,0.05); border-left: 3px solid var(--sa-teal); }
.sa-mega-entry-item:hover { background: rgba(0,212,170,0.10); }

.sa-entry-unavailable { opacity: 0.5; }
.sa-entry-badge { font-size: 11px; padding: 1px 6px; border-radius: 3px; margin-right: 6px; white-space: nowrap; flex-shrink: 0; }
.sa-entry-badge-mega { background: rgba(0,212,170,0.15); color: #00d4aa; border: 1px solid rgba(0,212,170,0.3); }
.sa-entry-badge-disabled { background: rgba(255,255,255,0.06); color: var(--sa-text3); border: 1px solid rgba(255,255,255,0.1); }

.sa-selection-controls { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--sa-border2); background: rgba(108,99,255,0.04); }
.sa-selection-count { font-size: 12px; color: var(--sa-text2); }
.sa-selection-btns { display: flex; gap: 6px; }

.sa-blocks-container { display: flex; flex-direction: column; gap: 8px; }
.sa-block-header { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--sa-surface); border-radius: var(--sa-radius-sm); cursor: pointer; user-select: none; }
.sa-block-drag { cursor: grab; color: var(--sa-text3); }
.sa-block-body { padding: 10px; border-top: 1px solid var(--sa-border2); }

.sa-about-content { line-height: 1.7; }
.sa-about-content h3 { font-size: 18px; color: var(--sa-text); margin-bottom: 8px; }
.sa-about-content p { color: var(--sa-text2); margin-bottom: 16px; }
.sa-about-content a.sa-btn { text-decoration: none; }

/* 移动端适配 */
@media (max-width: 768px) {
  .sa-panel { width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; border-radius: 0; }
  .sa-body { padding: 10px; }
  .sa-tabs { padding: 8px 10px 0; }
  .sa-tab-item { padding: 8px 12px; font-size: 13px; }
  .sa-settings-layout { flex-direction: column; }
  .sa-settings-nav { width: 100%; flex-direction: row; overflow-x: auto; padding-bottom: 8px; border-bottom: 1px solid var(--sa-border); margin-bottom: 8px; }
  .sa-settings-nav-item { flex-shrink: 0; }
  .sa-row, .sa-pair-item { flex-direction: column; align-items: stretch; gap: 6px; }
  .sa-row .sa-label { min-width: auto; }
  .sa-checkbox-grid { grid-template-columns: 1fr; }
}

</style>
`;
