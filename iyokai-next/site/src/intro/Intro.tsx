import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useApp } from '../store/app'
import { useCountdown } from '../lib/useCountdown'
import { useReducedMotion } from '../lib/useReducedMotion'
import { dur, ease } from '../lib/motion'
import { Incense } from '../ui/Incense'

const WAIT_SECONDS = 9

/** La soglia: il comando è già scritto sul talismano. Invio, un tocco, o l'incenso che finisce. */
export function Intro() {
  const enter = useApp((s) => s.enter)
  const reduced = useReducedMotion()
  const [held, setHeld] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const root = useRef<HTMLElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    if (reduced || !root.current) return enter()
    gsap
      .timeline({ onComplete: enter })
      .to('[data-mask]', { opacity: 0, scale: 1.06, filter: 'blur(14px)', duration: dur.cine, ease: ease.dramatic }, 0)
      .to('[data-rise]', { opacity: 0, y: -18, duration: dur.std, ease: ease.primary, stagger: 0.05 }, 0)
  }

  const left = useCountdown(WAIT_SECONDS, leave, held || leaving)

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('[data-mask]', { opacity: 0, scale: 0.96, duration: dur.cine, ease: ease.primary })
      gsap.from('[data-rise]', { opacity: 0, y: 22, duration: 1.1, ease: ease.primary, stagger: 0.08, delay: 0.2 })
    },
    { scope: root, dependencies: [reduced] },
  )

  useEffect(() => {
    button.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHeld(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main ref={root} className="relative grid h-full grid-rows-[1fr_auto] overflow-hidden bg-void px-[var(--gutter)] pb-10 pt-8">
      <img
        data-mask
        src="/art/gate-mask.webp"
        alt=""
        width={360}
        height={448}
        className="pointer-events-none absolute left-[66%] top-[46%] w-[clamp(11rem,26vw,24rem)] -translate-x-1/2 -translate-y-1/2 select-none max-md:left-1/2 max-md:top-[34%]"
      />

      <p data-rise className="kicker self-start">
        iYokai <span className="font-fude text-pale-ink">ミ</span> · sessione notturna
      </p>

      <div className="flex items-end justify-between gap-8">
        <form
          className="max-w-[34rem]"
          onSubmit={(event) => {
            event.preventDefault()
            leave()
          }}
        >
          <h1 data-rise className="display text-[length:var(--text-h1)]">
            Il regno attende
            <br />
            <em>il comando.</em>
          </h1>
          <p data-rise className="mt-6 flex items-baseline gap-4 border-l border-ash pl-4">
            <span className="kicker">Talismano</span>
            <span className="font-fude text-[length:var(--text-lead)] text-pale-ink">/iYokai ミ</span>
          </p>
          <div data-rise className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              ref={button}
              type="submit"
              className="bg-cinnabar px-7 py-3 text-[length:var(--text-micro)] uppercase tracking-[0.22em] text-void transition-colors duration-[380ms] hover:bg-pale-ink"
            >
              Entra nel mondo
            </button>
            <span className="text-[length:var(--text-micro)] text-mist" aria-live="polite">
              {held ? 'Attesa fermata: premi Invio quando vuoi.' : 'Invio per entrare · Esc per restare qui'}
            </span>
          </div>
        </form>

        <div data-rise className="flex flex-col items-center gap-3 max-md:hidden">
          <Incense left={left} className="h-[clamp(8rem,26vh,16rem)]" />
          <span className="kicker [writing-mode:vertical-rl]">妖怪召喚</span>
        </div>
      </div>
    </main>
  )
}
