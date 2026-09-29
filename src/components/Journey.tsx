import { useEffect, useMemo, useRef, useState } from 'react'
import { useT } from '../i18n'
import { CHAPTERS } from '../journey/chapters'
import { smoothstep } from '../journey/noise'
import { prefersReducedMotion, supportsWebGL } from '../lib/hooks'
import type { Journey as Engine } from '../journey/engine'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Hành trình cuộn kiểu WHITEOUT: section rất cao, canvas dính màn hình; progress cuộn trong section
 * → vị trí camera trên tuyến leo. Overlay chữ/HUD cập nhật thẳng DOM mỗi frame (không re-render React).
 */
export function Journey() {
  const t = useT().journey
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const altEl = useRef<HTMLSpanElement>(null)
  const kcalEl = useRef<HTMLSpanElement>(null)
  const chapEl = useRef<HTMLSpanElement>(null)
  const barEl = useRef<HTMLDivElement>(null)
  const hintEl = useRef<HTMLDivElement>(null)
  const [boot, setBoot] = useState<number | null>(null) // null = chưa tải, 0..1 = đang dựng, 2 = xong
  const webgl = useMemo(supportsWebGL, [])
  const mobile = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 767px), (pointer: coarse)').matches, [])

  // progress của section (0 khi đỉnh section chạm đỉnh màn hình, 1 khi đáy chạm đáy)
  const readProgress = () => {
    const el = section.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)))
  }

  // cập nhật overlay từ progress (đã giảm chấn bởi engine nếu có WebGL)
  const paint = (p: number, altitude?: number) => {
    panels.current.forEach((el, i) => {
      if (!el) return
      const [a, b] = CHAPTERS[i]
      const last = i === CHAPTERS.length - 1
      const o = smoothstep(a, a + 0.035, p) * (last ? 1 : 1 - smoothstep(b - 0.035, b, p))
      el.style.opacity = String(o)
      el.style.transform = `translate3d(0, ${(1 - o) * 24}px, 0)`
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
    })
    const idx = CHAPTERS.findIndex(([a, b]) => p >= a && p < b)
    if (chapEl.current) chapEl.current.textContent = `${String(Math.max(0, idx) + 1).padStart(2, '0')}/06`
    if (altEl.current) altEl.current.textContent = `${Math.round(altitude ?? lerp(12, 1470, p)).toLocaleString()} m`
    if (kcalEl.current) kcalEl.current.textContent = `${Math.round(lerp(120, 8849, smoothstep(0, 1, p))).toLocaleString()} kcal`
    if (barEl.current) barEl.current.style.transform = `scaleX(${p})`
    if (hintEl.current) hintEl.current.style.opacity = String(1 - smoothstep(0.01, 0.05, p))
  }

  useEffect(() => {
    let engine: Engine | null = null
    let visible = false
    let raf = 0
    let cancelled = false

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const p = readProgress()
      if (engine) engine.setProgress(p)
      else paint(p) // chưa có WebGL → overlay vẫn chạy theo cuộn
    }

    const load = async () => {
      if (!webgl || engine || !canvas.current) return
      setBoot(0)
      const { createJourney } = await import('../journey/engine')
      if (cancelled || !canvas.current) return
      engine = createJourney({
        canvas: canvas.current,
        mobile,
        reducedMotion: prefersReducedMotion(),
        onBootProgress: (v) => setBoot(v),
        onFrame: ({ progress, altitude }) => paint(progress, altitude),
      })
      engine.setProgress(readProgress())
      engine.setActive(visible)
      await engine.boot()
      if (!cancelled) setBoot(2)
    }

    // tải trước khi tới gần; chỉ render khi đang thấy
    const near = new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: '1200px 0px' })
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      engine?.setActive(visible)
      cancelAnimationFrame(raf)
      if (visible) loop()
    })
    if (section.current) {
      near.observe(section.current)
      seen.observe(section.current)
    }
    const onResize = () => engine?.resize()
    addEventListener('resize', onResize)
    paint(0)
    return () => {
      cancelled = true
      near.disconnect()
      seen.disconnect()
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
      engine?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webgl, mobile])

  return (
    <section id="journey" ref={section} className="relative" style={{ height: mobile ? '620svh' : '720svh' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0b1020]">
        <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden="true" />

        {/* chữ các chương */}
        {t.chapters.map((c, i) => {
          const white = i === 2
          return (
            <div
              key={i}
              ref={(el) => {
                panels.current[i] = el
              }}
              className={
                white
                  ? 'pointer-events-none absolute inset-0 grid place-items-center px-5 text-center opacity-0 sm:px-6'
                  : 'pointer-events-none absolute inset-x-4 bottom-24 opacity-0 sm:inset-x-auto sm:bottom-28 sm:left-10 sm:max-w-md lg:left-16'
              }
              style={{ visibility: 'hidden', willChange: 'opacity, transform' }}
            >
              {white ? (
                <div className="w-full max-w-2xl text-[#1b1f2a]">
                  <p className="font-mono text-xs tracking-[0.3em] opacity-70">{c.kicker}</p>
                  <h3 className="mt-3 text-[clamp(2.5rem,13vw,6rem)] font-black leading-none tracking-[0.06em] sm:tracking-[0.15em]">{c.title}</h3>
                  <p className="mx-auto mt-5 max-w-xl text-pretty text-sm font-medium sm:text-lg">{c.body}</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-black/35 p-5 shadow-2xl backdrop-blur-md sm:p-6">
                  <p className="font-mono text-[11px] tracking-widest text-noodle">{c.kicker}</p>
                  <h3 className="mt-2 text-balance text-3xl font-black leading-tight sm:text-4xl">{c.title}</h3>
                  <p className="mt-3 text-pretty text-sm text-paper/80 sm:text-base">{c.body}</p>
                  {i === t.chapters.length - 1 && (
                    <a href="#donate" className="pointer-events-auto mt-5 inline-block rounded-2xl bg-noodle px-5 py-3 font-black text-ink shadow-[0_0_40px_-8px] shadow-noodle transition hover:-translate-y-0.5">
                      {t.cta}
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-4 top-20 flex items-start justify-between font-mono text-[11px] text-paper/85 mix-blend-difference sm:inset-x-10 sm:top-24 sm:text-xs">
          <div>
            <p className="opacity-70">{t.kicker}</p>
            <p className="mt-1">{t.chapter} <span ref={chapEl}>01/06</span></p>
          </div>
          <div className="text-right">
            <p>{t.altitude} <span ref={altEl} className="tabular-nums">12 m</span></p>
            <p className="mt-1">{t.energy} <span ref={kcalEl} className="tabular-nums">120 kcal</span></p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-8 sm:inset-x-10">
          <div className="relative h-px bg-white/20">
            <div ref={barEl} className="absolute inset-0 origin-left bg-noodle" style={{ transform: 'scaleX(0)' }} />
            {CHAPTERS.map(([a], i) => (
              <span key={i} className="absolute -top-1 size-2 -translate-x-1/2 rounded-full bg-paper/70" style={{ left: `${a * 100}%` }} />
            ))}
          </div>
        </div>
        <a href="#vitals" className="absolute right-4 top-32 font-mono text-[11px] text-paper/60 mix-blend-difference hover:text-paper sm:bottom-12 sm:right-10 sm:top-auto">
          {t.skip}
        </a>
        <div ref={hintEl} className="pointer-events-none absolute inset-x-0 bottom-14 text-center font-mono text-sm tracking-widest text-paper/80">
          <span className="inline-block animate-bounce">{t.hint}</span>
        </div>

        {/* màn hình tải */}
        {boot !== null && boot < 2 && (
          <div className="absolute inset-0 grid place-items-center bg-[#0b1020]">
            <div className="w-64 text-center">
              <p className="font-mono text-xs text-muted">{t.loading}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-noodle transition-[width] duration-150" style={{ width: `${Math.round(boot * 100)}%` }} />
              </div>
              <p className="mt-2 font-mono text-xs tabular-nums text-paper/70">{Math.round(boot * 100)}%</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
