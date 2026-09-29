import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useSurvival } from '../store'

/** Bát cơm sứ trắng viền xanh kiểu Việt Nam, dựng bằng LatheGeometry. */
function useBowlGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = []
    // mặt ngoài: từ đáy lên miệng
    pts.push(new THREE.Vector2(0, 0), new THREE.Vector2(0.55, 0), new THREE.Vector2(0.6, 0.12))
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      pts.push(new THREE.Vector2(0.62 + Math.sin(t * Math.PI * 0.5) * 0.78, 0.12 + t * 0.9))
    }
    // vành miệng rồi đi xuống mặt trong
    pts.push(new THREE.Vector2(1.36, 1.04))
    for (let i = 12; i >= 0; i--) {
      const t = i / 12
      pts.push(new THREE.Vector2(0.55 + Math.sin(t * Math.PI * 0.5) * 0.77, 0.2 + t * 0.82))
    }
    pts.push(new THREE.Vector2(0, 0.2))
    const g = new THREE.LatheGeometry(pts, 64)
    g.computeVertexNormals()
    return g
  }, [])
}

export function Bowl() {
  const geo = useBowlGeometry()
  const rice = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    const fed = useSurvival.getState().fed
    const target = 0.02 + (fed / 100) * 0.78
    if (rice.current) {
      const s = rice.current.scale
      s.y = THREE.MathUtils.damp(s.y, target, 3, dt)
      rice.current.position.y = 0.2 + s.y * 0.5
      const r = 0.55 + Math.sin(Math.min(1, s.y / 0.82) * Math.PI * 0.5) * 0.75
      s.x = s.z = r
    }
  })

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geo} castShadow receiveShadow>
          <meshPhysicalMaterial color="#f4efe6" roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} side={THREE.DoubleSide} />
        </mesh>
      </RigidBody>
      {/* viền xanh truyền thống */}
      <mesh position={[0, 0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.34, 0.025, 12, 96]} />
        <meshStandardMaterial color="#2b59c3" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.018, 12, 96]} />
        <meshStandardMaterial color="#2b59c3" roughness={0.3} />
      </mesh>
      {/* cơm: là một cái "đồi" hình bán cầu dẹt, cao dần khi được donate */}
      <mesh ref={rice} position={[0, 0.21, 0]} scale={[0.55, 0.02, 0.55]}>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.9} />
      </mesh>
      {/* một hạt cơm cô đơn — biểu tượng của sự khắc khổ */}
      <mesh position={[0.25, 0.23, 0.1]} rotation={[0, 0.6, Math.PI / 2]}>
        <capsuleGeometry args={[0.025, 0.06, 4, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff6d5" emissiveIntensity={0.6} />
      </mesh>
      {/* đôi đũa gác hờ */}
      {[-0.1, 0.1].map((z, i) => (
        <mesh key={z} position={[0.15, 1.08, z + 0.35]} rotation={[0, 0.35 + i * 0.08, Math.PI / 2 - 0.05]} castShadow>
          <cylinderGeometry args={[0.022, 0.03, 2.2, 8]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
