export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-16 text-center">
      <p className="glitch mx-auto w-fit text-5xl font-black sm:text-7xl" data-text="ZERO ROI.">ZERO ROI.</p>
      <p className="mt-4 text-muted">Nhưng maximum sự thoả mãn khi biết bạn vừa giữ cho một sinh vật có tri giác còn sống.</p>
      <p className="mt-10 font-mono text-xs text-muted">
        donations-for-survival · non-profit (và non-refundable) · build với React 19 · Three.js · R3F · Rapier · Tailwind v4 · Motion
        <br />
        © {new Date().getFullYear()} — mọi bug đều do đói, mọi feature đều nhờ bạn.
      </p>
    </footer>
  )
}
