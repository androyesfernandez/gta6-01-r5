// input.js — keyboard/mouse state with pressed-edge detection and pointer orbit deltas.
export function createInput(G) {
  const down = new Set(); const pressed = new Set();
  let orbitDX = 0, orbitDY = 0, wheelDelta = 0, mouseDown = false;
  const api = {
    down, pressed,
    isDown(code) { return down.has(code); },
    wasPressed(code) { return pressed.has(code); },
    consumeOrbit() { const r = { dx: orbitDX, dy: orbitDY }; orbitDX = 0; orbitDY = 0; return r; },
    isMouseDown() { return mouseDown; },
    endFrame() { pressed.clear(); },
    attach(el) {
      window.addEventListener('keydown', (e) => { if (!down.has(e.code)) pressed.add(e.code); down.add(e.code); if (G.audio) G.audio.init(); });
      window.addEventListener('keyup', (e) => down.delete(e.code));
      window.addEventListener('blur', () => down.clear());
      el.addEventListener('mousedown', (e) => { mouseDown = true; if (G.audio) G.audio.init(); });
      window.addEventListener('mouseup', () => { mouseDown = false; });
      el.addEventListener('mousemove', (e) => { if (mouseDown || e.buttons) { orbitDX += e.movementX || 0; orbitDY += e.movementY || 0; } });
      el.addEventListener('wheel', (e) => { wheelDelta += e.deltaY; }, { passive: true });
    },
  };
  return api;
}
