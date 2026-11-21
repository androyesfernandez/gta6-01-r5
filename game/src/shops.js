// shops.js — 2 shops: harbour armour refill + market ammo, proximity panels.
export const SHOPS = [
  { name: 'HARBOUR ARMOURY', x: 30, z: -30, kind: 'armour' },
  { name: 'MERCADO AMMO', x: 210, z: 150, kind: 'ammo' },
];
export function createShops(G) {
  const panel = document.getElementById('shop-panel');
  const title = document.getElementById('shop-title');
  let current = null;
  const api = { shops: SHOPS, current: () => current,
    buy() {
      if (!current) return;
      if (current.kind === 'armour') { if (G.economy.spend(250)) { if (G.playerObj) G.playerObj.armour = 100; if (G.hud) G.hud.banner('ARMOUR REFILLED'); } }
      else { if (G.economy.spend(200)) { if (G.weaponsState) { G.weaponsState.addAmmo('pistol', 60); G.weaponsState.addAmmo('smg', 120); } if (G.hud) G.hud.banner('AMMO RESTOCKED'); } }
    },
    update() {
      if (!G.playerObj) return; const p = G.playerObj.pos();
      current = null;
      for (const s of SHOPS) if (Math.hypot(p.x - s.x, p.z - s.z) < 9) current = s;
      if (panel) { if (current) { panel.style.display = 'block'; if (title) title.textContent = current.name + (current.kind === 'armour' ? ' — ARMOUR $250 [B]' : ' — AMMO $200 [B]'); } else panel.style.display = 'none'; }
      if (current && G.input.wasPressed('KeyB')) api.buy();
    },
  };
  return api;
}
