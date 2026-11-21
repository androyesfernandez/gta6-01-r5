// reputation.js — 8 respect ranks, thresholds, rank gates, progress fraction.
export const RANKS = [
  { name: 'RUNNER', need: 0 }, { name: 'BAGMAN', need: 150 }, { name: 'WHEELMAN', need: 400 },
  { name: "FIXER'S HAND", need: 800 }, { name: 'SMUGGLER', need: 1400 }, { name: 'SHOT CALLER', need: 2200 },
  { name: 'HARBOUR BOSS', need: 3200 }, { name: 'PUERTO KING', need: 4600 },
];
export function rankIndexFor(respect) { let i = 0; for (let k = 0; k < RANKS.length; k++) if (respect >= RANKS[k].need) i = k; return i; }
export function createReputation(G) {
  const api = {
    rankIndex() { return rankIndexFor(G.prog.respect); },
    rankName() { return RANKS[api.rankIndex()].name; },
    progress() { const i = api.rankIndex(); if (i >= RANKS.length - 1) return 1; const cur = RANKS[i].need, nxt = RANKS[i + 1].need; return Math.max(0, Math.min(1, (G.prog.respect - cur) / (nxt - cur))); },
    addRespect(n) { const before = api.rankIndex(); G.prog.respect += n; if (api.rankIndex() > before && G.hud) G.hud.banner('RANK UP — ' + api.rankName()); },
    meetsRank(n) { return api.rankIndex() >= n; },
  };
  return api;
}
