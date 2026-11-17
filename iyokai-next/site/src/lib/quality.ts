/** Livello di qualità: 0 = nessun 3D, 1 = mobile, 2 = laptop medio, 3 = GPU dedicata. */
export type Tier = 0 | 1 | 2 | 3

function hasWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'))
  } catch {
    return false
  }
}

export function detectTier(reducedMotion: boolean): Tier {
  if (reducedMotion || !hasWebGL2()) return 0
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse || window.innerWidth < 768) return 1
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return cores <= 4 || memory <= 4 ? 2 : 3
}

export const PETALS: Record<Tier, number> = { 0: 0, 1: 140, 2: 360, 3: 640 }
export const MAX_DPR: Record<Tier, number> = { 0: 1, 1: 1.5, 2: 1.5, 3: 2 }
