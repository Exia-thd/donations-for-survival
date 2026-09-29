import { useState } from 'react'
import { motion } from 'motion/react'
import { DONATE, vietQrUrl } from '../config'
import { useT } from '../i18n'

/** Thẻ QR nhỏ ở đầu trang: quét là chuyển được luôn, không cần cuộn xuống. */
export function QuickQr() {
  const t = useT().hero
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const dynamic = vietQrUrl(0, DONATE.message)
  const src = (!failed && dynamic) || DONATE.staticQr
  if (!src) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, type: 'spring', stiffness: 160, damping: 18 }}
      className="mt-6 flex max-w-xl items-center gap-4 rounded-3xl border border-noodle/30 bg-noodle/[0.06] p-3 pr-5"
    >
      <a href={src} target="_blank" rel="noreferrer" className="shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 transition hover:scale-105">
        {src === DONATE.staticQr ? (
          // ảnh QR tĩnh có cả khung logo/tên → crop đúng phần mã (x 250–970, y 283–1003 trên ảnh 1220×1505)
          <div className="relative size-28 overflow-hidden sm:size-32">
            <img src={src} alt={t.qrAlt} className="absolute max-w-none" style={{ width: '169.4%', left: '-34.7%', top: '-39.3%' }} />
          </div>
        ) : (
          <img src={src} alt={t.qrAlt} onError={() => setFailed(true)} className="size-28 object-contain sm:size-32" />
        )}
      </a>
      <div className="min-w-0 text-sm">
        <p className="font-bold text-paper">{t.qrTitle}</p>
        <p className="mt-1 text-muted">{t.qrSub}</p>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(DONATE.accountNo)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="mt-2 rounded-lg border border-white/15 px-2 py-1 font-mono text-xs hover:bg-white/10"
        >
          {DONATE.bankId.toUpperCase()} · {DONATE.accountNo} · {copied ? '✓' : '⧉'}
        </button>
        <a href="#tiers" className="mt-2 block font-mono text-xs text-noodle hover:underline">{t.qrMore}</a>
      </div>
    </motion.div>
  )
}
