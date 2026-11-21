// hud.js — core HUD update: cash, stars, bars, speedo, vehicle chip, weapons, rank, district.
import { WEAPONS } from './weapons.js';
import { districtAt } from './districts.js';
export function createHud(G) {
  const el = (id) => document.getElementById(id);
  let bannerTimer = 0, flashTimer = 0;
  const hud = {
    banner(text) { const b = el('banner'); if (b) { b.textContent = text; b.style.display = 'block'; } bannerTimer = 3.2; },
    flashCash(n) { const c = el('cash'); if (c) { c.style.color = n >= 0 ? '#7ae88a' : '#ff7a6e'; flashTimer = 1.2; } },
    refreshWeapons() {
      const box = el('weapon-slots'); if (!box || !G.weaponsState) return;
      box.innerHTML = '';
      WEAPONS.forEach((w, i) => {
        const d = document.createElement('div'); d.className = 'weapon-slot' + (i === G.weaponsState.state.active ? ' active' : '') + (G.weaponsState.isLocked(w) ? ' locked' : '');
        const ammo = w.ammo === Infinity ? '∞' : String(G.weaponsState.state.ammo[w.id] || 0);
        d.textContent = (i + 1) + ' ' + w.name + (G.weaponsState.isLocked(w) ? ' 🔒 RANK' : ' · ' + ammo);
        box.appendChild(d);
      });
    },
    update(dt) {
      if (bannerTimer > 0) { bannerTimer -= dt; if (bannerTimer <= 0) { const b = el('banner'); if (b) b.style.display = 'none'; } }
      if (flashTimer > 0) { flashTimer -= dt; if (flashTimer <= 0) { const c = el('cash'); if (c) c.style.color = ''; } }
      const p = G.playerObj; if (!p) return;
      const cash = el('cash'); if (cash) cash.textContent = '$' + G.prog.cash.toLocaleString();
      const stars = el('wanted-stars');
      if (stars && G.wanted) { stars.textContent = '★★★★★'.slice(0, G.wanted.stars) + '☆☆☆☆☆'.slice(0, 5 - G.wanted.stars); stars.style.color = G.wanted.stars ? '#ffd94b' : '#666'; }
      const ws = el('wanted-state'); if (ws && G.wanted) { ws.textContent = G.wanted.stars ? (G.wanted.state + (G.wanted.busted > 0.05 ? ' · BUSTED ' + Math.round(G.wanted.busted * 100) + '%' : '')) : '';
        // Turn the state line urgent coral-red as the busted meter fills, so the risk reads at a glance.
        ws.style.color = G.wanted.busted > 0.4 ? '#ff5a4a' : G.wanted.busted > 0.05 ? '#ff9a8a' : '#f0c9a0'; }
      const hb = el('health-bar'); if (hb) hb.style.width = Math.max(0, p.health) + '%';
      const ab = el('armour-bar'); if (ab) ab.style.width = Math.max(0, p.armour) + '%';
      const rank = el('rank-chip'); if (rank && G.reputation) rank.textContent = G.reputation.rankName();
      const rb = el('rank-bar'); if (rb && G.reputation) rb.style.width = Math.round(G.reputation.progress() * 100) + '%';
      const pos = p.pos(); const d = districtAt(pos.x, pos.z);
      const dc = el('district-chip'); if (dc) dc.textContent = d.name + ' · ' + (G.prog.standing[d.name] || 'NEUTRAL');
      const sp = el('speedo'); const chip = el('vehicle-chip');
      if (p.inCar) { if (sp) { sp.style.display = 'block'; sp.textContent = Math.round(Math.abs(p.inCar.speed) * 3.6) + ' km/h'; }
        if (chip) { chip.style.display = 'block'; chip.textContent = p.inCar.model.name + ' · CONDITION ' + Math.round(p.inCar.condition) + '%'; } }
      else { if (sp) sp.style.display = 'none'; if (chip) chip.style.display = 'none'; }
      if (G.input) for (let i = 0; i < 4; i++) if (G.input.wasPressed('Digit' + (i + 1))) { G.weaponsState.select(i); hud.refreshWeapons(); }
    },
  };
  hud.refreshWeapons();
  return hud;
}
