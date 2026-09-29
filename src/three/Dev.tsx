import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useSurvival } from '../store'

/**
 * Nhân vật "dev đói": thân capsule, đầu tròn, mắt dõi theo con trỏ,
 * miệng cong theo mức no, giọt mồ hôi khi đói, run rẩy khi sắp tắt nguồn.
 */
export function Dev(props: ThreeElements['group']) {
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const sweat = useRef<THREE.Mesh>(null)
  const cheeks = useRef<THREE.Group>(null)

  useFrame(({ pointer, clock }, dt) => {
    const fed = useSurvival.getState().fed
    const t = clock.elapsedTime
    const hunger = 1 - fed / 100
    if (root.current) {
      // run rẩy vì đói + thở nhẹ
      root.current.position.x = Math.sin(t * 40) * 0.012 * Math.max(0, hunger - 0.6) * 2.5
      root.current.scale.y = THREE.MathUtils.damp(root.current.scale.y, 1 + Math.sin(t * 2) * 0.015, 8, dt)
      root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, hunger * 0.12, 2, dt)
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * 0.5, 4, dt)
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * 0.25 + hunger * 0.25, 4, dt)
    }
    if (eyes.current) {
      // chớp mắt
      const blink = Math.sin(t * 1.3) > 0.985 ? 0.1 : 1
      eyes.current.scale.y = THREE.MathUtils.damp(eyes.current.scale.y, blink * (1 - hunger * 0.45), 20, dt)
    }
    if (mouth.current) {
      // mood: -1 (mếu) -> 1 (cười)
      const mood = fed / 50 - 1
      mouth.current.rotation.z = mood >= 0 ? Math.PI : 0
      mouth.current.scale.setScalar(THREE.MathUtils.damp(mouth.current.scale.x, 0.5 + Math.abs(mood) * 0.6, 4, dt))
      mouth.current.position.y = mood >= 0 ? -0.1 : -0.2
    }
    if (sweat.current) {
      sweat.current.visible = fed < 50
      sweat.current.position.y = 0.3 - ((t * 0.4) % 0.5)
    }
    if (cheeks.current) cheeks.current.visible = fed >= 70
  })

  return (
    <group {...props}>
      <group ref={root}>
        {/* thân + áo hoodie */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <capsuleGeometry args={[0.45, 0.6, 8, 24]} />
          <meshStandardMaterial color="#3b3f58" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.95, 0.4]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.35, 0.22, 0.05]} />
          <meshStandardMaterial color="#f25c54" roughness={0.6} />
        </mesh>
        <group ref={head} position={[0, 1.65, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.48, 48, 48]} />
            <meshStandardMaterial color="#ffd6b0" roughness={0.6} />
          </mesh>
          {/* tóc rối vì 3 ngày chưa gội */}
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i) * 0.28, 0.4 + (i % 3) * 0.03, Math.sin(i * 1.7) * 0.2 - 0.05]} rotation={[i, i * 2, i * 3]}>
              <coneGeometry args={[0.1, 0.28, 6]} />
              <meshStandardMaterial color="#1d1b1a" roughness={0.9} />
            </mesh>
          ))}
          {/* kính cận */}
          <group position={[0, 0.05, 0.43]}>
            {[-0.17, 0.17].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <torusGeometry args={[0.12, 0.018, 8, 32]} />
                <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
              </mesh>
            ))}
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.1, 0.02, 0.02]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
          <group ref={eyes} position={[0, 0.05, 0.44]}>
            {[-0.17, 0.17].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#111" />
              </mesh>
            ))}
          </group>
          {/* quầng thâm */}
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.43]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.07, 0.012, 6, 16, Math.PI]} />
              <meshBasicMaterial color="#7a5c8a" />
            </mesh>
          ))}
          <mesh ref={mouth} position={[0, -0.2, 0.45]}>
            <torusGeometry args={[0.1, 0.02, 8, 24, Math.PI]} />
            <meshBasicMaterial color="#5a2a2a" />
          </mesh>
          <mesh ref={sweat} position={[0.4, 0.3, 0.25]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshPhysicalMaterial color="#9fd8ff" transmission={0.6} roughness={0} thickness={0.2} />
          </mesh>
          <group ref={cheeks}>
            {[-0.3, 0.3].map((x) => (
              <mesh key={x} position={[x, -0.1, 0.38]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshBasicMaterial color="#ff8fa3" transparent opacity={0.7} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}
