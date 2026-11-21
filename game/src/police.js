// police.js — CPA cruiser AI: pursuit, ramming, roadblocks, foot officers.
import { nearestRoadPoint } from './districts.js';
export function createPolice(G) {
  function spawnCruiser(x, z, heading) {
    const car = G.vehicles.spawnCar('duquesa', x, z, heading || 0, 0xffffff, { police: true, driver: 'officer' });
    car.ai = { police: true }; return car;
  }
  function spawnOfficer(x, z) {
    const ped = G.pedestrians.spawnPed(x, z, { shirt: 0x2244aa, officer: true });
    ped.state = 'chasePlayer'; return ped;
  }
  function spawnRoadblock(aheadX, aheadZ, heading) {
    const units = [];
    const px = Math.cos(heading || 0), pz = -Math.sin(heading || 0);
    for (const off of [-4, 4]) {
      const car = spawnCruiser(aheadX + px * off, aheadZ + pz * off, (heading || 0) + Math.PI / 3);
      car.ai.roadblock = true; units.push(car);
      units.push(spawnOfficer(aheadX + px * (off + 2), aheadZ + pz * (off + 2)));
    }
    if (G.hud) G.hud.banner('CPA ROADBLOCK AHEAD');
    return units;
  }
  const api = { spawnCruiser, spawnOfficer, spawnRoadblock,
    driveCruiser(car, dt, tactic) {
      if (car.ai && car.ai.roadblock) { G.vehicles.stepCar(car, 0, 0, true, dt); return; }
      const w = G.wanted; if (!w) return;
      const target = w.state === 'IN SIGHT' || !w.lastSeen ? (G.playerObj ? G.playerObj.pos() : { x: car.x, z: car.z }) : { x: w.lastSeen.x, z: w.lastSeen.z };
      const dx = target.x - car.x, dz = target.z - car.z;
      const dist = Math.hypot(dx, dz);
      const wantHeading = Math.atan2(dx, dz);
      let diff = wantHeading - car.heading;
      while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      const steer = Math.max(-1, Math.min(1, -diff * 1.6));
      let throttle = dist > 8 ? 1 : 0.2;
      if (tactic === 'RAMMING' && dist < 16) throttle = 1.25;
      if (Math.abs(diff) > 2.4) throttle = -0.7; // reverse out of a bad angle
      G.vehicles.stepCar(car, throttle, steer, dist < 5 && tactic !== 'RAMMING', dt);
      if (dist < 3.6 && tactic === 'RAMMING' && G.playerObj && G.playerObj.inCar) {
        G.vehicles.damageCar(G.playerObj.inCar, 2.2); if (G.wanted) G.wanted.addHeat(2, true);
      }
    },
    update(dt) { /* per-unit driving is driven by dispatch.js */ },
    roadblockAheadOfPlayer() {
      if (!G.playerObj) return null; const p = G.playerObj.pos();
      const h = G.playerObj.inCar ? G.playerObj.inCar.heading : G.playerObj.heading;
      const snap = nearestRoadPoint(p.x + Math.sin(h) * 55, p.z + Math.cos(h) * 55);
      return { x: snap.x, z: snap.z, heading: h };
    },
  };
  return api;
}
export function spawnDispatchUnit(G, x, z) { return G.police.spawnCruiser(x, z, 0); }
