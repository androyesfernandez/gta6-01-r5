// menu.js — title screen, pause menu with tabs, WASTED/BUSTED overlays.
export function createMenu(G) {
  const el = (id) => document.getElementById(id);
  const menu = {
    showTitle() { const t = el('title-screen'); if (t) t.style.display = 'flex'; renderSlotCards(); G.mode = 'title'; if (G.cameraRig) G.cameraRig.setAerial(); },
    hideTitle() { const t = el('title-screen'); if (t) t.style.display = 'none'; if (G.mode === 'title') G.mode = 'play'; if (G.cameraRig) G.cameraRig.setFollow(); },
    openPause(tab) { const p = el('pause-menu'); if (p) p.style.display = 'block'; G.mode = 'pause'; menu.showTab(tab || 'MAP'); if (G.stats) G.stats.renderAll(); },
    closePause() { const p = el('pause-menu'); if (p) p.style.display = 'none'; if (G.mode === 'pause') G.mode = 'play'; },
    showTab(name) { for (const t of ['MAP', 'STATS', 'CREW', 'SAVE']) { const p = el('tab-' + t.toLowerCase()); if (p) p.style.display = t === name ? 'block' : 'none';
      const b = el('tabbtn-' + t.toLowerCase()); if (b) b.classList.toggle('active', t === name); } if (G.stats) G.stats.renderAll(); },
    showWasted() { const w = el('wasted-overlay'); if (w) w.style.display = 'flex'; },
    showBusted() { const b = el('busted-overlay'); if (b) b.style.display = 'flex'; },
    hideOverlays() { const w = el('wasted-overlay'); if (w) w.style.display = 'none'; const b = el('busted-overlay'); if (b) b.style.display = 'none'; },
    update() {
      if (!G.input) return;
      if (G.input.wasPressed('Escape')) { if (G.mode === 'play') menu.openPause('MAP'); else if (G.mode === 'pause') menu.closePause(); }
      if ((G.mode === 'wasted' || G.mode === 'busted') && G.input.wasPressed('KeyR')) { if (G.playerSys) G.playerSys.respawn(); }
    },
  };
  function renderSlotCards() {
    const box = el('title-slots'); if (!box || !G.saveSys) return;
    const sums = G.saveSys.summaries();
    box.innerHTML = sums.map((s, i) => '<div class="slotcard"><b>SLOT ' + (i + 1) + '</b>' + (s ? '<span>' + s.rank + ' · $' + s.cash.toLocaleString() + ' · JOBS ' + s.jobsDone + '/8</span>' : '<span>EMPTY</span>') + '</div>').join('');
  }
  const bind = (id, fn) => { const b = el(id); if (b) b.addEventListener('click', fn); };
  bind('btn-continue', () => { const d = G.saveSys ? G.saveSys.load(0) : null; menu.hideTitle(); if (G.hud) G.hud.banner(d ? 'WELCOME BACK, RUY' : 'NEW GAME — PUERTO CANDELA'); startFirstJobHint(); });
  bind('btn-new', () => { menu.hideTitle(); if (G.hud) G.hud.banner('NEW GAME — PUERTO CANDELA'); startFirstJobHint(); });
  bind('btn-load', () => { menu.hideTitle(); menu.openPause('SAVE'); });
  bind('btn-settings', () => { if (G.hud) G.hud.banner('SETTINGS — GOLDEN HOUR GRADE · MASTER VOLUME ON'); });
  bind('btn-resume', () => menu.closePause());
  bind('wasted-respawn', () => { if (G.playerSys) G.playerSys.respawn(); });
  bind('busted-respawn', () => { if (G.playerSys) G.playerSys.respawn(); });
  for (const t of ['map', 'stats', 'crew', 'save']) bind('tabbtn-' + t, () => menu.showTab(t.toUpperCase()));
  function startFirstJobHint() { if (G.phone && G.prog.jobIndex === 0 && !G.missions.active) G.phone.showCall('madre', ['Ruy. Madre Cande. The harbour has work — first run, easy money. Press Y to take it, N to walk away.'], 0); }
  return menu;
}
