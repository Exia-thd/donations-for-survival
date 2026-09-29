const news = [
  '⚠ BREAKING: Dev ăn mì tôm ngày thứ 17 liên tiếp, bắt đầu nói chuyện với con vịt cao su',
  '📉 Số dư tài khoản giảm 12% sau khi lỡ tay mua thêm 1 quả trứng',
  '☕ Cà phê hôm nay được pha lại từ bã hôm qua — "vị có chiều sâu"',
  '🐛 Bug production tăng vọt, chuyên gia nghi ngờ nguyên nhân là đói',
  '🏠 Chủ trọ gửi tin nhắn "em ơi" — dev giả vờ offline',
  '🍜 Mì tôm tăng giá 500đ, thị trường chấn động',
]

export function Ticker() {
  const row = [...news, ...news]
  return (
    <div className="overflow-hidden py-4">
    <div className="relative -mx-4 -rotate-1 overflow-hidden border-y border-noodle/40 bg-noodle py-3 text-ink" aria-label="Tin nóng">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-sm font-bold hover:[animation-play-state:paused]">
        {row.map((n, i) => (
          <span key={i} aria-hidden={i >= news.length}>{n}</span>
        ))}
      </div>
    </div>
    </div>
  )
}
