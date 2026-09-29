import { useSurvival, moodOf } from '../store'
import { withViewTransition } from '../lib/hooks'

export function Nav() {
  const fed = useSurvival((s) => s.fed)
  const powerSaving = useSurvival((s) => s.powerSaving)
  const toggle = useSurvival((s) => s.togglePowerSaving)
  const mood = moodOf(fed)

  const onToggle = () =>
    withViewTransition(() => {
      toggle()
      document.documentElement.classList.toggle('power-saving')
    })

  return (
    <>
      <div className="progress-bar fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-noodle via-chili to-bruise" />
      <header className="fixed inset-x-0 top-3 z-40 mx-auto flex w-[min(1100px,calc(100%-2rem))] items-center justify-between gap-3 rounded-full border border-white/10 bg-ink/60 px-4 py-2 backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-xl">🍜</span>
          <span className="hidden sm:inline">donations-for-survival</span>
        </a>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={`size-2 rounded-full ${mood === 'dying' ? 'animate-blink bg-chili' : mood === 'hungry' ? 'bg-noodle' : 'bg-broke'}`} />
          <span className="hidden md:inline text-muted">HP</span>
          <span className="tabular-nums">{fed.toFixed(0)}%</span>
          <button
            onClick={onToggle}
            className="ml-2 rounded-full border border-white/15 px-3 py-1 hover:bg-white/10"
            title="Tắt màu cho đỡ tốn điện (thật ra không đỡ)"
          >
            {powerSaving ? '🔌 Có điện rồi' : '🪫 Tiết kiệm điện'}
          </button>
          <a href="#donate" className="rounded-full bg-noodle px-3 py-1 font-bold text-ink hover:brightness-110">
            Cứu đói
          </a>
        </div>
      </header>
    </>
  )
}
