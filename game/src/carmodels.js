// carmodels.js — 7 original car models: low-poly builders + performance data.
import * as THREE from 'three';
function box(w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); return m;
}
function wheel(x, z) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
  m.rotation.z = Math.PI / 2; m.position.set(x, 0.34, z); return m;
}
function buildCar(color, opts) {
  const g = new THREE.Group();
  const L = opts.len, W = opts.wid;
  g.add(box(W, 0.5, L, color, 0, 0.55, 0));
  g.add(box(W * 0.86, 0.42, L * 0.48, opts.cabinColor || 0x22303a, 0, 1.0, opts.cabinZ || -0.1));
  g.add(box(W * 0.9, 0.18, L * 0.2, color, 0, 0.72, L * 0.38));
  if (opts.spoiler) g.add(box(W * 0.95, 0.1, 0.3, 0x222222, 0, 1.05, -L * 0.46));
  if (opts.stripe) g.add(box(W * 0.3, 0.06, L * 0.96, opts.stripe, 0, 0.83, 0));
  if (opts.bed) g.add(box(W * 0.9, 0.35, L * 0.36, 0x333333, 0, 0.85, -L * 0.3));
  if (opts.taxiSign) g.add(box(0.7, 0.22, 0.4, 0xffd94b, 0, 1.32, -0.1));
  const hw = W / 2 - 0.05, hl = L / 2 - 0.85;
  for (const [x, z] of [[-hw, hl], [hw, hl], [-hw, -hl], [hw, -hl]]) g.add(wheel(x, z));
  const hl1 = box(0.3, 0.14, 0.06, 0xffe9a0, -W * 0.3, 0.6, L / 2 + 0.01); g.add(hl1);
  const hl2 = box(0.3, 0.14, 0.06, 0xffe9a0, W * 0.3, 0.6, L / 2 + 0.01); g.add(hl2);
  return g;
}
export const CAR_MODELS = [
  { id: 'solaire', name: 'VANTARO SOLAIRE GT', topSpeed: 52, accel: 22, grip: 2.6, priceTier: 5, build: (T, c) => buildCar(c, { len: 4.6, wid: 1.9, spoiler: true, stripe: 0xffffff }) },
  { id: 'brisa', name: 'BRISA COMPACT', topSpeed: 34, accel: 15, grip: 2.2, priceTier: 1, build: (T, c) => buildCar(c, { len: 3.6, wid: 1.65 }) },
  { id: 'duquesa', name: 'DUQUESA SEDAN', topSpeed: 40, accel: 16, grip: 2.3, priceTier: 3, build: (T, c) => buildCar(c, { len: 4.8, wid: 1.9 }) },
  { id: 'marina', name: 'MARINA CABRIO', topSpeed: 44, accel: 19, grip: 2.4, priceTier: 4, build: (T, c) => buildCar(c, { len: 4.3, wid: 1.85, cabinColor: c }) },
  { id: 'loma', name: 'LOMA PICKUP', topSpeed: 38, accel: 17, grip: 2.0, priceTier: 2, build: (T, c) => buildCar(c, { len: 5.0, wid: 2.0, bed: true }) },
  { id: 'carga', name: 'CARGA VAN', topSpeed: 32, accel: 13, grip: 1.9, priceTier: 2, build: (T, c) => buildCar(c, { len: 5.2, wid: 2.05, cabinColor: c }) },
  { id: 'taxi', name: 'TAXI CANDELA', topSpeed: 39, accel: 16, grip: 2.2, priceTier: 2, build: (T, c) => buildCar(0xf2b821, { len: 4.6, wid: 1.85, taxiSign: true }) },
];
export function modelById(id) { return CAR_MODELS.find((m) => m.id === id) || CAR_MODELS[1]; }
export function buildPoliceCruiser(THREEref) {
  const g = buildCar(0xf2f2f2, { len: 4.8, wid: 1.95, stripe: 0x2244aa });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.16, 0.4), new THREE.MeshBasicMaterial({ color: 0x3355ff }));
  bar.position.set(0, 1.32, -0.1); bar.name = 'lightbar'; g.add(bar);
  const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.4), new THREE.MeshBasicMaterial({ color: 0xff3344 }));
  bar2.position.set(0.4, 1.32, -0.1); bar2.name = 'lightbar2'; g.add(bar2);
  return g;
}
