/**
 * ⚙️ Cấu hình nhận tiền — SỬA FILE NÀY là xong.
 *
 * QR được sinh tự động qua VietQR (https://vietqr.io) theo đúng số tiền của từng tier.
 * `bankId` là mã BIN hoặc short name của ngân hàng (vd: "970436" hoặc "vcb", "mb", "tcb", "acb").
 * Để trống `accountNo` thì trang sẽ hiện ô QR placeholder thay vì QR thật.
 */
export const DONATE = {
  bankId: 'bidv', // BIN 970418
  bankName: 'BIDV — Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', // hiển thị cho người xem
  accountNo: '1440206408',
  accountName: 'TRAN HUU DAT', // viết hoa không dấu
  /** Ảnh QR tĩnh (không kèm số tiền) — dùng khi không tải được QR động từ VietQR. */
  staticQr: './qr-bidv.jpg',
  message: 'Cuu doi dev', // nội dung chuyển khoản mặc định
  /** Link dự phòng (Ko-fi, Buy Me a Coffee, Momo...). Để '' nếu không có. */
  altLinks: [] as { label: string; href: string }[],
}

export type Tier = {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  path: string
  amount: number // VND, 0 = tự nhập
  emoji: string
  coins: number // số đồng xu rơi vào bát 3D
}

export const TIERS: Tier[] = [
  {
    id: 'coffee',
    method: 'GET',
    path: '/coffee',
    amount: 20_000,
    emoji: '☕',
    coins: 6,
  },
  {
    id: 'meal',
    method: 'POST',
    path: '/meal',
    amount: 50_000,
    emoji: '🍚',
    coins: 14,
  },
  {
    id: 'sanity',
    method: 'PUT',
    path: '/sanity',
    amount: 200_000,
    emoji: '🧠',
    coins: 30,
  },
  {
    id: 'custom',
    method: 'PATCH',
    path: '/custom',
    amount: 0,
    emoji: '🎲',
    coins: 10,
  },
]

export const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

/** Quy đổi gần đúng cho khách nước ngoài (chỉ để tham khảo). */
export const VND_PER_USD = 26_000
export const formatUSD = (vnd: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(vnd / VND_PER_USD)

export const vietQrUrl = (amount: number, note = DONATE.message) => {
  if (!DONATE.bankId || !DONATE.accountNo) return null
  const q = new URLSearchParams({ addInfo: note, accountName: DONATE.accountName })
  if (amount > 0) q.set('amount', String(amount))
  return `https://img.vietqr.io/image/${DONATE.bankId}-${DONATE.accountNo}-compact2.png?${q}`
}
