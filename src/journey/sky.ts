import * as THREE from 'three'

/** Vòm trời: cầu lớn BackSide, shader gradient + đĩa mặt trời + sao (hash) theo hệ số đêm. */
export function createSky(radius: number) {
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
    uFog: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColor: { value: new THREE.Color() },
    uSunIntensity: { value: 1 },
    uNight: { value: 0 },
    uHaze: { value: 0 }, // 0..1 — whiteout nuốt cả bầu trời
    uTime: { value: 0 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww; // luôn nằm ở mặt phẳng xa
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uBottom, uFog, uSunDir, uSunColor;
      uniform float uSunIntensity, uNight, uHaze, uTime;
      varying vec3 vDir;
      float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        vec3 col = mix(uBottom, uTop, pow(smoothstep(-0.05, 0.9, h), 0.7));
        // mặt trời + quầng
        float sd = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSunColor * (pow(sd, 900.0) * 6.0 + pow(sd, 18.0) * 0.35 + pow(sd, 4.0) * 0.08) * uSunIntensity;
        // sao: lưới hash trên hướng nhìn, nhấp nháy nhẹ
        vec3 g = floor(d * 380.0);
        float s = hash(g);
        float star = step(0.9975, s) * smoothstep(0.0, 0.25, d.y);
        star *= 0.6 + 0.4 * sin(uTime * 2.0 + s * 80.0);
        col += vec3(star) * uNight * 1.6;
        // chân trời hoà vào sương, whiteout nuốt trọn
        col = mix(col, uFog, smoothstep(0.12, -0.02, d.y) * 0.9);
        col = mix(col, uFog, uHaze);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), mat)
  mesh.frustumCulled = false
  mesh.renderOrder = -1
  return { mesh, uniforms }
}
