// missions.js — story job stage machine: goto/pickup/steal/chase/fight/deliver/escape + beacon.
import * as THREE from 'three';
import { JOBS } from './story.js';
export function createMissions(G) {
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 30, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd94b, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  beacon.visible = false; G.scene.add(beacon);
  const m = { active: null, jobIndex: -1, stageIndex: 0, rivalsLeft: 0, forcedLabel: null,
    currentJob() { return m.active; },
    currentStage() { if (m.forcedLabel) return m.forcedLabel; if (!m.active) return null; return m.active.stages[m.stageIndex]; },
    beginStoryJob(jobIndex) {
      const job = JOBS[jobIndex]; if (!job) return false;
      m.active = job; m.jobIndex = jobIndex; m.stageIndex = 0; startStage(); return true;
    },
    setForced(jobTitle, stageLabel, stageNum, stageTotal, objectiveText) {
      m.forcedLabel = { title: jobTitle, n: stageNum, total: stageTotal, text: objectiveText }; m.active = null;
    },
    clearForced() { m.forcedLabel = null; },
  };
  function startStage() {
    const st = m.active.stages[m.stageIndex]; if (!st) return;
    if (st.line && G.dialogue) G.dialogue.showLine(st.line[0], st.line[1]);
    if (st.type === 'fight' && G.combat) { m.rivalsLeft = 3; for (let k = 0; k < 3; k++) G.combat.spawnRival(st.x + G.rng.range(-12, 12), st.z + G.rng.range(-12, 12)); }
    if (st.type === 'chase' && G.wanted) G.wanted.addHeat(60, true);
    beacon.visible = st.type !== 'escape';
    beacon.position.set(st.x, 15, st.z);
  }
  function completeJob() {
    const job = m.active; m.active = null; beacon.visible = false;
    G.prog.jobIndex = Math.max(G.prog.jobIndex, m.jobIndex + 1); G.prog.jobStage = 0;
    if (G.economy) G.economy.add(job.pay, 'JOB COMPLETE — ' + job.title);
    if (G.reputation) G.reputation.addRespect(job.respect);
    if (G.hud) G.hud.banner('JOB COMPLETE — ' + job.title);
    if (G.audio) G.audio.chime();
    if (G.save) G.save.save(0);
  }
  function advance() {
    m.stageIndex++;
    if (m.stageIndex >= m.active.stages.length) completeJob(); else { G.prog.jobStage = m.stageIndex; startStage(); }
  }
  m.onRivalDown = function () { if (m.active && m.active.stages[m.stageIndex] && m.active.stages[m.stageIndex].type === 'fight') { m.rivalsLeft--; if (m.rivalsLeft <= 0) advance(); } };
  m.failJob = function (why) { if (G.hud) G.hud.banner('JOB FAILED — ' + (why || 'RESET')); m.active = null; beacon.visible = false; };
  m.update = function (dt) {
    if (!m.active || !G.playerObj) return;
    const st = m.active.stages[m.stageIndex]; if (!st) return;
    beacon.rotation.y += dt;
    const p = G.playerObj.pos(); const d = Math.hypot(p.x - st.x, p.z - st.z);
    if (st.type === 'goto' || st.type === 'pickup' || st.type === 'deliver') { if (d < 7) advance(); }
    else if (st.type === 'steal') { if (G.playerObj.inCar && d < 26) advance(); else if (d < 7 && G.playerObj.inCar) advance(); }
    else if (st.type === 'chase') { if (d < 12) advance(); }
    else if (st.type === 'escape') { beacon.visible = false; if (G.wanted && G.wanted.stars === 0) advance(); }
  };
  return m;
}
export function beginStoryJob(G, i) { return G.missions.beginStoryJob(i); }
