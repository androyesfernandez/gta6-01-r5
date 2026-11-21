// races.js — 4 street races: checkpoint sequences, countdown, rival pace timer, payouts.
import { roadCenterX, roadCenterZ } from './districts.js';
export const RACES = [
  { name: 'Malecón Sprint', checkpoints: [[-270, 210], [-120, 210], [30, 210], [180, 210], [270, 210]] },
  { name: 'Market Loop', checkpoints: [[30, 90], [150, 90], [270, 90], [270, 210], [150, 210], [30, 210]] },
  { name: 'Towers Climb', checkpoints: [[-270, 30], [-270, -120], [-120, -210], [30, -210], [30, -60]] },
  { name: 'Causeway Run', checkpoints: [[270, -30], [330, -330 + 300], [390, -330], [470, -330], [530, -270]] },
];
export function createRaces(G) {
  const race = { active: -1, cp: 0, timer: 0, countdown: 0, pace: 95,
    start(i) {
      if (!G.playerObj || !G.playerObj.inCar) { if (G.hud) G.hud.banner('RACES START FROM A CAR'); return false; }
      race.active = i; race.cp = 0; race.timer = 0; race.countdown = 3; race.pace = 80 + i * 18;
      if (G.hud) G.hud.banner('RACE — ' + RACES[i].name); return true;
    },
    currentCheckpoint() { if (race.active < 0) return null; const c = RACES[race.active].checkpoints[race.cp]; return c ? { x: c[0], z: c[1] } : null; },
    update(dt) {
      if (race.active < 0) return;
      if (race.countdown > 0) { race.countdown -= dt; return; }
      race.timer += dt;
      const cp = race.currentCheckpoint(); if (!cp || !G.playerObj) return;
      const p = G.playerObj.pos();
      if (Math.hypot(p.x - cp.x, p.z - cp.z) < 14) {
        race.cp++; if (G.audio) G.audio.chime();
        if (race.cp >= RACES[race.active].checkpoints.length) {
          const won = race.timer <= race.pace;
          if (won && !G.prog.racesWon.includes(race.active)) { G.prog.racesWon.push(race.active); if (G.economy) G.economy.add(1500, 'RACE WON — ' + RACES[race.active].name); if (G.reputation) G.reputation.addRespect(60); }
          else if (G.hud) G.hud.banner('RACE FINISHED — PACE ' + Math.round(race.pace) + 's');
          race.active = -1;
        }
      }
    },
  };
  return race;
}
export { roadCenterX, roadCenterZ };
