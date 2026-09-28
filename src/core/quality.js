// Tier di qualità iniziale da hardware e tipo di input; in seguito si adatta al frame time reale.
const TIERS = {
  high: { dpr: 2, particles: 60000, post: true },
  mid: { dpr: 1.5, particles: 24000, post: true },
  low: { dpr: 1, particles: 8000, post: false },
};
export function detectTier() {
  const cores = Math.min(navigator.hardwareConcurrency || 4, 8) / 8;
  const mem = Math.min(navigator.deviceMemory || 4, 8) / 8;
  const coarse = matchMedia('(pointer: coarse)').matches ? 0.1 : 0;
  const score = cores * 0.5 + mem * 0.5 - coarse;
  const tier = score > 0.7 ? 'high' : score > 0.4 ? 'mid' : 'low';
  return { tier, ...TIERS[tier] };
}
