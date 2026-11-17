import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MAX_DPR, PETALS, type Tier } from '../lib/quality'
import { useApp } from '../store/app'
import { Sakura } from './Sakura'

/** Misura i fotogrammi su finestre di 3 secondi: sotto i 45 al secondo chiede meno petali. */
function Governor({ onDecline }: { onDecline: () => void }) {
  const sample = useRef({ frames: 0, time: 0, slow: 0 })
  useFrame((_, delta) => {
    const s = sample.current
    s.frames += 1
    s.time += delta
    if (s.time < 3) return
    s.slow = s.frames / s.time < 45 ? s.slow + 1 : 0
    s.frames = 0
    s.time = 0
    if (s.slow >= 2) {
      s.slow = 0
      onDecline()
    }
  })
  return null
}

/**
 * L'unico canvas del sito: sta sopra le illustrazioni e sotto il testo, è solo decorazione.
 * Si ferma quando la scheda non è visibile e scende di qualità se il dispositivo fatica.
 */
export default function Stage() {
  const tier = useApp((s) => s.tier)
  const setTier = useApp((s) => s.setTier)
  const [visible, setVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  if (tier === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden="true">
      <Canvas
        dpr={[1, MAX_DPR[tier]]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: tier >= 2, alpha: true, powerPreference: 'high-performance' }}
        eventSource={document.documentElement}
        eventPrefix="client"
      >
        <Governor onDecline={() => setTier(Math.max(1, tier - 1) as Tier)} />
        <ambientLight intensity={0.55} color="#c8c4bc" />
        <directionalLight position={[3, 5, 4]} intensity={1.1} color="#c8c4bc" />
        <pointLight position={[-4, -1, 2]} intensity={6} color="#c24a3a" distance={12} />
        <Sakura key={tier} count={PETALS[tier]} />
      </Canvas>
    </div>
  )
}
