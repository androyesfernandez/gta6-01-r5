// daynight.js — golden-hour grade: sky dome, sun, fog, applyTimeOfDay lerp.
import * as THREE from 'three';
export function skyTexture(top, mid, bot) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c);
}
export function createDayNight(G) {
  const scene = G.scene;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 16, 10), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false }));
  scene.add(sky); G.skyDome = sky;
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffdf9a, transparent: true, opacity: 0.95, fog: false }));
  sunSprite.scale.set(180, 180, 1); scene.add(sunSprite); G.sunSprite = sunSprite;
  G.hemi = new THREE.HemisphereLight(0xffe0b0, 0x3a4a5a, 0.9); scene.add(G.hemi);
  G.sun = new THREE.DirectionalLight(0xffb36a, 1.5); G.sun.position.set(-300, 220, 420); scene.add(G.sun);
  scene.fog = new THREE.Fog(0xf2a56a, 220, 950);
  const api = { timeOfDay: 18.35, sky, applyTimeOfDay };
  function applyTimeOfDay(G2, hour) {
    api.timeOfDay = hour;
    const dusk = hour > 19; // market scene 19.5 is deeper dusk
    const top = dusk ? '#2e3a63' : '#4a6ea8', mid = dusk ? '#c65f6e' : '#e88a5a', bot = dusk ? '#e8a56a' : '#ffd97a';
    sky.material.map = skyTexture(top, mid, bot); sky.material.needsUpdate = true;
    scene.fog.color.set(dusk ? 0x8a5a6e : 0xf2a56a);
    G.sun.color.set(dusk ? 0xff8a5a : 0xffb36a); G.sun.intensity = dusk ? 1.1 : 1.5;
    G.hemi.intensity = dusk ? 0.65 : 0.9;
    sunSprite.position.set(-500, dusk ? 90 : 170, 650);
    if (G.city && G.city.lampGlows) for (const s of G.city.lampGlows) s.material.opacity = dusk ? 1 : 0.55;
    if (G.renderer) G.renderer.setClearColor(dusk ? 0x8a5a6e : 0xf2a56a);
  }
  applyTimeOfDay(G, 18.35);
  return api;
}
