import * as THREE from 'three'
import { WORLD_SIZE, EYE, height, buildRoute, pace } from './world'
import { sampleAtmo, createAtmoState } from './atmosphere'
import { createSky } from './sky'
import { createSnow } from './snow'
import { createPost } from './post'
import { rocks, noodleCups, baseCamp, bugEyes, ropeAndFlags, summitBowl, steam, bowlAnchor } from './props'
import { smoothstep } from './noise'

export type JourneyOptions = {
  canvas: HTMLCanvasElement
  mobile: boolean
  reducedMotion: boolean
  onBootProgress: (p: number) => void
  onFrame?: (info: { progress: number; u: number; altitude: number }) => void
}

export type Journey = {
  boot: () => Promise<void>
  setProgress: (p: number) => void
  setActive: (active: boolean) => void
  resize: () => void
  dispose: () => void
}

/** Chạy danh sách job nặng rải qua nhiều frame để tab không bị đơ. */
async function runJobs(jobs: (() => void)[], onProgress: (p: number) => void, budgetMs = 12) {
  let i = 0
  while (i < jobs.length) {
    const start = performance.now()
    while (i < jobs.length && performance.now() - start < budgetMs) jobs[i++]()
    onProgress(i / jobs.length)
    await new Promise((r) => requestAnimationFrame(() => r(null)))
  }
}

