import * as THREE from 'three'
import { height, ROUTE_XZ, SUMMIT } from './world'

type Curve = THREE.CatmullRomCurve3
const tmpM = new THREE.Matrix4()
const tmpQ = new THREE.Quaternion()
const tmpS = new THREE.Vector3()
const tmpP = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)

/** Điểm trên tuyến ở u, dịch ngang `side` mét (vuông góc hướng đi), đặt sát đất. */
function beside(curve: Curve, u: number, side: number, lift = 0) {
  const p = curve.getPointAt(u)
  const t = curve.getTangentAt(u)
  const n = new THREE.Vector3(-t.z, 0, t.x).normalize()
  const x = p.x + n.x * side
  const z = p.z + n.z * side
  return new THREE.Vector3(x, height(x, z) + lift, z)
}

/** Đá tảng rải hai bên đường. */
export function rocks(curve: Curve, count: number) {
  const geo = new THREE.IcosahedronGeometry(1, 0)
  const mat = new THREE.MeshStandardMaterial({ color: '#5d5a58', roughness: 0.95, flatShading: true })
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 0.97
    const side = (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() ** 1.5 * 180)
    const p = beside(curve, u, side)
    const s = 1.2 + Math.random() ** 3 * 7
    tmpP.set(p.x, p.y - s * 0.35, p.z)
    tmpQ.setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3))
    tmpS.set(s, s * (0.5 + Math.random() * 0.6), s * (0.7 + Math.random() * 0.5))
    mesh.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS))
  }
  mesh.castShadow = false
  return mesh
}

/** "Dấu chân" của dev: những cốc mì rỗng đánh dấu đường mòn. Scale lớn = tượng đài ở thung lũng mì. */
export function noodleCups(curve: Curve, opts: { from: number; to: number; step: number; scale: number; spread: number; jitter?: number }) {
  const cup = new THREE.CylinderGeometry(0.55, 0.42, 1.1, 16, 1, true)
  const band = new THREE.CylinderGeometry(0.565, 0.54, 0.28, 16, 1, true)
  const lid = new THREE.CircleGeometry(0.56, 16).rotateX(-Math.PI / 2).translate(0, 0.55, 0)
  const cupMat = new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.6, side: THREE.DoubleSide })
  const bandMat = new THREE.MeshStandardMaterial({ color: '#d7263d', roughness: 0.5, side: THREE.DoubleSide })
  const lidMat = new THREE.MeshStandardMaterial({ color: '#c9ccd3', metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })
  const list: THREE.Vector3[] = []
  const rots: number[] = []
  for (let u = opts.from; u < opts.to; u += opts.step) {
    const side = (list.length % 2 ? 1 : -1) * (opts.spread + Math.random() * (opts.jitter ?? 2))
    list.push(beside(curve, u, side))
    rots.push(Math.random() * Math.PI)
  }
  const group = new THREE.Group()
  for (const [g, m, yo] of [[cup, cupMat, 0.55], [band, bandMat, 0.7], [lid, lidMat, 0.55]] as const) {
    const im = new THREE.InstancedMesh(g, m, list.length)
    list.forEach((p, i) => {
      // tượng đài thì nghiêng ngả cho "đổ nát"
      tmpQ.setFromEuler(new THREE.Euler(opts.scale > 2 ? (Math.random() - 0.5) * 0.5 : 0, rots[i], opts.scale > 2 ? (Math.random() - 0.5) * 0.4 : 0))
      tmpS.setScalar(opts.scale)
      tmpP.set(p.x, p.y + yo * opts.scale - 0.1 * opts.scale, p.z)
      im.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS))
    })
    group.add(im)
  }
  return group
}

/** Trại căn cứ: "phòng trọ 12m²" có cửa sổ sáng màn hình + vài cái lều. */
export function baseCamp(curve: Curve) {
  const g = new THREE.Group()
  const room = beside(curve, 0.012, -24)
  const box = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 8), new THREE.MeshStandardMaterial({ color: '#3b3a45', roughness: 0.9 }))
  box.position.set(room.x, room.y + 3.3, room.z)
  box.rotation.y = 0.6
  g.add(box)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3, 4), new THREE.MeshStandardMaterial({ color: '#5a2e2e', roughness: 0.8 }))
  roof.position.set(0, 5, 0)
  roof.rotation.y = Math.PI / 4
  box.add(roof)
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshBasicMaterial({ color: '#8fd3ff' }))
  win.position.set(0, 0.5, 4.01)
  box.add(win)
  const glow = new THREE.PointLight('#7cc4ff', 60, 40, 2)
  glow.position.set(0, 0.5, 6)
  box.add(glow)
  ;[[-10, 0.03], [9, 0.05], [-16, 0.07]].forEach(([side, u], i) => {
    const p = beside(curve, u, side)
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.2, 4), new THREE.MeshStandardMaterial({ color: i === 1 ? '#ffc53d' : '#f25c54', roughness: 0.7 }))
    tent.position.set(p.x, p.y + 1.5, p.z)
    tent.rotation.y = i
    g.add(tent)
  })
  return g
}

