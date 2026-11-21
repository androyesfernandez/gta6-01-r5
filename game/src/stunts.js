// stunts.js — 6 ramp jumps: airborne distance measured on landing, counted once each.
export function createStunts(G) {
  const stunts = {
    onLanding(car) {
      if (!car.isPlayer || !G.city) return;
      let best = -1, bd = 1e9;
      G.city.ramps.forEach((r, i) => { const d = Math.hypot(car.airStartX - r.x, car.airStartZ - r.z); if (d < bd) { bd = d; best = i; } });
      if (best < 0 || bd > 9) return;
      const dist = Math.hypot(car.x - car.airStartX, car.z - car.airStartZ);
      if (dist < 6) return;
      if (!G.prog.stuntsDone.includes(best)) { G.prog.stuntsDone.push(best); if (G.economy) G.economy.add(600, 'STUNT JUMP ' + (best + 1) + '/6 — ' + Math.round(dist) + ' m'); if (G.reputation) G.reputation.addRespect(30); if (G.particles) G.particles.confetti(car.x, 2, car.z); }
      else if (G.hud) G.hud.banner('JUMP — ' + Math.round(dist) + ' m');
    },
    update() { /* landing hook is called from vehicles.js */ },
  };
  return stunts;
}
