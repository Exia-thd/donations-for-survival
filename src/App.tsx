import { useEffect } from 'react'
import Lenis from 'lenis'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Ticker } from './components/Ticker'
import { Vitals } from './components/Vitals'
import { Tiers } from './components/Tiers'
import { Menu } from './components/Menu'
import { Testimonials } from './components/Testimonials'
import { Faq } from './components/Faq'
import { Donate } from './components/Donate'
import { Footer } from './components/Footer'
import { useSurvival } from './store'
import { prefersReducedMotion, useGuiltTrip } from './lib/hooks'
import { applyDocumentLang, useLang } from './i18n'

export default function App() {
  useGuiltTrip()
  const lang = useLang((s) => s.lang)
  useEffect(() => applyDocumentLang(lang), [lang])

  // đói dần theo thời gian
  useEffect(() => {
    const id = setInterval(() => useSurvival.getState().starve(), 1500)
    return () => clearInterval(id)
  }, [])

  // smooth scroll
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ autoRaf: true, anchors: true })
    return () => lenis.destroy()
  }, [])

  return (
    <div className="grain">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Vitals />
        <Tiers />
        <Menu />
        <Testimonials />
        <Donate />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
