# 🍜 PLAN — Thiết kế `donations-for-survival`

> Mục tiêu: một trang xin donate **hài hước – khắc khổ** khiến người xem vừa cười vừa… thấy tội, rồi chuyển khoản.

## 1. Concept & giọng văn

| Trụ cột | Cách thể hiện |
| --- | --- |
| **Dev là một hệ thống sắp sập** | Mọi thứ nói bằng ngôn ngữ kỹ thuật: HP %, `stomach.exe is not responding`, log `FATAL: Out of memory. Cũng out of money.` |
| **Khắc khổ nhưng không than vãn** | Tự giễu: thực đơn 7 ngày đều là mì tôm, 1 hạt cơm cô đơn trong bát 3D, số dư đếm lùi còn 12.000đ. |
| **Donate = gọi API** | Tier là endpoint `GET /coffee`, `POST /meal`, `PUT /sanity`, `PATCH /custom`; phản hồi `201 Created (một con người mới)`. |
| **Phản hồi tức thì** | Bấm donate → xu vàng rơi vào bát (vật lý thật), cơm đầy lên, nhân vật hết mếu, confetti 🍚☕. |
| **Guilt-trip nhẹ nhàng** | Rời tab → tiêu đề đổi thành "😢 Đừng đi mà… bát cơm vẫn rỗng". HP tự giảm dần theo thời gian. |

Palette: nền mực đen ấm (`oklch`), vàng **mì tôm**, đỏ **tương ớt**, tím **quầng thâm**, xanh **"broke"**. Font: *Be Vietnam Pro* (đủ dấu tiếng Việt) + *JetBrains Mono* cho phần "code".

## 2. Research công nghệ (tháng 9/2026)

| Lớp | Lựa chọn | Lý do |
| --- | --- | --- |
| Build | **Vite 8** (Rolldown) + **TypeScript 7** | Build < 2s, code-split tự động. |
| UI | **React 19** | Chuẩn hệ sinh thái R3F. |
| Styling | **Tailwind CSS v4** (`@theme`, CSS-first, màu `oklch`) | Không cần file config JS. |
| 3D | **Three.js r186** + **@react-three/fiber 9** + **drei 10** | Viết scene 3D như component React. |
| Vật lý | **@react-three/rapier** (Rapier WASM) | Xu rơi, nảy, chồng lên nhau trong bát. |
| Hậu kỳ | **@react-three/postprocessing** | Bloom, chromatic aberration, noise, vignette. |
| Motion | **Motion 13** (Framer Motion) | Text reveal theo chữ, tilt 3D bằng spring, AnimatePresence. |
| Scroll | **Lenis** | Smooth scroll. |
| State | **Zustand 5** | Chia sẻ "độ no" giữa DOM và scene 3D mà không re-render canvas. |

**CSS/Web Platform hiện đại được dùng (không cần thư viện):**
- *Scroll-driven animations* (`animation-timeline: view()` / `scroll()`) — reveal section & thanh tiến trình đọc.
- *View Transitions API* — nút "🪫 Tiết kiệm điện" cross-fade cả trang sang đen trắng.
- *Popover API* + `@starting-style` — toast cảm ơn.
- `::details-content` + `interpolate-size` — FAQ mở/đóng mượt, `<details name>` kiểu accordion.
- `@property` (Houdini) — viền gradient xoay cho tier đang chọn.
- `mask-image` — mép canvas 3D tan vào nền.
- `text-wrap: balance / pretty`, `100svh`, `overflow-x: clip`.

## 3. Scene 3D (100% procedural — không tải model/HDRI ngoài)

- **Bát cơm sứ viền xanh** dựng bằng `LatheGeometry`, collider `trimesh` để xu rơi vào thật.
- **Cơm**: bán cầu dẹt, chiều cao nội suy theo `fed` (0 → 100%). Ban đầu chỉ có **1 hạt cơm phát sáng**.
- **Đôi đũa** gác trên miệng bát.
- **Dev đói**: thân hoodie, tóc rối, kính cận, quầng thâm, mắt dõi theo chuột, chớp mắt, miệng mếu ↔ cười theo độ no, giọt mồ hôi khi đói, **run rẩy** khi HP < 40%, má hồng khi no.
- **Xu vàng** (Rapier, CCD) rơi khi chọn tier / bấm canvas; giới hạn 70 xu để giữ FPS.
- **Hơi nóng** (`Sparkles`) chỉ bốc lên khi cơm > 25%.
- **Ánh sáng**: `Environment` tự dựng bằng `Lightformer` (không phụ thuộc CDN), `ContactShadows`.
- **Hiệu năng**: lazy-load cả scene (chunk riêng), `PerformanceMonitor` tự tắt post-processing khi máy yếu, `AdaptiveDpr`, fallback emoji khi không có WebGL.

