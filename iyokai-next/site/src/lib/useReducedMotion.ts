import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

/** Vero se la persona ha chiesto meno movimento. Segue il cambio dell'impostazione dal vivo. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
