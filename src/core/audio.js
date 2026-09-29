// Suono di carta giapponese strappata, sintetizzato: rumore a raffiche con decadimento.
let ctx;
export function tear(volume = 0.35) {
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (ctx.state !== 'running') return; // ingresso automatico senza gesto: niente audio
    const n = Math.floor(ctx.sampleRate * 0.7), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.15 + 0.5 * (1 - t) ? 1 : 0.15) * Math.pow(1 - t, 1.6);
    }
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.7; g.gain.value = volume;
    src.connect(f).connect(g).connect(ctx.destination); src.start();
  } catch { /* audio non disponibile */ }
}
