// particles.js — pooled sprite particles: impacts, car smoke, sea spray.
import * as THREE from 'three';
export function createParticles(G) {
  const MAX = 300;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.9 }));
  points.frustumCulled = false; G.scene.add(points);
  const pool = [];
  for (let i = 0; i < MAX; i++) { pool.push({ life: 0, vx: 0, vy: 0, vz: 0, max: 1 }); pos[i * 3 + 1] = -50; }
  let head = 0;
  function burst(x, y, z, n, colorHex, speed, life, up) {
    const c = new THREE.Color(colorHex);
    for (let k = 0; k < n; k++) {
      const i = head; head = (head + 1) % MAX; const p = pool[i];
      p.life = life * (0.6 + G.rng.next() * 0.7); p.max = p.life;
      p.vx = (G.rng.next() - 0.5) * speed; p.vz = (G.rng.next() - 0.5) * speed; p.vy = G.rng.next() * (up || 2);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
  }
  const api = {
    points, burst,
    impact(x, y, z) { burst(x, y, z, 8, 0xffca6a, 5, 0.4, 2); },
    smoke(x, y, z) { burst(x, y, z, 2, 0x555555, 1, 1.4, 3); },
    spray(x, y, z) { burst(x, y, z, 5, 0xbfeef2, 3, 0.6, 3); },
    confetti(x, y, z) { burst(x, y, z, 18, 0xffd94b, 7, 1.0, 5); },
    update(dt) {
      for (let i = 0; i < MAX; i++) { const p = pool[i]; if (p.life <= 0) continue; p.life -= dt;
        if (p.life <= 0) { pos[i * 3 + 1] = -50; continue; }
        pos[i * 3] += p.vx * dt; pos[i * 3 + 1] += p.vy * dt; pos[i * 3 + 2] += p.vz * dt; p.vy -= 2 * dt; }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    },
  };
  return api;
}
