# Phân Tích Website Reference: Grand Ceramic (grandtiles.com.vn)

## 1. Giới thiệu & Tổng quan
- **Domain:** https://grandtiles.com.vn/
- **Lĩnh vực:** Gạch ốp lát kiến trúc cao cấp, vật liệu hoàn thiện bề mặt và thiết bị phòng tắm.
- **Thị trường mục tiêu:** Kiến trúc sư, nhà thiết kế nội thất, gia chủ công trình nhà phố, biệt thự, dự án cao cấp (khu vực Thanh Hóa & Bắc Trung Bộ).
- **Định vị:** Editorial Showroom — "The Art of Surface" (Nghệ thuật bề mặt). Không định vị như một sàn thương mại điện tử giá rẻ thông thường mà hướng đến trải nghiệm vật liệu thực tế ("Xem gần, sờ thật, định hình không gian").

---

## 2. Information Architecture & Sitemap
Hệ thống kiến trúc thông tin trên reference site bao gồm:
```
Homepage (/)
├── Hero: Tuyên ngôn "Bề mặt định hình không gian."
├── Zalo Hub / Showroom số (Zalo OA + Zalo Mini App)
├── Không gian (Living, Bath, Kitchen, Bedroom, Outdoor, Lobby, v.v.)
├── Bộ sưu tập (Monalisa, Apodio, Changyih, Grand Ceramic)
├── Sản phẩm tiêu biểu (Shelf gạch chọn lọc)
├── Giải pháp phòng tắm (Thiết bị vệ sinh, Sen vòi, Bình nóng lạnh, Gương điện)
├── Cẩm nang (Tư vấn bề mặt, kích thước, face gạch)
└── Showroom & Liên hệ (KCN Tây Bắc Ga, Thanh Hóa)

Các trang con chính:
├── /catalog (Bộ lọc: không gian, kích thước, bề mặt, thương hiệu, chất liệu)
├── /khong-gian (Trang chọn theo công năng phòng)
├── /p/[slug] hoặc /products/[slug] (Chi tiết sản phẩm, mặt face, thông số)
├── /tin-tuc (Bài viết cẩm nang kiến trúc)
└── /lien-he (Địa chỉ showroom, bản đồ, đặt lịch tư vấn)
```

---

## 3. Visual Language & Design Tokens hiện tại
- **Màu sắc chủ đạo:**
  - `Bone` (`#F5F1EA` / `#F3F0E9`): Màu nền off-white tự nhiên, tạo cảm giác giấy mỹ thuật và đá vôi.
  - `Paper` (`#FAF8F4` / `#EBE5DA`): Nền phụ cho các card hoặc section đối lập nhẹ.
  - `Ink` (`#1C1B19`): Màu văn bản đậm, sang trọng, thay cho đen thuần túy.
  - `Clay / Terracotta` (`#B85C38`): Màu đất nung ấm, làm điểm nhấn editorial tinh tế.
  - `Taupe / Stone` (`#8B7C66` / `#918B80`): Màu phụ cho subtitle, metadata, số liệu kỹ thuật.
  - `Line / Hairline` (`#D5CDBE` / `rgba(28,27,25,0.15)`): Đường phân cách siêu mảnh (0.5px - 1px).
- **Typography:**
  - Heading: Serif editorial có biến thể mềm mại (Fraunces / Newsreader).
  - Body & UI: Sans-serif hiện đại, nét thoáng (Manrope / Be Vietnam Pro).
  - Data / Specs / Codes: Monospace kiến trúc (JetBrains Mono).
- **Layout & Spacing:**
  - Container tối đa ~1440px - 1480px.
  - Sử dụng khoảng trắng hào phóng (breathing room).
  - Các đường kẻ hairline phân vùng thay vì đổ bóng khối (drop shadow) dày cộm.

---

## 4. Phân tích Chi Tiết Các Thành Phần UI

### 4.1 Header & Navigation
- **Hiện tại:** Sticky header nền `bone/95` có backdrop blur, logo có tagline "The Art of Surface", thanh tìm kiếm nhanh, chuyển đổi ngôn ngữ VI/EN, menu ngang đơn giản.
- **Điểm mạnh:** Nhã nhặn, đúng tinh thần editorial.
- **Điểm yếu:** Thiếu mega-menu trực quan phân tầng để người dùng có thể xem trước các bộ sưu tập nổi bật hoặc danh mục không gian ngay trên hover; menu mobile còn đơn giản.

