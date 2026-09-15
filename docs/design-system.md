# Design System: Grand Ceramic — Architectural Material Atelier

Hệ thống thiết kế chuẩn hóa phục vụ thương hiệu gạch ốp lát và vật liệu kiến trúc cao cấp.
Tôn chỉ: **IMAGE > LAYOUT > TYPOGRAPHY > CONTENT > DECORATION**

---

## 1. Color Palette & Design Tokens

Bảng màu lấy cảm hứng từ các vật liệu tự nhiên: đá vôi, đất sét nung, mực in thô và giấy mỹ thuật.

| Token | Hex / Value | Vai trò | Ứng dụng |
| :--- | :--- | :--- | :--- |
| `--color-bone` | `#F5F1EA` / `#F3F0E9` | Nền chính (Off-white) | Toàn bộ background trang, bề mặt nhẹ nhàng tự nhiên |
| `--color-paper` | `#FAF8F4` / `#EBE5DA` | Nền khối (Card/Section) | Card sản phẩm, section đối lập, khung chi tiết |
| `--color-ink` | `#171715` / `#1C1B19` | Màu chữ chính | Heading, body text chính, button primary, icon |
| `--color-ink-soft` | `#292825` / `#2A2825` | Chữ giảm độ gắt | Subtitles, body phụ, viền tối |
| `--color-clay` | `#B85B35` / `#B85C38` | Màu nhấn đặc trưng | Accent buttons, active dots, tags, hover state |
| `--color-stone` | `#918B80` / `#8B7C66` | Màu trung tính ấm | Specs label, metadata, footnote, chapter number |
| `--color-line` | `rgba(23, 23, 21, 0.12)` | Đường kẻ hairline | Viền bảng, ngăn cách section, border card |
| `--color-line-dark` | `rgba(245, 241, 234, 0.15)` | Đường kẻ trên nền tối | Phân cách trong footer, dark sections |

---

## 2. Typography System

Sử dụng kết hợp 3 họ font chuyên biệt:
1. **Editorial Serif:** `Fraunces` / `Newsreader` (Opsz & Wonk settings) — Dùng cho các tiêu đề lớn, quote tuyên ngôn nghệ thuật.
2. **Modern Architectural Sans:** `Manrope` / `Be Vietnam Pro` — Dùng cho hệ thống Navigation, Body text, Button text. Đảm bảo hỗ trợ tiếng Việt toàn diện.
3. **Architectural Monospace:** `JetBrains Mono` — Dùng cho mã SKU, kích thước, thông số kỹ thuật, label chỉ mục (Fig. 01, SCN-01).

### Typography Scale (Desktop & Mobile Responsive)
- **Hero Title (H1):** `clamp(2.75rem, 5vw + 1rem, 5.5rem)` (44px - 88px), Line-height: `1.05`, Serif Font-weight: `300`
- **Section Heading (H2):** `clamp(2rem, 3.5vw + 0.5rem, 3.75rem)` (32px - 60px), Line-height: `1.15`, Serif Font-weight: `350`
- **Sub-heading (H3):** `clamp(1.5rem, 2vw + 0.5rem, 2.25rem)` (24px - 36px), Line-height: `1.25`, Serif / Sans
- **Card Heading (H4):** `1.15rem - 1.35rem` (18px - 22px), Font-weight: `500`
- **Body Text:** `1rem` (16px) hoặc `1.125rem` (18px), Line-height: `1.65`, Sans Font-weight: `300` - `400`
- **Caption / Meta:** `0.75rem - 0.8125rem` (12px - 13px), Tracking: `0.08em - 0.15em`, Monospace / Sans uppercase

---

## 3. Grid & Layout System
- **Desktop Max Container:** `1440px` (có thể mở rộng `1560px` cho widescreen)
- **Grid:** 12 columns, Gutter: `24px` (tablet) - `32px` (desktop)
- **Breathing Room (Section Vertical Padding):**
  - Desktop: `100px - 160px`
  - Tablet: `80px - 100px`
  - Mobile: `60px - 80px`
- **Breakout Sections:** Các hình ảnh kiến trúc toàn cảnh hoặc gallery được phép tràn lề (`full-bleed`) tạo chiều sâu thị giác.

---

## 4. Breakpoints
- **Mobile (sm):** `640px`
- **Tablet (md):** `768px`
- **Desktop (lg):** `1024px`
- **Wide Desktop (xl):** `1280px`
- **Large Cinema (2xl):** `1536px`

---

## 5. UI Components Guidelines

### 5.1 Buttons
- **`.btn-ink` (Primary):** Nền `#1C1B19`, chữ `#F5F1EA`, border `#1C1B19`. Hover: border chuyển `#B85C38`, dịch chuyển `-1px`.
- **`.btn-ghost` (Editorial Outline):** Nền trong suốt, viền `rgba(28,27,25,0.2)`. Hover: viền và chữ chuyển `#B85C38`.
- **`.btn-clay` (Accent CTA):** Nền `#1C1B19` hoặc `#B85C38`, chữ `#F5F1EA`, viền `#B85C38`. Dành riêng cho Zalo OA, Đặt lịch hẹn Showroom.
- **Quy tắc:** Tất cả button có min-height `44px` cho khả năng chạm trên mobile, typography uppercase, letter-spacing `0.12em`. Không bo tròn quá mức (border-radius: `0px` - `2px`).

### 5.2 Links
- **`.link-line`:** Link có gạch chân hairline tinh tế, hover có hiệu ứng trượt quét sang phải (sweep animation).

### 5.3 Product & Collection Cards
- **Product Card:**
  - Không dùng drop-shadow khối.
  - Tỷ lệ khung hình chuẩn `1:1` hoặc `4:5` tôn vinh bề mặt vân đá.
  - Hover: phóng to nhẹ `scale(1.03)` kết hợp chuyển đổi sang hình ảnh phối cảnh (secondary view) nếu có.
  - Thông tin tối giản: Mã sản phẩm (Mono), Tên thương mại (Serif/Sans), Kích thước + Bề mặt, Giá/Báo giá.
- **Collection Card:**
  - Định dạng editorial khổ lớn (landscape hoặc vertical).
  - Tích hợp số lượng mẫu và triết lý cảm hứng thiết kế.

### 5.4 Image Strategy
- Sử dụng Next/Image với thuộc tính `sizes` chuẩn, `priority` cho các ảnh viewport đầu tiên (Hero, Above-the-fold).
- Tỷ lệ hiển thị trung thực màu sắc (`object-cover` hoặc `object-contain` tùy mẫu gạch).
- Hỗ trợ tải placeholder mượt mà không gây giật layout (Layout Shift 0).

---

## 6. Micro-animations & Motion
- **Thời lượng:** `300ms - 600ms`, Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (mượt mà, tự nhiên).
- **Loại hình tương tác:**
  - Fade in + TranslateY (`8px - 16px`).
  - Đường kẻ reveal (`scaleX(0)` sang `scaleX(1)`).
  - Modal / Drawer mở dạng backdrop mờ nhạt dần.
- Tuân thủ nghiêm ngặt: `prefers-reduced-motion` tắt toàn bộ hiệu ứng chuyển động với người dùng nhạy cảm.
