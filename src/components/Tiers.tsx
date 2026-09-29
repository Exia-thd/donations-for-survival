import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { TIERS, formatVND, type Tier } from '../config'
import { useSurvival } from '../store'
import { spotlight } from '../lib/hooks'

const methodColor: Record<Tier['method'], string> = {
  GET: 'bg-broke/20 text-broke', POST: 'bg-noodle/20 text-noodle', PUT: 'bg-sky-400/20 text-sky-300', PATCH: 'bg-bruise/25 text-bruise',
}

function TierCard({ tier }: { tier: Tier }) {
  const selected = useSurvival((s) => s.selected.id === tier.id)
  const select = useSurvival((s) => s.select)
  const dropCoins = useSurvival((s) => s.dropCoins)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  return (
    <motion.button
      type="button"
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        spotlight(e)
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width - 0.5)
        y.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
      onClick={() => {
        select(tier)
        dropCoins(tier.coins)
        document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' })
      }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={selected}
      className={`spotlight flex h-full flex-col w-full rounded-3xl p-6 text-left transition-colors ${selected ? 'ring-spin' : 'border-2 border-white/10 bg-white/[0.03] hover:border-white/25'}`}
    >
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className={`rounded-md px-2 py-0.5 font-bold ${methodColor[tier.method]}`}>{tier.method}</span>
        <span>{tier.path}</span>
      </div>
      <div className="mt-6 text-6xl">{tier.emoji}</div>
      <h3 className="mt-4 text-xl font-bold">{tier.title}</h3>
      <p className="mt-1 text-3xl font-black text-noodle">{tier.amount ? formatVND(tier.amount) : 'Tuỳ tâm'}</p>
      <p className="mt-3 flex-1 text-sm text-muted">{tier.outcome}</p>
      <p className="mt-5 border-t border-white/10 pt-3 font-mono text-[11px] text-muted">
        response: <span className="text-broke">{tier.latency}</span>
      </p>
    </motion.button>
  )
}

export function Tiers() {
  return (
    <section id="tiers" className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">// 02 — contribution tiers (API endpoints)</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">Chọn endpoint để gọi</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Tất cả endpoint đều trả về <code className="font-mono text-paper">200 OK</code> cho lương tâm của bạn. Zero ROI, nhưng
        maximum cảm giác mình là người tốt.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <div key={t.id} className="reveal"><TierCard tier={t} /></div>
        ))}
      </div>
    </section>
  )
}
