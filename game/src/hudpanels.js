// hudpanels.js — dispatch panel, mission panel, crew cards rendering.
export function createHudPanels(G) {
  const el = (id) => document.getElementById(id);
  let built = false;
  function buildCrewCards() {
    const box = el('crew-cards'); if (!box || !G.crew || built) return; built = true;
    for (const m of G.crew.members) {
      const d = document.createElement('div'); d.className = 'crew-card'; d.id = 'crew-' + m.id;
      d.innerHTML = '<b>' + m.ability + '</b><span>' + m.name + ' · [' + m.key.replace('Key', '') + ']</span><i class="cd"></i><em></em>';
      box.appendChild(d);
    }
  }
  const api = {
    highlightCrew(id) { for (const m of G.crew.members) { const d = el('crew-' + m.id); if (d) d.classList.toggle('highlight', m.id === id); } },
    update() {
      buildCrewCards();
      // Dispatch panel
      const dp = el('dispatch-rows');
      if (dp && G.dispatch) {
        const rows = G.dispatch.rows();
        const show = G.wanted && G.wanted.stars > 0 || G.shotName;
        const panel = el('dispatch-panel'); if (panel) panel.style.display = rows.length ? 'block' : 'none';
        dp.innerHTML = rows.map((r) => '<div class="drow"><b>' + r.callsign + '</b><span>' + r.tactic + '</span><em>' + (r.dist === null || r.dist === undefined || r.dist > 9000 ? '' : r.dist + ' m') + '</em></div>').join('');
      }
      // Mission panel
      const mp = el('mission-panel');
      if (mp && G.missions) {
        const forced = G.missions.forcedLabel;
        const job = G.missions.active;
        if (forced) { mp.style.display = 'block'; el('mission-title').textContent = forced.title;
          el('mission-stage').textContent = 'STAGE ' + forced.n + '/' + forced.total;
          el('mission-pips').textContent = '●'.repeat(forced.n) + '○'.repeat(Math.max(0, forced.total - forced.n));
          el('mission-objective').textContent = forced.text; }
        else if (job) { const st = job.stages[G.missions.stageIndex]; mp.style.display = 'block';
          el('mission-title').textContent = job.title;
          el('mission-stage').textContent = 'STAGE ' + (G.missions.stageIndex + 1) + '/' + job.stages.length;
          el('mission-pips').textContent = '●'.repeat(G.missions.stageIndex + 1) + '○'.repeat(job.stages.length - G.missions.stageIndex - 1);
          el('mission-objective').textContent = st ? st.text : ''; }
        else if (!G.shotName) mp.style.display = 'none';
      }
      // Crew cards cooldown sweeps
      if (G.crew) for (const m of G.crew.members) {
        const d = el('crew-' + m.id); if (!d) continue;
        const cd = d.querySelector('.cd'); const em = d.querySelector('em');
        const frac = m.cooldown ? m.cdLeft / m.cooldown : 0;
        if (cd) cd.style.width = Math.round(frac * 100) + '%';
        if (em) em.textContent = m.cdLeft > 0 ? 'ON ' + Math.ceil(m.cdLeft) + 'S' : 'READY';
        d.classList.toggle('ready', m.cdLeft <= 0);
      }
    },
  };
  return api;
}
