import * as THREE from 'three'

/**
 * Tuyết GPU: Points trong một hộp quanh camera, vị trí "cuộn vòng" (mod) trong vertex shader.
 * Rơi + trôi theo uTime và uWind (gió từ vận tốc con trỏ). uAmount ẩn bớt hạt theo khí quyển.
 */
export function createSnow(count: number, box = 140) {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = Math.random() * box
    pos[i * 3 + 1] = Math.random() * box
    pos[i * 3 + 2] = Math.random() * box
    seed[i] = Math.random()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const uniforms = {
    uTime: { value: 0 },
    uCam: { value: new THREE.Vector3() },
    uWind: { value: new THREE.Vector2() },
    uBox: { value: box },
    uAmount: { value: 0.5 },
    uColor: { value: new THREE.Color('#ffffff') },
    uPixelRatio: { value: 1 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime, uBox, uAmount, uPixelRatio;
      uniform vec3 uCam;
      uniform vec2 uWind;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float fall = 2.2 + aSeed * 2.5;
        p.y -= uTime * fall;
        p.x += uTime * (0.6 + uWind.x * 14.0) + sin(uTime * 0.7 + aSeed * 30.0) * 1.5;
        p.z += uTime * (uWind.y * 14.0) + cos(uTime * 0.5 + aSeed * 20.0) * 1.5;
        // cuộn vòng trong hộp quanh camera
        p = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5 + uCam;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float dist = -mv.z;
        gl_PointSize = (1.5 + aSeed * 2.5) * uPixelRatio * (60.0 / max(dist, 1.0));
        vAlpha = step(aSeed, uAmount) * smoothstep(uBox * 0.5, uBox * 0.2, dist) * smoothstep(0.5, 3.0, dist);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float a = smoothstep(0.5, 0.1, length(c)) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a * 0.9);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  return { points, uniforms, geo }
}
