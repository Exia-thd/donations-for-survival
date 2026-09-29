const quotes = [
  ['Mẹ', '"Con ăn uống đầy đủ không?" — Dạ đầy đủ ạ (đủ 3 gói/ngày).', '👩‍🦳'],
  ['Chủ nhà trọ', 'Cậu này rất đúng giờ. Đúng giờ trốn mỗi mùng 5 hàng tháng.', '🏠'],
  ['Con vịt cao su trên bàn', 'Nó kể hết bug cho tôi nghe. Giờ nó bắt đầu kể chuyện về đồ ăn.', '🦆'],
  ['Laptop 2017', 'Tôi và cậu ấy cùng nóng lên mỗi khi chạy Docker. Cùng khổ.', '💻'],
  ['Senior dev ẩn danh', '"It works on my machine." Cậu ấy thì không work vì đói.', '🧔'],
  ['Mèo hàng xóm', 'Hôm qua tôi thấy cậu ta nhìn chén hạt của tôi hơi lâu.', '🐈'],
] as const

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">// 04 — reviews (100% có thật trong tưởng tượng)</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">Người đời nói gì</h2>
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
