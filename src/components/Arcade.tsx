import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { useArcade, GAME_SECONDS, type GameId } from '../arcade/store'
import { useT } from '../i18n'
import { supportsWebGL } from '../lib/hooks'

const ArcadeCanvas = lazy(() => import('../arcade/ArcadeCanvas'))

export function Arcade() {
  const t = useT().arcade
  const { game, status, score, timeLeft, best } = useArcade()
  const setGame = useArcade((s) => s.setGame)
  const start = useArcade((s) => s.start)
  const [backend, setBackend] = useState('')
  const [visible, setVisible] = useState(false)
  const bestBefore = useRef(0)
  const webgl = useMemo(supportsWebGL, [])
  const onBackend = useCallback((b: string) => setBackend(b), [])

  // chỉ tải canvas khi cuộn tới gần — không làm nặng lần tải đầu
  const sentinel = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setVisible(true), io.disconnect()), { rootMargin: '400px' })
    io.observe(el)
  }, [])

  const begin = () => {
    bestBefore.current = best[game]
    start()
  }
  const isNewBest = status === 'over' && score > bestBefore.current && score > 0
  useEffect(() => {
    if (isNewBest) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  }, [isNewBest])

  return (
    <section id="arcade" className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">{t.kicker}</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">{t.title}</h2>
      <p className="mt-2 max-w-2xl text-muted">{t.lead}</p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(['toss', 'bugs'] as GameId[]).map((g) => (
          <button
            key={g}
            onClick={() => setGame(g)}
            className={`rounded-full px-4 py-2 font-bold transition ${g === game ? 'bg-noodle text-ink' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {t.tabs[g]}
          </button>
        ))}
        {backend && (
          <span className="ml-auto rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-muted">
            {t.renderer}: <span className={backend === 'WebGPU' ? 'text-broke' : 'text-noodle'}>{backend}</span> · TSL
          </span>
        )}
      </div>

      <div ref={sentinel} className="relative mt-4 aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-black sm:aspect-[16/9]">
        {webgl && visible ? (
          <Suspense fallback={<div className="grid h-full place-items-center font-mono text-sm text-muted">{t.loading}</div>}>
            <ArcadeCanvas onBackend={onBackend} />
          </Suspense>
        ) : (
          <div className="grid h-full place-items-center font-mono text-sm text-muted">{webgl ? t.loading : '🥣 WebGL/WebGPU ✗'}</div>
        )}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between gap-2 font-mono text-xs sm:text-sm">
          <span className="rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">{t.score}: <b className="text-noodle tabular-nums">{score}</b></span>
          <span className="rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">
            ⏱ <b className={`tabular-nums ${timeLeft < 5 && status === 'playing' ? 'text-chili' : ''}`}>{timeLeft.toFixed(1)}s</b>
          </span>
          <span className="rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">{t.best}: <b className="tabular-nums">{best[game]}</b></span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div className="h-full bg-noodle transition-[width] duration-100" style={{ width: `${(timeLeft / GAME_SECONDS[game]) * 100}%` }} />
        </div>

        {/* màn hình bắt đầu / kết thúc */}
        <AnimatePresence>
          {status !== 'playing' && (
            <motion.div
              key={status + game}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, pointerEvents: 'none' }}
              className="absolute inset-0 grid place-items-center bg-black/55 p-6 text-center backdrop-blur-sm"
            >
              <div className="max-w-md">
                {status === 'over' ? (
                  <>
                    {isNewBest && <p className="mb-2 font-mono text-noodle">{t.newBest}</p>}
                    <p className="text-2xl font-black sm:text-3xl">{t.result(score)}</p>
                  </>
                ) : (
                  <p className="text-lg text-paper/90">{t.hints[game]}</p>
                )}
                <button onClick={begin} className="mt-6 rounded-2xl bg-noodle px-8 py-4 text-lg font-black text-ink shadow-[0_0_40px_-8px] shadow-noodle transition hover:-translate-y-0.5">
                  {status === 'over' ? t.again : t.start}
                </button>
                {status === 'over' && (
                  <a href="#donate" className="mt-4 block text-sm text-noodle hover:underline">{t.donateCta}</a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
