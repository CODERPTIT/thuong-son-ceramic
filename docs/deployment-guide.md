# Hướng Dẫn Triển Khai: Thư Mục Dự Án -> GitHub -> Vercel (Miễn Phí 100%)

Tài liệu này hướng dẫn chi tiết từng bước để đưa toàn bộ mã nguồn website **Công ty TNHH Thường Sơn** từ máy tính lên GitHub và phát hành trực tiếp trên nền tảng **Vercel (Gói Hobby Miễn Phí)**.

---

## 1. Tổng Quan Luồng Hoạt Động (Architecture Flow)

```
[Thư mục máy tính C:\...\Pr]
            ↓ (git commit & git push)
[GitHub Repository (Mã nguồn riêng tư hoặc công khai)]
            ↓ (Tự động kích hoạt webhook)
[Vercel Cloud (Hobby Tier Miễn Phí)]
            ↓ (Tự động biên dịch & tối ưu hình ảnh)
[Website Hoạt Động Toàn Cầu: https://thuong-son-ceramic.vercel.app]
```

* **Chi phí:** 0 VNĐ (Vercel miễn phí SSL, CDN toàn cầu, và tự động deploy khi có code mới).
* **Tự động hóa (CI/CD):** Mỗi lần bạn cập nhật mã nguồn và push lên GitHub, Vercel sẽ tự động cập nhật website chỉ sau khoảng 30 - 45 giây.

---

## 2. Bước 1: Chuẩn Bị & Đẩy Mã Nguồn Lên GitHub

Mở cửa sổ dòng lệnh (Terminal / PowerShell) ngay tại thư mục dự án và thực hiện:

### 2.1. Kiểm tra và thêm toàn bộ file vào Git
```powershell
git status
git add .
git commit -m "feat: Hoan thien website Thuong Son Ceramic voi 589 san pham va tich hop email"
```

### 2.2. Tạo Repository mới trên GitHub
1. Truy cập [https://github.com/new](https://github.com/new) (đăng nhập tài khoản GitHub của bạn).
2. Đặt tên Repository (ví dụ: `thuong-son-ceramic` hoặc `thuongson-tiles`).
3. Chọn chế độ **Private** (Riêng tư) hoặc **Public** (Công khai).
4. Không tích chọn các ô "Add a README file", "Add .gitignore" vì dự án đã có sẵn.
5. Bấm **Create repository**.

### 2.3. Kết nối và đẩy mã nguồn lên GitHub
GitHub sẽ cung cấp cho bạn đường dẫn repository. Chạy các lệnh sau trong terminal (thay link bằng link của bạn):

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thuong-son-ceramic.git
git push -u origin main
```
*(Nếu đã có remote origin trước đó, bạn có thể kiểm tra bằng lệnh `git remote -v` hoặc đổi link bằng `git remote set-url origin <LINK>`)*.

---

## 3. Bước 2: Đăng Nhập & Import Vào Vercel (Miễn Phí)

1. Truy cập [https://vercel.com/signup](https://vercel.com/signup) hoặc [https://vercel.com/login](https://vercel.com/login).
2. Chọn **Continue with GitHub** để liên kết trực tiếp với tài khoản GitHub bạn vừa dùng.
3. Sau khi vào màn hình chính Dashboard của Vercel:
   - Bấm nút **Add New...** (góc phải trên) -> Chọn **Project**.
4. Tại danh sách **Import Git Repository**:
   - Tìm repository `thuong-son-ceramic` vừa đẩy lên.
   - Bấm nút **Import** bên cạnh.

---

## 4. Bước 3: Cấu Hình Biến Môi Trường (Environment Variables)

Tại màn hình cấu hình project trước khi bấm Deploy:
- **Framework Preset:** Giữ nguyên mặc định là `Next.js` (Vercel tự động nhận diện Turbopack và App Router).
- **Root Directory:** Giữ nguyên `./`.
- Mở mục **Environment Variables** và thêm các biến để hệ thống gửi email về `nguyenhieu32005@gmail.com`:

| Tên Biến (Key) | Giá Trị (Value) | Giải Thích |
| :--- | :--- | :--- |
| `NOTIFICATION_EMAIL` | `nguyenhieu32005@gmail.com` | Email nhận thông báo đặt lịch & báo giá |
| `SMTP_HOST` | `smtp.gmail.com` | Máy chủ gửi mail của Google |
| `SMTP_PORT` | `465` | Cổng bảo mật SSL của Gmail |
| `SMTP_USER` | `nguyenhieu32005@gmail.com` | Tài khoản Gmail của bạn |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | **Mật khẩu ứng dụng** 16 ký tự tạo từ tài khoản Google (xem hướng dẫn bên dưới) |

> **Cách lấy Mật khẩu ứng dụng Gmail (App Password):**
> 1. Truy cập [myaccount.google.com/security](https://myaccount.google.com/security).
> 2. Bật "Xác minh 2 bước" (2-Step Verification) nếu chưa bật.
> 3. Tìm mục "Mật khẩu ứng dụng" (hoặc truy cập trực tiếp [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
> 4. Đặt tên ứng dụng là `Website Thuong Son` -> Google sẽ cấp 1 mã 16 chữ cái.
> 5. Dán mã 16 chữ cái này vào ô giá trị của `SMTP_PASS`.

---

## 5. Bước 4: Bấm Deploy & Nhận Website Hoàn Chỉnh

1. Bấm nút **Deploy** màu xanh.
2. Vercel sẽ tự động tải mã nguồn, chạy `npm run build` và khởi chạy serverless functions.
3. Sau khoảng 45 giây, bạn sẽ nhận được thông báo **Congratulations!** kèm đường link website trực tiếp (ví dụ: `https://thuong-son-ceramic.vercel.app`).
4. Bạn có thể chia sẻ link này cho khách hàng hoặc gắn tên miền riêng (ví dụ `thuongsonceramic.vn`) hoàn toàn miễn phí tại mục **Settings -> Domains** trên Vercel.

---

## 6. Quy Trình Cập Nhật Sau Này (Update Workflow)

Bất kỳ khi nào bạn cần thêm sản phẩm mới hoặc thay đổi thông tin:
1. Chỉnh sửa code trên máy tính.
2. Mở terminal gõ 2 lệnh:
   ```powershell
   git add .
   git commit -m "Cập nhật nội dung mới"
   git push
   ```
3. Vercel sẽ tự động phát hiện code mới trên GitHub và triển khai bản cập nhật ngay lập tức mà bạn không cần thao tác gì thêm!
