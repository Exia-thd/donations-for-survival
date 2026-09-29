import { create } from 'zustand'

export type Lang = 'vi' | 'en'
export const LANGS: Lang[] = ['vi', 'en']
const STORAGE_KEY = 'dfs-lang'

/**
 * Chọn ngôn ngữ mặc định theo client:
 * 1. `?lang=vi|en` trên URL  2. lựa chọn đã lưu  3. region/ngôn ngữ trình duyệt hoặc múi giờ Việt Nam.
 */
export function detectLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang')
    if (q === 'vi' || q === 'en') return q
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'vi' || saved === 'en') return saved
  } catch {
    /* storage có thể bị chặn */
  }
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  const vnLocale = langs.some((l) => /^vi\b/i.test(l) || /-VN$/i.test(l))
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const vnTz = tz === 'Asia/Ho_Chi_Minh' || tz === 'Asia/Saigon'
  return vnLocale || vnTz ? 'vi' : 'en'
}

const vi = {
  meta: {
    title: 'donations-for-survival · Cứu đói 1 lập trình viên',
    description: 'Dự án mã nguồn mở nhằm ngăn chặn lỗi runtime nghiêm trọng do lập trình viên bị đói. Zero ROI, max cảm xúc.',
    guilt: '😢 Đừng đi mà… bát cơm vẫn rỗng',
  },
  nav: { powerOn: '🔌 Có điện rồi', powerSave: '🪫 Tiết kiệm điện', powerTitle: 'Tắt màu cho đỡ tốn điện (thật ra không đỡ)', cta: 'Cứu đói', switchTo: 'Switch to English' },
  mood: {
    dying: 'CRITICAL · đang chạy bằng niềm tin',
    hungry: 'WARN · bụng kêu to hơn quạt laptop',
    okay: 'OK · đã có thể nghĩ về kiến trúc microservice',
    blessed: 'BLESSED · sẵn sàng refactor cả thế giới',
  },
  hero: {
    words: ['Lập', 'trình', 'viên', 'này', 'đang', 'chạy', 'bằng', 'mì', 'tôm', 'và', 'niềm', 'tin.'],
    highlight: ['mì', 'tôm'],
    lead1: 'là sáng kiến mã nguồn mở nhằm',
    leadBold: 'ngăn chặn lỗi runtime nghiêm trọng do lập trình viên bị đói',
    lead2: '. Mỗi đồng bạn gửi được chuyển thẳng thành cà phê, cơm tấm và một chút lòng tự trọng.',
    cta: '🍚 Cho một bữa cơm',
    cta2: 'Xem chỉ số sinh tồn →',
    tip: '↳ mẹo: bấm vào cảnh 3D để thả xu tưởng tượng (miễn phí, vô dụng)',
    loading: 'Đang nấu cơm… (loading 3D)',
    noWebgl: ['Máy bạn không chạy được WebGL.', 'Giống như dev không chạy được nếu thiếu cơm.'],
    canvasLabel: 'Cảnh 3D: một lập trình viên đói ngồi cạnh bát cơm gần như rỗng. Bấm để thả xu.',
  },
  ticker: {
    label: 'Tin nóng',
    items: [
      '⚠ BREAKING: Dev ăn mì tôm ngày thứ 17 liên tiếp, bắt đầu nói chuyện với con vịt cao su',
      '📉 Số dư tài khoản giảm 12% sau khi lỡ tay mua thêm 1 quả trứng',
      '☕ Cà phê hôm nay được pha lại từ bã hôm qua — "vị có chiều sâu"',
      '🐛 Bug production tăng vọt, chuyên gia nghi ngờ nguyên nhân là đói',
      '🏠 Chủ trọ gửi tin nhắn "em ơi" — dev giả vờ offline',
      '🍜 Mì tôm tăng giá 500đ, thị trường chấn động',
    ],
  },
  vitals: {
    kicker: '// 01 — system health',
    title: 'Chỉ số sinh tồn',
    titleMuted: '(real-time*)',
    footnote: '*real-time theo nghĩa "thật sự đang khổ theo thời gian thực".',
    balance: 'SỐ DƯ TÀI KHOẢN',
    balanceNote: 'Đủ mua 2 gói mì + 1 lần gửi xe. Phải chọn một.',
    lastMeal: 'BỮA ĂN TỬ TẾ GẦN NHẤT',
    hoursAgo: (h: number) => `${h} giờ trước`,
    lastMealNote: 'Đám cưới đồng nghiệp cũ. Đã gói mang về 3 hộp.',
    uptime: 'UPTIME KHÔNG NGỦ',
    uptimeNote: 'SLA cao hơn cả server công ty. Không ai trả lương cho cái này.',
    meters: {
      caffeine: 'Đang pha loãng cà phê theo tỉ lệ 1:9',
      sugar: 'Bấm donate để thấy thanh này nhúc nhích',
      sanity: 'Đã bắt đầu đặt tên cho các con bug',
      bugs: 'Tỉ lệ nghịch với lượng cơm nạp vào',
    },
    logs: [
      ['INFO', 'dev.wake() — thức dậy lúc 11:47, gọi là "buổi sáng"'],
      ['WARN', 'caffeine.level < 12%, đang fallback sang nước lọc'],
      ['ERROR', 'stomach.exe is not responding. [Chờ] [Đóng chương trình]'],
      ['INFO', 'fridge.scan() → 1 quả chanh, 2 gói tương ớt, 0 hy vọng'],
      ['WARN', 'wallet.balance đang tiến gần tới undefined'],
      ['DEBUG', 'đã thử `npm install food` — 404 Not Found'],
      ['ERROR', 'SanityOverflowException tại debug.ts:42 (lúc 2h sáng)'],
      ['INFO', 'Đang chờ nhà hảo tâm… (timeout: vô hạn)'],
      ['WARN', 'Phát hiện mùi cơm nhà hàng xóm. Tâm lý không ổn định.'],
      ['FATAL', 'Out of memory. Cũng out of money. Cũng out of mì.'],
    ] as [string, string][],
  },
  tiers: {
    kicker: '// 02 — contribution tiers (API endpoints)',
    title: 'Chọn endpoint để gọi',
    lead1: 'Tất cả endpoint đều trả về',
    lead2: 'cho lương tâm của bạn. Zero ROI, nhưng maximum cảm giác mình là người tốt.',
    anyAmount: 'Tuỳ tâm',
    items: {
      coffee: { title: 'Nửa ly cà phê đen', outcome: 'Hoãn một cơn đau đầu nhẹ. Fix được 1 bug typo.', latency: '~200ms tới não' },
      meal: { title: 'Một dĩa cơm tấm tử tế', outcome: 'Giữ logic mạch lạc ít nhất 4 tiếng. Có sườn, có bì, có hy vọng.', latency: '201 Created (một con người mới)' },
      sanity: { title: 'Bảo trì sức khoẻ tâm thần', outcome: 'Ngăn chặn rage-quit lúc 2h sáng. Không deploy thứ Sáu nữa (hứa).', latency: 'idempotent — ủng hộ nhiều lần vẫn vui như nhau' },
      custom: { title: 'Lòng hảo tâm vô điều kiện', outcome: 'Bao nhiêu cũng quý. 1.000đ cũng mua được… nửa gói muối.', latency: 'phụ thuộc vào lòng tốt' },
    } as Record<string, { title: string; outcome: string; latency: string }>,
  },
  menu: {
    kicker: '// 03 — weekly_menu.json',
    title: 'Thực đơn tuần này',
    lead: 'Được thiết kế bởi chuyên gia dinh dưỡng: là chính tôi, lúc 3h sáng.',
    cta: 'Viết lại Chủ nhật →',
    days: [
      ['Thứ 2', 'Mì tôm', 'vị tôm chua cay', '😐'],
      ['Thứ 3', 'Mì tôm', 'vị gà (không có gà)', '😶'],
      ['Thứ 4', 'Mì tôm trụng 2 lần', 'cho đỡ nóng trong', '🥲'],
      ['Thứ 5', 'Mì tôm + 1 quả trứng', 'bữa tiệc giữa tuần', '🤩'],
      ['Thứ 6', 'Nước mì hôm qua', 'deploy xong không dám ăn', '💀'],
      ['Thứ 7', 'Mì tôm sống', 'bẻ vụn chấm gói gia vị, hoài niệm tuổi thơ', '🥹'],
      ['Chủ nhật', '???', 'phụ thuộc vào bạn', '🫵'],
    ] as [string, string, string, string][],
  },
  reviews: {
    kicker: '// 04 — reviews (100% có thật trong tưởng tượng)',
    title: 'Người đời nói gì',
    items: [
      ['Mẹ', '"Con ăn uống đầy đủ không?" — Dạ đầy đủ ạ (đủ 3 gói/ngày).', '👩‍🦳'],
      ['Chủ nhà trọ', 'Cậu này rất đúng giờ. Đúng giờ trốn mỗi mùng 5 hàng tháng.', '🏠'],
      ['Con vịt cao su trên bàn', 'Nó kể hết bug cho tôi nghe. Giờ nó bắt đầu kể chuyện về đồ ăn.', '🦆'],
      ['Laptop 2017', 'Tôi và cậu ấy cùng nóng lên mỗi khi chạy Docker. Cùng khổ.', '💻'],
      ['Senior dev ẩn danh', '"It works on my machine." Cậu ấy thì không work vì đói.', '🧔'],
      ['Mèo hàng xóm', 'Hôm qua tôi thấy cậu ta nhìn chén hạt của tôi hơi lâu.', '🐈'],
    ] as [string, string, string][],
  },
  donate: {
    kicker: '// 06 — quick start (how to donate)',
    title: 'Thực thi request cứu đói',
    customLabel: 'Số tiền tuỳ tâm (VND)',
    qrAlt: (a: string) => `Mã VietQR chuyển ${a}`,
    qrHint: ['Điền', '+', 'trong', 'để QR tự sinh theo từng mức.'],
    contentType: 'application/lòng-tốt',
    responseNote: '// dev đã được cho ăn',
    bank: 'NGÂN HÀNG',
    account: 'SỐ TÀI KHOẢN',
    holder: 'CHỦ TÀI KHOẢN',
    note: 'NỘI DUNG',
    notSet: '— chưa cấu hình —',
    copy: 'copy',
    copied: '✓ copied',
    confirm: '✅ Tôi đã chuyển khoản (hoặc ít nhất đã thương)',
    confirmNote: 'Nút này dựa trên hệ thống xác thực tuyệt đối: niềm tin.',
    toastTitle: '🙏 201 Created — một dev vừa được hồi sinh',
    toastBody: 'Cuộn lên để xem bát cơm đầy lên nhé.',
    approx: '',
  },
  faq: {
    kicker: '// 05 — FAQ',
    title: 'Câu hỏi hay bị hỏi',
    items: [
      ['Tiền của tôi được dùng vào việc gì?', 'Cà phê (60%), cơm (35%), và 5% còn lại để mua trứng cho mì tôm vào những ngày đặc biệt.'],
      ['Tôi có được hoàn tiền không?', 'Không. Nhưng bạn sẽ được hoàn lại bằng cảm giác ấm áp — thứ không bị đánh thuế.'],
      ['Donate có giúp code tốt hơn không?', 'Theo nghiên cứu (n=1, không peer-review), đường huyết cao hơn tương quan với ít sự cố production vào thứ Sáu hơn.'],
      ['Sao không đi làm thêm?', 'Đang làm thêm rồi. Đây chính là trang web làm thêm. Bạn đang ở trong nó.'],
      ['Có xuất hoá đơn VAT không?', 'Có thể xuất hoá đơn "Very Appreciated Thanks". Mệnh giá: vô hạn.'],
    ] as [string, string][],
  },
  footer: {
    line: 'Nhưng maximum sự thoả mãn khi biết bạn vừa giữ cho một sinh vật có tri giác còn sống.',
    meta: 'non-profit (và non-refundable) · build với',
    copy: 'mọi bug đều do đói, mọi feature đều nhờ bạn.',
  },
}

