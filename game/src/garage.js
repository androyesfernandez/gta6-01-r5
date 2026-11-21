// garage.js — PUERTO ALTO garage: respray clears wanted, armour/engine tiers, rank-gated.
export function createGarage(G) {
  const panel = document.getElementById('garage-panel');
  let open = false;
  function refresh() {
    const el = document.getElementById('garage-info');
    if (el) el.textContent = 'Armour tier ' + G.prog.garage.armourTier + '/2 · Engine tier ' + G.prog.garage.engineTier + '/2 · Cash $' + G.prog.cash.toLocaleString();
  }
  const api = { isOpen: () => open,
    openPanel() { open = true; if (panel) panel.style.display = 'block'; refresh(); },
    closePanel() { open = false; if (panel) panel.style.display = 'none'; },
    respray() { if (!G.playerObj || !G.playerObj.inCar) { if (G.hud) G.hud.banner('RESPRAY NEEDS A CAR'); return; } if (G.economy.spend(300)) { G.playerObj.inCar.condition = 100; if (G.wanted) G.wanted.clearWanted(); if (G.hud) G.hud.banner('RESPRAYED — WANTED CLEARED'); refresh(); } },
    buyArmour() { if (G.prog.garage.armourTier >= 2) return; if (!G.reputation.meetsRank(2)) { if (G.hud) G.hud.banner('ARMOUR NEEDS RANK: WHEELMAN'); return; } if (G.economy.spend(900)) { G.prog.garage.armourTier++; if (G.playerObj && G.playerObj.inCar) G.playerObj.inCar.condition = 100; refresh(); } },
    buyEngine() { if (G.prog.garage.engineTier >= 2) return; if (!G.reputation.meetsRank(3)) { if (G.hud) G.hud.banner("ENGINE NEEDS RANK: FIXER'S HAND"); return; } if (G.economy.spend(1100)) { G.prog.garage.engineTier++; refresh(); } },
    update() {
      if (!G.playerObj || !G.city) return; const p = G.playerObj.pos();
      const near = Math.hypot(p.x - G.city.garagePos.x, p.z - G.city.garagePos.z) < 13;
      if (near && G.input.wasPressed('KeyG') && !open) api.openPanel();
      if (open && G.input.wasPressed('Escape')) api.closePanel();
    },
  };
  const bind = (id, fn) => { const b = document.getElementById(id); if (b) b.addEventListener('click', fn); };
  bind('garage-respray', () => api.respray()); bind('garage-armour', () => api.buyArmour()); bind('garage-engine', () => api.buyEngine()); bind('garage-close', () => api.closePanel());
  return api;
}
