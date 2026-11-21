// stats.js — completion %, career stats, MAP/STATS/CREW/SAVE pause-tab rendering.
import { RANKS } from './reputation.js';
import { JOBS, CHARACTERS } from './story.js';
import { drawBigMap } from './minimap.js';
export function completionPercent(prog) {
  const jobs = prog.jobIndex / 8, races = prog.racesWon.length / 4, stunts = prog.stuntsDone.length / 6, buoys = prog.buoysFound.length / 20;
  // Story-led weighting: jobs dominate completion, then stunts, then races and buoys.
  return Math.round((jobs * 0.6 + stunts * 0.3 + races * 0.05 + buoys * 0.05) * 100);
}
export function formatPlayTime(sec) { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60); return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }
export function createStats(G) {
  const el = (id) => document.getElementById(id);
  const api = {
    completion() { return completionPercent(G.prog); },
    renderAll() {
      const canvas = el('map-canvas'); if (canvas) drawBigMap(G, canvas);
      const grid = el('stats-grid');
      if (grid) {
        const s = G.prog.stats;
        const rows = [
          ['COMPLETION', api.completion() + '%'], ['JOBS DONE', G.prog.jobIndex + '/8'],
          ['RACES WON', G.prog.racesWon.length + '/4'], ['STUNT JUMPS', G.prog.stuntsDone.length + '/6'],
          ['GOLDEN BUOYS', G.prog.buoysFound.length + '/20'], ['CASH EARNED', '$' + s.earned.toLocaleString()],
          ['CARS STOLEN', String(s.stolen)], ['TOP SPEED', s.topSpeed + ' km/h'],
          ['BUSTS', String(s.busts)], ['WASTED', String(s.wasted)], ['TIME PLAYED', formatPlayTime(s.playSeconds)],
          ['RANK', G.reputation ? G.reputation.rankName() : 'RUNNER'],
        ];
        grid.innerHTML = rows.map((r) => '<div class="stat"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
      }
      const check = el('completion-list');
      if (check) check.innerHTML =
        '<div>STORY JOBS — ' + G.prog.jobIndex + '/8 · next: ' + (JOBS[G.prog.jobIndex] ? JOBS[G.prog.jobIndex].title : 'ALL DONE') + '</div>' +
        '<div>STREET RACES — ' + G.prog.racesWon.length + '/4</div><div>STUNT JUMPS — ' + G.prog.stuntsDone.length + '/6</div>' +
        '<div>GOLDEN BUOYS — ' + G.prog.buoysFound.length + '/20</div>';
      const ladder = el('rank-ladder');
      if (ladder && G.reputation) { const cur = G.reputation.rankIndex();
        ladder.innerHTML = RANKS.map((r, i) => '<div class="' + (i === cur ? 'cur' : i < cur ? 'done' : '') + '">' + (i === cur ? '▶ ' : '') + r.name + ' — ' + r.need + ' respect</div>').join(''); }
      const crewTab = el('crew-tab-list');
      if (crewTab) crewTab.innerHTML = Object.values(CHARACTERS).map((c) => '<div class="crewrow"><b>' + c.name + '</b><span>' + c.role + '</span></div>').join('') +
        (G.crew ? G.crew.members.map((m) => '<div class="crewrow"><b>' + m.name + ' — ' + m.ability + '</b><span>' + m.desc + ' · cooldown ' + m.cooldown + 's</span></div>').join('') : '');
      const slots = el('save-slots');
      if (slots && G.saveSys) { const sums = G.saveSys.summaries();
        slots.innerHTML = sums.map((s, i) => '<div class="slotcard"><b>SLOT ' + (i + 1) + '</b>' + (s ? '<span>' + s.rank + ' · $' + s.cash.toLocaleString() + ' · JOBS ' + s.jobsDone + '/8</span><button data-save="' + i + '">SAVE</button><button data-load="' + i + '">LOAD</button>' : '<span>EMPTY</span><button data-save="' + i + '">SAVE</button>') + '</div>').join('');
        slots.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
          if (b.dataset.save !== undefined && b.dataset.save !== '') { G.saveSys.save(Number(b.dataset.save)); api.renderAll(); }
          if (b.dataset.load !== undefined && b.dataset.load !== '') { G.saveSys.load(Number(b.dataset.load)); api.renderAll(); }
        })); }
    },
  };
  return api;
}