export function createJourney(opts: JourneyOptions): Journey {
  const { canvas, mobile, reducedMotion } = opts
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' })
  let pixelRatio = Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75)
  renderer.setPixelRatio(pixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2('#0b1020', 0.0008)
  scene.fog = fog
  const camera = new THREE.PerspectiveCamera(mobile ? 62 : 52, 1, 0.5, 9000)

  const atmo = createAtmoState()
  const sky = createSky(4200)
  scene.add(sky.mesh)
  const hemi = new THREE.HemisphereLight('#9fb4ff', '#2a2320', 0.5)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#ffffff', 1)
  scene.add(sun, sun.target)

  const uTime = { value: 0 }
  const route = buildRoute()
  const snowCount = reducedMotion ? 0 : mobile ? 1800 : 7000
  const snow = snowCount ? createSnow(snowCount) : null
  const post = mobile ? null : createPost(1, 1)
  const bowlLook = bowlAnchor().add(new THREE.Vector3(0, 16, 0))

  let active = false
  let disposed = false
  let booted = false
  let target = 0
  let uCur = 0
  let progressCur = 0
  let gust = 0
  const wind = new THREE.Vector2()
  let lastPointer: { x: number; y: number; t: number } | null = null
  const frameTimes: number[] = []

  // ---------------- boot: dựng địa hình theo từng hàng trong job queue ----------------
  async function boot() {
    const SEG = mobile ? 180 : 300
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, SEG, SEG).rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const rowLen = SEG + 1
    const cRock = new THREE.Color('#4a4644')
    const cDirt = new THREE.Color('#3b3326')
    const cSnow = new THREE.Color('#eef2f7')
    const tmp = new THREE.Color()
    const jobs: (() => void)[] = []
    for (let row = 0; row <= SEG; row++) {
      jobs.push(() => {
        for (let c = 0; c < rowLen; c++) {
          const i = row * rowLen + c
          const x = pos.getX(i)
          const z = pos.getZ(i)
          const h = height(x, z)
          pos.setY(i, h)
          // tuyết phủ theo độ cao + chút nhiễu
          const snowK = smoothstep(420, 780, h + Math.sin(x * 0.02) * 40 + Math.cos(z * 0.017) * 40)
          tmp.copy(cDirt).lerp(cRock, smoothstep(80, 380, h)).lerp(cSnow, snowK)
          colors[i * 3] = tmp.r
          colors[i * 3 + 1] = tmp.g
          colors[i * 3 + 2] = tmp.b
        }
      })
    }
    jobs.push(() => {
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geo.computeVertexNormals()
    })
    jobs.push(() => {
      const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: false }))
      scene.add(terrain)
    })
    jobs.push(() => scene.add(rocks(route, mobile ? 260 : 700)))
    jobs.push(() => scene.add(baseCamp(route)))
    jobs.push(() => scene.add(noodleCups(route, { from: 0.02, to: 0.97, step: mobile ? 0.012 : 0.006, scale: 1, spread: 3.2 })))
    jobs.push(() => scene.add(noodleCups(route, { from: 0.5, to: 0.68, step: 0.007, scale: 7, spread: 13, jitter: 30 })))
    jobs.push(() => scene.add(bugEyes(route, mobile ? 60 : 160)))
    jobs.push(() => scene.add(ropeAndFlags(route, 0.69, 0.86, uTime)))
    jobs.push(() => {
      const bowl = summitBowl()
      scene.add(bowl)
      scene.add(steam(bowl.position.clone().add(new THREE.Vector3(0, 18, 0)), uTime))
    })
    if (snow) jobs.push(() => scene.add(snow.points))
    // biên dịch shader trước để lần cuộn đầu không giật
    jobs.push(() => renderer.compile(scene, camera))
    await runJobs(jobs, opts.onBootProgress)
    booted = true
    resize()
  }

  // ---------------- gió theo con trỏ (chỉ chuột) ----------------
  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || reducedMotion) return
    const t = performance.now()
    if (lastPointer) {
      const dt = Math.max(1, t - lastPointer.t)
      const vx = (e.clientX - lastPointer.x) / dt
      const vy = (e.clientY - lastPointer.y) / dt
      gust = Math.min(1, gust + Math.hypot(vx, vy) * 0.08)
      wind.set(THREE.MathUtils.clamp(vx, -1, 1), THREE.MathUtils.clamp(vy, -1, 1))
    }
    lastPointer = { x: e.clientX, y: e.clientY, t }
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  function resize() {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    post?.setSize(Math.floor(w * pixelRatio), Math.floor(h * pixelRatio))
    if (snow) snow.uniforms.uPixelRatio.value = pixelRatio
  }

  // ---------------- vòng lặp ----------------
  const clock = new THREE.Clock()
  const look = new THREE.Vector3()
  const lookCur = new THREE.Vector3()
  let firstFrame = true

  function frame() {
    if (disposed) return
    requestAnimationFrame(frame)
    if (!active || !booted) {
      clock.getDelta()
      return
    }
    const dt = Math.min(clock.getDelta(), 0.1) // chặn dt sau khi đổi tab
    uTime.value += dt

    // cuộn → vị trí trên tuyến, luôn giảm chấn (không bao giờ gán thẳng)
    const k = 1 - Math.exp(-dt * (reducedMotion ? 10 : 3.2))
    progressCur += (target - progressCur) * k
    const uTarget = pace(progressCur)
    uCur += (uTarget - uCur) * (firstFrame ? 1 : k)
    const u = Math.min(uCur, 0.9985)

    const p = route.getPointAt(u)
    // khoảng hở tối thiểu so với mặt đất ngay dưới camera
    const ground = height(p.x, p.z)
    p.y = Math.max(p.y, ground + EYE * 0.6)
    // lắc nhẹ như đang bước đi (tắt khi giảm chuyển động)
    if (!reducedMotion) p.y += Math.sin(uTime.value * 1.6) * 0.25
    // chương cuối: bay lên kiểu drone để nhìn xuống lòng bát cơm
    const endBlend = smoothstep(0.86, 1, progressCur)
    p.y += endBlend * endBlend * 42
    camera.position.copy(p)

    // nhìn xa về phía trước + ngẩng lên (đoạn dốc không bị sườn núi che kín); cuối cùng quay về bát cơm
    const ahead = route.getPointAt(Math.min(1, u + 0.028))
    look.copy(ahead)
    look.y += 9
    if (endBlend > 0) look.lerp(bowlLook, endBlend)
    if (firstFrame) lookCur.copy(look)
    lookCur.lerp(look, firstFrame ? 1 : 1 - Math.exp(-dt * 4))
    camera.lookAt(lookCur)
    firstFrame = false

    // khí quyển
    sampleAtmo(progressCur, atmo)
    fog.color.copy(atmo.fogColor)
    fog.density = atmo.fogDensity
    renderer.setClearColor(atmo.fogColor)
    const su = sky.uniforms
    su.uTop.value.copy(atmo.skyTop)
    su.uBottom.value.copy(atmo.skyBottom)
    su.uFog.value.copy(atmo.fogColor)
    su.uSunDir.value.copy(atmo.sunDir)
    su.uSunColor.value.copy(atmo.sunColor)
    su.uSunIntensity.value = atmo.sunIntensity
    su.uNight.value = atmo.night
    su.uHaze.value = smoothstep(0.002, 0.011, atmo.fogDensity)
    su.uTime.value = uTime.value
    sky.mesh.position.copy(camera.position)
    sun.color.copy(atmo.sunColor)
    sun.intensity = atmo.sunIntensity
    sun.position.copy(camera.position).addScaledVector(atmo.sunDir, 500)
    sun.target.position.copy(camera.position)
    hemi.intensity = atmo.hemi
    hemi.color.copy(atmo.skyTop).lerp(atmo.fogColor, 0.5)

    // tuyết + gió
    gust *= Math.exp(-dt * 1.5)
    if (snow) {
      const s = snow.uniforms
      s.uTime.value = uTime.value
      s.uCam.value.copy(camera.position)
      s.uWind.value.copy(wind).multiplyScalar(gust)
      s.uAmount.value = atmo.snow
      s.uColor.value.copy(atmo.snowColor)
    }

    // render (+ hậu kỳ)
    if (post) {
      post.uniforms.uTime.value = uTime.value
      post.uniforms.uWhite.value = su.uHaze.value
      renderer.setRenderTarget(post.target)
      renderer.render(scene, camera)
      post.render(renderer)
    } else {
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)
    }

    // chất lượng thích ứng: trung bình frame > 20ms → giảm pixel ratio & số hạt
    frameTimes.push(dt * 1000)
    if (frameTimes.length >= 90) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      frameTimes.length = 0
      if (avg > 20 && pixelRatio > 0.75) {
        pixelRatio = Math.max(0.75, pixelRatio - 0.25)
        if (snow) snow.geo.setDrawRange(0, Math.floor(snow.geo.attributes.position.count * 0.6))
        resize()
      }
    }

    opts.onFrame?.({ progress: progressCur, u, altitude: camera.position.y })
  }
  requestAnimationFrame(frame)

  return {
    boot,
    setProgress: (p) => (target = THREE.MathUtils.clamp(p, 0, 1)),
    setActive: (a) => (active = a),
    resize,
    dispose: () => {
      disposed = true
      window.removeEventListener('pointermove', onPointerMove)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose?.()
      })
      post?.dispose()
      renderer.dispose()
    },
  }
}