/** Đèo Deadline: từng cặp mắt đỏ của bug trong bóng tối hai bên đường. */
export function bugEyes(curve: Curve, count: number) {
  const geo = new THREE.SphereGeometry(0.28, 8, 8)
  const mat = new THREE.MeshBasicMaterial({ color: '#ff2d2d', toneMapped: false })
  const mesh = new THREE.InstancedMesh(geo, mat, count * 2)
  for (let i = 0; i < count; i++) {
    const u = 0.13 + Math.random() * 0.2
    const side = (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 90)
    const p = beside(curve, u, side, 1 + Math.random() * 3)
    const yaw = Math.random() * Math.PI * 2
    for (const e of [-0.45, 0.45]) {
      tmpP.set(p.x + Math.cos(yaw) * e, p.y, p.z + Math.sin(yaw) * e)
      mesh.setMatrixAt(i * 2 + (e > 0 ? 1 : 0), tmpM.compose(tmpP, tmpQ.identity(), tmpS.setScalar(1)))
    }
  }
  return mesh
}

/** Dây thừng "ai đó thả xuống" dọc sườn dốc hy vọng + cọc và cờ bay. */
export function ropeAndFlags(curve: Curve, from: number, to: number, uTime: { value: number }) {
  const g = new THREE.Group()
  const pts: THREE.Vector3[] = []
  const posts: THREE.Vector3[] = []
  const N = 60
  for (let i = 0; i <= N; i++) {
    const u = from + ((to - from) * i) / N
    const p = beside(curve, u, 5, 0)
    // dây võng giữa hai cọc
    const k = i % 6
    const sag = Math.sin((k / 6) * Math.PI) * 0.5
    pts.push(new THREE.Vector3(p.x, p.y + 1.6 - sag, p.z))
    if (k === 0) posts.push(p)
  }
  const rope = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.06, 6, false),
    new THREE.MeshStandardMaterial({ color: '#ffb000', roughness: 0.5, emissive: '#6a3d00', emissiveIntensity: 0.6 }),
  )
  g.add(rope)
  const postMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.1, 2, 6), new THREE.MeshStandardMaterial({ color: '#333' }), posts.length)
  posts.forEach((p, i) => postMesh.setMatrixAt(i, tmpM.compose(tmpP.set(p.x, p.y + 1, p.z), tmpQ.identity(), tmpS.setScalar(1))))
  g.add(postMesh)

  // cờ: plane chia lưới, vertex shader tạo sóng; pha sóng lấy theo vị trí instance
  const flagGeo = new THREE.PlaneGeometry(1.1, 0.7, 10, 4).translate(0.55, 0, 0)
  const flagMat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide })
  flagMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float ph = instanceMatrix[3].x * 0.3 + instanceMatrix[3].z * 0.2;
        float amp = position.x * 0.35;
        transformed.z += sin(position.x * 5.0 - uTime * 7.0 + ph) * amp;
        transformed.y += sin(position.x * 3.0 - uTime * 5.0 + ph) * amp * 0.3;`,
      )
  }
  const flagColors = ['#f25c54', '#ffc53d', '#2fbf71', '#3a86ff', '#ffffff']
  const flags = new THREE.InstancedMesh(flagGeo, flagMat, posts.length)
  posts.forEach((p, i) => {
    const t = curve.getTangentAt(from + ((to - from) * i) / Math.max(1, posts.length - 1))
    tmpQ.setFromAxisAngle(UP, Math.atan2(-t.z, t.x) + Math.PI / 2)
    flags.setMatrixAt(i, tmpM.compose(tmpP.set(p.x, p.y + 1.7, p.z), tmpQ, tmpS.setScalar(1)))
    flags.setColorAt(i, new THREE.Color(flagColors[i % flagColors.length]))
  })
  g.add(flags)
  return g
}

/** Vị trí đặt bát cơm trên đỉnh (camera chương cuối cũng nhìn vào đây). */
export function bowlAnchor() {
  const top = ROUTE_XZ[ROUTE_XZ.length - 1]
  const x = SUMMIT.x + (top[0] - SUMMIT.x) * 0.2 - 4
  const z = SUMMIT.y - 38
  return new THREE.Vector3(x, height(x, z) - 1, z)
}

/** Đỉnh Cơm Tấm: bát cơm khổng lồ viền xanh, cơm vun, đôi đũa, đèn ấm. */
export function summitBowl() {
  const g = new THREE.Group()
  g.position.copy(bowlAnchor())
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const t = i / 16
    pts.push(new THREE.Vector2(6 + Math.sin(t * Math.PI * 0.5) * 16, t * 13))
  }
  pts.push(new THREE.Vector2(22.4, 13.3))
  for (let i = 16; i >= 0; i--) {
    const t = i / 16
    pts.push(new THREE.Vector2(5.5 + Math.sin(t * Math.PI * 0.5) * 15.6, 1 + t * 12))
  }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.25, side: THREE.DoubleSide, emissive: '#3a3024', emissiveIntensity: 0.4 }))
  g.add(bowl)
  // cái đĩa "tấm" khổng lồ làm điểm tiếp đất cho bát
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(38, 33, 2.4, 64), new THREE.MeshStandardMaterial({ color: '#e9eef5', roughness: 0.3 }))
  plate.position.y = -0.2
  g.add(plate)
  const plateRim = new THREE.Mesh(new THREE.TorusGeometry(37.6, 0.5, 8, 128).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2b59c3' }))
  plateRim.position.y = 1
  g.add(plateRim)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(22.2, 0.35, 8, 96).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2b59c3' }))
  rim.position.y = 12.2
  g.add(rim)
  const rice = new THREE.Mesh(new THREE.SphereGeometry(20.5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.9, emissive: '#ffeebb', emissiveIntensity: 0.15 }))
  rice.scale.y = 0.55
  rice.position.y = 10
  g.add(rice)
  // miếng sườn nướng + trứng ốp la
  const rib = new THREE.Mesh(new THREE.BoxGeometry(12, 1.6, 6), new THREE.MeshStandardMaterial({ color: '#8a3b12', roughness: 0.6 }))
  rib.position.set(-3, 21, 2)
  rib.rotation.set(0.1, 0.4, 0.05)
  g.add(rib)
  const egg = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.6, 32), new THREE.MeshStandardMaterial({ color: '#ffffff' }))
  egg.position.set(6, 20.6, -3)
  g.add(egg)
  const yolk = new THREE.Mesh(new THREE.SphereGeometry(2, 24, 16), new THREE.MeshStandardMaterial({ color: '#ffb703', emissive: '#ff8c00', emissiveIntensity: 0.4 }))
  yolk.scale.y = 0.6
  yolk.position.set(6, 21.2, -3)
  g.add(yolk)
  for (const dz of [-1.2, 1.2]) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 46, 8), new THREE.MeshStandardMaterial({ color: '#8b5a2b' }))
    stick.position.set(4, 18, dz + 8)
    stick.rotation.set(0.1, 0, Math.PI / 2 - 0.35)
    g.add(stick)
  }
  const warm = new THREE.PointLight('#ffcf7a', 1800, 160, 2)
  warm.position.set(0, 34, 0)
  g.add(warm)
  return g
}

/** Hơi nóng bốc lên từ bát cơm (Points ấm, shader nhỏ). */
export function steam(center: THREE.Vector3, uTime: { value: number }) {
  const N = 260
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 26
    pos[i * 3 + 1] = Math.random() * 50
    pos[i * 3 + 2] = (Math.random() - 0.5) * 26
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vA;
      void main() {
        vec3 p = position;
        float y = mod(p.y + uTime * 6.0, 50.0);
        p.y = y;
        p.x += sin(uTime + y * 0.15 + position.z) * 2.0;
        vA = smoothstep(0.0, 8.0, y) * smoothstep(50.0, 20.0, y);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 900.0 / max(-mv.z, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA * 0.12;
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.85) * a, a);
      }`,
  })
  const pts = new THREE.Points(geo, mat)
  pts.position.copy(center)
  pts.frustumCulled = false
  return pts
}
