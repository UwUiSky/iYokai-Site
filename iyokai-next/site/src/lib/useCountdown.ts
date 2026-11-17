import { useEffect, useRef, useState } from 'react'

/**
 * Conto alla rovescia in secondi: restituisce quanto resta (da 1 a 0) e chiama `onDone` alla fine.
 * `paused` lo ferma (Esc, o la persona sta usando la tastiera).
 */
export function useCountdown(seconds: number, onDone: () => void, paused = false): number {
  const [left, setLeft] = useState(1)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (paused) return
    let frame = 0
    let last = performance.now()
    let remaining = left * seconds
    const tick = (now: number) => {
      remaining -= (now - last) / 1000
      last = now
      if (remaining <= 0) {
        setLeft(0)
        done.current()
        return
      }
      setLeft(remaining / seconds)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // `left` si legge solo alla ripartenza dopo una pausa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, seconds])

  return left
}
