// collectibles.js — 20 golden buoys: rotating markers, collect radius, payout each 5.
export function createCollectibles(G) {
  const api = {
    update(dt) {
      if (!G.city || !G.playerObj) return;
      const p = G.playerObj.pos();
      G.city.buoys.forEach((mesh, i) => {
        if (G.prog.buoysFound.includes(i)) { mesh.visible = false; return; }
        mesh.rotation.y += dt * 2; mesh.position.y = 0.6 + Math.sin(G.clock.elapsedTime * 2 + i) * 0.25;
        const pos = G.city.buoyPos[i];
        if (Math.hypot(p.x - pos.x, p.z - pos.z) < 6) {
          G.prog.buoysFound.push(i); mesh.visible = false;
          if (G.audio) G.audio.chime(); if (G.particles) G.particles.spray(pos.x, 1, pos.z);
          if (G.hud) G.hud.banner('GOLDEN BUOY ' + G.prog.buoysFound.length + '/20');
          if (G.prog.buoysFound.length % 5 === 0 && G.economy) G.economy.add(1000, 'BUOY SET BONUS');
          if (G.reputation) G.reputation.addRespect(10);
        }
      });
    },
  };
  return api;
}
