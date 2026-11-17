import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

/**
 * L'illustrazione si sposta appena, contro il puntatore: pesante e lenta, come una scena con profondità.
 * Solo con un puntatore fine e con il movimento pieno; niente su telefono.
 */
export function usePointerDrift(scope: RefObject<HTMLElement | null>, enabled: boolean, amount = 14) {
  useEffect(() => {
    const root = scope.current
    if (!enabled || !root || !window.matchMedia('(pointer: fine)').matches) return
    const targets = () => root.querySelectorAll<HTMLElement>('[data-drift]')
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * -amount
      const y = (event.clientY / window.innerHeight - 0.5) * -amount * 0.6
      gsap.to(targets(), { x, y, duration: 1.6, ease: 'power3.out', overwrite: 'auto' })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      gsap.killTweensOf(targets())
      gsap.set(targets(), { clearProps: 'x,y' })
    }
  }, [scope, enabled, amount])
}
