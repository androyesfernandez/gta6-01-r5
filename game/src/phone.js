// phone.js — incoming-call panel for job briefs: showCall(character, lines) accepts a job.
import { CHARACTERS } from './story.js';
import { drawPortrait } from './portraits.js';
export function createPhone(G) {
  const panel = document.getElementById('phone-panel');
  const img = document.getElementById('phone-portrait');
  const nameEl = document.getElementById('phone-name');
  const textEl = document.getElementById('phone-text');
  let pendingJob = -1;
  const api = {
    showCall(characterKey, lines, jobIndex) {
      const ch = CHARACTERS[characterKey] || CHARACTERS.madre;
      pendingJob = jobIndex !== undefined ? jobIndex : G.prog.jobIndex;
      if (img) img.src = drawPortrait(ch);
      if (nameEl) nameEl.textContent = 'INCOMING — ' + ch.name;
      if (textEl) textEl.textContent = lines.join(' ');
      if (panel) panel.style.display = 'block';
      if (G.audio) G.audio.blip();
    },
    accept() { if (panel) panel.style.display = 'none'; if (G.missions && pendingJob >= 0) G.missions.beginStoryJob(pendingJob); },
    decline() { if (panel) panel.style.display = 'none'; },
    isOpen() { return panel && panel.style.display === 'block'; },
    update() { if (api.isOpen() && G.input) { if (G.input.wasPressed('KeyY')) api.accept(); if (G.input.wasPressed('KeyN')) api.decline(); } },
  };
  const btnA = document.getElementById('phone-accept'); if (btnA) btnA.addEventListener('click', () => api.accept());
  const btnD = document.getElementById('phone-decline'); if (btnD) btnD.addEventListener('click', () => api.decline());
  return api;
}
