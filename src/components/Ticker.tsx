import { useT } from '../i18n'

export function Ticker() {
  const t = useT()
  const news = t.ticker.items
  const row = [...news, ...news]
  return (
    <div className="overflow-hidden py-4">
    <div className="relative -mx-4 -rotate-1 overflow-hidden border-y border-noodle/40 bg-noodle py-3 text-ink" aria-label={t.ticker.label}>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-sm font-bold hover:[animation-play-state:paused]">
        {row.map((n, i) => (
          <span key={i} aria-hidden={i >= news.length}>{n}</span>
        ))}
      </div>
    </div>
    </div>
  )
}
