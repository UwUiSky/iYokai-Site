// Qualità adattiva: se il frame time medio resta alto, scende di un gradino di risoluzione; all'ultimo gradino alleggerisce la scena.
const STEPS = [2, 1.5, 1.25, 1, 0.8];
export function createAdaptive(renderer, quality, { onLowest } = {}) {
  let i = Math.max(0, STEPS.findIndex((v) => v <= quality.dpr)), frames = 0, acc = 0, warm = 0;
  const off = /[?&]noadapt/.test(location.search);
  return { tick(dt) {
    if (off || dt > 0.25 || document.visibilityState !== 'visible') return;
    if (warm < 180) { warm++; return; }
    acc += dt; frames++;
    if (frames < 90) return;
    const slow = acc / frames > 0.028; acc = 0; frames = 0;
    if (!slow) return;
    if (i < STEPS.length - 1) { i++; renderer.setPixelRatio(Math.min(devicePixelRatio, STEPS[i])); renderer.setSize(innerWidth, innerHeight, false); } else onLowest?.();
  } };
}
