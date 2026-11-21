// weapons.js — weapon data + player weapon state (slots, ammo, rank-gated tiers).
export const WEAPONS = [
  { id: 'fists', name: 'FISTS', damage: 8, fireRate: 2.2, range: 2.2, ammo: Infinity, slot: 0, price: 0, rankReq: 0 },
  { id: 'pistol', name: 'CANDELA PISTOL', damage: 22, fireRate: 3.5, range: 60, ammo: 120, slot: 1, price: 400, rankReq: 0 },
  { id: 'smg', name: 'VELA SMG', damage: 14, fireRate: 9, range: 48, ammo: 300, slot: 2, price: 1200, rankReq: 1 },
  { id: 'carbine', name: 'CANDELA CARBINE', damage: 30, fireRate: 6, range: 90, ammo: 240, slot: 3, price: 3500, rankReq: 4 },
];
export function createWeapons(G) {
  const state = { active: 1, ammo: { pistol: 120, smg: 300, carbine: 0 }, cooldown: 0, owned: { fists: true, pistol: true, smg: true, carbine: false } };
  if (G.prog && G.prog.weaponsUnlocked) for (const id of G.prog.weaponsUnlocked) if (state.owned[id] !== undefined) state.owned[id] = true;
  const api = {
    state,
    current() { return WEAPONS[state.active]; },
    select(i) { const w = WEAPONS[i]; if (w && state.owned[w.id]) { state.active = i; if (G.hud) G.hud.refreshWeapons(); } },
    isLocked(w) { return !state.owned[w.id]; },
    tryFire(dt) { state.cooldown -= dt; if (state.cooldown > 0) return false; const w = api.current(); if (w.ammo !== Infinity && state.ammo[w.id] <= 0) return false; state.cooldown = 1 / w.fireRate; if (w.ammo !== Infinity) state.ammo[w.id]--; return true; },
    addAmmo(id, n) { if (state.ammo[id] !== undefined) state.ammo[id] += n; },
    unlock(id) { state.owned[id] = true; if (G.prog && !G.prog.weaponsUnlocked.includes(id)) G.prog.weaponsUnlocked.push(id); },
    update(dt) { state.cooldown = Math.max(-1, state.cooldown - dt); },
  };
  return api;
}
