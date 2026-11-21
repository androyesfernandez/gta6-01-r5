// pedestrians.js — walkers with limb-swing anim, flee state; buildPerson shared builder.
import * as THREE from 'three';
import { collideCircle } from './city.js';
import { roadCenterX, roadCenterZ } from './districts.js';
const SKIN = [0xa06a42, 0x8a5a3b, 0xc98a5e, 0x6e4526, 0xd9a878];
const SHIRT = [0xe07a3f, 0x3fa08c, 0xd95f6e, 0xe8c84b, 0x5a7ad9, 0xdadada];
export function buildPerson(colors) {
  colors = colors || {};
  const g = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: colors.skin || 0xa06a42 });
  const shirt = new THREE.MeshLambertMaterial({ color: colors.shirt || 0x3fa08c });
  const pants = new THREE.MeshLambertMaterial({ color: colors.pants || 0x2e3440 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.34), shirt); torso.position.y = 1.06; g.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.4, 0.36), skin); head.position.y = 1.66; g.add(head);
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), new THREE.MeshLambertMaterial({ color: colors.hair || 0x1a1410 })); hair.position.y = 1.9; g.add(hair);
  const mkLimb = (mat, w, h) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat); m.position.y = -h / 2; p.add(m); return p; };
  const armL = mkLimb(skin, 0.16, 0.62); armL.position.set(-0.4, 1.38, 0); g.add(armL);
  const armR = mkLimb(skin, 0.16, 0.62); armR.position.set(0.4, 1.38, 0); g.add(armR);
  const legL = mkLimb(pants, 0.2, 0.72); legL.position.set(-0.16, 0.72, 0); g.add(legL);
  const legR = mkLimb(pants, 0.2, 0.72); legR.position.set(0.16, 0.72, 0); g.add(legR);
  g.userData.limbs = { armL, armR, legL, legR };
  return g;
}
export function animatePerson(mesh, phase, amp) {
  const L = mesh.userData.limbs; if (!L) return;
  const s = Math.sin(phase) * (amp || 0.55);
  L.legL.rotation.x = s; L.legR.rotation.x = -s; L.armL.rotation.x = -s * 0.8; L.armR.rotation.x = s * 0.8;
}
export function createPedestrians(G) {
  const peds = G.peds;
  function spawnPed(x, z, opts) {
    opts = opts || {};
    const mesh = buildPerson({ skin: G.rng.pick(SKIN), shirt: opts.shirt || G.rng.pick(SHIRT), hair: 0x1a1410 });
    mesh.position.set(x, 0.25, z); G.scene.add(mesh);
    const ped = { mesh, x, z, heading: G.rng.range(0, 6.28), speed: 0, walkPhase: G.rng.range(0, 6), state: opts.state || 'walk',
      health: opts.health || 100, rival: !!opts.rival, officer: !!opts.officer, down: false, tx: x, tz: z, retarget: 0, fireCd: 0 };
    peds.push(ped); return ped;
  }
  function removePed(ped) { G.scene.remove(ped.mesh); const i = peds.indexOf(ped); if (i >= 0) peds.splice(i, 1); }
  function fleeFrom(x, z, r) { for (const p of peds) { if (!p.down && Math.hypot(p.x - x, p.z - z) < r) { p.state = 'flee'; p.fleeX = x; p.fleeZ = z; p.fleeT = 3; } } }
  function ensureCrowd(n) {
    while (peds.filter((p) => !p.rival && !p.officer).length < n) {
      const vx = roadCenterX(G.rng.int(0, 10)), hz = roadCenterZ(G.rng.int(0, 8));
      const onVert = G.rng.chance(0.5);
      spawnPed(onVert ? vx + G.rng.pick([-1, 1]) * 9 : G.rng.range(-290, 290), onVert ? G.rng.range(-230, 240) : hz + G.rng.pick([-1, 1]) * 9);
    }
  }
  const api = { spawnPed, removePed, fleeFrom, ensureCrowd, buildPerson,
    update(dt) {
      for (const p of peds) {
        if (p.down) continue;
        let targetSpeed = 0;
        if (p.state === 'flee') { p.fleeT -= dt; const a = Math.atan2(p.x - p.fleeX, p.z - p.fleeZ); p.heading = a; targetSpeed = 4.6; if (p.fleeT <= 0) p.state = 'walk'; }
        else if (p.state === 'chasePlayer' && G.playerObj) { const t = G.playerObj.pos(); p.heading = Math.atan2(t.x - p.x, t.z - p.z); targetSpeed = 3.4; }
        else { p.retarget -= dt; if (p.retarget <= 0) { p.retarget = G.rng.range(2, 6); p.heading = G.rng.range(0, 6.28); } targetSpeed = 1.5; }
        p.speed += (targetSpeed - p.speed) * Math.min(1, dt * 4);
        p.x += Math.sin(p.heading) * p.speed * dt; p.z += Math.cos(p.heading) * p.speed * dt;
        const [nx, nz] = collideCircle(G, p.x, p.z, 0.5); p.x = nx; p.z = nz;
        p.x = Math.max(-320, Math.min(600, p.x)); p.z = Math.max(-460, Math.min(330, p.z));
        p.walkPhase += dt * (2 + p.speed * 2.2);
        p.mesh.position.set(p.x, 0.25, p.z); p.mesh.rotation.y = p.heading;
        animatePerson(p.mesh, p.walkPhase, p.speed > 3 ? 0.8 : 0.5);
      }
    } };
  return api;
}
