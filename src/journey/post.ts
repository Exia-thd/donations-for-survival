import * as THREE from 'three'

/**
 * Hậu kỳ tự viết: render cảnh vào render target (linear, HalfFloat), rồi vẽ quad toàn màn hình
 * thêm vignette + film grain + chút quang sai; tone mapping & sRGB xử lý ở bước cuối này.
 */
export function createPost(w: number, h: number) {
  const target = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 })
  const uniforms = {
    tScene: { value: target.texture },
    uTime: { value: 0 },
    uVignette: { value: 0.9 },
    uGrain: { value: 0.022 },
    uWhite: { value: 0 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene;
      uniform float uTime, uVignette, uGrain, uWhite;
      varying vec2 vUv;
      float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 c = vUv - 0.5;
        float r2 = dot(c, c);
        // quang sai màu rất nhẹ ở rìa
        vec2 off = c * r2 * 0.012;
        vec3 col;
        col.r = texture2D(tScene, vUv + off).r;
        col.g = texture2D(tScene, vUv).g;
        col.b = texture2D(tScene, vUv - off).b;
        // vignette (yếu đi trong whiteout cho cảnh "trắng xoá")
        col *= mix(1.0, smoothstep(0.85, 0.2, r2 * 2.2), uVignette * (1.0 - uWhite * 0.7));
        // grain động
        // grain tỉ lệ theo độ sáng → vùng tối không bị "nhiễu TV"
        float g = rand(vUv * vec2(1920.0, 1080.0) + fract(uTime * 7.13)) - 0.5;
        float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col += g * uGrain * (0.25 + min(luma, 1.0));
        gl_FragColor = vec4(max(col, 0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  mat.toneMapped = true
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  return {
    target,
    uniforms,
    setSize: (w: number, h: number) => target.setSize(w, h),
    render: (renderer: THREE.WebGLRenderer) => {
      renderer.setRenderTarget(null)
      renderer.render(scene, cam)
    },
    dispose: () => {
      target.dispose()
      mat.dispose()
      quad.geometry.dispose()
    },
  }
}
