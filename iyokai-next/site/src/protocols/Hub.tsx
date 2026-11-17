import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { PROTOCOLS, type ProtocolId } from '../data/protocols'
import { useApp } from '../store/app'
import { useCountdown } from '../lib/useCountdown'
import { useReducedMotion } from '../lib/useReducedMotion'
import { usePointerDrift } from '../lib/usePointerDrift'
import { dur, ease } from '../lib/motion'
import { cn } from '../lib/cn'
import { Incense } from '../ui/Incense'

const WAIT_SECONDS = 14
// Rientri diversi per riga: una colonna di tavolette appese, non una griglia.
const INDENT = ['0%', '14%', '5%', '20%', '9%', '16%']

/** La scelta del protocollo: mouse, tasti 1–6, oppure Discord Bot quando l'incenso finisce. */
export function Hub() {
  const open = useApp((s) => s.open)
  const reduced = useReducedMotion()
  const [focus, setFocus] = useState<ProtocolId>('discord')
  const [held, setHeld] = useState(false)
  const root = useRef<HTMLElement>(null)

  const left = useCountdown(WAIT_SECONDS, () => open('discord'), held)
  usePointerDrift(root, !reduced)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1
      if (index >= 0 && index < PROTOCOLS.length) open(PROTOCOLS[index].id)
      else if (event.key === 'Escape' || event.key === 'Tab' || event.key.startsWith('Arrow')) setHeld(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('[data-row]', { opacity: 0, x: -28, duration: 1.1, ease: ease.primary, stagger: 0.07 })
      gsap.from('[data-head]', { opacity: 0, y: 20, duration: dur.std, ease: ease.primary })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <main ref={root} className="relative h-full overflow-hidden bg-void">
      <div data-drift className="absolute -inset-4">
      {PROTOCOLS.map((p) => (
        <img
          key={p.id}
          src={p.art}
          alt=""
          loading={p.id === 'discord' ? 'eager' : 'lazy'}
          className={cn(
            'plate pointer-events-none absolute inset-0 h-full w-full object-cover object-[72%_center] transition-opacity duration-[900ms] ease-[var(--ease-soft)]',
            focus === p.id ? 'opacity-55' : 'opacity-0',
          )}
        />
      ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-void)_18%,color-mix(in_srgb,var(--color-void)_55%,transparent)_55%,transparent)]" />

      <div className="relative grid h-full grid-rows-[auto_1fr_auto] px-[var(--gutter)] pb-8 pt-8">
        <header data-head className="flex items-start justify-between">
          <p className="kicker">
            iYokai <span className="font-fude text-pale-ink">ミ</span>
          </p>
          <p className="kicker max-md:hidden">Premi 1–6, oppure scegli</p>
        </header>

        <nav aria-label="Protocolli" className="scrollable flex flex-col justify-center gap-[clamp(0.25rem,1.4vh,1rem)] py-6">
          <h1 data-head className="kicker mb-4">
            Scegli il protocollo
          </h1>
          {PROTOCOLS.map((p, i) => (
            <button
              key={p.id}
              data-row
              type="button"
              onClick={() => open(p.id)}
              onPointerEnter={() => setFocus(p.id)}
              onFocus={() => setFocus(p.id)}
              style={{ marginLeft: `clamp(0px, ${INDENT[i]}, 22vw)` }}
              className="group flex w-fit max-w-full items-baseline gap-[clamp(0.75rem,2vw,1.75rem)] text-left"
            >
              <span className="w-[2ch] text-[length:var(--text-micro)] tabular-nums text-mist">{p.number}</span>
              <span
                className={cn(
                  'display text-[length:clamp(2.1rem,6.4vh,4.75rem)] transition-colors duration-[380ms]',
                  focus === p.id ? 'text-pale-ink' : 'text-mist',
                )}
              >
                {p.name}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'font-fude text-[length:var(--text-lead)] transition-colors duration-[380ms]',
                  focus === p.id ? 'text-cinnabar' : 'text-ash',
                )}
              >
                {p.kanji}
              </span>
            </button>
          ))}
        </nav>

        <footer className="flex items-end justify-between gap-6">
          <p className="max-w-[38ch] text-mist" aria-live="polite">
            {PROTOCOLS.find((p) => p.id === focus)?.line}
          </p>
          <div className="flex items-end gap-3">
            <span className="kicker max-w-[16ch] text-right max-md:hidden">
              {held ? 'Attesa fermata' : 'Poi si apre Discord Bot'}
            </span>
            <Incense left={left} className="h-20" />
          </div>
        </footer>
      </div>
    </main>
  )
}
