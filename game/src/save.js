// save.js — 3 localStorage slots puerto-candela-slot-1..3 with summaries (exception-guarded).
import { rankIndexFor, RANKS } from './reputation.js';
export function defaultProg() {
  return { cash: 1200, respect: 0, jobIndex: 0, jobStage: 0, racesWon: [], stuntsDone: [], buoysFound: [],
    standing: { 'MALECÓN VIEJO': 'FRIENDLY', 'EL MERCADO': 'NEUTRAL', 'PUERTO ALTO': 'NEUTRAL', 'LA ISLA': 'NEUTRAL', 'EL PUERTO': 'NEUTRAL' },
    stats: { earned: 0, stolen: 0, topSpeed: 0, busts: 0, wasted: 0, playSeconds: 0 },
    garage: { armourTier: 0, engineTier: 0 }, weaponsUnlocked: ['fists', 'pistol', 'smg'] };
}
function slotKey(i) { return 'puerto-candela-slot-' + (i + 1); }
export function createSave(G) {
  const api = {
    save(slot) {
      try {
        const meta = { label: 'SLOT ' + (slot + 1), cash: G.prog.cash, rank: RANKS[rankIndexFor(G.prog.respect)].name, jobsDone: G.prog.jobIndex, savedAt: new Date().toISOString() };
        localStorage.setItem(slotKey(slot), JSON.stringify({ prog: G.prog, meta }));
        return true;
      } catch (e) { return false; }
    },
    load(slot) {
      try { const raw = localStorage.getItem(slotKey(slot)); if (!raw) return null; const data = JSON.parse(raw); G.prog = Object.assign(defaultProg(), data.prog); return data; } catch (e) { return null; }
    },
    summary(slot) {
      try { const raw = localStorage.getItem(slotKey(slot)); if (!raw) return null; const data = JSON.parse(raw); return data.meta; } catch (e) { return null; }
    },
    summaries() { return [0, 1, 2].map((i) => api.summary(i)); },
  };
  return api;
}
