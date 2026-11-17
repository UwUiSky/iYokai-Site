import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { protocolById, type Section } from '../data/protocols'
import { usePublicLinks, type PublicLinks } from '../data/links'
import { useApp } from '../store/app'
import { useSnap } from '../lib/useSnap'
import { useReducedMotion } from '../lib/useReducedMotion'
import { usePointerDrift } from '../lib/usePointerDrift'
import { dur, ease } from '../lib/motion'
import { cn } from '../lib/cn'
import { Incense } from '../ui/Incense'
import { LinkList } from '../ui/LinkList'

function SectionBody({ section, links, heading }: { section: Section; links: PublicLinks | null; heading: 'h1' | 'h2' }) {
  const Heading = heading
  return (
    <div
      className={cn(
        'scrollable relative flex h-full flex-col px-[var(--gutter)] max-md:pr-10 pb-[clamp(2.5rem,9vh,6rem)] pt-[clamp(5rem,14vh,9rem)]',
        section.align === 'low' ? 'justify-end' : 'justify-center',
      )}
    >
      <div className="max-w-[min(40rem,58vw)] max-md:max-w-none">
        <p data-settle className="kicker">
          {section.kicker}
        </p>
        <Heading data-settle className="display mt-4 text-[length:var(--text-h1)]">
          {section.title}
        </Heading>
        {section.body && (
          <p data-settle className="mt-6 max-w-[38ch] text-[length:var(--text-lead)] leading-[1.5] text-pale-ink/85">
            {section.body}
          </p>
        )}
        {section.list && (
          <ol data-settle className="mt-8 max-w-[34rem]">
            {section.list.map((row, i) => (
              <li key={row.name} className="grid grid-cols-[2.5ch_1fr] gap-x-4 border-t border-ash py-3 last:border-b">
                <span className="pt-1 text-[length:var(--text-micro)] tabular-nums text-mist">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="display block text-[length:clamp(1.35rem,2.2vw,1.9rem)]">{row.name}</span>
                  <span className="text-mist">{row.role}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
        {section.links && links && (
          <div data-settle>
            <LinkList items={section.links(links)} />
          </div>
        )}
      </div>
    </div>
  )
}

/** Un protocollo: sezioni a tutto schermo, una scrollata per sezione. */
export function ProtocolView() {
  const protocolId = useApp((s) => s.protocol)
  const index = useApp((s) => s.section)
  const setSection = useApp((s) => s.setSection)
  const backToHub = useApp((s) => s.backToHub)
  const reduced = useReducedMotion()
  const links = usePublicLinks()
  const protocol = protocolById(protocolId)
  const sections = protocol.sections
  const [locked, setLocked] = useState(false)
  const root = useRef<HTMLElement>(null)
  const previous = useRef(index)

  useSnap({ count: sections.length, index, locked, onChange: setSection, onExit: backToHub })
  usePointerDrift(root, !reduced)

  // Il passaggio: prima si muove il mondo (l'illustrazione), poi il testo.
  useEffect(() => {
    const from = previous.current
    previous.current = index
    const panels = root.current?.querySelectorAll<HTMLElement>('[data-panel]')
    const incoming = panels?.[index]
    if (!incoming) return
    incoming.querySelector<HTMLElement>('.scrollable')?.scrollTo({ top: 0 })
    if (reduced || from === index) return
    const direction = index > from ? 1 : -1
    const outgoing = panels?.[from]
    setLocked(true)
    const timeline = gsap.timeline({ onComplete: () => setLocked(false) })
    if (outgoing) {
      timeline.fromTo(
        outgoing,
        { autoAlpha: 1, yPercent: 0 },
        { autoAlpha: 0, yPercent: -6 * direction, duration: dur.std, ease: ease.dramatic },
        0,
      )
    }
    timeline
      .fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur.std, ease: ease.soft }, 0.15)
      .fromTo(incoming.querySelector('[data-art]'), { scale: 1.08 }, { scale: 1, duration: dur.cine, ease: ease.primary }, 0.15)
      .fromTo(
        incoming.querySelectorAll('[data-settle]'),
        { y: 26 * direction, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: ease.primary, stagger: 0.07 },
        0.45,
      )
    return () => {
      timeline.kill()
      gsap.set(panels ? Array.from(panels) : [], { clearProps: 'all' })
      setLocked(false)
    }
  }, [index, reduced])

  return (
    <main ref={root} className="relative h-full overflow-hidden bg-void" aria-label={protocol.name}>
      {sections.map((section, i) => (
        <section
          key={section.id}
          data-panel
          aria-labelledby={`${section.id}-title`}
          inert={i !== index}
          className={cn('absolute inset-0', i === index ? 'visible z-10' : 'invisible z-0')}
        >
          <div data-drift className="absolute -inset-4">
            <img
              data-art
              src={section.art}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              className="plate absolute inset-0 h-full w-full object-cover object-[72%_center] opacity-70 max-md:opacity-45"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-void)_12%,color-mix(in_srgb,var(--color-void)_62%,transparent)_48%,transparent_78%)] max-md:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-void)_70%,transparent),var(--color-void)_85%)]" />
          <div id={`${section.id}-title`} className="sr-only">
            {section.title}
          </div>
          <SectionBody section={section} links={links} heading={i === 0 ? 'h1' : 'h2'} />
        </section>
      ))}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-void)_78%,transparent),transparent)] px-[var(--gutter)] pb-10 pt-8">
        <button
          type="button"
          onClick={backToHub}
          className="kicker pointer-events-auto -m-3 p-3 transition-colors duration-[380ms] hover:text-pale-ink"
        >
          ← Protocolli
        </button>
        <p className="kicker">
          <span className="text-cinnabar">{protocol.number}</span> · {protocol.name}
        </p>
      </header>

      {sections.length > 1 && (
        <nav
          aria-label="Sezioni"
          className="absolute right-[calc(var(--gutter)/2)] top-1/2 z-20 flex -translate-y-1/2 items-center gap-4 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-void)_70%,transparent),transparent)] p-4 max-md:right-0 max-md:bg-none max-md:p-2"
        >
          <ol className="flex flex-col items-end gap-1 max-md:hidden">
            {sections.map((section, i) => (
              <li key={section.id}>
                <button
                  type="button"
                  disabled={locked}
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => setSection(i)}
                  className={cn(
                    'min-h-6 px-1 text-[length:var(--text-micro)] tabular-nums transition-colors duration-[380ms]',
                    i === index ? 'text-pale-ink' : 'text-mist hover:text-pale-ink',
                  )}
                >
                  <span className="sr-only">{section.kicker} </span>
                  {String(i + 1).padStart(2, '0')}
                </button>
              </li>
            ))}
          </ol>
          <Incense left={1 - index / (sections.length - 1)} className="h-[clamp(6rem,22vh,12rem)] transition-none" />
        </nav>
      )}
    </main>
  )
}
