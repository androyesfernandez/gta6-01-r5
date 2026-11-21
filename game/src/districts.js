// districts.js — world layout data + helpers: grid city, island, causeway, districts.
export const PITCH = 60;
export const ROAD_W = 14;
export const COLS = 10;
export const ROWS = 8;
// Mainland spans x in [-300,300], z in [-240,240]; roads sit on grid lines.
export function roadCenterX(i) { return -300 + i * PITCH; } // i 0..10 vertical roads
export function roadCenterZ(j) { return -240 + j * PITCH; } // j 0..8 horizontal roads
export function blockRect(col, row) {
  const x0 = roadCenterX(col) + ROAD_W / 2, x1 = roadCenterX(col + 1) - ROAD_W / 2;
  const z0 = roadCenterZ(row) + ROAD_W / 2, z1 = roadCenterZ(row + 1) - ROAD_W / 2;
  return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
}
export const ISLAND = { cx: 470, cz: -330, cols: 4, rows: 3, pitch: 60 };
export function islandRoadX(i) { return ISLAND.cx - 90 + i * ISLAND.pitch; }
export function islandRoadZ(j) { return ISLAND.cz - 60 + j * ISLAND.pitch; }
export const CAUSEWAY = { x0: 300, x1: 380, z: -330, width: 14 };
export const DISTRICTS = [
  { name: 'MALECÓN VIEJO', x0: -300, x1: 0, z0: 60, z1: 240, palette: [0xe8b04b, 0xd97b4f, 0xead9a0, 0xc96f5a], roof: 0x8a4b3a },
  { name: 'EL MERCADO', x0: 0, x1: 300, z0: 60, z1: 240, palette: [0xe07a3f, 0x3fa08c, 0xe8c84b, 0xd95f6e], roof: 0x6e3b2e },
  { name: 'PUERTO ALTO', x0: -300, x1: 0, z0: -240, z1: 60, palette: [0x9fb4c7, 0x7d94ad, 0xc7d3dd, 0x5f7d99], roof: 0x3d4f63 },
  { name: 'EL PUERTO', x0: 0, x1: 300, z0: -240, z1: 60, palette: [0xc9a86a, 0x8fa3b0, 0xb0764f, 0x6e8f7a], roof: 0x54443a },
  { name: 'LA ISLA', x0: 350, x1: 590, z0: -450, z1: -210, palette: [0xe8d9a0, 0xd97b8f, 0x7ac7b8, 0xe8b04b], roof: 0x7a4b5a },
];
export function districtAt(x, z) {
  for (const d of DISTRICTS) if (x >= d.x0 && x <= d.x1 && z >= d.z0 && z <= d.z1) return d;
  if (z > 240) return DISTRICTS[0];
  return DISTRICTS[3];
}
export function isRoad(x, z) {
  if (Math.abs(z - CAUSEWAY.z) < CAUSEWAY.width / 2 + 2 && x > 290 && x < 390) return true;
  if (x > 350 && x < 590 && z > -450 && z < -210) {
    for (let i = 0; i <= 4; i++) if (Math.abs(x - islandRoadX(i)) < ROAD_W / 2 + 1) return true;
    for (let j = 0; j <= 3; j++) if (Math.abs(z - islandRoadZ(j)) < ROAD_W / 2 + 1) return true;
    return false;
  }
  if (x < -310 || x > 310 || z < -250 || z > 250) return false;
  for (let i = 0; i <= COLS; i++) if (Math.abs(x - roadCenterX(i)) < ROAD_W / 2 + 1) return true;
  for (let j = 0; j <= ROWS; j++) if (Math.abs(z - roadCenterZ(j)) < ROAD_W / 2 + 1) return true;
  return false;
}
export function nearestRoadPoint(x, z) {
  let best = null, bd = 1e9;
  for (let i = 0; i <= COLS; i++) for (let j = 0; j <= ROWS; j++) {
    const d = Math.hypot(x - roadCenterX(i), z - roadCenterZ(j));
    if (d < bd) { bd = d; best = { x: roadCenterX(i), z: roadCenterZ(j), col: i, row: j }; }
  }
  return best;
}
export const BEACH_Z = 268;
export const SEA_Z = 300;
export const MARKET_PLAZA = { x: 150, z: 150 };
export const GARAGE_POS = { x: -270, z: -210 };
export const PIER_POS = { x: 60, z: 300 };