export type Dict = typeof vi

const en: Dict = {
  meta: {
    title: 'donations-for-survival · Feed a starving developer',
    description: 'An open-source initiative dedicated to preventing critical runtime failures caused by developer starvation. Zero ROI, max feelings.',
    guilt: "😢 Don't go… the bowl is still empty",
  },
  nav: { powerOn: '🔌 Power restored', powerSave: '🪫 Power saving', powerTitle: 'Drain the colors to save electricity (it does not)', cta: 'Feed me', switchTo: 'Chuyển sang tiếng Việt' },
  mood: {
    dying: 'CRITICAL · running on pure faith',
    hungry: 'WARN · stomach louder than the laptop fan',
    okay: 'OK · can think about microservices again',
    blessed: 'BLESSED · ready to refactor the entire world',
  },
  hero: {
    words: ['This', 'developer', 'is', 'running', 'on', 'instant', 'noodles', 'and', 'pure', 'faith.'],
    highlight: ['instant', 'noodles'],
    lead1: 'is an open-source initiative dedicated to',
    leadBold: 'preventing critical runtime failures caused by developer starvation',
    lead2: '. Every coin you send is converted directly into coffee, rice and a little bit of self-respect.',
    cta: '🍚 Buy me a meal',
    cta2: 'See vital signs →',
    tip: '↳ tip: click the 3D scene to drop imaginary coins (free, useless)',
    loading: 'Cooking rice… (loading 3D)',
    noWebgl: ["Your device can't run WebGL.", "Just like a developer can't run without rice."],
    canvasLabel: 'A 3D scene: a hungry developer next to an almost empty rice bowl. Click to drop coins.',
  },
  ticker: {
    label: 'Breaking news',
    items: [
      '⚠ BREAKING: Dev eats instant noodles for the 17th day in a row, starts talking to rubber duck',
      '📉 Bank balance drops 12% after accidentally buying one extra egg',
      '☕ Today\'s coffee brewed from yesterday\'s grounds — "a flavor with depth"',
      '🐛 Production bugs skyrocket, experts suspect hunger',
      '🏠 Landlord texts "hey" — dev pretends to be offline',
      '🍜 Instant noodle prices up 2 cents, markets in shock',
    ],
  },
  vitals: {
    kicker: '// 01 — system health',
    title: 'Vital signs',
    titleMuted: '(real-time*)',
    footnote: '*real-time as in "genuinely suffering in real time".',
    balance: 'BANK BALANCE',
    balanceNote: 'Enough for 2 noodle packs or 1 parking fee. Pick one.',
    lastMeal: 'LAST DECENT MEAL',
    hoursAgo: (h: number) => `${h} hours ago`,
    lastMealNote: "A former coworker's wedding. Took 3 boxes home.",
    uptime: 'SLEEPLESS UPTIME',
    uptimeNote: 'Better SLA than the company servers. Nobody pays for this one.',
    meters: {
      caffeine: 'Currently diluting coffee at a 1:9 ratio',
      sugar: 'Donate to watch this bar actually move',
      sanity: 'Has started naming the bugs',
      bugs: 'Inversely proportional to rice intake',
    },
    logs: [
      ['INFO', 'dev.wake() — woke up at 11:47, calls it "morning"'],
      ['WARN', 'caffeine.level < 12%, falling back to tap water'],
      ['ERROR', 'stomach.exe is not responding. [Wait] [Close program]'],
      ['INFO', 'fridge.scan() → 1 lime, 2 chili sauce packets, 0 hope'],
      ['WARN', 'wallet.balance approaching undefined'],
      ['DEBUG', 'tried `npm install food` — 404 Not Found'],
      ['ERROR', 'SanityOverflowException at debug.ts:42 (2 AM)'],
      ['INFO', 'Waiting for a kind soul… (timeout: infinite)'],
      ['WARN', "Detected smell of neighbor's dinner. Mental state unstable."],
      ['FATAL', 'Out of memory. Also out of money. Also out of noodles.'],
    ],
  },
  tiers: {
    kicker: '// 02 — contribution tiers (API endpoints)',
    title: 'Pick an endpoint to call',
    lead1: 'Every endpoint returns',
    lead2: 'to your conscience. Zero ROI, maximum feeling-like-a-good-person.',
    anyAmount: 'Any amount',
    items: {
      coffee: { title: 'Half a cup of black coffee', outcome: 'Delays a minor headache. Fixes exactly 1 typo bug.', latency: '~200ms to the brain' },
      meal: { title: 'A decent plate of rice', outcome: 'Keeps logic coherent for at least 4 hours. With pork chop. With hope.', latency: '201 Created (a new human being)' },
      sanity: { title: 'Mental health maintenance', outcome: 'Prevents 2 AM rage-quits. No more Friday deploys (promise).', latency: 'idempotent — equally joyful every time' },
      custom: { title: 'Unconditional kindness', outcome: 'Any amount helps. 1,000₫ buys… half a packet of salt.', latency: 'depends on your kindness' },
    },
  },
  menu: {
    kicker: '// 03 — weekly_menu.json',
    title: "This week's menu",
    lead: 'Designed by a nutrition expert: me, at 3 AM.',
    cta: 'Rewrite Sunday →',
    days: [
      ['Mon', 'Instant noodles', 'spicy shrimp flavor', '😐'],
      ['Tue', 'Instant noodles', 'chicken flavor (no chicken)', '😶'],
      ['Wed', 'Noodles, blanched twice', 'for "health reasons"', '🥲'],
      ['Thu', 'Noodles + 1 egg', 'the mid-week feast', '🤩'],
      ['Fri', "Yesterday's noodle broth", "deployed, too scared to eat", '💀'],
      ['Sat', 'Raw instant noodles', 'crushed, dipped in seasoning, childhood nostalgia', '🥹'],
      ['Sun', '???', 'depends on you', '🫵'],
    ],
  },
  reviews: {
    kicker: '// 04 — reviews (100% real, in my imagination)',
    title: 'What people say',
    items: [
      ['Mom', '"Are you eating properly?" — Yes mom (3 packs a day, properly).', '👩‍🦳'],
      ['Landlord', 'Very punctual. Punctually disappears on the 5th of every month.', '🏠'],
      ['Rubber duck on the desk', 'He tells me all his bugs. Lately he only talks about food.', '🦆'],
      ['2017 laptop', 'We both overheat whenever Docker runs. Suffering together.', '💻'],
      ['Anonymous senior dev', '"It works on my machine." He doesn\'t work, because he\'s hungry.', '🧔'],
      ["Neighbor's cat", 'Yesterday I caught him staring at my kibble bowl for a bit too long.', '🐈'],
    ],
  },
  donate: {
    kicker: '// 06 — quick start (how to donate)',
    title: 'Execute the rescue request',
    customLabel: 'Custom amount (VND)',
    qrAlt: (a: string) => `VietQR code for ${a}`,
    qrHint: ['Fill in', '+', 'in', 'to auto-generate a QR for every tier.'],
    contentType: 'application/kindness',
    responseNote: '// developer has been fed',
    bank: 'BANK',
    account: 'ACCOUNT NUMBER',
    holder: 'ACCOUNT HOLDER',
    note: 'TRANSFER NOTE',
    notSet: '— not configured —',
    copy: 'copy',
    copied: '✓ copied',
    confirm: "✅ I've sent it (or at least I care)",
    confirmNote: 'This button uses the most secure verification system known: trust.',
    toastTitle: '🙏 201 Created — a developer has been revived',
    toastBody: 'Scroll up to watch the bowl fill up.',
    approx: '≈',
  },
  faq: {
    kicker: '// 05 — FAQ',
    title: 'Frequently asked questions',
    items: [
      ['Where does my money go?', 'Coffee (60%), rice (35%), and the remaining 5% buys eggs for the noodles on special occasions.'],
      ['Can I get a refund?', 'No. But you get refunded in warm fuzzy feelings — which are tax-free.'],
      ['Does donating make the code better?', 'According to research (n=1, not peer-reviewed), higher blood sugar correlates with fewer Friday production incidents.'],
      ['Why not get a side job?', "This is the side job. You're looking at it."],
      ['Do you issue VAT invoices?', 'We issue "Very Appreciated Thanks" invoices. Face value: infinite.'],
    ],
  },
  footer: {
    line: 'But maximum emotional satisfaction knowing you kept a sentient being alive.',
    meta: 'non-profit (and non-refundable) · built with',
    copy: 'every bug is caused by hunger, every feature is thanks to you.',
  },
}

const DICTS: Record<Lang, Dict> = { vi, en }

type LangState = { lang: Lang; setLang: (l: Lang) => void }

export const useLang = create<LangState>((set) => ({
  lang: typeof window === 'undefined' ? 'vi' : detectLang(),
  setLang: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    set({ lang })
  },
}))

export const useT = () => DICTS[useLang((s) => s.lang)]
export const getT = () => DICTS[useLang.getState().lang]

/** Đồng bộ <html lang>, <title>, meta description theo ngôn ngữ. */
export function applyDocumentLang(lang: Lang) {
  const t = DICTS[lang]
  document.documentElement.lang = lang
  document.title = t.meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
}