## 4. Kiến trúc trang

1. **Nav** dạng pill glass: đèn HP nhấp nháy, nút *Tiết kiệm điện*, CTA *Cứu đói*; thanh tiến trình scroll ở mép trên.
2. **Hero**: headline reveal từng chữ + scene 3D + thanh `stomach.buffer`.
3. **Ticker** tin nóng nghiêng: "Mì tôm tăng giá 500đ, thị trường chấn động".
4. **Chỉ số sinh tồn** (bento grid): số dư đếm lùi, "bữa ăn tử tế gần nhất", uptime không ngủ, 4 meter, terminal `tail -f body.log` tự chạy.
5. **Tiers / API endpoints**: card tilt 3D + spotlight theo chuột, bấm là thả xu & nhảy tới phần donate.
6. **Thực đơn tuần**: 6 ngày mì tôm, Chủ nhật "???" — *"Viết lại Chủ nhật →"*.
7. **Người đời nói gì**: Mẹ, chủ trọ, con vịt cao su, laptop 2017, mèo hàng xóm (masonry).
8. **Donate**: QR **VietQR tự sinh theo đúng số tiền từng tier**, nút copy STK/nội dung, lệnh `curl` minh hoạ, nút *"Tôi đã chuyển khoản (hoặc ít nhất đã thương)"* → confetti + bát đầy + toast.
9. **FAQ** + **Footer** glitch "ZERO ROI."

## 4b. The Ascent (scroll journey — áp dụng skill threejs-scroll-journey)

| Phase | Đã làm |
| --- | --- |
| 1 · Skeleton | Terrain 4000×4000 (300 seg desktop / 180 mobile) từ fBm + ridged; route CatmullRom đặt trên mặt đất, arc-length 4000 divisions; progress cuộn trong section → `pace()` → u, giảm chấn `1-exp(-dt·k)`; overlay 6 chương fade bằng smoothstep; `FogExp2`. |
| 2 · Atmosphere | Sky dome BackSide shader (gradient, sun disc + halo, sao hash nhấp nháy, haze); 10 keyframe khí quyển (fog màu/mật độ nội suy log, sky, sun hướng/màu/cường độ, hemi, tuyết); beat WHITEOUT ở chương 3. |
| 3 · Life & detail | Tuyết Points shader wrap quanh camera + gió chuột (bỏ qua touch); bảng nhịp phi tuyến; InstancedMesh đá/vỏ mì/mắt bug/cọc; Tube rope; cờ sóng bằng `onBeforeCompile`; bát cơm tấm + khói; post vignette/grain/CA qua render target. |
| 4 · Boot & polish | Loading screen + job queue theo ngân sách 12ms/frame + precompile shader; adaptive quality (>20ms → giảm pixel ratio & số hạt); reduced-motion; resize; dt clamp 0.1s; chỉ render khi in-view; hero & arcade canvas cũng tự dừng khi khuất. |

## 5. Accessibility & chất lượng

- Tôn trọng `prefers-reduced-motion` (tắt Lenis, animation, view transition).
- Canvas có `aria-label`; marquee nhân đôi được `aria-hidden`; nút tier dùng `aria-pressed`.
- Không tràn ngang trên mobile 390px; trên mobile scene 3D lên trước, tự thu nhỏ theo tỉ lệ khung hình.

## 6. Roadmap tiếp theo (gợi ý)

- [ ] Điền thông tin ngân hàng thật trong `src/config.ts`.
- [ ] Deploy GitHub Pages / Vercel (đã để `base: './'`).
- [ ] Webhook ngân hàng (Casso/SePay) → hiển thị "Bảng vàng nhà hảo tâm" realtime & HP thật.
- [ ] Âm thanh: tiếng bụng kêu khi HP < 10%, tiếng "ting ting" khi xu rơi (Web Audio).
- [ ] Easter egg Konami code: dev ăn một bữa buffet.
- [ ] OG image động (tiến độ no bụng hôm nay).
