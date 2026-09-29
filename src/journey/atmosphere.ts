import * as THREE from 'three'
import { smoothstep } from './noise'

/**
 * Hồ sơ khí quyển theo progress (0..1). Mỗi frame nội suy keyframe rồi đẩy vào fog, đèn, sky, tuyết.
 */
export type Atmo = {
  fogColor: string
  fogDensity: number
  skyTop: string
  skyBottom: string
  sunColor: string
  sunIntensity: number
  sunElevation: number // độ, âm = dưới chân trời
  sunAzimuth: number // độ
  night: number // 0..1 — lượng sao
  hemi: number
  snow: number // 0..1 — mật độ hạt
  snowColor: string
}

const K: [number, Atmo][] = [
  [0.0, { fogColor: '#0b1020', fogDensity: 0.00075, skyTop: '#03050d', skyBottom: '#18223d', sunColor: '#9fb4ff', sunIntensity: 0.55, sunElevation: 28, sunAzimuth: 200, night: 1, hemi: 0.35, snow: 0.25, snowColor: '#cfd9ff' }],
  [0.14, { fogColor: '#1a1328', fogDensity: 0.0007, skyTop: '#0a0a1f', skyBottom: '#3a2448', sunColor: '#b7a4ff', sunIntensity: 0.6, sunElevation: 8, sunAzimuth: 250, night: 0.7, hemi: 0.4, snow: 0.15, snowColor: '#e0d6ff' }],
  [0.24, { fogColor: '#4a2430', fogDensity: 0.0006, skyTop: '#1b1133', skyBottom: '#ff7442', sunColor: '#ff9a55', sunIntensity: 1.6, sunElevation: 4, sunAzimuth: 265, night: 0.15, hemi: 0.55, snow: 0.1, snowColor: '#ffd1b0' }],
  // WHITEOUT — sương mù não
  [0.34, { fogColor: '#aeb6c4', fogDensity: 0.003, skyTop: '#9aa4b4', skyBottom: '#d7dce4', sunColor: '#ffffff', sunIntensity: 0.7, sunElevation: 20, sunAzimuth: 240, night: 0, hemi: 0.9, snow: 0.8, snowColor: '#ffffff' }],
  [0.42, { fogColor: '#eef1f5', fogDensity: 0.011, skyTop: '#e6eaf0', skyBottom: '#f4f6f9', sunColor: '#ffffff', sunIntensity: 0.5, sunElevation: 25, sunAzimuth: 230, night: 0, hemi: 1.1, snow: 1, snowColor: '#ffffff' }],
  [0.5, { fogColor: '#8d93a6', fogDensity: 0.0025, skyTop: '#3a3f5a', skyBottom: '#7b7f95', sunColor: '#d6dcff', sunIntensity: 0.4, sunElevation: 6, sunAzimuth: 220, night: 0.3, hemi: 0.6, snow: 0.5, snowColor: '#ffffff' }],
  // Thung lũng mì tôm — đêm sao
  [0.58, { fogColor: '#120f1f', fogDensity: 0.0009, skyTop: '#02020a', skyBottom: '#231538', sunColor: '#c9b6ff', sunIntensity: 0.45, sunElevation: 35, sunAzimuth: 160, night: 1, hemi: 0.3, snow: 0.2, snowColor: '#d8ccff' }],
  // Sườn dốc hy vọng — bình minh
  [0.72, { fogColor: '#5b4a6e', fogDensity: 0.0007, skyTop: '#243879', skyBottom: '#ff9e7a', sunColor: '#ffc48a', sunIntensity: 1.7, sunElevation: 5, sunAzimuth: 95, night: 0.2, hemi: 0.6, snow: 0.12, snowColor: '#ffe6d0' }],
  // Đỉnh cơm tấm — nắng vàng
  [0.9, { fogColor: '#f0c890', fogDensity: 0.00045, skyTop: '#3d78d6', skyBottom: '#ffe3ab', sunColor: '#fff0c4', sunIntensity: 2.6, sunElevation: 22, sunAzimuth: 110, night: 0, hemi: 0.9, snow: 0.35, snowColor: '#fff3c9' }],
  [1.0, { fogColor: '#f3cf98', fogDensity: 0.0004, skyTop: '#3f7bd9', skyBottom: '#ffe6b3', sunColor: '#fff3cc', sunIntensity: 2.8, sunElevation: 26, sunAzimuth: 115, night: 0, hemi: 0.95, snow: 0.4, snowColor: '#fff3c9' }],
]

// cache Color (đã chuyển sRGB → linear bởi ColorManagement)
const colorCache = new Map<string, THREE.Color>()
const col = (hex: string) => {
  let c = colorCache.get(hex)
  if (!c) colorCache.set(hex, (c = new THREE.Color(hex)))
  return c
}

export type AtmoState = {
  fogColor: THREE.Color
  fogDensity: number
  skyTop: THREE.Color
  skyBottom: THREE.Color
  sunColor: THREE.Color
  sunIntensity: number
  sunDir: THREE.Vector3
  night: number
  hemi: number
  snow: number
  snowColor: THREE.Color
}

export function createAtmoState(): AtmoState {
  return {
    fogColor: new THREE.Color(), fogDensity: 0, skyTop: new THREE.Color(), skyBottom: new THREE.Color(),
    sunColor: new THREE.Color(), sunIntensity: 0, sunDir: new THREE.Vector3(), night: 0, hemi: 0,
    snow: 0, snowColor: new THREE.Color(),
  }
}

export function sampleAtmo(p: number, out: AtmoState) {
  let i = 0
  while (i < K.length - 2 && p > K[i + 1][0]) i++
  const [p0, a] = K[i]
  const [p1, b] = K[i + 1]
  const t = smoothstep(0, 1, (p - p0) / (p1 - p0))
  const n = (x: number, y: number) => x + (y - x) * t
  out.fogColor.copy(col(a.fogColor)).lerp(col(b.fogColor), t)
  // mật độ sương nội suy theo log cho chuyển cảnh whiteout mượt
  out.fogDensity = Math.exp(n(Math.log(a.fogDensity), Math.log(b.fogDensity)))
  out.skyTop.copy(col(a.skyTop)).lerp(col(b.skyTop), t)
  out.skyBottom.copy(col(a.skyBottom)).lerp(col(b.skyBottom), t)
  out.sunColor.copy(col(a.sunColor)).lerp(col(b.sunColor), t)
  out.sunIntensity = n(a.sunIntensity, b.sunIntensity)
  const el = THREE.MathUtils.degToRad(n(a.sunElevation, b.sunElevation))
  const az = THREE.MathUtils.degToRad(n(a.sunAzimuth, b.sunAzimuth))
  out.sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize()
  out.night = n(a.night, b.night)
  out.hemi = n(a.hemi, b.hemi)
  out.snow = n(a.snow, b.snow)
  out.snowColor.copy(col(a.snowColor)).lerp(col(b.snowColor), t)
  return out
}

export { CHAPTERS } from './chapters'
