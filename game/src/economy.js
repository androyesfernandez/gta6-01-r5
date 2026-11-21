// economy.js — cash add/spend with HUD flash; payout helper for jobs/races/stunts/buoys.
export function createEconomy(G) {
  const api = {
    add(n, why) { G.prog.cash += n; if (n > 0) G.prog.stats.earned += n; if (G.hud) G.hud.flashCash(n); if (why && G.hud) G.hud.banner(why + '  +$' + n.toLocaleString()); },
    spend(n) { if (G.prog.cash < n) return false; G.prog.cash -= n; if (G.hud) G.hud.flashCash(-n); return true; },
    canAfford(n) { return G.prog.cash >= n; },
    payout(kind, base) { const table = { job: base || 1000, race: 1500, stunt: 600, buoySet: 1000, delivery: 800 }; api.add(table[kind] !== undefined ? table[kind] : base || 500); },
  };
  return api;
}
