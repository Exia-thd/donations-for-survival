import { memo, useEffect } from 'react'
import * as THREE from 'three/webgpu'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useArcade } from './store'
import { backgroundNode } from './materials'
import { TossGame } from './TossGame'
import { BugGame } from './BugGame'

// Đăng ký class của three/webgpu cho R3F (node materials được tạo bằng code TSL trong materials.ts)
extend(THREE as unknown as Parameters<typeof extend>[0])

type GpuLike = {
  requestAdapter: () => Promise<{
    requestDevice: () => Promise<{
      createTexture: (d: object) => { createView: (d: object) => unknown; destroy: () => void }
      destroy: () => void
    }>
  } | null>
}

/**
 * Kiểm tra WebGPU của trình duyệt có dùng được với three r186 không.
 * Một số bản Chromium cũ hiểu `swizzle` theo spec nháp → createView ném lỗi; khi đó ép WebGL2.
 */
let gpuCheck: Promise<boolean> | null = null
function webgpuUsable() {
  gpuCheck ??= (async () => {
    const gpu = (navigator as unknown as { gpu?: GpuLike }).gpu
    if (!gpu) return false
    try {
      const adapter = await gpu.requestAdapter()
      if (!adapter) return false
      const device = await adapter.requestDevice()
      const tex = device.createTexture({ size: [1, 1], format: 'rgba8unorm', usage: 0x04 /* TEXTURE_BINDING */ })
      tex.createView({ swizzle: 'rgba' })
      tex.destroy()
      device.destroy()
      return true
    } catch {
      return false
    }
  })()
  return gpuCheck
}

/** Nền gradient TSL + đồng hồ đếm ngược của game. */
function Director({ onBackend }: { onBackend: (b: string) => void }) {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer
  useEffect(() => {
    scene.backgroundNode = backgroundNode()
    const backend = (gl as unknown as { backend?: { isWebGPUBackend?: boolean } }).backend
    onBackend(backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2')
  }, [scene, gl, onBackend])
  useFrame((_, dt) => useArcade.getState().tick(Math.min(dt, 0.1)))
  return null
}

function Rig() {
  const game = useArcade((s) => s.game)
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  useEffect(() => {
    // khung dọc (điện thoại) → lùi camera ra cho thấy đủ sân chơi
    const k = Math.max(1, 1.5 / aspect)
    if (game === 'toss') camera.position.set(0, 2.2 + (k - 1) * 0.8, 6.2 * k)
    else camera.position.set(0, 5.2 * k, 4.6 * k)
    camera.lookAt(0, game === 'toss' ? 1.4 : 0, game === 'toss' ? -1 : -0.3 - (k - 1) * 1.2)
  }, [game, camera, aspect])
  return null
}

function ArcadeCanvas({ onBackend, active = true }: { onBackend: (b: string) => void; active?: boolean }) {
  const game = useArcade((s) => s.game)
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      camera={{ position: [0, 2.2, 6.2], fov: 45 }}
      gl={async (props) => {
        // WebGPURenderer tự fallback sang WebGL2 backend nếu trình duyệt chưa có WebGPU
        const forceWebGL = !(await webgpuUsable())
        const renderer = new THREE.WebGPURenderer({ ...(props as object), antialias: true, forceWebGL } as ConstructorParameters<typeof THREE.WebGPURenderer>[0])
        await renderer.init()
        return renderer as unknown as THREE.WebGPURenderer & { render: () => void }
      }}
      className="touch-none"
    >
      <Director onBackend={onBackend} />
      <Rig />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} color="#ffe2b8" />
      <pointLight position={[-4, 3, 2]} intensity={30} color="#7aa2ff" />
      {game === 'toss' ? <TossGame /> : <BugGame />}
    </Canvas>
  )
}

// Arcade (DOM) re-render mỗi frame vì đồng hồ đếm ngược → memo để canvas không re-render theo
export default memo(ArcadeCanvas)
