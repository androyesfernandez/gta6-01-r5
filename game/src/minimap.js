// minimap.js — 220x220 canvas: district tints, road grid, blips, search sweep.
import { DISTRICTS, roadCenterX, roadCenterZ } from './districts.js';
export function createMinimap(G) {
  const canvas = document.getElementById('minimap');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const W2C = 220 / 1000; // world [-360..640]x[-500..360] approx -> canvas
  function px(x) { return (x + 360) * W2C; }
  function pz(z) { return (z + 500) * (220 / 860); }
  const api = { canvas,
    update() {
      if (!ctx || !G.playerObj) return;
      ctx.fillStyle = '#17303a'; ctx.fillRect(0, 0, 220, 220);
      for (const d of DISTRICTS) { ctx.fillStyle = 'rgba(232,176,75,0.20)'; ctx.fillRect(px(d.x0), pz(d.z0), (d.x1 - d.x0) * W2C, (d.z1 - d.z0) * (220 / 860)); }
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(px(roadCenterX(i)), pz(-240)); ctx.lineTo(px(roadCenterX(i)), pz(240)); ctx.stroke(); }
      for (let j = 0; j <= 8; j++) { ctx.beginPath(); ctx.moveTo(px(-300), pz(roadCenterZ(j))); ctx.lineTo(px(300), pz(roadCenterZ(j))); ctx.stroke(); }
      ctx.fillStyle = '#3fa08c'; for (const c of G.cars) { if (c.police) continue; ctx.fillRect(px(c.x) - 1, pz(c.z) - 1, 2, 2); }
      // Objective / race checkpoint (gold)
      let obj = null;
      if (G.missions && G.missions.currentStage() && G.missions.active) { const s = G.missions.currentStage(); obj = { x: s.x, z: s.z }; }
      if (G.races && G.races.currentCheckpoint()) obj = G.races.currentCheckpoint();
      if (G.shotObjective) obj = G.shotObjective;
      if (obj) { ctx.fillStyle = '#ffd94b'; ctx.beginPath(); ctx.arc(px(obj.x), pz(obj.z), 5, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#3355ff';
      if (G.dispatch) for (const u of G.dispatch.units) { const o = u.car || u.ped; if (o && u.active) { ctx.beginPath(); ctx.arc(px(o.x), pz(o.z), 3, 0, 7); ctx.fill(); } }
      for (const c of G.cars) if (c.police) { ctx.beginPath(); ctx.arc(px(c.x), pz(c.z), 3, 0, 7); ctx.fill(); }
      // Search sweep when SEARCHING
      if (G.wanted && G.wanted.state === 'SEARCHING') {
        const ls = G.wanted.lastSeen; const a = G.clock.elapsedTime * 1.8;
        ctx.fillStyle = 'rgba(51,85,255,0.18)'; ctx.beginPath(); ctx.moveTo(px(ls.x), pz(ls.z));
        ctx.arc(px(ls.x), pz(ls.z), 26, a, a + 0.9); ctx.closePath(); ctx.fill();
      }
      // Player arrow
      const p = G.playerObj.pos(); const h = G.playerObj.heading || 0;
      ctx.save(); ctx.translate(px(p.x), pz(p.z)); ctx.rotate(Math.atan2(Math.sin(h), -Math.cos(h)) + Math.PI);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '9px sans-serif'; ctx.fillText('PUERTO CANDELA', 6, 12);
    } };
  return api;
}
export function drawBigMap(G, canvas) {
  const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#12242e'; ctx.fillRect(0, 0, W, H);
  const sx = W / 1000, sz = H / 860; const px = (x) => (x + 360) * sx, pz = (z) => (z + 500) * sz;
  ctx.fillStyle = '#1d6e8a'; ctx.fillRect(0, pz(280), W, H - pz(280));
  for (const d of DISTRICTS) { ctx.fillStyle = 'rgba(232,176,75,0.25)'; ctx.fillRect(px(d.x0), pz(d.z0), (d.x1 - d.x0) * sx, (d.z1 - d.z0) * sz);
    ctx.fillStyle = '#ffd97a'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.name, px((d.x0 + d.x1) / 2), pz((d.z0 + d.z1) / 2));
    ctx.font = '11px sans-serif'; ctx.fillStyle = '#ffffff';
    const st = G.prog && G.prog.standing[d.name] ? G.prog.standing[d.name] : 'NEUTRAL'; ctx.fillText(st, px((d.x0 + d.x1) / 2), pz((d.z0 + d.z1) / 2) + 16); }
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(px(roadCenterX(i)), pz(-240)); ctx.lineTo(px(roadCenterX(i)), pz(240)); ctx.stroke(); }
  for (let j = 0; j <= 8; j++) { ctx.beginPath(); ctx.moveTo(px(-300), pz(roadCenterZ(j))); ctx.lineTo(px(300), pz(roadCenterZ(j))); ctx.stroke(); }
  ctx.fillStyle = '#ffd94b'; if (G.prog) for (let k = 0; k < 20; k++) { /* buoy dots omitted on big map for clarity */ }
}
