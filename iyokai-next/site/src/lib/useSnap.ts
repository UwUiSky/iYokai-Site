import { useEffect, useRef } from 'react'

type Options = {
  count: number
  index: number
  locked: boolean
  onChange: (next: number) => void
  onExit?: () => void
}

/** Il primo antenato che scorre davvero in quella direzione: lì dentro lo scatto non parte. */
function scrollsInside(target: EventTarget | null, direction: number): boolean {
  let node = target instanceof Element ? target : null
  while (node) {
    if (node instanceof HTMLElement && node.classList.contains('scrollable') && node.scrollHeight > node.clientHeight + 1) {
      const atTop = node.scrollTop <= 0
      const atEnd = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
      if ((direction > 0 && !atEnd) || (direction < 0 && !atTop)) return true
    }
    node = node.parentElement
  }
  return false
}

/**
 * Navigazione a scatti: un gesto = una sezione. Rotella e trackpad (i tanti piccoli eventi
 * di un solo gesto contano una volta), frecce, Pagina su/giù, spazio, e lo scorrimento col dito.
 */
export function useSnap({ count, index, locked, onChange, onExit }: Options) {
  const state = useRef({ count, index, locked, onChange, onExit })
  useEffect(() => {
    state.current = { count, index, locked, onChange, onExit }
  })

  useEffect(() => {
    let sum = 0
    let lastWheel = 0
    let quietUntil = 0
    let touchY: number | null = null

    const step = (direction: number) => {
      const s = state.current
      if (s.locked) return
      const next = s.index + direction
      if (next < 0 || next >= s.count) return
      quietUntil = performance.now() + 900 // la coda d'inerzia del trackpad non fa un secondo scatto
      s.onChange(next)
    }

    const onWheel = (event: WheelEvent) => {
      const direction = Math.sign(event.deltaY)
      if (!direction || scrollsInside(event.target, direction)) return
      event.preventDefault()
      const now = performance.now()
      if (now < quietUntil) return
      if (now - lastWheel > 220) sum = 0
      lastWheel = now
      sum += event.deltaY
      if (Math.abs(sum) >= 48) {
        sum = 0
        step(direction)
      }
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return
      if (['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey)) {
        if (event.key === ' ' && event.target instanceof HTMLElement && /^(BUTTON|A)$/.test(event.target.tagName)) return
        event.preventDefault()
        step(1)
      } else if (['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)) {
        event.preventDefault()
        step(-1)
      } else if (event.key === 'Escape') {
        state.current.onExit?.()
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null
    }
    const onTouchEnd = (event: TouchEvent) => {
      if (touchY === null) return
      const delta = touchY - (event.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      if (Math.abs(delta) < 56) return
      const direction = Math.sign(delta)
      if (!scrollsInside(event.target, direction)) step(direction)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
