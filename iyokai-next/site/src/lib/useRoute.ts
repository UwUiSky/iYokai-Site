import { useEffect } from 'react'
import { PROTOCOLS, type ProtocolId } from '../data/protocols'
import { useApp } from '../store/app'

type Route = { phase: 'hub' } | { phase: 'protocol'; protocol: ProtocolId; section: number }

/** `#/discord/3` → protocollo e sezione (da 1). Tutto ciò che non torna vale «scelta del protocollo». */
export function parseHash(hash: string): Route | null {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts[0] === 'protocolli') return { phase: 'hub' }
  const protocol = PROTOCOLS.find((p) => p.id === parts[0])
  if (!protocol) return { phase: 'hub' }
  const wanted = Number.parseInt(parts[1] ?? '1', 10)
  const section = Number.isInteger(wanted) ? Math.min(Math.max(wanted, 1), protocol.sections.length) - 1 : 0
  return { phase: 'protocol', protocol: protocol.id, section }
}

export function toHash(phase: string, protocol: ProtocolId, section: number): string {
  if (phase === 'intro') return ''
  if (phase === 'hub') return '#/protocolli'
  return section > 0 ? `#/${protocol}/${section + 1}` : `#/${protocol}`
}

/**
 * Tiene insieme indirizzo e stato: un link come `…/#/social` apre subito quella pagina (senza intro),
 * e i tasti avanti/indietro del browser funzionano. Cambiare sezione non riempie la cronologia.
 */
export function useRoute() {
  useEffect(() => {
    const apply = () => {
      const route = parseHash(window.location.hash)
      if (!route) return
      if (route.phase === 'hub') useApp.setState({ phase: 'hub', section: 0 })
      else useApp.setState({ phase: 'protocol', protocol: route.protocol, section: route.section })
    }
    apply()
    window.addEventListener('hashchange', apply)

    const unsubscribe = useApp.subscribe((state, previous) => {
      const next = toHash(state.phase, state.protocol, state.section)
      if (next === window.location.hash || (next === '' && !window.location.hash)) return
      const onlySection = state.phase === previous.phase && state.protocol === previous.protocol
      const url = next || window.location.pathname + window.location.search
      if (onlySection) window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
    })
    return () => {
      window.removeEventListener('hashchange', apply)
      unsubscribe()
    }
  }, [])
}
