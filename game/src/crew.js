// crew.js — crew abilities: Tito GETAWAY boost + wanted freeze; Lucia STATIC dispatch jam.
export function createCrew(G) {
  const crew = { boostT: 0,
    members: [
      { id: 'getaway', name: 'Tito Vale', ability: 'GETAWAY', key: 'KeyQ', cooldown: 45, cdLeft: 0, desc: 'Instant engine boost + brief wanted freeze' },
      { id: 'static', name: 'Lucia Ferrer', ability: 'STATIC', key: 'KeyE', cooldown: 60, cdLeft: 0, desc: 'Jams dispatch: units lose your trail' },
    ],
    use(id) {
      const m = crew.members.find((x) => x.id === id); if (!m || m.cdLeft > 0) return false;
      m.cdLeft = m.cooldown;
      if (id === 'getaway') { crew.boostT = 4; if (G.wanted) G.wanted.freezeT = 4; if (G.playerObj && G.playerObj.inCar) G.playerObj.inCar.speed *= 1.45; if (G.hud) G.hud.banner('GETAWAY — TITO HAS THE WHEEL'); }
      if (id === 'static') { if (G.dispatch) G.dispatch.jamAll(); if (G.hud) G.hud.banner('STATIC — DISPATCH JAMMED'); }
      if (G.audio) G.audio.blip(); return true;
    },
    setCooldown(id, secondsLeft) { const m = crew.members.find((x) => x.id === id); if (m) m.cdLeft = secondsLeft; },
    update(dt) {
      if (crew.boostT > 0) crew.boostT -= dt;
      for (const m of crew.members) if (m.cdLeft > 0) m.cdLeft = Math.max(0, m.cdLeft - dt);
      if (G.input && G.mode === 'play') {
        if (G.input.wasPressed('KeyQ')) crew.use('getaway');
        if (G.input.wasPressed('KeyE')) crew.use('static');
      }
    },
  };
  return crew;
}
