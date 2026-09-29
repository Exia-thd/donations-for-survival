import { lazy, Suspense, useMemo } from 'react'
import { motion } from 'motion/react'
import { useSurvival, moodOf, MOOD_TEXT } from '../store'
import { supportsWebGL } from '../lib/hooks'

const Scene = lazy(() => import('../three/Scene'))

function Fallback() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <div className="text-8xl">🥣</div>
        <p className="mt-4 font-mono text-sm text-muted">
          Máy bạn không chạy được WebGL.
          <br />
          Giống như dev không chạy được nếu thiếu cơm.
        </p>
      </div>
    </div>
  )
}

const words = ['Lập', 'trình', 'viên', 'này', 'đang', 'chạy', 'bằng', 'mì', 'tôm', 'và', 'niềm', 'tin.']

export function Hero() {
  const fed = useSurvival((s) => s.fed)
  const webgl = useMemo(supportsWebGL, [])

  return (
    <section id="top" className="relative grid min-h-[100svh] items-center gap-2 px-4 pt-20 lg:gap-6 lg:pt-24 lg:grid-cols-[1.05fr_1fr] lg:px-12">
      <div className="relative z-10 mx-auto max-w-2xl lg:mx-0">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-chili/40 bg-chili/10 px-3 py-1 font-mono text-xs text-chili"
        >
          <span className="size-1.5 animate-blink rounded-full bg-chili" />
          [{moodOf(fed).toUpperCase()}] {MOOD_TEXT[moodOf(fed)]}
        </motion.p>

        <h1 className="text-balance text-[2.6rem] font-black leading-[0.95] tracking-tight sm:text-7xl">
          {words.map((w, i) => (
            <motion.span
              key={i}
              className={`mr-[0.25em] inline-block ${w === 'mì' || w === 'tôm' ? 'text-noodle' : ''}`}
              initial={{ opacity: 0, y: 40, rotate: 6, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 220, damping: 18 }}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 max-w-xl text-pretty text-lg text-muted"
        >
          <code className="font-mono text-paper">donations-for-survival</code> là sáng kiến mã nguồn mở nhằm{' '}
          <b className="text-paper">ngăn chặn lỗi runtime nghiêm trọng do lập trình viên bị đói</b>. Mỗi đồng bạn
          gửi được chuyển thẳng thành cà phê, cơm tấm và một chút lòng tự trọng.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a href="#donate" className="group relative overflow-hidden rounded-2xl bg-noodle px-6 py-4 font-bold text-ink shadow-[0_0_40px_-8px] shadow-noodle/60 transition hover:-translate-y-0.5">
            🍚 Cho một bữa cơm
          </a>
          <a href="#vitals" className="rounded-2xl border border-white/15 px-6 py-4 font-bold hover:bg-white/5">
            Xem chỉ số sinh tồn →
          </a>
        </motion.div>
        <p className="mt-4 font-mono text-xs text-muted">↳ mẹo: bấm vào cảnh 3D để thả xu tưởng tượng (miễn phí, vô dụng)</p>
      </div>

      <div className="relative order-first h-[48svh] min-h-[340px] cursor-pointer lg:order-none lg:h-[80svh]">
        <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,black_75%,transparent)]">
        {webgl ? (
          <Suspense fallback={<div className="grid h-full place-items-center font-mono text-sm text-muted">Đang nấu cơm… (loading 3D)</div>}>
            <Scene />
          </Suspense>
        ) : (
          <Fallback />
        )}
        </div>
        {/* thanh no bụng nổi trên canvas */}
        <div className="pointer-events-none absolute inset-x-6 bottom-2 rounded-2xl border border-white/10 bg-ink/70 p-3 backdrop-blur-md">
          <div className="mb-1 flex justify-between font-mono text-xs">
            <span>🍚 stomach.buffer</span>
            <span className="tabular-nums">{fed.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-chili via-noodle to-broke"
              animate={{ width: `${fed}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
