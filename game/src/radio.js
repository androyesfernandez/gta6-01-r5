// radio.js — RADIO CANDELA 98.4 ticker lines + fake track rotation.
import { RADIO_LINES } from './story.js';
export function createRadio(G) {
  const el = document.getElementById('radio-ticker');
  let idx = 0, timer = 0;
  const radio = { station: 'RADIO CANDELA 98.4', lines: RADIO_LINES,
    current() { return RADIO_LINES[idx % RADIO_LINES.length]; },
    setLine(i) { idx = i; if (el) el.textContent = radio.current(); },
    update(dt) { timer -= dt; if (timer <= 0) { timer = 7; idx++; if (el) el.textContent = radio.current(); } },
  };
  if (el) el.textContent = radio.current();
  return radio;
}
