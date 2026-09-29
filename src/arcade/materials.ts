import * as THREE from 'three/webgpu'
import { color, mix, sin, time, normalView, positionLocal, float, screenUV, vec3, uniform } from 'three/tsl'

/**
 * Vật liệu viết bằng TSL (Three Shading Language) — chạy trên WebGPU, tự biên dịch
 * sang GLSL khi trình duyệt chỉ có WebGL2.
 */

/** Gradient nền theo toạ độ màn hình + chút "nhịp thở". */
export function backgroundNode() {
  const top = color('#1a1206')
  const bottom = color('#050403')
  const pulse = sin(time.mul(0.6)).mul(0.03)
  return mix(bottom, top, screenUV.y.oneMinus().add(pulse))
}

/** Cơm nắm phát sáng nhẹ, hạt cơm lấm tấm theo vị trí. */
export function riceMaterial() {
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.85 })
  const grain = sin(positionLocal.x.mul(60)).mul(sin(positionLocal.y.mul(55))).mul(sin(positionLocal.z.mul(50)))
  m.colorNode = mix(color('#fffaf0'), color('#efe6d0'), grain.step(float(0.3)))
  m.emissiveNode = color('#ffe7a3').mul(sin(time.mul(5)).mul(0.08).add(0.1))
  return m
}

/** Vỏ bug óng ánh kiểu bọ cánh cứng — đổi màu theo góc nhìn và thời gian. */
export function bugMaterial() {
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.25, metalness: 0.6 })
  const t = normalView.y.mul(0.5).add(0.5).add(sin(time.mul(2)).mul(0.15))
  m.colorNode = mix(color('#2fbf71'), color('#7b3fe4'), t)
  return m
}

/** Bàn phím laptop: lưới phím vẽ bằng TSL, phím sáng chạy theo thời gian. */
export function keyboardMaterial() {
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.7, metalness: 0.2 })
  const uv = positionLocal.xz.mul(1.6)
  const cell = uv.fract()
  const edge = cell.x.min(cell.y).min(cell.x.oneMinus()).min(cell.y.oneMinus())
  const key = edge.smoothstep(float(0.04), float(0.09))
  const id = uv.floor()
  const glow = sin(id.x.mul(1.7).add(id.y.mul(2.3)).add(time.mul(2))).max(0).pow(8)
  m.colorNode = mix(vec3(0.03, 0.03, 0.035), vec3(0.12, 0.12, 0.14), key)
  m.emissiveNode = color('#ffc53d').mul(glow.mul(key).mul(0.35))
  return m
}

/** Uniform để làm miệng dev "đỏ lên" mỗi lần ăn trúng. */
export const chompUniform = uniform(0)
export function mouthMaterial() {
  const m = new THREE.MeshStandardNodeMaterial({ roughness: 0.6 })
  m.colorNode = mix(color('#3a1414'), color('#ff5d5d'), chompUniform)
  return m
}
