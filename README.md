# 🛡️ donations-for-survival

> "An open-source initiative dedicated to preventing critical runtime failures caused by developer starvation."

Trang web xin donate **hài hước – khắc khổ** với một scene 3D (Three.js + React Three Fiber + Rapier): một lập trình viên đói ngồi cạnh bát cơm chỉ còn *một hạt*. Mỗi lần bạn donate, xu vàng rơi vào bát, cơm đầy lên và anh ta thôi mếu.

👉 Xem bản thiết kế chi tiết & research công nghệ ở [`PLAN.md`](./PLAN.md).

## 📋 Overview
`donations-for-survival` is a non-profit (and non-refundable) personal maintenance system. In the current economic stack, a developer's body runs on a delicate balance of caffeine, instant noodles, and intermittent sleep. When resources drop below critical thresholds, bugs multiply and productivity plummets.

This project establishes a direct pipeline for compassionate souls to inject funds into the author's local runtime environment.

---

## ⚙️ Features & Architecture
* **Caffeine-to-Code Conversion:** Converts your fiat currency directly into espresso and high-fructose beverages.
* **Bug Shielding:** Higher blood sugar levels mathematically correlate with fewer production incidents on Fridays.
* **Zero ROI:** You get 0% financial return, but maximum emotional satisfaction knowing you kept a sentient being alive.

### 🏔️ The Ascent — hành trình cuộn (WHITEOUT style)
Section `#journey` (`src/journey/`): cuộn trang = leo từ phòng trọ 12m² lên **Đỉnh Cơm Tấm** trong 6 chương.
* Thế giới 100% procedural, không ảnh/model: height field từ fBm + ridged noise viết tay, đường mòn được "mài" êm quanh tuyến leo.
* Camera đi trên `CatmullRomCurve3` lấy mẫu theo độ dài cung; nhịp cuộn phi tuyến (bảng `PACE`) + giảm chấn, luôn giữ khoảng hở với mặt đất.
* Khí quyển theo keyframe: vòm trời shader (gradient, mặt trời, sao hash), `FogExp2`, đèn mặt trời/hemisphere; chương 3 là **WHITEOUT** (sương mù não).
* Tuyết GPU cuộn vòng quanh camera, gió từ vận tốc chuột; props instanced: vỏ mì đánh dấu đường, mắt bug đỏ, dây thừng Tube + cờ bay bằng vertex shader, tượng đài cốc mì, bát cơm tấm khổng lồ bốc khói.
* Hậu kỳ tự viết (render target → vignette + grain + quang sai), loading screen dựng địa hình theo job queue, chất lượng thích ứng, tôn trọng `prefers-reduced-motion`, chỉ render khi section đang hiển thị; engine tải lười (~20KB).

### 🎮 Interactive bits
* **Chọc dev** trong cảnh 3D đầu trang → anh ấy nhảy lên và than đói (bong bóng thoại `drei <Html>`).
* **Arcade** (`src/arcade/`): 2 mini-game 3D chạy **Three.js WebGPURenderer + TSL node materials**, tự fallback WebGL2:
  * 🍙 **Ném cơm** — ngắm & ném cơm nắm/trứng vào miệng dev đang chạy qua lại (vật lý Rapier, miệng là sensor collider).
  * 🐛 **Đập bug** — đập bug bò trên bàn phím laptop vẽ bằng shader TSL; bug vàng = 3 điểm.
  * Điểm chơi game cộng vào thanh "no bụng" của dev; kỷ lục lưu trong trình duyệt.

### Tech stack
Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · Three.js · @react-three/fiber · drei · Rapier physics · postprocessing · Motion · Lenis · Zustand — cùng các Web API mới: scroll-driven animations, View Transitions, Popover, `@property`, `::details-content`.

---

## 💸 Contribution Tiers (API Endpoints)

| Tier | Amount | Expected Outcome |
| :--- | :--- | :--- |
| **`GET /coffee`** | 20.000đ | Buys half a cup of black coffee; delays a minor headache. |
| **`POST /meal`** | 50.000đ | Secures a decent plate of rice, keeping logic coherent for at least 4 hours. |
| **`PUT /sanity`** | 200.000đ | Subsidizes mental health preservation and prevents late-night rage quitting. |
| **`PATCH /custom`** | Tuỳ tâm | Whatever your heart compiles to. |

Sửa số tiền / nội dung các tier trong [`src/config.ts`](./src/config.ts).

---

## 🚀 Quick Start (How to Donate)
To execute a donation request, scan the payload on the website using your banking app.

**Cấu hình nhận tiền:** mở [`src/config.ts`](./src/config.ts), điền `bankId` (vd `mb`, `vcb`, `tcb`…) và `accountNo`. Mã QR [VietQR](https://vietqr.io) sẽ được sinh tự động theo đúng số tiền của từng tier. Để trống thì trang hiện ô placeholder.

## 🌐 Ngôn ngữ / Language
Trang có 2 phiên bản **Tiếng Việt** và **English**. Mặc định: **region Việt Nam → Tiếng Việt, mọi region khác → English** (region xác định qua múi giờ `Asia/Ho_Chi_Minh`, locale có region `VN` như `vi-VN`/`en-VN`, hoặc múi giờ `Asia/Bangkok` của Windows + ngôn ngữ tiếng Việt). `?lang=vi|en` trên URL và lựa chọn người xem đã bấm luôn được ưu tiên. Người xem có thể đổi bằng nút **VI | EN** trên thanh nav. Toàn bộ nội dung chữ nằm trong [`src/i18n.ts`](./src/i18n.ts).

## 🧑‍💻 Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + build ra dist/
npm run preview
```

Build dùng `base: './'` nên deploy thẳng thư mục `dist/` lên GitHub Pages, Netlify, Vercel… đều được.
