import type { LinkItem } from '../data/links'

/** L'elenco dei link di una sezione. Un link non ancora configurato resta visibile ma spento. */
export function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <ul className="mt-8 max-w-[30rem] border-t border-ash">
      {items.map((item, i) => {
        const row = (
          <>
            <span className="display text-[length:clamp(1.5rem,2.6vw,2.25rem)]">{item.label}</span>
            <span className="text-[length:var(--text-micro)] uppercase tracking-[0.18em]">
              {item.href ? `${item.note ?? 'Apri'} ↗` : 'In arrivo'}
            </span>
          </>
        )
        const layout = 'flex min-h-11 items-baseline justify-between gap-6 border-b border-ash py-3'
        return (
          <li key={`${item.label}-${item.note ?? i}`}>
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={`${layout} text-pale-ink transition-colors duration-[380ms] hover:text-cinnabar`}
              >
                {row}
              </a>
            ) : (
              <span className={`${layout} text-mist`} aria-disabled="true">
                {row}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
