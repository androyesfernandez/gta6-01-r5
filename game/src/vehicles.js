// vehicles.js — createVehicles: spawnCar, arcade car physics, collisions, damage, enter/exit hooks.
import * as THREE from 'three';
import { CAR_MODELS, modelById, buildPoliceCruiser } from './carmodels.js';
import { collideCircle } from './city.js';
import { clamp } from './rng.js';
export function createVehicles(G) {
  const cars = G.cars;
  let smokeTimer = 0;
  function spawnCar(modelId, x, z, heading, color, opts) {
    opts = opts || {};
    const model = modelById(modelId);
    const mesh = opts.police ? buildPoliceCruiser(THREE) : model.build(THREE, color || 0xc0392b);
    mesh.position.set(x, 0.1, z); mesh.rotation.y = heading || 0; G.scene.add(mesh);
    const car = { mesh, model, modelId, x, z, heading: heading || 0, speed: 0, steer: 0, vy: 0, y: 0.1,
      condition: opts.condition !== undefined ? opts.condition : 100, police: !!opts.police, driver: opts.driver || null,
      isPlayer: false, ai: null, lightPhase: Math.random() * 6, airborne: false, rampBoost: 0 };
    cars.push(car); return car;
  }
  function removeCar(car) { G.scene.remove(car.mesh); const i = cars.indexOf(car); if (i >= 0) cars.splice(i, 1); }
  function damageCar(car, amount) {
    car.condition = Math.max(0, car.condition - amount);
    if (G.particles) G.particles.impact(car.x, 1, car.z);
  }
  function stepCar(car, throttle, steerIn, brake, dt) {
    const eng = (G.prog && car.isPlayer) ? 1 + (G.prog.garage.engineTier || 0) * 0.12 : 1;
    const top = car.model.topSpeed * eng * (0.45 + 0.55 * car.condition / 100);
    if (throttle > 0) car.speed += car.model.accel * eng * throttle * dt * (1 - Math.max(0, car.speed) / (top + 8));
    else if (throttle < 0) car.speed += car.model.accel * 0.7 * throttle * dt;
    if (brake) car.speed -= Math.sign(car.speed) * Math.min(Math.abs(car.speed), 26 * dt);
    car.speed -= car.speed * 0.35 * dt; // drag
    car.speed = clamp(car.speed, -12, top + 14);
    car.steer += ((steerIn || 0) - car.steer) * Math.min(1, dt * 8);
    if (Math.abs(car.speed) > 0.2) car.heading -= car.steer * car.model.grip * 0.42 * dt * Math.sign(car.speed) * Math.min(1, Math.abs(car.speed) / 8);
    // Ramp launch: inside a ramp zone at speed -> airborne arc
    if (G.city && car.y <= 0.11) for (const r of G.city.ramps) {
      if (Math.hypot(car.x - r.x, car.z - r.z) < 5 && Math.abs(car.speed) > 16) { car.vy = 6.5; car.airborne = true; car.airStartX = car.x; car.airStartZ = car.z; }
    }
    car.x += Math.sin(car.heading) * car.speed * dt;
    car.z += Math.cos(car.heading) * car.speed * dt;
    if (car.airborne || car.y > 0.11) {
      car.y += car.vy * dt; car.vy -= 18 * dt;
      if (car.y <= 0.1) { car.y = 0.1; car.vy = 0; if (car.airborne) { car.airborne = false; if (G.stunts) G.stunts.onLanding(car); } }
    }
    const [nx, nz] = collideCircle(G, car.x, car.z, 1.6);
    if (nx !== car.x || nz !== car.z) { if (Math.abs(car.speed) > 9) damageCar(car, Math.abs(car.speed) * 0.35); car.speed *= 0.4; car.x = nx; car.z = nz; }
    car.x = clamp(car.x, -330, 620); car.z = clamp(car.z, -480, 340);
    // Car-car soft separation
    for (const o of cars) { if (o === car) continue; const d = Math.hypot(car.x - o.x, car.z - o.z);
      if (d > 0.01 && d < 3.4) { const push = (3.4 - d) * 0.5; car.x += (car.x - o.x) / d * push; car.z += (car.z - o.z) / d * push;
        if (Math.abs(car.speed) > 12 && Math.abs(o.speed) < 4) { damageCar(car, 3); damageCar(o, 4); if (G.wanted) G.wanted.addHeat(6, true); } } }
    car.mesh.position.set(car.x, car.y, car.z); car.mesh.rotation.y = car.heading;
    car.mesh.rotation.z = -car.steer * 0.05 * Math.min(1, Math.abs(car.speed) / 20);
    if (car.police) { car.lightPhase += dt * 9; const on = Math.sin(car.lightPhase) > 0;
      car.mesh.traverse((m) => { if (m.name === 'lightbar') m.material.color.setHex(on ? 0x3355ff : 0x112266); if (m.name === 'lightbar2') m.material.color.setHex(on ? 0x551122 : 0xff3344); }); }
    if (car.isPlayer && G.prog) { const kmh = Math.abs(car.speed) * 3.6; if (kmh > G.prog.stats.topSpeed) G.prog.stats.topSpeed = Math.round(kmh); }
    return car;
  }
  const api = { spawnCar, removeCar, damageCar, stepCar,
    nearestCar(x, z, maxD) { let best = null, bd = maxD || 6; for (const c of cars) { const d = Math.hypot(c.x - x, c.z - z); if (d < bd) { bd = d; best = c; } } return best; },
    update(dt) { smokeTimer -= dt; if (smokeTimer <= 0) { smokeTimer = 0.12; if (G.particles) for (const c of cars) if (c.condition < 45) G.particles.smoke(c.x, 1.2, c.z); } },
  };
  return api;
}
export { CAR_MODELS };
