import { useMemo, useRef } from 'react'
import * as THREE from 'three/webgpu'
import { useFrame } from '@react-three/fiber'

/** Chùm hạt văng ra khi ăn trúng / đập trúng — InstancedMesh cho nhẹ. */
export function Burst({ position, color, count = 18 }: { position: [number, number, number]; color: string; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const born = useRef<number | null>(null)
  const dirs = useMemo(
    () => Array.from({ length: count }, () => new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.2, Math.random() - 0.5).normalize()),
    [count],
  )
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const s = useMemo(() => new THREE.Vector3(), [])
  const p = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    born.current ??= clock.elapsedTime
    const t = clock.elapsedTime - born.current
    dirs.forEach((d, i) => {
      p.copy(d).multiplyScalar(t * 3.2).add(new THREE.Vector3(...position))
      p.y -= t * t * 4
      s.setScalar(Math.max(0, 0.07 * (1 - t / 0.9)))
      ref.current!.setMatrixAt(i, m.compose(p, q, s))
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}
