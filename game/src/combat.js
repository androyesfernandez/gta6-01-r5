// combat.js — hitscan shooting, tracers, muzzle flash, rival shooters, WASTED trigger support.
import * as THREE from 'three';
export function createCombat(G) {
  const tracers = [];
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffdf7a, transparent: true, opacity: 0 }));
  flash.scale.set(1.6, 1.6, 1); G.scene.add(flash);
  function tracer(from, to, colorHex) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: colorHex || 0xffe9a0, transparent: true, opacity: 0.95 }));
    G.scene.add(line); tracers.push({ line, life: 0.12 });
  }
  function playerShoot() {
    const w = G.weaponsState; if (!w || !w.tryFire(0)) return;
    const p = G.playerObj; if (!p) return;
    const pos = p.pos(); const yaw = G.cameraRig ? G.cameraRig.yaw + Math.PI : p.heading;
    const origin = new THREE.Vector3(pos.x, 1.5, pos.z);
    const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const weapon = w.current();
    flash.position.copy(origin).addScaledVector(dir, 0.8); flash.material.opacity = 0.95;
    if (G.audio) G.audio.gunshot();
    if (G.pedestrians) G.pedestrians.fleeFrom(pos.x, pos.z, 22);
    if (G.wanted) G.wanted.addHeat(10, true);
    // Nearest rival / ped / car inside range + cone
    let best = null, bd = weapon.range;
    for (const ped of G.peds) { if (ped.down) continue; const d = Math.hypot(ped.x - pos.x, ped.z - pos.z);
      if (d < bd) { const a = Math.atan2(ped.x - pos.x, ped.z - pos.z); let diff = Math.abs(a - yaw); if (diff > Math.PI) diff = Math.PI * 2 - diff; if (diff < 0.45) { bd = d; best = ped; } } }
    const end = origin.clone().addScaledVector(dir, best ? bd : weapon.range);
    tracer(origin, end, 0xffe9a0);
    if (best) { hurtPed(best, weapon.damage); if (G.particles) G.particles.impact(best.x, 1.2, best.z); }
  }
  function hurtPed(ped, dmg) {
    ped.health -= dmg;
    if (ped.health <= 0 && !ped.down) { ped.down = true; ped.mesh.rotation.x = Math.PI / 2; ped.mesh.position.y = 0.5; ped.state = 'down';
      if (ped.rival && G.missions) G.missions.onRivalDown(ped); if (G.wanted) G.wanted.addHeat(16, true); }
    else if (!ped.down) { ped.state = 'flee'; ped.fleeX = G.playerObj.pos().x; ped.fleeZ = G.playerObj.pos().z; ped.fleeT = 2.5; }
  }
  function rivalShoot(ped, dt) {
    ped.fireCd -= dt; if (ped.fireCd > 0 || ped.down) return;
    const p = G.playerObj.pos(); const d = Math.hypot(ped.x - p.x, ped.z - p.z);
    if (d > 42) return; ped.fireCd = 0.9 + G.rng.next() * 0.7;
    tracer(new THREE.Vector3(ped.x, 1.4, ped.z), new THREE.Vector3(p.x, 1.2, p.z), 0xff7a5a);
    if (G.audio) G.audio.gunshot();
    if (G.rng.chance(0.45)) G.playerSys.hurt(6 + G.rng.next() * 6);
  }
  const api = { tracer, playerShoot, hurtPed, rivalShoot,
    spawnRival(x, z) { const ped = G.pedestrians.spawnPed(x, z, { shirt: 0x8a2e3a, rival: true, health: 60 }); ped.state = 'fight'; return ped; },
    update(dt) {
      flash.material.opacity = Math.max(0, flash.material.opacity - dt * 8);
      for (let i = tracers.length - 1; i >= 0; i--) { tracers[i].life -= dt; tracers[i].line.material.opacity = Math.max(0, tracers[i].life / 0.12); if (tracers[i].life <= 0) { G.scene.remove(tracers[i].line); tracers.splice(i, 1); } }
      if (G.mode === 'play' && G.input && G.input.isMouseDown() && G.playerObj && !G.playerObj.inCar) playerShoot();
      for (const ped of G.peds) if (ped.rival && ped.state === 'fight') rivalShoot(ped, dt);
    } };
  return api;
}
