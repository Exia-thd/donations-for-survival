import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { RigidBody, CylinderCollider } from '@react-three/rapier'
import { useSurvival } from '../store'

type Coin = { key: string; pos: [number, number, number]; rot: [number, number, number] }
const MAX_COINS = 70

export function Coins() {
  const drops = useSurvival((s) => s.coinDrops)
  const [coins, setCoins] = useState<Coin[]>([])
  const geo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.16, 0.04, 28), [])
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffc53d', metalness: 1, roughness: 0.22, emissive: '#5a3a00', emissiveIntensity: 0.3 }),
    [],
  )

  useEffect(() => {
    const last = drops.at(-1)
    if (!last) return
    const fresh: Coin[] = Array.from({ length: last.count }, (_, i) => ({
      key: `${last.id}-${i}`,
      pos: [(Math.random() - 0.5) * 1.2, 3.2 + i * 0.28, (Math.random() - 0.5) * 1.2],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    }))
    setCoins((c) => [...c, ...fresh].slice(-MAX_COINS))
  }, [drops])

  return (
    <>
      {coins.map((c) => (
        <RigidBody key={c.key} position={c.pos} rotation={c.rot} colliders={false} ccd restitution={0.35} friction={0.6}>
          <CylinderCollider args={[0.02, 0.16]} />
          <mesh geometry={geo} material={mat} castShadow />
        </RigidBody>
      ))}
    </>
  )
}
