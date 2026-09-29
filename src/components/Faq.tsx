import { useT } from '../i18n'

export function Faq() {
  const t = useT()
  const faqs = t.faq.items
  return (
    <section className="mx-auto max-w-3xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">{t.faq.kicker}</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">{t.faq.title}</h2>
      <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {faqs.map(([q, a]) => (
          <details key={q} name="faq" className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
              {q}
              <span className="text-2xl text-noodle transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="pt-3 text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
