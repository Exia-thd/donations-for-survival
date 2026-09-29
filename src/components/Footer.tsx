import { useT } from '../i18n'

export function Footer() {
  const t = useT()
  return (
    <footer className="border-t border-white/10 px-4 py-16 text-center">
      <p className="glitch mx-auto w-fit text-5xl font-black sm:text-7xl" data-text="ZERO ROI.">ZERO ROI.</p>
      <p className="mt-4 text-muted">{t.footer.line}</p>
      <p className="mt-10 font-mono text-xs text-muted">
        donations-for-survival · {t.footer.meta} React 19 · Three.js · R3F · Rapier · Tailwind v4 · Motion
        <br />
        © {new Date().getFullYear()} — {t.footer.copy}
      </p>
    </footer>
  )
}
