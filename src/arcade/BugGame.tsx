import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useArcade } from './store'
import { bugMaterial, keyboardMaterial } from './materials'
import { Burst } from './Burst'
import { useSurvival } from '../store'

const W = 3.6
const D = 2.2
type Bug = { id: number; x: number; z: number; angle: number; speed: number; golden: boolean; dead: number | null }
let bugId = 0

function spawn(score: number): Bug {
  return {
    id: ++bugId,
    x: (Math.random() - 0.5) * W * 1.8,
    z: (Math.random() - 0.5) * D * 1.8,
    angle: Math.random() * Math.PI * 2,
    speed: 0.9 + Math.random() * 0.6 + score * 0.04,
    golden: Math.random() < 0.12,
    dead: null,
  }
}

function BugMesh({ bug, onSquash }: { bug: Bug; onSquash: (b: Bug, e: ThreeEvent<PointerEvent>) => void }) {
  const ref = useRef<THREE.Group>(null)
  const legs = useRef<THREE.Group>(null)
  const shell = useMemo(bugMaterial, [])

  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    if (bug.dead !== null) {
      // bẹp dí
      g.scale.y = THREE.MathUtils.damp(g.scale.y, 0.08, 18, dt)
      g.scale.x = g.scale.z = THREE.MathUtils.damp(g.scale.x, 1.5, 18, dt)
      return
    }
    // bò ngoằn ngoèo, dội lại ở mép bàn phím
    bug.angle += Math.sin(clock.elapsedTime * 3 + bug.id) * dt * 2
    bug.x += Math.cos(bug.angle) * bug.speed * dt
    bug.z += Math.sin(bug.angle) * bug.speed * dt
    if (Math.abs(bug.x) > W) { bug.x = Math.sign(bug.x) * W; bug.angle = Math.PI - bug.angle }
    if (Math.abs(bug.z) > D) { bug.z = Math.sign(bug.z) * D; bug.angle = -bug.angle }
    g.position.set(bug.x, 0.12, bug.z)
    g.rotation.y = -bug.angle
    if (legs.current) legs.current.rotation.x = Math.sin(clock.elapsedTime * 30 + bug.id) * 0.25
  })

  return (
    <group ref={ref} position={[bug.x, 0.12, bug.z]} onPointerDown={(e) => onSquash(bug, e)}>
      <mesh material={bug.golden ? undefined : shell} scale={[1.3, 0.6, 1]}>
        <sphereGeometry args={[0.2, 24, 16]} />
        {bug.golden && <meshStandardMaterial color="#ffc53d" metalness={1} roughness={0.15} emissive="#7a5200" />}
      </mesh>
      <mesh position={[0.26, 0.02, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {[-0.05, 0.05].map((z) => (
        <mesh key={z} position={[0.33, 0.06, z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ff3b3b" />
        </mesh>
      ))}
      <group ref={legs}>
        {[-0.12, 0, 0.12].flatMap((x) =>
          [-1, 1].map((side) => (
            <mesh key={`${x}${side}`} position={[x, -0.02, side * 0.2]} rotation={[side * 0.9, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.2, 4]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          )),
        )}
      </group>
      {/* hitbox to hơn cho dễ bấm trên điện thoại */}
      <mesh>
        <sphereGeometry args={[0.38, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function BugGame() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [splats, setSplats] = useState<{ id: number; at: [number, number, number]; gold: boolean }[]>([])
  const nextSpawn = useRef(0)
  const kb = useMemo(keyboardMaterial, [])

  useFrame(({ clock }) => {
    const { status, score } = useArcade.getState()
    if (status !== 'playing') {
      if (bugs.length && status === 'idle') setBugs([])
      return
    }
    const alive = bugs.filter((b) => b.dead === null).length
    if (clock.elapsedTime > nextSpawn.current && alive < 10) {
      nextSpawn.current = clock.elapsedTime + Math.max(0.35, 1.1 - score * 0.03)
      setBugs((all) => [...all, spawn(score)])
    }
  })

  const onSquash = (bug: Bug, e: ThreeEvent<PointerEvent>) => {
    // mutate trực tiếp để useFrame thấy ngay, không chờ re-render
    e.stopPropagation()
    if (bug.dead !== null || useArcade.getState().status !== 'playing') return
    bug.dead = 1
    const pts = bug.golden ? 3 : 1
    useArcade.getState().hit(pts)
    useSurvival.getState().feed(pts * 0.5)
    const s = { id: bug.id, at: [bug.x, 0.2, bug.z] as [number, number, number], gold: bug.golden }
    setSplats((all) => [...all.slice(-6), s])
    setTimeout(() => setSplats((all) => all.filter((x) => x.id !== bug.id)), 900)
    setTimeout(() => setBugs((all) => all.filter((b) => b.id !== bug.id)), 700)
  }

  return (
    <group>
      {/* laptop: bàn phím (TSL) + màn hình báo lỗi */}
      <mesh position={[0, -0.05, 0]} material={kb}>
        <boxGeometry args={[W * 2 + 0.6, 0.1, D * 2 + 0.6]} />
      </mesh>
      <mesh position={[0, 1.4, -D - 0.35]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[W * 2 + 0.6, 2.8, 0.08]} />
        <meshStandardMaterial color="#141418" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.4, -D - 0.3]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[W * 2 + 0.2, 2.5]} />
        <meshStandardMaterial color="#3a0d0d" emissive="#ff3b3b" emissiveIntensity={0.35} />
      </mesh>
      {bugs.map((b) => (
        <BugMesh key={b.id} bug={b} onSquash={onSquash} />
      ))}
      {splats.map((s) => (
        <Burst key={s.id} position={s.at} color={s.gold ? '#ffc53d' : '#7CFC9A'} count={14} />
      ))}
    </group>
  )
}
