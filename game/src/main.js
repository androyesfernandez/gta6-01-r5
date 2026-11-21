// main.js — PUERTO CANDELA boot: renderer/scene, system wiring in dependency order, main loop.
// All cross-system calls go through the shared state object G; modules never import each other
// (except pure data/util modules), so there are no import cycles.
import * as THREE from 'three';
import { createRng } from './rng.js';
import { createInput } from './input.js';
import { buildCity } from './city.js';
import { createDayNight } from './daynight.js';
import { createParticles } from './particles.js';
import { createVehicles } from './vehicles.js';
import { createPedestrians } from './pedestrians.js';
import { createPlayer } from './player.js';
import { createWeapons } from './weapons.js';
import { createEconomy } from './economy.js';
import { createReputation } from './reputation.js';
import { createSave, defaultProg } from './save.js';
import { createWanted } from './wanted.js';
import { createPolice } from './police.js';
import { createHelicopter } from './helicopter.js';
import { createDispatch } from './dispatch.js';
import { createTraffic } from './traffic.js';
import { createCombat } from './combat.js';
import { createMissions } from './missions.js';
import { createCrew } from './crew.js';
import { createRaces } from './races.js';
import { createStunts } from './stunts.js';
import { createCollectibles } from './collectibles.js';
import { createGarage } from './garage.js';
import { createShops } from './shops.js';
import { createDialogue } from './dialogue.js';
import { createPhone } from './phone.js';
import { createRadio } from './radio.js';
import { createAudio } from './audio.js';
import { createCamera } from './camera.js';
import { createMinimap } from './minimap.js';
import { createHud } from './hud.js';
import { createHudPanels } from './hudpanels.js';
import { createStats } from './stats.js';
import { createMenu } from './menu.js';
import { stageShot, updateShot } from './shots.js';

const params = new URLSearchParams(location.search);
const shotName = params.get('shot') || '';
const seed = parseInt(params.get('seed') || '7', 10) || 7;

const G = { mode: 'play', shotName, seed, cars: [], peds: [], prog: defaultProg(), shotObjective: null, shotDriveCar: null };
G.rng = createRng(seed);
window.__G = G;

const app = document.getElementById('app');
G.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
G.renderer.setSize(window.innerWidth, window.innerHeight);
G.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
app.appendChild(G.renderer.domElement);
G.scene = new THREE.Scene();
G.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 3000);
G.camera.position.set(-60, 30, 260);
G.clock = new THREE.Clock();

G.input = createInput(G); G.input.attach(G.renderer.domElement);
G.daynight = createDayNight(G);
buildCity(G);
G.particles = createParticles(G);
G.vehicles = createVehicles(G);
G.pedestrians = createPedestrians(G);
G.playerSys = createPlayer(G);
G.weaponsState = createWeapons(G);
G.economy = createEconomy(G);
G.reputation = createReputation(G);
G.saveSys = createSave(G);
G.wanted = createWanted(G);
G.police = createPolice(G);
G.helicopter = createHelicopter(G);
G.dispatch = createDispatch(G);
G.traffic = createTraffic(G);
G.combat = createCombat(G);
G.missions = createMissions(G);
G.crew = createCrew(G);
G.races = createRaces(G);
G.stunts = createStunts(G);
G.collectibles = createCollectibles(G);
G.garage = createGarage(G);
G.shops = createShops(G);
G.dialogue = createDialogue(G);
G.phone = createPhone(G);
G.radio = createRadio(G);
G.audio = createAudio(G);
G.cameraRig = createCamera(G);
G.minimap = createMinimap(G);
G.hud = createHud(G);
G.hudPanels = createHudPanels(G);
G.stats = createStats(G);
G.menu = createMenu(G);

// Free-roam seeding: a starter car, ambient traffic and a crowd so any view is alive.
const starter = G.vehicles.spawnCar('brisa', -24, 204, Math.PI / 2, 0x3fa08c, {});
starter.driver = null;
G.traffic.ensure(14);
G.pedestrians.ensureCrowd(24);

if (shotName) stageShot(G, shotName);
else {
  G.menu.showTitle();
}

let frames = 0, accum = 0, minimapTimer = 0, autosaveTimer = 0;
function animate() {
  requestAnimationFrame(animate);
  const rawDt = Math.min(0.05, G.clock.getDelta());
  accum += rawDt;
  const dt = rawDt;
  if (G.mode === 'play' || G.mode === 'dialogue') {
    G.prog.stats.playSeconds += dt;
    G.playerSys.update(dt);
    G.traffic.update(dt);
    G.pedestrians.update(dt);
    G.dispatch.update(dt);
    G.wanted.update(dt);
    G.helicopter.update(dt);
    G.combat.update(dt);
    G.missions.update(dt);
    G.crew.update(dt);
    G.races.update(dt);
    G.collectibles.update(dt);
    G.garage.update(dt);
    G.shops.update(dt);
    G.phone.update();
    if (G.shotName === 'cover') updateShot(G, dt);
  }
  if (G.mode === 'title') { G.traffic.update(dt); G.pedestrians.update(dt); }
  G.particles.update(dt);
  G.dialogue.update(dt);
  G.radio.update(dt);
  G.audio.update();
  G.menu.update();
  G.cameraRig.update(dt);
  // Note: the cover shot re-frames its chase camera inside updateShot (called in the play
  // branch above, with the real dt) — it must not run twice per frame or the GT double-steps.
  G.hud.update(dt);
  G.hudPanels.update();
  minimapTimer -= dt;
  if (minimapTimer <= 0) { minimapTimer = 0.12; G.minimap.update(); }
  autosaveTimer -= dt;
  if (autosaveTimer <= 0) { autosaveTimer = 30; if (G.mode === 'play' && !G.shotName) G.saveSys.save(0); }
  G.input.endFrame();
  G.renderer.render(G.scene, G.camera);
  frames++;
  if (frames > 35 && !window.__shotReady) window.__shotReady = true;
}
animate();

window.addEventListener('resize', () => {
  G.camera.aspect = window.innerWidth / window.innerHeight;
  G.camera.updateProjectionMatrix();
  G.renderer.setSize(window.innerWidth, window.innerHeight);
});
