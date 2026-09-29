import * as THREE from 'three'
import { fbm, ridged, smoothstep, clamp01 } from './noise'

/**
 * Thế giới: một khối núi lớn, đỉnh ở SUMMIT. Tuyến leo đi từ phòng trọ (nam) lên đỉnh (bắc).
 * Đơn vị: mét. Địa hình 4000×4000.
 */
export const WORLD_SIZE = 4000
export const SUMMIT = new THREE.Vector2(0, -1300)
export const EYE = 9 // camera bay thấp kiểu drone, đủ để nhìn thấy cảnh

/** Waypoint (x, z) của tuyến leo — y được lấy từ height field. */
export const ROUTE_XZ: [number, number][] = [
  [300, 1650], [230, 1420], [40, 1200], [-200, 1010], [-250, 780], [-60, 540],
  [230, 330], [340, 70], [150, -190], [-150, -400], [-310, -620], [-190, -860],
  [30, -1030], [70, -1180], [20, -1265], [0, -1290],
]

// ---------- khoảng cách tới tuyến (để "đào" đường mòn êm cho camera) ----------
function distToRoute(x: number, z: number) {
  let best = Infinity
  for (let i = 0; i < ROUTE_XZ.length - 1; i++) {
    const [ax, az] = ROUTE_XZ[i]
    const [bx, bz] = ROUTE_XZ[i + 1]
    const dx = bx - ax
    const dz = bz - az
    const t = clamp01(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))
    const px = ax + dx * t - x
    const pz = az + dz * t - z
    const d = px * px + pz * pz
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

/** Phần "khung" mượt của địa hình (không có chi tiết sắc). */
function baseHeight(x: number, z: number) {
  const d = Math.hypot(x - SUMMIT.x, z - SUMMIT.y)
  const massif = 1150 * Math.exp(-((d / 820) ** 2)) + 320 * Math.exp(-((d / 1700) ** 2))
  return massif + fbm(x * 0.0011 + 3.1, z * 0.0011 - 7.4, 4) * 70
}

/** Chiều cao địa hình tại (x, z) — dùng cho cả mesh và camera. */
export function height(x: number, z: number) {
  const base = baseHeight(x, z)
  const d = Math.hypot(x - SUMMIT.x, z - SUMMIT.y)
  const rocky = 0.35 + 0.65 * smoothstep(1800, 300, d)
  const detail = ridged(x * 0.0021 + 11, z * 0.0021 - 5, 5) * 230 * rocky + fbm(x * 0.012, z * 0.012, 3) * 6
  // gần đường mòn thì mài phẳng chi tiết → camera không đâm vào đá nhọn
  const carve = 0.12 + 0.88 * smoothstep(25, 160, distToRoute(x, z))
  return base + detail * carve
}

/** Tuyến leo: CatmullRom qua các waypoint đặt trên mặt đất, lấy mẫu theo độ dài cung. */
export function buildRoute() {
  const pts = ROUTE_XZ.map(([x, z]) => new THREE.Vector3(x, height(x, z) + EYE, z))
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5)
  curve.arcLengthDivisions = 4000
  curve.updateArcLengths()
  return curve
}

/**
 * Nhịp cuộn phi tuyến: [progress, tốc độ]. Tốc độ thấp = chậm rãi dừng ngắm (chương "nghỉ"),
 * cao = lướt nhanh. Chuẩn hoá thành bảng tra progress → u (vị trí trên tuyến).
 */
const PACE: [number, number][] = [
  [0.0, 0.5], // khởi hành chậm ở phòng trọ
  [0.12, 1.2],
  [0.3, 0.7], // đèo deadline
  [0.4, 0.35], // whiteout — gần như đứng yên trong sương
  [0.52, 1.3],
  [0.68, 0.9], // sườn dốc hy vọng
  [0.86, 0.45], // chậm lại khi tới đỉnh
  [1.0, 0.3],
]

const PACE_LUT = (() => {
  const N = 512
  const lut = new Float32Array(N + 1)
  const speed = (p: number) => {
    for (let i = 0; i < PACE.length - 1; i++) {
      const [p0, s0] = PACE[i]
      const [p1, s1] = PACE[i + 1]
      if (p <= p1) return s0 + (s1 - s0) * ((p - p0) / (p1 - p0))
    }
    return PACE[PACE.length - 1][1]
  }
  let acc = 0
  for (let i = 0; i <= N; i++) {
    lut[i] = acc
    acc += speed(i / N) / N
  }
  for (let i = 0; i <= N; i++) lut[i] /= lut[N]
  return lut
})()

export function pace(progress: number) {
  const f = clamp01(progress) * (PACE_LUT.length - 1)
  const i = Math.floor(f)
  const t = f - i
  return PACE_LUT[i] + ((PACE_LUT[Math.min(i + 1, PACE_LUT.length - 1)] ?? 1) - PACE_LUT[i]) * t
}
