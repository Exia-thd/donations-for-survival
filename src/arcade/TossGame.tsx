import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import { useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider, BallCollider, type RapierRigidBody } from '@react-three/rapier'
import { useArcade } from './store'
import { riceMaterial, mouthMaterial, chompUniform } from './materials'
import { Burst } from './Burst'
import { useSurvival } from '../store'

type Food = { id: number; pos: [number, number, number]; vel: [number, number, number]; kind: 'rice' | 'egg' }
let foodId = 0

/** Đầu dev khổng lồ há miệng, chạy qua lại; miệng là một sensor của Rapier. */
function Head({ onEat }: { onEat: (id: number, at: THREE.Vector3) => void }) {
  const body = useRef<RapierRigidBody>(null)
  const jaw = useRef<THREE.Mesh>(null)
  const mouthMat = useMemo(mouthMaterial, [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }, dt) => {
    const { status, score } = useArcade.getState()
    const speed = status === 'playing' ? 0.8 + score * 0.06 : 0.5
    const x = Math.sin(clock.elapsedTime * speed) * 2.2
    body.current?.setNextKinematicTranslation({ x, y: 1.6, z: -3 })
    chompUniform.value = THREE.MathUtils.damp(chompUniform.value, 0, 6, dt)
    if (jaw.current) jaw.current.position.y = -0.55 - Math.sin(clock.elapsedTime * 6) * 0.05 - chompUniform.value * 0.15
  })

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[0, 1.6, -3]}>
      {/* sensor ở miệng */}
      <CuboidCollider
        sensor
        args={[0.5, 0.35, 0.5]}
        position={[0, -0.35, 0.8]}
        onIntersectionEnter={({ other }) => {
          const id = other.rigidBodyObject?.userData?.food as number | undefined
          if (id === undefined) return
          const p = other.rigidBody?.translation()
          onEat(id, tmp.set(p?.x ?? 0, p?.y ?? 1.3, p?.z ?? -2.2))
        }}
      />
      {/* đầu */}
      <mesh>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial color="#ffd6b0" roughness={0.6} />
      </mesh>
      {/* miệng há to (một cái lỗ tối) + hàm dưới */}
      <mesh position={[0, -0.35, 0.93]} scale={[1, 0.7, 0.4]} material={mouthMat}>
        <sphereGeometry args={[0.42, 32, 16]} />
      </mesh>
      <mesh ref={jaw} position={[0, -0.55, 0.85]}>
        <boxGeometry args={[0.6, 0.08, 0.2]} />
        <meshStandardMaterial color="#ffc49a" />
      </mesh>
      {/* mắt thèm thuồng + kính */}
      {[-0.35, 0.35].map((x) => (
        <group key={x} position={[x, 0.25, 0.92]}>
          <mesh>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.02, 0.1]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <torusGeometry args={[0.2, 0.025, 8, 32]} />
            <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* tóc rối */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i) * 0.6, 0.9 + (i % 3) * 0.05, Math.sin(i * 1.7) * 0.4 - 0.1]} rotation={[i, i * 2, i * 3]}>
          <coneGeometry args={[0.2, 0.5, 6]} />
          <meshStandardMaterial color="#1d1b1a" />
        </mesh>
      ))}
    </RigidBody>
  )
}

function FoodBody({ food }: { food: Food }) {
  const rb = useRef<RapierRigidBody>(null)
  // đặt vận tốc đúng 1 lần lúc ném — prop linearVelocity bị áp lại mỗi lần re-render
  useEffect(() => {
    rb.current?.setLinvel({ x: food.vel[0], y: food.vel[1], z: food.vel[2] }, true)
    rb.current?.setAngvel({ x: 3, y: 2, z: 1 }, true)
  }, [food])
  const rice = useMemo(riceMaterial, [])
  return (
    <RigidBody ref={rb} position={food.pos} colliders={false} userData={{ food: food.id }} ccd>
      <BallCollider args={[0.22]} />
      {food.kind === 'rice' ? (
        // cơm nắm tam giác + miếng rong biển
        <group>
          <mesh material={rice} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 3]} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.2, 0.14, 0.22]} />
            <meshStandardMaterial color="#10261a" roughness={0.9} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh scale={[1, 0.35, 1]}>
            <sphereGeometry args={[0.26, 24, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.08, 0]} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#ffb703" emissive="#ff8c00" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
    </RigidBody>
  )
}

/** Mũi tên ngắm bám theo con trỏ. */
function Aim() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ pointer }) => {
    if (!ref.current) return
    ref.current.position.set(pointer.x * 2.6, 0.05, 1.6)
    ref.current.rotation.z = -pointer.x * 0.4
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.18, 0.5, 3]} />
      <meshBasicMaterial color="#ffc53d" transparent opacity={0.8} />
    </mesh>
  )
}

export function TossGame() {
  const [foods, setFoods] = useState<Food[]>([])
  const foodsRef = useRef(foods)
  foodsRef.current = foods
  const [bursts, setBursts] = useState<{ id: number; at: [number, number, number] }[]>([])
  const pointer = useThree((s) => s.pointer)

  const throwFood = () => {
    const { status } = useArcade.getState()
    if (status !== 'playing') return
    const id = ++foodId
    const x = pointer.x * 2.6
    const f: Food = {
      id,
      kind: Math.random() < 0.25 ? 'egg' : 'rice',
      pos: [x, 0.6, 2.2],
      // vy ≈ 4.4 → rơi đúng tầm miệng (y≈1.25, z≈-2.2) khi bấm giữa khung
      vel: [pointer.x * 0.8, 4.4 + pointer.y * 2.5, -6.2],
    }
    setFoods((all) => [...all.slice(-14), f])
    setTimeout(() => setFoods((all) => all.filter((a) => a.id !== id)), 3500)
  }

  const onEat = (id: number, at: THREE.Vector3) => {
    const food = foodsRef.current.find((f) => f.id === id)
    if (!food) return
    setFoods((all) => all.filter((f) => f.id !== id))
    const pts = food?.kind === 'egg' ? 2 : 1
    useArcade.getState().hit(pts)
    useSurvival.getState().feed(pts * 0.8)
    chompUniform.value = 1
    const b = { id, at: [at.x, at.y, at.z] as [number, number, number] }
    setBursts((all) => [...all.slice(-5), b])
    setTimeout(() => setBursts((all) => all.filter((x) => x.id !== id)), 900)
  }

  return (
    <group>
      {/* mặt phẳng vô hình bắt click toàn khung hình */}
      <mesh position={[0, 2, 0.5]} onPointerDown={throwFood}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Physics gravity={[0, -9.81, 0]}>
        <Head onEat={onEat} />
        {foods.map((f) => (
          <FoodBody key={f.id} food={f} />
        ))}
        {/* sàn */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[20, 0.1, 20]} position={[0, -0.1, 0]} />
        </RigidBody>
      </Physics>
      <Aim />
      {bursts.map((b) => (
        <Burst key={b.id} position={b.at} color="#ffe7a3" />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#17120c" roughness={1} />
      </mesh>
    </group>
  )
}
