// portraits.js — drawPortrait(character) -> canvas data URL, flat-shaded stylised faces.
const cache = {};
export function drawPortrait(ch) {
  if (cache[ch.name]) return cache[ch.name];
  const c = document.createElement('canvas'); c.width = 96; c.height = 96; const g = c.getContext('2d');
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  g.fillStyle = ch.accent || '#e8b04b'; g.fillRect(0, 0, 96, 96);
  g.fillStyle = hex(ch.shirt); g.fillRect(18, 74, 60, 22); // shoulders / shirt
  g.fillStyle = hex(ch.skin); g.beginPath(); g.ellipse(48, 46, 20, 24, 0, 0, Math.PI * 2); g.fill(); // face
  g.fillStyle = hex(ch.hair); g.beginPath(); g.ellipse(48, 26, 21, 11, 0, Math.PI, Math.PI * 2); g.fill(); // hair cap
  g.fillRect(27, 24, 5, 18); g.fillRect(64, 24, 5, 18);
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(40, 46, 2.6, 0, 7); g.arc(56, 46, 2.6, 0, 7); g.fill(); // eyes
  g.strokeStyle = '#5a3420'; g.lineWidth = 2; g.beginPath(); g.arc(48, 58, 7, 0.3, Math.PI - 0.3); g.stroke(); // mouth
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.font = 'bold 9px sans-serif'; g.textAlign = 'center';
  const url = c.toDataURL(); cache[ch.name] = url; return url;
}
export function portraitCacheSize() { return Object.keys(cache).length; }
