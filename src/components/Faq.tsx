const faqs = [
  ['Tiền của tôi được dùng vào việc gì?', 'Cà phê (60%), cơm (35%), và 5% còn lại để mua trứng cho mì tôm vào những ngày đặc biệt.'],
  ['Tôi có được hoàn tiền không?', 'Không. Nhưng bạn sẽ được hoàn lại bằng cảm giác ấm áp — thứ không bị đánh thuế.'],
  ['Donate có giúp code tốt hơn không?', 'Theo nghiên cứu (n=1, không peer-review), đường huyết cao hơn tương quan với ít sự cố production vào thứ Sáu hơn.'],
  ['Sao không đi làm thêm?', 'Đang làm thêm rồi. Đây chính là trang web làm thêm. Bạn đang ở trong nó.'],
  ['Có xuất hoá đơn VAT không?', 'Có thể xuất hoá đơn "Very Appreciated Thanks". Mệnh giá: vô hạn.'],
] as const

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-28">
      <p className="font-mono text-sm text-noodle">// 05 — FAQ</p>
      <h2 className="mt-2 text-4xl font-black sm:text-5xl">Câu hỏi hay bị hỏi</h2>
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
