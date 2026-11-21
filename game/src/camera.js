// camera.js — camera rig: foot follow-orbit, car chase with FOV kick, aerial title orbit, fixed shot cams.
import * as THREE from 'three';
import { clamp, lerp, angleLerp } from './rng.js';
export function createCamera(G) {
  const rig = { yaw: 0, pitch: 0.32, dist: 9, mode: 'follow', fixedPos: null, fixedLook: null, fovKick: 0,
    update(dt) {
      if (G.shotName === 'cover') return; // cover shot: updateShot in shots.js owns the chase camera
      const cam = G.camera, input = G.input;
      if (rig.mode === 'fixed' && rig.fixedPos) { cam.position.lerp(rig.fixedPos, 0.2); cam.lookAt(rig.fixedLook); return; }
      if (rig.mode === 'aerial') {
        const t = G.clock.elapsedTime * 0.05;
        cam.position.set(Math.cos(t) * 260, 120, Math.sin(t) * 260 + 40);
        cam.lookAt(40, 0, 0); cam.fov = 55; cam.updateProjectionMatrix(); return;
      }
      const orbit = input.consumeOrbit(); rig.yaw -= orbit.dx * 0.005; rig.pitch = clamp(rig.pitch + orbit.dy * 0.004, 0.05, 1.1);
      const p = G.playerObj; if (!p) return;
      const target = p.pos();
      let wantDist = 9, height = 3.2, lookAhead = 0;
      if (p.inCar) {
        rig.yaw = angleLerp(rig.yaw, p.inCar.heading + Math.PI, Math.min(1, dt * 1.6));
        const kmh = Math.abs(p.inCar.speed) * 3.6;
        wantDist = 10 + kmh * 0.05; height = 3.6; lookAhead = 6;
        rig.fovKick = lerp(rig.fovKick, clamp((kmh - 60) / 90, 0, 1) * 14, dt * 3);
      } else rig.fovKick = lerp(rig.fovKick, 0, dt * 3);
      cam.fov = 62 + rig.fovKick; cam.updateProjectionMatrix();
      rig.dist = lerp(rig.dist, wantDist, dt * 3);
      const bx = target.x - Math.sin(rig.yaw) * Math.cos(rig.pitch) * rig.dist;
      const bz = target.z - Math.cos(rig.yaw) * Math.cos(rig.pitch) * rig.dist;
      const by = height + Math.sin(rig.pitch) * rig.dist;
      cam.position.lerp(new THREE.Vector3(bx, Math.max(1.2, by), bz), Math.min(1, dt * 6));
      cam.lookAt(target.x + Math.sin(p.heading || 0) * lookAhead * 0.2, 1.6, target.z + Math.cos(p.heading || 0) * lookAhead * 0.2);
    },
    setFixed(pos, look) { rig.mode = 'fixed'; rig.fixedPos = pos; rig.fixedLook = look; },
    setFollow() { rig.mode = 'follow'; rig.fixedPos = null; },
    setAerial() { rig.mode = 'aerial'; },
  };
  return rig;
}
