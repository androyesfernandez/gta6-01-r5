// city.js — buildCity(G): ground, roads, buildings, palms, lamps, market, pier, sea, causeway, ramps, buoys.
import * as THREE from 'three';
import { PITCH, ROAD_W, COLS, ROWS, roadCenterX, roadCenterZ, blockRect, DISTRICTS, ISLAND, CAUSEWAY, MARKET_PLAZA, GARAGE_POS } from './districts.js';
function mat(color) { return new THREE.MeshLambertMaterial({ color }); }
function addBox(scene, w, h, d, color, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z); if (ry) m.rotation.y = ry; scene.add(m); return m;
}
function windowTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#20242c'; g.fillRect(0, 0, 64, 128);
  for (let y = 6; y < 122; y += 12) for (let x = 6; x < 58; x += 12) { g.fillStyle = Math.random() > 0.45 ? '#ffd97a' : '#3a4a5a'; g.fillRect(x, y, 7, 8); }
  const t = new THREE.CanvasTexture(c); return t;
}
function textSprite(text, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 80; const g = c.getContext('2d');
  g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillStyle = color || '#ffd97a';
  g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 6; g.strokeText(text, 256, 52); g.fillText(text, 256, 52);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  s.scale.set(36, 5.6, 1); return s;
}
export function buildCity(G) {
  const scene = G.scene, rng = G.rng;
  const colliders = [], ramps = [], buoyPos = [];
  // Ground: mainland + island + beach + sea
  addBox(scene, 660, 1, 540, 0x8a7a5e, 0, -0.5, 0);
  addBox(scene, 300, 1, 300, 0x8a7a5e, ISLAND.cx + 20, -0.5, ISLAND.cz);
  addBox(scene, 700, 0.6, 60, 0xe8d9a0, 0, -0.2, 268); // beach strip
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1600, 900), new THREE.MeshLambertMaterial({ color: 0x1d6e8a }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(200, -0.6, 700); scene.add(sea); G.citySea = sea;
  const sea2 = new THREE.Mesh(new THREE.PlaneGeometry(700, 1400), new THREE.MeshLambertMaterial({ color: 0x1d6e8a }));
  sea2.rotation.x = -Math.PI / 2; sea2.position.set(800, -0.6, 0); scene.add(sea2);
  // Roads: dark strips along grid lines
  for (let i = 0; i <= COLS; i++) addBox(scene, ROAD_W, 0.12, ROWS * PITCH + ROAD_W, 0x2e2e33, roadCenterX(i), 0.02, 0);
  for (let j = 0; j <= ROWS; j++) addBox(scene, COLS * PITCH + ROAD_W, 0.12, ROAD_W, 0x2e2e33, 0, 0.02, roadCenterZ(j));
  for (let i = 0; i <= 4; i++) addBox(scene, ROAD_W, 0.12, 190, 0x2e2e33, 380 + i * 60, 0.02, ISLAND.cz);
  for (let j = 0; j <= 3; j++) addBox(scene, 260, 0.12, ROAD_W, 0x2e2e33, ISLAND.cx + 20, 0.02, ISLAND.cz - 60 + j * 60);
  addBox(scene, CAUSEWAY.x1 - CAUSEWAY.x0 + 30, 0.5, CAUSEWAY.width + 6, 0x6e6e72, (CAUSEWAY.x0 + CAUSEWAY.x1) / 2, 0.1, CAUSEWAY.z); // causeway deck
  // Sidewalk slabs per block + buildings
  const winTex = windowTexture();
  for (let col = 0; col < COLS; col++) for (let row = 0; row < ROWS; row++) {
    const r = blockRect(col, row);
    addBox(scene, r.w + 4, 0.3, r.d + 4, 0xb8a888, r.cx, 0.12, r.cz);
    const dist = DISTRICTS.find((d) => r.cx >= d.x0 && r.cx <= d.x1 && r.cz >= d.z0 && r.cz <= d.z1) || DISTRICTS[3];
    const tall = dist.name === 'PUERTO ALTO';
    const n = rng.int(2, 3);
    for (let k = 0; k < n; k++) {
      const bw = rng.range(12, 20), bd = rng.range(12, 20);
      const bx = r.cx + rng.range(-10, 10), bz = r.cz + rng.range(-10, 10);
      const bh = tall ? rng.range(22, 52) : rng.range(7, 20);
      const color = rng.pick(dist.palette);
      const useWin = bh > 16;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), useWin ? new THREE.MeshLambertMaterial({ color, emissive: 0xffca6a, emissiveMap: winTex, emissiveIntensity: 0.55 }) : mat(color));
      mesh.position.set(bx, bh / 2 + 0.25, bz); scene.add(mesh);
      addBox(scene, bw + 1, 1, bd + 1, dist.roof, bx, bh + 0.6, bz);
      colliders.push({ x0: bx - bw / 2, x1: bx + bw / 2, z0: bz - bd / 2, z1: bz + bd / 2 });
    }
  }
  // Island buildings
  for (let k = 0; k < 10; k++) {
    const bx = ISLAND.cx + rng.range(-100, 130), bz = ISLAND.cz + rng.range(-70, 80);
    if (Math.abs((bx - ISLAND.cx) % 60) < 10) continue;
    const bh = rng.range(6, 16), color = rng.pick(DISTRICTS[4].palette);
    addBox(scene, 16, bh, 16, color, bx, bh / 2, bz);
    colliders.push({ x0: bx - 8, x1: bx + 8, z0: bz - 8, z1: bz + 8 });
  }
  // Palms + lamps along roads
  const palmTrunk = new THREE.CylinderGeometry(0.22, 0.3, 5, 6), palmMat = mat(0x7a5a3a), leafMat = mat(0x2e8a4f);
  const leafGeo = new THREE.ConeGeometry(3.2, 1.6, 7);
  for (let k = 0; k < 130; k++) {
    const onX = rng.chance(0.5);
    const x = onX ? roadCenterX(rng.int(0, COLS)) + rng.pick([-1, 1]) * 9 : rng.range(-300, 300);
    const z = onX ? rng.range(-240, 250) : roadCenterZ(rng.int(0, ROWS)) + rng.pick([-1, 1]) * 9;
    const trunk = new THREE.Mesh(palmTrunk, palmMat); trunk.position.set(x, 2.5, z); scene.add(trunk);
    const leaf = new THREE.Mesh(leafGeo, leafMat); leaf.position.set(x, 5.4, z); scene.add(leaf);
  }
  const lampGeo = new THREE.CylinderGeometry(0.09, 0.09, 5.5, 5), lampMat = mat(0x333338);
  const glowMat = new THREE.SpriteMaterial({ color: 0xffc46a, transparent: true, opacity: 0.85 });
  const lampGlows = [];
  for (let i = 0; i <= COLS; i += 2) for (let j = 0; j <= ROWS; j += 2) {
    const pole = new THREE.Mesh(lampGeo, lampMat); pole.position.set(roadCenterX(i) + 8, 2.75, roadCenterZ(j) + 8); scene.add(pole);
    const s = new THREE.Sprite(glowMat); s.position.set(roadCenterX(i) + 8, 5.6, roadCenterZ(j) + 8); s.scale.set(4, 4, 1); scene.add(s); lampGlows.push(s);
  }
  // Market stalls + plaza in EL MERCADO
  addBox(scene, 52, 0.35, 52, 0xd9c9a0, MARKET_PLAZA.x, 0.15, MARKET_PLAZA.z);
  const stallCols = [0xe07a3f, 0x3fa08c, 0xd95f6e, 0xe8c84b];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, sx = MARKET_PLAZA.x + Math.cos(a) * 20, sz = MARKET_PLAZA.z + Math.sin(a) * 20;
    addBox(scene, 5, 2.2, 3, 0x8a6a4a, sx, 1.1, sz);
    addBox(scene, 6, 0.3, 4, stallCols[k % 4], sx, 2.6, sz);
    colliders.push({ x0: sx - 2.5, x1: sx + 2.5, z0: sz - 1.5, z1: sz + 1.5 });
  }
  // Ferry pier
  addBox(scene, 10, 1, 46, 0x6e5a44, 60, 0.4, 292);
  addBox(scene, 16, 4, 10, 0xdadada, 60, 2, 322);
  // District signs
  for (const d of DISTRICTS) { const s = textSprite(d.name); s.position.set((d.x0 + d.x1) / 2, 26, (d.z0 + d.z1) / 2); scene.add(s); }
  // Stunt ramps (6)
  const rampSpots = [[-270, 30, 0], [-30, -90, 1], [90, 30, 2], [210, -150, 3], [-150, 210, 0], [450, -330, 1]];
  const rampGeo = new THREE.BoxGeometry(6, 2.2, 9);
  for (const [rx, rz, dir] of rampSpots) {
    const m = new THREE.Mesh(rampGeo, mat(0xe07a3f)); m.position.set(rx, 1.0, rz); m.rotation.x = -0.32; m.rotation.y = dir * Math.PI / 2; scene.add(m);
    ramps.push({ x: rx, z: rz, dir });
  }
  // Golden buoys (20) along beach + causeway water edge
  const buoyGeo = new THREE.OctahedronGeometry(1.1);
  const buoys = [];
  for (let k = 0; k < 20; k++) {
    const onCauseway = k >= 14;
    const bx = onCauseway ? 305 + (k - 14) * 14 : -280 + k * 42;
    const bz = onCauseway ? CAUSEWAY.z + (k % 2 ? 16 : -16) : 292 + (k % 3) * 8;
    const m = new THREE.Mesh(buoyGeo, new THREE.MeshBasicMaterial({ color: 0xffd94b }));
    m.position.set(bx, 0.6, bz); scene.add(m); buoys.push(m); buoyPos.push({ x: bx, z: bz });
  }
  // Garage marker building
  addBox(scene, 18, 7, 14, 0x3fa08c, GARAGE_POS.x, 3.5, GARAGE_POS.z);
  const gs = textSprite('GARAGE', '#7ae8d9'); gs.position.set(GARAGE_POS.x, 10, GARAGE_POS.z); scene.add(gs);
  colliders.push({ x0: GARAGE_POS.x - 9, x1: GARAGE_POS.x + 9, z0: GARAGE_POS.z - 7, z1: GARAGE_POS.z + 7 });
  G.city = { colliders, ramps, buoys, buoyPos, lampGlows, garagePos: GARAGE_POS, marketPlaza: MARKET_PLAZA, pierPos: { x: 60, z: 300 } };
  return G.city;
}
export function collideCircle(G, x, z, r) {
  // Push a circle out of building AABBs; returns corrected [x,z].
  for (const c of G.city.colliders) {
    if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) {
      const dxl = x - (c.x0 - r), dxr = (c.x1 + r) - x, dzl = z - (c.z0 - r), dzr = (c.z1 + r) - z;
      const m = Math.min(dxl, dxr, dzl, dzr);
      if (m === dxl) x = c.x0 - r; else if (m === dxr) x = c.x1 + r; else if (m === dzl) z = c.z0 - r; else z = c.z1 + r;
    }
  }
  return [x, z];
}
