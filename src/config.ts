/**
 * ⚙️ Cấu hình nhận tiền — SỬA FILE NÀY là xong.
 *
 * QR được sinh tự động qua VietQR (https://vietqr.io) theo đúng số tiền của từng tier.
 * `bankId` là mã BIN hoặc short name của ngân hàng (vd: "970436" hoặc "vcb", "mb", "tcb", "acb").
 * Để trống `accountNo` thì trang sẽ hiện ô QR placeholder thay vì QR thật.
 */
export const DONATE = {
  bankId: '', // vd: 'mb'
  bankName: 'Ngân hàng Tình Thương', // hiển thị cho người xem
  accountNo: '', // vd: '0123456789'
  accountName: 'NGUYEN VAN DEV', // viết hoa không dấu
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
  title: string
  outcome: string
  latency: string
  coins: number // số đồng xu rơi vào bát 3D
}

export const TIERS: Tier[] = [
  {
    id: 'coffee',
    method: 'GET',
    path: '/coffee',
    amount: 20_000,
    emoji: '☕',
    title: 'Nửa ly cà phê đen',
    outcome: 'Hoãn một cơn đau đầu nhẹ. Fix được 1 bug typo.',
    latency: '~200ms tới não',
    coins: 6,
  },
  {
    id: 'meal',
    method: 'POST',
    path: '/meal',
    amount: 50_000,
    emoji: '🍚',
    title: 'Một dĩa cơm tấm tử tế',
    outcome: 'Giữ logic mạch lạc ít nhất 4 tiếng. Có sườn, có bì, có hy vọng.',
    latency: '201 Created (một con người mới)',
    coins: 14,
  },
  {
    id: 'sanity',
    method: 'PUT',
    path: '/sanity',
    amount: 200_000,
    emoji: '🧠',
    title: 'Bảo trì sức khoẻ tâm thần',
    outcome: 'Ngăn chặn rage-quit lúc 2h sáng. Không deploy thứ Sáu nữa (hứa).',
    latency: 'idempotent — ủng hộ nhiều lần vẫn vui như nhau',
    coins: 30,
  },
  {
    id: 'custom',
    method: 'PATCH',
    path: '/custom',
    amount: 0,
    emoji: '🎲',
    title: 'Lòng hảo tâm vô điều kiện',
    outcome: 'Bao nhiêu cũng quý. 1.000đ cũng mua được… nửa gói muối.',
    latency: 'phụ thuộc vào lòng tốt',
    coins: 10,
  },
]

export const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

export const vietQrUrl = (amount: number, note = DONATE.message) => {
  if (!DONATE.bankId || !DONATE.accountNo) return null
  const q = new URLSearchParams({ addInfo: note, accountName: DONATE.accountName })
  if (amount > 0) q.set('amount', String(amount))
  return `https://img.vietqr.io/image/${DONATE.bankId}-${DONATE.accountNo}-compact2.png?${q}`
}
