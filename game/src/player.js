// player.js — on-foot Ruy: movement, enter/exit cars, carjack, health/armour, respawn.
import { buildPerson, animatePerson } from './pedestrians.js';
import { collideCircle } from './city.js';
import { CHARACTERS } from './story.js';
import { clamp } from './rng.js';
export function createPlayer(G) {
  const ch = CHARACTERS.ruy;
  const mesh = buildPerson({ skin: ch.skin, hair: ch.hair, shirt: ch.shirt });
  mesh.position.set(-30, 0.25, 210); G.scene.add(mesh);
  const player = { mesh, x: -30, z: 210, heading: 0, walkPhase: 0, health: 100, armour: 50, inCar: null, speedNow: 0,
    pos() { if (player.inCar) return { x: player.inCar.x, z: player.inCar.z }; return { x: player.x, z: player.z }; },
    speedKmh() { if (player.inCar) return Math.abs(player.inCar.speed) * 3.6; return player.speedNow * 3.6; },
  };
  function hurt(amount) {
    if (player.armour > 0) { const absorbed = Math.min(player.armour, amount * 0.7); player.armour -= absorbed; amount -= absorbed; }
    player.health -= amount;
    if (G.particles) { const p = player.pos(); G.particles.impact(p.x, 1.2, p.z); }
    if (player.health <= 0 && G.mode === 'play') { G.mode = 'wasted'; if (G.prog) G.prog.stats.wasted++; if (G.menu) G.menu.showWasted(); if (G.audio) G.audio.gunshot(); }
  }
  function heal(n) { player.health = clamp(player.health + n, 0, 100); }
  function respawn() {
    player.health = 100; player.inCar = null; player.x = -30; player.z = 210; player.heading = 0;
    mesh.visible = true; mesh.position.set(player.x, 0.25, player.z);
    if (G.wanted) G.wanted.clearWanted(); G.mode = 'play'; if (G.menu) G.menu.hideOverlays();
  }
  function enterCar(car) {
    player.inCar = car; car.isPlayer = true; mesh.visible = false;
    if (car.driver === 'traffic') { car.driver = null; }
    if (G.audio) G.audio.blip();
  }
  function exitCar() {
    if (!player.inCar) return; const car = player.inCar; car.isPlayer = false; player.inCar = null;
    player.x = car.x + Math.cos(car.heading) * 2.2; player.z = car.z - Math.sin(car.heading) * 2.2;
    mesh.visible = true; mesh.position.set(player.x, 0.25, player.z);
  }
  function tryEnterExit() {
    if (player.inCar) { exitCar(); return; }
    const car = G.vehicles.nearestCar(player.x, player.z, 5);
    if (!car) return;
    if (car.driver) { // carjack: pull the driver out, driver ped flees
      const d = G.pedestrians.spawnPed(car.x + 2, car.z, {}); d.state = 'flee'; d.fleeX = car.x; d.fleeZ = car.z; d.fleeT = 4;
      car.driver = null; if (G.prog) G.prog.stats.stolen++;
      if (G.hud) G.hud.banner('VEHICLE STOLEN — ' + car.model.name);
      if (G.wanted) G.wanted.addHeat(22, true); if (G.audio) G.audio.blip();
    }
    enterCar(car);
  }
  const api = { player, hurt, heal, respawn, enterCar, exitCar, tryEnterExit,
    update(dt) {
      const input = G.input;
      if (player.inCar) {
        const car = player.inCar;
        const th = (input.isDown('KeyW') || input.isDown('ArrowUp') ? 1 : 0) + (input.isDown('KeyS') || input.isDown('ArrowDown') ? -1 : 0);
        const st = (input.isDown('KeyA') || input.isDown('ArrowLeft') ? 1 : 0) + (input.isDown('KeyD') || input.isDown('ArrowRight') ? -1 : 0);
        let boost = 1;
        if (G.crew && G.crew.boostT > 0) boost = 1.7;
        G.vehicles.stepCar(car, th * boost, st, input.isDown('Space'), dt);
        player.x = car.x; player.z = car.z; player.heading = car.heading;
        if (input.wasPressed('KeyF') || input.wasPressed('Enter')) tryEnterExit();
        if (G.audio) G.audio.engine(Math.abs(car.speed) / 50);
        return;
      }
      const yaw = G.cameraRig ? G.cameraRig.yaw : 0;
      let mx = 0, mz = 0;
      if (input.isDown('KeyW') || input.isDown('ArrowUp')) mz += 1;
      if (input.isDown('KeyS') || input.isDown('ArrowDown')) mz -= 1;
      if (input.isDown('KeyA') || input.isDown('ArrowLeft')) mx -= 1;
      if (input.isDown('KeyD') || input.isDown('ArrowRight')) mx += 1;
      const run = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
      const mag = Math.hypot(mx, mz);
      player.speedNow = mag > 0 ? (run ? 6.4 : 3.4) : 0;
      if (mag > 0) {
        const a = Math.atan2(mx, mz) + yaw;
        player.heading = a;
        player.x += Math.sin(a) * player.speedNow * dt; player.z += Math.cos(a) * player.speedNow * dt;
        const [nx, nz] = collideCircle(G, player.x, player.z, 0.5); player.x = nx; player.z = nz;
        player.walkPhase += dt * (run ? 11 : 7);
      }
      mesh.position.set(player.x, 0.25, player.z); mesh.rotation.y = player.heading;
      animatePerson(mesh, player.walkPhase, mag > 0 ? 0.55 : 0.04);
      if (input.wasPressed('KeyF') || input.wasPressed('Enter')) tryEnterExit();
    } };
  G.playerObj = player;
  return api;
}
