import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Petal = { x: number; y: number; z: number; speed: number; sway: number; phase: number; spin: THREE.Vector3; scale: number }

const AREA = { x: 9, y: 6, z: 5 }

function petalGeometry(): THREE.BufferGeometry {
  // Un petalo: un piano stretto, piegato lungo l'asse, con la punta chiusa.
  const geometry = new THREE.PlaneGeometry(0.11, 0.16, 3, 4)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const y = position.getY(i)
    const taper = 1 - Math.pow(Math.abs(y) / 0.08, 2) * 0.75
    position.setX(i, x * taper)
    position.setZ(i, Math.abs(x) * 0.5 + y * y * 1.5)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Pioggia di petali: una sola mesh istanziata. Il vento segue piano il puntatore. */
export function Sakura({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const wind = useRef(0)
  const geometry = useMemo(() => petalGeometry(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Lo stato dei petali cambia a ogni fotogramma: vive in un ref, fuori dal render.
  const state = useRef<Petal[] | null>(null)
  const build = (): Petal[] => {
    // Sequenza fissa: stessi petali a ogni caricamento, niente salti tra un render e l'altro.
    let seed = 7
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    return Array.from({ length: count }, () => ({
      x: -AREA.x + Math.pow(random(), 0.55) * AREA.x * 2,
      y: (random() - 0.5) * AREA.y * 2,
      z: -random() * AREA.z,
      speed: 0.18 + random() * 0.32,
      sway: 0.25 + random() * 0.55,
      phase: random() * Math.PI * 2,
      spin: new THREE.Vector3(random() * 1.2, random() * 1.6, random() * 0.8),
      scale: 0.6 + random() * 0.9,
    }))
  }

  useFrame((frame, delta) => {
    const instanced = mesh.current
    if (!instanced) return
    const petals = (state.current ??= build())
    const step = Math.min(delta, 0.05) // dopo una pausa della scheda i petali non saltano
    const time = frame.clock.elapsedTime
    wind.current += (frame.pointer.x * 0.6 - wind.current) * Math.min(1, step * 0.8)
    for (let i = 0; i < petals.length; i += 1) {
      const p = petals[i]
      p.y -= p.speed * step
      p.x += (wind.current * 0.35 + Math.sin(time * 0.4 + p.phase) * 0.05) * step
      if (p.y < -AREA.y) p.y = AREA.y
      if (p.x > AREA.x) p.x = -AREA.x
      else if (p.x < -AREA.x) p.x = AREA.x
      dummy.position.set(p.x + Math.sin(time * p.sway + p.phase) * 0.35, p.y, p.z)
      dummy.rotation.set(time * p.spin.x + p.phase, time * p.spin.y, time * p.spin.z + p.phase)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)
    }
    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshPhysicalMaterial
        color="#c8b8bc"
        roughness={0.38}
        sheen={0.6}
        sheenColor="#9b4d7a"
        emissive="#9b4d7a"
        emissiveIntensity={0.05}
        side={THREE.DoubleSide}
        transparent
        opacity={0.82}
      />
    </instancedMesh>
  )
}
