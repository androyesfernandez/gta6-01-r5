// dispatch.js — named CPA unit registry CANDELA-11..16, CONDOR-1, FOOT-21/22; tactics + HUD rows.
export function createDispatch(G) {
  const defs = [
    { callsign: 'CANDELA-11', kind: 'car' }, { callsign: 'CANDELA-12', kind: 'car' },
    { callsign: 'CANDELA-13', kind: 'car' }, { callsign: 'CANDELA-14', kind: 'car' },
    { callsign: 'CANDELA-15', kind: 'car' }, { callsign: 'CANDELA-16', kind: 'car' },
    { callsign: 'CONDOR-1', kind: 'air' }, { callsign: 'FOOT-21', kind: 'foot' }, { callsign: 'FOOT-22', kind: 'foot' },
  ];
  const units = defs.map((d) => ({ ...d, active: false, tactic: 'STANDBY', distToPlayer: 1e9, car: null, ped: null, forced: null }));
  function desiredCount() { const s = G.wanted ? G.wanted.stars : 0; return [0, 1, 2, 4, 5, 6][s] || 0; }
  function spawnFor(unit) {
    const p = G.playerObj.pos(); const a = G.rng.range(0, 6.28), d = G.rng.range(55, 85);
    const x = p.x + Math.sin(a) * d, z = p.z + Math.cos(a) * d;
    if (unit.kind === 'car') { unit.car = G.police.spawnCruiser(x, z, a); }
    if (unit.kind === 'foot') { unit.ped = G.police.spawnOfficer(p.x + G.rng.range(-14, 14), p.z + G.rng.range(-14, 14)); }
    unit.active = true;
  }
  function despawn(unit) {
    if (unit.car) { G.vehicles.removeCar(unit.car); unit.car = null; }
    if (unit.ped) { G.pedestrians.removePed(unit.ped); unit.ped = null; }
    unit.active = false; unit.tactic = 'STANDBY'; unit.forced = null;
  }
  const api = { units,
    rows() { return units.filter((u) => u.active || u.forced).map((u) => ({ callsign: u.callsign, tactic: u.forced ? u.forced.tactic : u.tactic, dist: u.forced ? u.forced.dist : Math.round(u.distToPlayer) })); },
    forceRow(callsign, tactic, dist) { const u = units.find((x) => x.callsign === callsign); if (u) { u.forced = { tactic, dist }; u.active = true; } },
    spawnUnit(callsign, x, z, tactic) { const u = units.find((v) => v.callsign === callsign); if (!u) return null;
      if (u.kind === 'car') { u.car = G.police.spawnCruiser(x, z, 0); u.active = true; if (tactic) u.tactic = tactic; return u.car; }
      if (u.kind === 'foot') { u.ped = G.police.spawnOfficer(x, z); u.active = true; if (tactic) u.tactic = tactic; return u.ped; }
      return null; },
    jamAll() { for (const u of units) { u.tactic = 'RESPONDING'; if (u.car) u.car.ai.holdT = 3; } if (G.wanted) { G.wanted.state = 'SEARCHING'; G.wanted.hiddenT = 4; } },
    update(dt) {
      const stars = G.wanted ? G.wanted.stars : 0;
      const wantCars = desiredCount();
      const carUnits = units.filter((u) => u.kind === 'car');
      let activeCars = carUnits.filter((u) => u.active && u.car).length;
      for (const u of carUnits) {
        if (!u.active && activeCars < wantCars) { spawnFor(u); activeCars++; }
        if (u.active && u.car && activeCars > wantCars && !u.forced) { despawn(u); activeCars--; }
      }
      const footUnits = units.filter((u) => u.kind === 'foot');
      for (const u of footUnits) {
        const wantFoot = stars >= 2 && G.playerObj && !G.playerObj.inCar;
        if (!u.active && wantFoot) spawnFor(u);
        if (u.active && !wantFoot && stars === 0 && !u.forced) despawn(u);
      }
      const air = units.find((u) => u.kind === 'air');
      if (air) { air.active = stars >= 4; air.tactic = stars >= 4 ? 'SPOTLIGHT' : 'STANDBY'; air.distToPlayer = G.helicopter ? 40 : 1e9; }
      const p = G.playerObj ? G.playerObj.pos() : { x: 0, z: 0 };
      let roadblockDone = false;
      for (const u of units) {
        const obj = u.car || u.ped; if (!obj) { if (!u.forced) u.distToPlayer = 1e9; continue; }
        u.distToPlayer = Math.hypot(obj.x - p.x, obj.z - p.z);
        if (u.forced) continue;
        if (u.kind === 'car') {
          if (stars >= 3 && !roadblockDone && u.distToPlayer > 60 && u.callsign === 'CANDELA-12') { u.tactic = 'ROADBLOCK'; }
          else if (u.distToPlayer < 22) u.tactic = 'RAMMING';
          else u.tactic = 'PURSUIT';
          if (u.car.ai.holdT > 0) { u.car.ai.holdT -= dt; G.vehicles.stepCar(u.car, 0, 0, true, dt); }
          else G.police.driveCruiser(u.car, dt, u.tactic);
          if (u.distToPlayer > 320 && stars === 0) despawn(u);
        }
        if (u.kind === 'foot') u.tactic = 'ON FOOT';
      }
      // Roadblock spawn at >=3 stars, once per escalation window
      if (stars >= 3 && !api._rbDone) { api._rbDone = true; const spot = G.police.roadblockAheadOfPlayer(); if (spot) G.police.spawnRoadblock(spot.x, spot.z, spot.heading); }
      if (stars < 3) api._rbDone = false;
    },
  };
  return api;
}
export function spawnDispatchUnit(G, callsign, x, z, tactic) { return G.dispatch.spawnUnit(callsign, x, z, tactic); }
