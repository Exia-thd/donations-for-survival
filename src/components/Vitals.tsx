import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'motion/react'
import { useSurvival } from '../store'
import { spotlight, useTicker } from '../lib/hooks'
import { formatVND } from '../config'
import { useT } from '../i18n'

const color: Record<string, string> = {
  INFO: 'text-sky-300', WARN: 'text-noodle', ERROR: 'text-chili', DEBUG: 'text-bruise', FATAL: 'text-chili font-bold',
}

function Terminal() {
  const tick = useTicker(1400)
  const LOGS = useT().vitals.logs
  const box = useRef<HTMLDivElement>(null)
  const lines = Array.from({ length: Math.min(tick + 3, 40) }, (_, i) => LOGS[i % LOGS.length])
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' })
  }, [tick])
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/60">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-chili" /><span className="size-3 rounded-full bg-noodle" /><span className="size-3 rounded-full bg-broke" />
        <span className="ml-3 font-mono text-xs text-muted">~/life $ tail -f body.log</span>
      </div>
      <div ref={box} className="h-64 overflow-y-auto p-4 font-mono text-xs leading-6 [scrollbar-width:none]">
        {lines.map(([lvl, msg], i) => (
          <div key={i}>
            <span className="text-muted">[{String(i).padStart(3, '0')}]</span> <span className={color[lvl]}>{lvl.padEnd(5)}</span> {msg}
          </div>
        ))}
        <span className="animate-blink">▋</span>
      </div>
    </div>
  )
}

function CountDown({ from, to }: { from: number; to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const c = animate(from, to, {
      duration: 2.4, ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = formatVND(Math.round(v)) },
    })
    return () => c.stop()
  }, [inView, from, to])
  return <span ref={ref} className="tabular-nums">{formatVND(from)}</span>
}

function Meter({ label, value, hint, tone }: { label: string; value: number; hint: string; tone: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-xs"><span>{label}</span><span className="tabular-nums">{value.toFixed(0)}%</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div className={`h-full rounded-full ${tone}`} initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: false }} transition={{ duration: 1.2 }} />
      </div>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div onPointerMove={spotlight} className={`spotlight reveal rounded-3xl border border-white/10 bg-white/[0.03] p-6 ${className}`}>
      {children}
    </div>
  )
}

export function Vitals() {
  const fed = useSurvival((s) => s.fed)
  const t = useT()
  const v = t.vitals
  const [hours, setHours] = useState(71)
  useEffect(() => {
    const id = setInterval(() => setHours((h) => h + 1), 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="vitals" className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">{v.kicker}</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">{v.title} <span className="text-muted">{v.titleMuted}</span></h2>
      <p className="mt-2 text-sm text-muted">{v.footnote}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-2">
          <p className="font-mono text-xs text-muted">{v.balance}</p>
          <p className="mt-3 text-4xl font-black text-chili"><CountDown from={2_450_000} to={12_000} /></p>
          <p className="mt-2 text-sm text-muted">{v.balanceNote}</p>
        </Card>
        <Card className="md:col-span-2">
          <p className="font-mono text-xs text-muted">{v.lastMeal}</p>
          <p className="mt-3 text-4xl font-black tabular-nums">{v.hoursAgo(hours)}</p>
          <p className="mt-2 text-sm text-muted">{v.lastMealNote}</p>
        </Card>
        <Card className="md:col-span-2">
          <p className="font-mono text-xs text-muted">{v.uptime}</p>
          <p className="mt-3 text-4xl font-black">99.97%</p>
          <p className="mt-2 text-sm text-muted">{v.uptimeNote}</p>
        </Card>

        <Card className="space-y-5 md:col-span-3">
          <Meter label="☕ caffeine.level" value={11} hint={v.meters.caffeine} tone="bg-amber-700" />
          <Meter label="🍚 blood_sugar" value={fed} hint={v.meters.sugar} tone="bg-noodle" />
          <Meter label="🧠 sanity" value={23} hint={v.meters.sanity} tone="bg-bruise" />
          <Meter label="🐛 bugs_per_hour" value={87} hint={v.meters.bugs} tone="bg-chili" />
        </Card>
        <div className="reveal md:col-span-3"><Terminal /></div>
      </div>
    </section>
  )
}
