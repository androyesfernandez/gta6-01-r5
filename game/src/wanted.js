// wanted.js — stars 0-5, heat, IN SIGHT vs SEARCHING, decay, busted meter.
import * as THREE from 'three';
import { clamp } from './rng.js';
export function createWanted(G) {
  const w = { stars: 0, heat: 0, state: 'CLEAR', seen: false, lastSeen: new THREE.Vector3(-30, 0, 210), hiddenT: 0, busted: 0, freezeT: 0,
    addHeat(n, witnessed) {
      if (w.freezeT > 0) return;
      w.heat = clamp(w.heat + n * (witnessed ? 1 : 0.4), 0, 500);
      const s = w.heat >= 340 ? 5 : w.heat >= 240 ? 4 : w.heat >= 160 ? 3 : w.heat >= 90 ? 2 : w.heat >= 30 ? 1 : 0;
      if (s > w.stars) { w.stars = s; if (G.hud) G.hud.banner('WANTED — ' + s + ' STAR' + (s > 1 ? 'S' : '')); }
    },
    setStars(n) { w.stars = n; w.heat = [0, 30, 90, 160, 240, 340][n]; },
    clearWanted() { w.stars = 0; w.heat = 0; w.busted = 0; w.state = 'CLEAR'; },
    update(dt) {
      if (w.freezeT > 0) w.freezeT -= dt;
      const p = G.playerObj ? G.playerObj.pos() : { x: 0, z: 0 };
      // Line of sight: any police unit within 55 m with clear-ish view flags seen
      let seenNow = false, nearestOfficer = 1e9;
      if (G.dispatch) for (const u of G.dispatch.units) {
        if (!u.active) continue;
        const d = u.distToPlayer !== undefined ? u.distToPlayer : 1e9;
        if (d < nearestOfficer) nearestOfficer = d;
        if (d < 55) seenNow = true;
      }
      w.seen = seenNow;
      if (seenNow && w.stars > 0) { w.lastSeen.set(p.x, 0, p.z); w.state = 'IN SIGHT'; w.hiddenT = 0; }
      else if (w.stars > 0) { w.state = 'SEARCHING'; w.hiddenT += dt; if (w.hiddenT > 9) { w.heat = Math.max(0, w.heat - dt * 14); const s = w.heat >= 340 ? 5 : w.heat >= 240 ? 4 : w.heat >= 160 ? 3 : w.heat >= 90 ? 2 : w.heat >= 30 ? 1 : 0; if (s < w.stars) { w.stars = s; if (s === 0) { w.state = 'CLEAR'; if (G.hud) G.hud.banner('YOU LOST THE CPA'); } } } }
      // Busted meter: officer close while player slow / on foot
      const slow = !G.playerObj || !G.playerObj.inCar || Math.abs(G.playerObj.inCar.speed) < 3;
      if (w.stars > 0 && nearestOfficer < 6 && slow) { w.busted += dt / 2.4; if (G.playerObj && G.playerObj.inCar) w.busted += dt / 3; }
      else w.busted = Math.max(0, w.busted - dt * 0.7);
      if (w.busted >= 1 && G.mode === 'play') { G.mode = 'busted'; if (G.prog) { G.prog.stats.busts++; G.economy && G.economy.spend(Math.min(500, G.prog.cash)); } if (G.menu) G.menu.showBusted(); }
      if (G.audio && w.stars > 0 && nearestOfficer < 45) G.audio.siren();
    },
  };
  return w;
}
export function escalateWanted(G, n) { if (G.wanted) G.wanted.addHeat(n, true); }
