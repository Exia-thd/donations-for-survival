import { useT } from '../i18n'

export function Menu() {
  const t = useT()
  const menu = t.menu.days
  return (
    <section className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">{t.menu.kicker}</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">{t.menu.title}</h2>
      <p className="mt-2 text-muted">{t.menu.lead}</p>
      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {menu.map(([day, dish, note, face], i) => (
          <li
            key={day}
            className={`reveal flex flex-col rounded-2xl border p-4 ${i === 6 ? 'border-noodle bg-noodle/10' : 'border-white/10 bg-white/[0.03]'}`}
          >
            <span className="font-mono text-xs text-muted">{day}</span>
            <span className="mt-3 text-4xl">{face}</span>
            <span className="mt-3 font-bold">{dish}</span>
            <span className="text-xs text-muted">{note}</span>
            {i === 6 && (
              <a href="#tiers" className="mt-3 rounded-lg bg-noodle px-2 py-1 text-center text-xs font-bold text-ink">
                {t.menu.cta}
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