### 4.2 Hero Section
- **Hiện tại:** Chia đôi 5/12 nội dung chữ và 7/12 hình ảnh mặt gạch thực tế, có surface index badge ở góc ảnh.
- **Điểm mạnh:** Thể hiện rõ triết lý "bề mặt", không quảng cáo giật gân.
- **Điểm yếu:** Tỷ lệ khung hình trên một số màn hình có thể bị co cụm; thiếu micro-interaction thu hút sự tò mò.

### 4.3 Catalog & Lọc Sản Phẩm
- **Hiện tại:** Danh sách sản phẩm với các filter cơ bản.
- **Điểm mạnh:** Có thông tin mã gạch, kích thước, bề mặt rõ ràng.
- **Điểm yếu:** Bộ lọc chưa hỗ trợ multi-select trực quan mượt mà; thiếu xem nhanh (quick view) hoặc so sánh face gạch; URL syncing chưa tối ưu cho việc chia sẻ link lọc trực tiếp.

### 4.4 Product Detail Page
- **Hiện tại:** Hình ảnh sản phẩm, thông số kích thước, bề mặt, mã sản phẩm, giá hoặc báo giá.
- **Điểm mạnh:** Chú trọng hiển thị đúng mặt face của gạch (yếu tố sống còn với gạch cao cấp).
- **Điểm yếu:** Cần layout 2 cột bất đối xứng (Gallery sticky trái, Specs + Call-to-action phải); cần thêm tài liệu thông số kỹ thuật (PDF spec sheet) và gợi ý không gian phối gạch tương ứng.

### 4.5 Material Finder (Công cụ tìm vật liệu)
- **Hiện tại:** Reference chưa có wizard Material Finder tương tác nhiều bước.
- **Cơ hội cải tiến vượt bậc:** Xây dựng một tương tác 5 bước (Không gian -> Diện tích -> Phong cách -> Tone màu -> Bề mặt) trả về kết quả gợi ý chuẩn xác ngay lập tức.

---

## 5. Điểm Mạnh (Strengths) vs Điểm Yếu (Weaknesses) của Reference

| Thành phần | Điểm mạnh của Reference | Điểm yếu cần khắc phục |
| :--- | :--- | :--- |
| **Định vị & Màu sắc** | Tone màu Bone/Clay/Ink rất sang, đậm chất vật liệu tự nhiên | Một số chỗ tương phản text phụ (taupe trên bone) hơi thấp, cần tinh chỉnh độ tương phản WCAG |
| **Hình ảnh** | Ảnh chụp mặt gạch thực tế (face thật), phối cảnh kiến trúc chất lượng | Một số ảnh cần tối ưu responsive sizes, lazy loading để tăng tốc độ tải |
| **Typography** | Kết hợp Serif + Sans + Mono có cá tính riêng | Cần chuẩn hóa scale clamp() để responsive trên mobile mượt hơn |
| **Trải nghiệm tìm kiếm & lọc** | Tìm kiếm gõ theo mã gạch trực tiếp | Thiếu fullscreen search modal với gợi ý tìm kiếm phổ biến, lịch sử tìm kiếm |
| **Tương tác chuyển đổi** | Tích hợp Zalo OA và Mini App thực tế | Cần bổ sung form đặt lịch trải nghiệm showroom và tải tài liệu mẫu trực quan |

---

## 6. Đề Xuất Cải Tiến Cụ Thể (Proposed Improvements)
1. **Kiến trúc mã nguồn hiện đại:** Next.js App Router (TypeScript, Tailwind CSS, Framer Motion) giúp hiệu năng cao nhất, component hóa mạch lạc.
2. **Mega Menu & Drawer Navigation:** Tích hợp Mega Menu với hình ảnh phối cảnh và danh mục con cho Desktop, Full-screen architectural drawer cho Mobile.
3. **Interactive Material Finder (Tính năng độc quyền):** Wizard 5 bước trực quan giúp KTS/gia chủ tìm đúng loại gạch trong 30 giây.
4. **Catalog lọc đa tầng chuẩn mực:** Đồng bộ state với URL SearchParams (`/catalog?space=living-room&surface=matt`), hỗ trợ active filter chips, đếm kết quả thực tế.
5. **Product Detail chuẩn Studio:** Gallery lớn hỗ trợ xem vân gạch cực nét, tab thông số kỹ thuật, tải catalogue, sản phẩm tương tự cùng bộ sưu tập.
6. **Không gian & Bộ sưu tập dạng Tạp chí kiến trúc:** Storytelling về cảm hứng thiết kế, màu sắc, ứng dụng thực tế.
7. **Showroom Experience:** Bản đồ chỉ đường, đặt lịch tư vấn có chọn khung giờ và nhu cầu cụ thể.
