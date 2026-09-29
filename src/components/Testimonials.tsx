import { useT } from '../i18n'

export function Testimonials() {
  const t = useT()
  const quotes = t.reviews.items
  return (
    <section className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">{t.reviews.kicker}</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">{t.reviews.title}</h2>
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {quotes.map(([who, text, icon]) => (
          <figure key={who} className="reveal mb-4 break-inside-avoid rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <blockquote className="text-lg">{text}</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 text-sm text-muted">
              <span className="grid size-10 place-items-center rounded-full bg-white/5 text-xl">{icon}</span>
              {who} · <span className="text-noodle">★★★★☆</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
