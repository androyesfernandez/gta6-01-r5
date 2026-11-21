// dialogue.js — dialogue box UI queue with portraits; phone.js briefs reuse showLine.
import { CHARACTERS } from './story.js';
import { drawPortrait } from './portraits.js';
export function createDialogue(G) {
  const box = document.getElementById('dialogue-box');
  const img = document.getElementById('dialogue-portrait');
  const nameEl = document.getElementById('dialogue-name');
  const textEl = document.getElementById('dialogue-text');
  const queue = []; let showing = null, timer = 0;
  function showLine(speakerKey, text, holdSeconds) {
    const ch = CHARACTERS[speakerKey] || CHARACTERS.madre;
    queue.push({ ch, text, hold: holdSeconds || 4.5 });
  }
  function showNow(item) {
    showing = item; timer = item.hold;
    if (img) img.src = drawPortrait(item.ch);
    if (nameEl) nameEl.textContent = item.ch.name;
    if (textEl) textEl.textContent = item.text;
    if (box) box.style.display = 'flex';
  }
  const api = { showLine, queue,
    hide() { showing = null; if (box) box.style.display = 'none'; },
    update(dt) {
      if (showing) { timer -= dt; if (timer <= 0) { showing = null; if (box) box.style.display = 'none'; } }
      else if (queue.length) showNow(queue.shift());
    } };
  return api;
}
