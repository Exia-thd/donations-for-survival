/**
 * Noise viết tay, không phụ thuộc thư viện: value noise 2D (fade bậc 5) + fBm + ridged.
 * Dùng chung cho cả mesh địa hình lẫn camera để camera luôn bám đúng mặt đất.
 */

const PERM = new Uint8Array(512)
;(function seed(s = 1337) {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]
})()

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const hash = (x: number, y: number) => PERM[(PERM[x & 255] + y) & 511] / 255

/** Value noise trong khoảng [-1, 1]. */
export function noise2(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = fade(xf)
  const v = fade(yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1
}

/** Fractal Brownian motion, ~[-1, 1]. */
export function fbm(x: number, y: number, octaves = 5) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * freq, y * freq) * amp
    norm += amp
    amp *= 0.5
    freq *= 2.03
  }
  return sum / norm
}

/** Ridged multifractal, [0, 1] — tạo sống núi sắc. */
export function ridged(x: number, y: number, octaves = 5) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  let prev = 1
  for (let i = 0; i < octaves; i++) {
    let n = 1 - Math.abs(noise2(x * freq, y * freq))
    n *= n
    sum += n * amp * prev
    prev = n
    norm += amp
    amp *= 0.5
    freq *= 2.1
  }
  return sum / norm
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const mix = lerp
