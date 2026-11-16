import { lazy, Suspense, useEffect } from 'react'
import { useApp } from './store/app'
import { detectTier } from './lib/quality'
import { useReducedMotion } from './lib/useReducedMotion'
import { Intro } from './intro/Intro'
import { Hub } from './protocols/Hub'
import { ProtocolView } from './protocols/ProtocolView'

// Il 3D arriva dopo il primo schermo: il testo non lo aspetta mai.
const Stage = lazy(() => import('./stage/Stage'))

export default function App() {
  const phase = useApp((s) => s.phase)
  const protocol = useApp((s) => s.protocol)
  const setTier = useApp((s) => s.setTier)
  const reduced = useReducedMotion()

  useEffect(() => {
    setTier(detectTier(reduced))
  }, [reduced, setTier])

  return (
    <>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-pale-ink focus:px-4 focus:py-2 focus:text-void"
      >
        Vai al contenuto
      </a>
      <div id="contenuto" className="relative z-0 h-full">
        {phase === 'intro' && <Intro />}
        {phase === 'hub' && <Hub />}
        {phase === 'protocol' && <ProtocolView key={protocol} />}
      </div>
      {phase !== 'intro' && (
        <Suspense fallback={null}>
          <Stage />
        </Suspense>
      )}
    </>
  )
}
