// audio.js — WebAudio synth: engine hum, siren, gunshot, blip, chime. Guarded, gesture-init.
export function createAudio(G) {
  let ctx = null, engineOsc = null, engineGain = null, sirenOsc = null, sirenGain = null, sirenT = 0;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC();
      engineOsc = ctx.createOscillator(); engineGain = ctx.createGain();
      engineOsc.type = 'sawtooth'; engineOsc.frequency.value = 55; engineGain.gain.value = 0;
      engineOsc.connect(engineGain); engineGain.connect(ctx.destination); engineOsc.start();
      sirenOsc = ctx.createOscillator(); sirenGain = ctx.createGain();
      sirenOsc.type = 'sine'; sirenGain.gain.value = 0; sirenOsc.connect(sirenGain); sirenGain.connect(ctx.destination); sirenOsc.start();
    } catch (e) { ctx = null; }
  }
  function burst(dur, freq, gain, type) {
    if (!ctx) return;
    try { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur); } catch (e) { /* no-op */ }
  }
  const api = { init,
    engine(level) { if (!ctx || !engineOsc) return; try { engineOsc.frequency.value = 50 + level * 130; engineGain.gain.value = G.mode === 'play' && G.playerObj && G.playerObj.inCar ? 0.03 + level * 0.03 : 0; } catch (e) { /* no-op */ } },
    siren() { if (!ctx || !sirenOsc) return; sirenT += 0.016; try { sirenOsc.frequency.value = Math.sin(sirenT * 6) > 0 ? 700 : 950; sirenGain.gain.value = 0.012; } catch (e) { /* no-op */ } },
    sirenOff() { if (sirenGain) try { sirenGain.gain.value = 0; } catch (e) { /* no-op */ } },
    gunshot() { burst(0.14, 180, 0.16, 'sawtooth'); },
    blip() { burst(0.07, 880, 0.06, 'sine'); },
    chime() { burst(0.22, 1320, 0.07, 'sine'); setTimeout(() => burst(0.3, 1760, 0.06, 'sine'), 90); },
    update() { if (G.wanted && G.wanted.stars === 0) api.sirenOff(); },
  };
  return api;
}
