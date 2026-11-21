// shots.js — staged deterministic scenes: cover, market, stats, title. Sets window.__shotReady via main.js.
import * as THREE from 'three';
export function seedCoverProg(G) {
  G.prog.cash = 47850; G.prog.respect = 2820; G.prog.jobIndex = 5; G.prog.jobStage = 2;
  G.prog.racesWon = [0]; G.prog.stuntsDone = [0, 1, 2, 3];
  G.prog.buoysFound = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  G.prog.stats.earned = 86400; G.prog.stats.stolen = 23; G.prog.stats.topSpeed = 187; G.prog.stats.busts = 2; G.prog.stats.playSeconds = 11564;
  G.prog.standing['MALECÓN VIEJO'] = 'FRIENDLY'; G.prog.standing['EL MERCADO'] = 'NEUTRAL'; G.prog.standing['PUERTO ALTO'] = 'WARY'; G.prog.standing['LA ISLA'] = 'NEUTRAL';
}
export function seedMarketProg(G) {
  G.prog.cash = 31240; G.prog.respect = 1680; G.prog.jobIndex = 4; G.prog.jobStage = 1;
  G.prog.racesWon = [0]; G.prog.stuntsDone = [0, 1]; G.prog.buoysFound = [0, 1, 2, 3, 4];
  G.prog.stats.earned = 51200; G.prog.stats.stolen = 14; G.prog.stats.topSpeed = 164;
}
export function stageShot(G, name) {
  G.shotName = name;
  const P = G.playerObj;
  if (name === 'cover') {
    seedCoverProg(G);
    G.daynight.applyTimeOfDay(G, 18.35);
    // Player driving the SOLAIRE GT east on the Malecón boulevard (z=180 road)
    const gt = G.vehicles.spawnCar('solaire', -10, 183, Math.PI / 2, 0xc0392b, { condition: 78 });
    gt.speed = 31; G.playerSys.enterCar(gt); P.heading = Math.PI / 2;
    G.shotDriveCar = gt;
    // Traffic + fleeing peds for density
    G.traffic.ensure(8); G.pedestrians.ensureCrowd(16); G.pedestrians.fleeFrom(0, 180, 60);
    // CPA cruisers: alongside rammer + pursuers, roadblock far ahead
    const ram = G.dispatch.spawnUnit('CANDELA-14', 6, 177, 'RAMMING'); if (ram) { ram.speed = 30; ram.heading = Math.PI / 2; }
    const p1 = G.dispatch.spawnUnit('CANDELA-11', -32, 186, 'PURSUIT'); if (p1) { p1.speed = 29; p1.heading = Math.PI / 2; }
    const p2 = G.dispatch.spawnUnit('CANDELA-16', -48, 176, 'PURSUIT'); if (p2) { p2.speed = 28; p2.heading = Math.PI / 2; }
    const rb = G.dispatch.spawnUnit('CANDELA-12', 150, 180, 'ROADBLOCK'); if (rb) rb.heading = Math.PI / 3;
    G.dispatch.spawnUnit('FOOT-21', 24, 168, 'RESPONDING');
    G.dispatch.forceRow('CANDELA-11', 'PURSUIT', 42); G.dispatch.forceRow('CANDELA-14', 'RAMMING', 18);
    G.dispatch.forceRow('CANDELA-12', 'ROADBLOCK', 210); G.dispatch.forceRow('CONDOR-1', 'SPOTLIGHT', null);
    G.dispatch.forceRow('FOOT-21', 'RESPONDING', null); G.dispatch.forceRow('CANDELA-16', 'PURSUIT', 96);
    if (G.helicopter) G.helicopter.placeAbove(0, 180);
    G.wanted.setStars(4); G.wanted.state = 'IN SIGHT'; G.wanted.seen = true;
    G.missions.setForced('Wreck the Regent', null, 3, 4, "RAM THE REGENT'S CONVOY CAR");
    G.shotObjective = { x: 150, z: 180 };
    G.dialogue.showLine('madre', "He's running for the ferry, Ruy. Break his pretty car.", 999);
    if (G.crew) G.crew.setCooldown('static', 25);
    if (G.radio) G.radio.setLine(0);
    G.mode = 'play';
  }
  if (name === 'market') {
    seedMarketProg(G);
    G.daynight.applyTimeOfDay(G, 19.5);
    // Fight staged on the open SW corner of the market plaza (the plaza block's buildings
    // sit NE of here and would occlude actors placed at the plaza centre).
    P.x = 132; P.z = 132; P.heading = 1.1; P.mesh.position.set(132, 0.25, 132); P.mesh.rotation.y = 1.1;
    G.weaponsState.select(2); // VELA SMG active
    G.pedestrians.ensureCrowd(14);
    // Fleeing crowd placed explicitly around the fight so the frame is populated.
    for (const [cx, cz] of [[124, 140], [128, 120], [142, 124], [120, 128], [136, 152], [152, 130]]) G.pedestrians.spawnPed(cx, cz, {});
    G.pedestrians.fleeFrom(138, 136, 40);
    for (const p of G.peds) if (p.state === 'flee') p.fleeT = 99; // keep them mid-flight for the staged frame
    const r1 = G.combat.spawnRival(140, 144); r1.down = true; r1.mesh.rotation.x = Math.PI / 2; r1.mesh.position.y = 0.5; r1.state = 'down';
    const r2 = G.combat.spawnRival(144, 131); r2.down = true; r2.mesh.rotation.x = Math.PI / 2; r2.mesh.position.y = 0.5; r2.state = 'down';
    G.shotRival = G.combat.spawnRival(148, 140);
    G.combat.tracer(new THREE.Vector3(133, 1.5, 133), new THREE.Vector3(148, 1.3, 140), 0xffe9a0);
    // Tracers live only 0.12 s (combat.js), so the setup tracer above is long gone by
    // capture time: re-fire on a short timer, alternating direction between the player
    // and the standing rival, so a live tracer is always in frame at capture.
    if (G.shotTracerTimer) clearInterval(G.shotTracerTimer);
    G.shotTracerFlip = false;
    G.shotTracerTimer = setInterval(() => {
      if (!G.combat) return;
      G.shotTracerFlip = !G.shotTracerFlip;
      const rival = G.shotRival; // collision pushes the rival out of the plaza building to ~ (145.4, 138.2)
      const rx = rival ? rival.x : 148, rz = rival ? rival.z : 140;
      if (G.shotTracerFlip) G.combat.tracer(new THREE.Vector3(133, 1.5, 133), new THREE.Vector3(rx, 1.3, rz), 0xffe9a0);
      else G.combat.tracer(new THREE.Vector3(rx, 1.4, rz), new THREE.Vector3(133, 1.2, 133), 0xff7a5a);
    }, 90);
    G.dispatch.spawnUnit('FOOT-21', 122, 146, 'ON FOOT'); G.dispatch.spawnUnit('FOOT-22', 156, 124, 'ON FOOT');
    G.dispatch.forceRow('FOOT-21', 'ON FOOT', null); G.dispatch.forceRow('FOOT-22', 'ON FOOT', null); G.dispatch.forceRow('CANDELA-13', 'RESPONDING', 120);
    G.wanted.setStars(2); G.wanted.state = 'IN SIGHT';
    G.missions.setForced('Market Day Riot', null, 2, 4, "DRIVE OFF THE REGENT'S MEN");
    G.shotObjective = { x: 150, z: 150 };
    if (G.hudPanels) setTimeout(() => G.hudPanels.highlightCrew('static'), 60);
    // Tightened fixed camera: the old (122,4.5,122)->(140,1.2,140) ground-level line
    // put both downed rivals behind stall tables, readable only as edge-on slivers.
    // The closer, raised (133,14,121)->(142,0,137) view looks over the stall roofs:
    // every actor — player, standing rival, both downed rivals (full body length from
    // above) — has a clear line of sight at a shorter distance, stalls still in frame.
    G.cameraRig.setFixed(new THREE.Vector3(133, 14, 121), new THREE.Vector3(142, 0, 137));
    G.mode = 'play';
  }
  if (name === 'stats') {
    seedCoverProg(G);
    // Populate all 3 save slots with the seeded career (slightly earlier careers in
    // slots 2-3 for distinct entries), mirroring the title staging's save(0); the live
    // prog is then restored to the full seeded career before renderAll() runs below.
    try {
      G.saveSys.save(0);
      G.prog.cash = 29640; G.prog.respect = 2140; G.prog.jobIndex = 4; G.prog.jobStage = 1; G.prog.stats.playSeconds = 8210; G.saveSys.save(1);
      G.prog.cash = 12780; G.prog.respect = 1180; G.prog.jobIndex = 2; G.prog.jobStage = 0; G.prog.stats.playSeconds = 3965; G.saveSys.save(2);
      seedCoverProg(G);
    } catch (e) { /* storage may be unavailable */ }
    G.traffic.ensure(10); G.pedestrians.ensureCrowd(12);
    G.menu.openPause('STATS'); G.menu.showTab('MAP'); G.stats.renderAll();
    // Show the big map (MAP tab content is the default visual) while STATS data is rendered too.
    G.menu.showTab('STATS'); G.stats.renderAll();
    const mapTab = document.getElementById('tab-map'); if (mapTab) mapTab.style.display = 'block';
    // Staged pause screen: stack MAP + STATS + SAVE compactly so the map, completion,
    // career stats, rank ladder and all 3 save slots fit one 720p frame without scrolling.
    const saveTab = document.getElementById('tab-save'); if (saveTab) saveTab.style.display = 'block';
    const pm = document.getElementById('pause-menu');
    if (pm) { pm.style.width = '920px'; pm.style.maxHeight = '97vh'; pm.style.overflow = 'hidden'; pm.style.top = '1vh'; pm.style.padding = '10px 16px'; }
    const mc = document.getElementById('map-canvas'); if (mc) { mc.style.width = '480px'; mc.style.height = '225px'; mc.style.display = 'block'; mc.style.margin = '0 auto'; }
    const cl = document.getElementById('completion-list'); if (cl) { cl.style.display = 'grid'; cl.style.gridTemplateColumns = '1fr 1fr'; cl.style.margin = '4px 0'; }
    const sg = document.getElementById('stats-grid'); if (sg) { sg.style.display = 'grid'; sg.style.gridTemplateColumns = 'repeat(4, 1fr)'; sg.style.gap = '3px 14px'; }
    const rl = document.getElementById('rank-ladder'); if (rl) { rl.style.display = 'grid'; rl.style.gridTemplateColumns = 'repeat(3, 1fr)'; rl.style.gap = '2px 12px'; rl.style.fontSize = '12px'; }
    const ss = document.getElementById('save-slots'); if (ss) { ss.style.display = 'grid'; ss.style.gridTemplateColumns = 'repeat(3, 1fr)'; ss.style.gap = '10px'; }
    G.mode = 'pause';
  }
  if (name === 'title') {
    // Title screen over aerial orbit; slot 1 summary seeded from the cover career for the card row.
    try { const keep = G.prog; seedCoverProg(G); G.saveSys.save(0); G.prog = keep; } catch (e) { /* storage may be unavailable */ }
    seedCoverProg(G);
    G.traffic.ensure(12); G.pedestrians.ensureCrowd(12);
    G.menu.showTitle();
    G.mode = 'title';
  }
}
export function updateShot(G, dt) {
  if (G.shotName === 'cover' && G.shotDriveCar) {
    const car = G.shotDriveCar;
    G.vehicles.stepCar(car, 0.85, 0, false, dt);
    car.z += (180 - car.z) * dt * 0.6; // hold the boulevard lane
    // Keep the staged escorts in formation beside/behind the GT (their dispatch rows are
    // forced for the panel, so formation-keeping lives here instead of in police AI).
    for (const u of G.dispatch.units) {
      if (!u.car || u.car === car) continue;
      if (u.callsign === 'CANDELA-14') { u.car.x = car.x + 15; u.car.z = car.z - 5; u.car.heading = Math.PI / 2; u.car.mesh.position.set(u.car.x, 0.1, u.car.z); u.car.mesh.rotation.y = Math.PI / 2; }
      if (u.callsign === 'CANDELA-11') { u.car.x = car.x - 24; u.car.z = car.z + 6; u.car.heading = Math.PI / 2; u.car.mesh.position.set(u.car.x, 0.1, u.car.z); u.car.mesh.rotation.y = Math.PI / 2; }
      if (u.callsign === 'CANDELA-16') { u.car.x = car.x - 42; u.car.z = car.z - 7; u.car.heading = Math.PI / 2; u.car.mesh.position.set(u.car.x, 0.1, u.car.z); u.car.mesh.rotation.y = Math.PI / 2; }
    }
    if (car.x > 240) { car.x = -60; } // loop the boulevard for a stable frame
    car.speed = Math.max(car.speed, 30); // staged chase pace: speedo reads 108+ km/h
    // Side tracking shot from the seaward side: GT centre frame driving left-to-right,
    // pursuers in frame behind (west), rammer and roadblock ahead (east), city as backdrop.
    const camPos = new THREE.Vector3(car.x - 2, 3.4, car.z + 16);
    G.camera.position.lerp(camPos, 0.3);
    G.camera.lookAt(car.x + 2, 1.5, car.z - 1);
    G.camera.fov = 68; G.camera.updateProjectionMatrix();
    if (G.helicopter) {
      const heli = G.helicopter;
      if (!heli.active) heli.setActive(true);
      // Pin CONDOR-1 in frame: its normal orbit hovers at y=34, far above this y=3.4
      // camera, so only its spotlight circle ever showed. Hold it ahead of the GT and
      // beside its lane at y=12, far enough out that the whole airframe (rotor, body,
      // tail) sits inside the frame, spotlight kept on the car.
      heli.group.position.set(car.x + 24, 12, car.z - 6);
      heli.group.lookAt(car.x, 0, car.z);
      heli.circle.position.set(car.x, 0.35, car.z);
      heli.circle.visible = true;
    }
  }
  if (G.shotName === 'market') {
    // Per-frame counterpart of the staging timer in stageShot: re-fire tracers between
    // the player and the standing rival every ~0.09 s (tracer life is 0.12 s),
    // alternating direction, so a live tracer is visible whenever the frame is taken.
    G.shotTracerT = (G.shotTracerT || 0) + dt;
    if (G.shotTracerT >= 0.09) {
      G.shotTracerT = 0;
      G.shotTracerFlip = !G.shotTracerFlip;
      const rival = G.shotRival;
      const rx = rival ? rival.x : 148, rz = rival ? rival.z : 140;
      if (G.shotTracerFlip) G.combat.tracer(new THREE.Vector3(133, 1.5, 133), new THREE.Vector3(rx, 1.3, rz), 0xffe9a0);
      else G.combat.tracer(new THREE.Vector3(rx, 1.4, rz), new THREE.Vector3(133, 1.2, 133), 0xff7a5a);
    }
  }
}
