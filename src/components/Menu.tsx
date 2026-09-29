const menu = [
  ['Thứ 2', 'Mì tôm', 'vị tôm chua cay', '😐'],
  ['Thứ 3', 'Mì tôm', 'vị gà (không có gà)', '😶'],
  ['Thứ 4', 'Mì tôm trụng 2 lần', 'cho đỡ nóng trong', '🥲'],
  ['Thứ 5', 'Mì tôm + 1 quả trứng', 'bữa tiệc giữa tuần', '🤩'],
  ['Thứ 6', 'Nước mì hôm qua', 'deploy xong không dám ăn', '💀'],
  ['Thứ 7', 'Mì tôm sống', 'bẻ vụn chấm gói gia vị, hoài niệm tuổi thơ', '🥹'],
  ['Chủ nhật', '???', 'phụ thuộc vào bạn', '🫵'],
] as const

export function Menu() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">// 03 — weekly_menu.json</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">Thực đơn tuần này</h2>
      <p className="mt-2 text-muted">Được thiết kế bởi chuyên gia dinh dưỡng: là chính tôi, lúc 3h sáng.</p>
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
                Viết lại Chủ nhật →
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
