// traffic.js — ambient traffic on road lanes, turns at intersections, keep >=14 alive.
import { roadCenterX, roadCenterZ, COLS, ROWS } from './districts.js';
import { CAR_MODELS } from './carmodels.js';
const COLORS = [0xc0392b, 0xdadada, 0x3fa08c, 0xe8b04b, 0x5a7ad9, 0x888888, 0xe07a3f];
export function createTraffic(G) {
  const lanes = [];
  function spawnTrafficCar(nearPlayer) {
    const vertical = G.rng.chance(0.5);
    const line = vertical ? roadCenterX(G.rng.int(0, COLS)) : roadCenterZ(G.rng.int(0, ROWS));
    const dir = G.rng.pick([-1, 1]);
    const along = nearPlayer && G.playerObj ? G.rng.range(-60, 60) : G.rng.range(-220, 220);
    const p = G.playerObj ? G.playerObj.pos() : { x: 0, z: 0 };
    const x = vertical ? line + dir * 3 : Math.max(-290, Math.min(290, p.x + along));
    const z = vertical ? Math.max(-230, Math.min(230, p.z + along)) : line + dir * 3;
    const heading = vertical ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    // heading convention: 0 = +z, PI/2 = +x
    const h = vertical ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    const model = G.rng.pick(CAR_MODELS);
    const car = G.vehicles.spawnCar(model.id, x, z, h, G.rng.pick(COLORS), { driver: 'traffic' });
    car.ai = { traffic: true, cruise: G.rng.range(9, 14) };
    return car;
  }
  const api = { spawnTrafficCar,
    ensure(n) { const alive = G.cars.filter((c) => c.ai && c.ai.traffic && !c.isPlayer).length; for (let i = alive; i < n; i++) spawnTrafficCar(true); },
    update(dt) {
      api.ensure(14);
      for (const car of G.cars) {
        if (!car.ai || !car.ai.traffic || car.isPlayer) continue;
        // Brake when a car is close ahead
        let throttle = 0.6, blocked = false;
        const fx = car.x + Math.sin(car.heading) * 7, fz = car.z + Math.cos(car.heading) * 7;
        for (const o of G.cars) { if (o !== car && Math.hypot(o.x - fx, o.z - fz) < 4) blocked = true; }
        if (blocked) throttle = -0.4;
        if (car.speed < car.ai.cruise) throttle = Math.max(throttle, 0.5); else throttle = Math.min(throttle, 0);
        // Turn choice near intersections
        const gx = Math.round((car.x + 300) / 60), gz = Math.round((car.z + 240) / 60);
        const nearIx = Math.abs(car.x - roadCenterX(Math.max(0, Math.min(10, gx)))) < 3 && Math.abs(car.z - roadCenterZ(Math.max(0, Math.min(8, gz)))) < 3;
        if (nearIx && G.rng.chance(0.012)) car.heading += G.rng.pick([-1, 1]) * Math.PI / 2;
        // Keep inside the city: U-turn at edges
        if (car.x < -305 || car.x > 305 || car.z < -245 || car.z > 250) car.heading += Math.PI;
        G.vehicles.stepCar(car, throttle, 0, blocked && car.speed > 2, dt);
        // Despawn far traffic, respawn near player
        if (G.playerObj) { const p = G.playerObj.pos(); if (Math.hypot(car.x - p.x, car.z - p.z) > 420) { G.vehicles.removeCar(car); spawnTrafficCar(true); } }
      }
    } };
  return api;
}
