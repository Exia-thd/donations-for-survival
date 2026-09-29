import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, Sparkles, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { Physics, CuboidCollider, RigidBody } from '@react-three/rapier'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Bowl } from './Bowl'
import { Coins } from './Coins'
import { Dev } from './Dev'
import { useSurvival } from '../store'

/** Thu nhỏ cả cảnh trên màn hình hẹp để nhân vật không bị cắt mép. */
function Responsive({ children }: { children: React.ReactNode }) {
  const aspect = useThree((s) => s.viewport.aspect)
  const k = Math.min(1, aspect / 1.05)
  return <group scale={k} position={[0, 0.3 * (1 - k), 0]}>{children}</group>
}

function Steam() {
  const fed = useSurvival((s) => s.fed)
  if (fed < 25) return null
  return <Sparkles count={Math.round(fed / 2)} scale={[1.6, 1.8, 1.6]} position={[0, 1.9, 0]} size={4} speed={0.6} color="#fff4d6" opacity={0.6} />
}

export default function Scene({ label }: { label: string }) {
  const [hq, setHq] = useState(true)
  const powerSaving = useSurvival((s) => s.powerSaving)
  const dropCoins = useSurvival((s) => s.dropCoins)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.35, 3, 6.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onClick={() => {
        // bấm trúng dev là "chọc", không tính là thả xu
        const poke = useSurvival.getState().poke
        if (poke && performance.now() - poke.at < 400) return
        dropCoins(1)
      }}
      onCreated={({ camera }) => camera.lookAt(0.35, 0.55, 0)}
      aria-label={label}
    >
      <PerformanceMonitor onDecline={() => setHq(false)} />
      <AdaptiveDpr pixelated />
      <fog attach="fog" args={['#0b0a09', 9, 18]} />
      <ambientLight intensity={0.25} />
      <spotLight position={[4, 8, 5]} angle={0.4} penumbra={0.8} intensity={120} castShadow shadow-mapSize={[1024, 1024]} color="#ffe2b8" />
      <pointLight position={[-4, 2, -2]} intensity={25} color="#6c8cff" />

      <Suspense fallback={null}>
        <Responsive>
        <Physics gravity={[0, -9.81, 0]} timeStep="vary">
          <group position={[1.0, 0, 0]}>
            <Bowl />
          </group>
          <Coins />
          <RigidBody type="fixed">
            <CuboidCollider args={[20, 0.1, 20]} position={[0, -0.1, 0]} />
          </RigidBody>
        </Physics>
        <group position={[1.0, 0, 0]}>
          <Steam />
        </group>
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.25}>
          <Dev position={[-1.15, 0, 0.4]} rotation={[0, 0.45, 0]} />
        </Float>
        </Responsive>
        {/* Environment tự dựng bằng Lightformer — không phải tải HDRI từ CDN */}
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 3, 1]} color="#ffd8a8" />
          <Lightformer intensity={1} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} color="#7aa2ff" />
          <Lightformer intensity={1} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        </Environment>
        <ContactShadows position={[0, 0.001, 0]} opacity={0.7} scale={12} blur={2.4} far={4} />
      </Suspense>

      {hq && !powerSaving && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.6} luminanceThreshold={0.75} mipmapBlur />
          <ChromaticAberration offset={new Vector2(0.0006, 0.0006)} />
          <Noise opacity={0.05} />
          <Vignette offset={0.3} darkness={0.5} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
