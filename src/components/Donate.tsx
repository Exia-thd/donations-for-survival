import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { DONATE, TIERS, formatUSD, formatVND, vietQrUrl } from '../config'
import { useLang, useT } from '../i18n'
import { useSurvival } from '../store'

function CopyRow({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false)
  const t = useT().donate
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-muted">{label}</p>
        <p className="truncate font-bold">{value || t.notSet}</p>
      </div>
      {value && (
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(value)
            setOk(true)
            setTimeout(() => setOk(false), 1500)
          }}
          className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs hover:bg-white/10"
        >
          {ok ? t.copied : t.copy}
        </button>
      )}
    </div>
  )
}

export function Donate() {
  const selected = useSurvival((s) => s.selected)
  const select = useSurvival((s) => s.select)
  const feed = useSurvival((s) => s.feed)
  const dropCoins = useSurvival((s) => s.dropCoins)
  const [custom, setCustom] = useState(30_000)
  const [qrFailed, setQrFailed] = useState(false)
  const toast = useRef<HTMLDivElement>(null)
  const t = useT().donate
  const lang = useLang((s) => s.lang)

  const amount = selected.amount || custom
  const dynamicQr = vietQrUrl(amount, `${DONATE.message} ${selected.path}`)
  const qr = (!qrFailed && dynamicQr) || DONATE.staticQr || null

  const thanks = () => {
    feed(Math.max(8, Math.min(60, amount / 4000)))
    dropCoins(selected.coins)
    const colors = ['#ffd23f', '#f25c54', '#9b5de5', '#ffffff']
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.7 }, colors })
    confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors, shapes: [confetti.shapeFromText({ text: '🍚', scalar: 2 })], scalar: 2 })
    confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors, shapes: [confetti.shapeFromText({ text: '☕', scalar: 2 })], scalar: 2 })
    toast.current?.showPopover()
    setTimeout(() => toast.current?.hidePopover(), 4000)
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="donate" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-28">
      <p className="font-mono text-sm text-noodle">{t.kicker}</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">{t.title}</h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* QR */}
        <div className="reveal rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => select(t)}
                className={`rounded-full px-3 py-1.5 font-mono text-xs transition ${t.id === selected.id ? 'bg-noodle font-bold text-ink' : 'bg-white/5 hover:bg-white/10'}`}
              >
                {t.emoji} {t.method} {t.path}
              </button>
            ))}
          </div>
          {!selected.amount && (
            <label className="mb-4 block">
              <span className="font-mono text-xs text-muted">{t.customLabel}</span>
              <input
                type="number" min={1000} step={1000} value={custom}
                onChange={(e) => setCustom(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-lg outline-none focus:border-noodle"
              />
            </label>
          )}
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-paper p-3">
            <AnimatePresence mode="wait">
              {qr ? (
                <motion.img
                  key={qr} src={qr} alt={t.qrAlt(formatVND(amount))}
                  initial={{ opacity: 0, scale: 0.9, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  onError={() => setQrFailed(true)}
                  className="size-full object-contain"
                />
              ) : (
                <motion.div key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid size-full place-items-center rounded-xl border-4 border-dashed border-ink/30 p-6 text-center text-ink">
                  <div>
                    <div className="text-6xl">🪙</div>
                    <p className="mt-3 font-mono text-sm font-bold">[ Insert QR Code / Bank Info Here ]</p>
                    <p className="mt-2 text-xs text-ink/60">{t.qrHint[0]} <code>bankId</code> {t.qrHint[1]} <code>accountNo</code> {t.qrHint[2]} <code>src/config.ts</code> {t.qrHint[3]}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-4 text-center font-mono text-sm">
            payload: <span className="text-noodle">{formatVND(amount)}</span>
            {lang === 'en' && amount > 0 && <span className="text-muted"> ({t.approx} {formatUSD(amount)})</span>} → <span className="text-muted">{selected.path}</span>
          </p>
        </div>

        {/* Bank info + CTA */}
        <div className="reveal flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <pre className="overflow-x-auto rounded-xl bg-black/60 p-4 font-mono text-xs leading-6 text-muted">
{`$ curl -X ${selected.method} https://dev.local${selected.path} \\
    -H "Content-Type: ${t.contentType}" \\
    -d '{ "amount": ${amount}, "currency": "VND" }'

`}<span className="text-broke">{`HTTP/1.1 200 OK  ${t.responseNote}`}</span>
          </pre>
          <CopyRow label={t.bank} value={DONATE.bankName} />
          <CopyRow label={t.account} value={DONATE.accountNo} />
          <CopyRow label={t.holder} value={DONATE.accountName} />
          <CopyRow label={t.note} value={`${DONATE.message} ${selected.path}`} />
          {DONATE.altLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {DONATE.altLinks.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">{l.label} ↗</a>
              ))}
            </div>
          )}
          <button
            onClick={thanks}
            className="mt-auto rounded-2xl bg-noodle px-6 py-5 text-lg font-black text-ink shadow-[0_0_60px_-10px] shadow-noodle transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
          >
            {t.confirm}
          </button>
          <p className="text-center text-xs text-muted">{t.confirmNote}</p>
        </div>
      </div>

      <div ref={toast} popover="manual" className="toast rounded-2xl border border-broke/40 bg-ink p-4 text-paper shadow-2xl">
        <p className="font-bold">{t.toastTitle}</p>
        <p className="text-sm text-muted">{t.toastBody}</p>
      </div>
    </section>
  )
}
