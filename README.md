# 📐 HÌNH HỌC 3D – PHÒNG THÍ NGHIỆM TOÁN HỌC TƯƠNG TÁC
> **Giáo viên phát triển:** **Cao Thị Thu Thảo (GV trường THCS và THPT Long Hiệp)**  
> **Mục tiêu:** Phục vụ học sinh THCS và THPT học tập hình học không gian trực quan, sinh động, hoàn toàn **MIỄN PHÍ 100%** và hỗ trợ học tập **NGOẠI TUYẾN (Offline)**.

---

## 🌟 1. Giới thiệu các chức năng nổi bật

1. **Thư viện 30 mô hình không gian:**
   - Đa diện: Khối lập phương, hình hộp chữ nhật, khối chóp (S.ABCD, S.ABC, chóp đều), lăng trụ đứng, lăng trụ xiên, tứ diện đều, khối bát diện...
   - Khối tròn xoay: Hình nón, hình trụ, hình cầu, nón cụt, chỏm cầu...
   - Hệ tọa độ Oxyz: Trục tọa độ, vectơ không gian, mặt phẳng, tích có hướng...
   - Mô hình liên môn & thực tế: Kim tự tháp, lăng kính quang học, tinh thể hóa học...
2. **Tương tác 3D 360° đa nền tảng:**
   - Xoay, lật, phóng to thu nhỏ mượt mà trên cả máy tính (chuột), máy tính bảng và điện thoại thông minh (cảm ứng chạm vuốt).
   - Tự động nhận diện nét thấy – nét đứt (khuất) theo góc nhìn thời gian thực.
3. **Mở hình khai triển 2D (Net Unfolding):**
   - Trải phẳng các mặt của khối đa diện và khối tròn xoay ra mặt phẳng 2D, hỗ trợ học sinh hình dung cách gấp và in làm mô hình giấy.
4. **Cắt khối & Khám phá thiết diện:**
   - Cắt đa diện bằng mặt phẳng tùy chỉnh, tính toán diện tích thiết diện và chu vi giao tuyến.
5. **Thế số công thức KaTeX tự động:**
   - Kéo thanh trượt thay đổi kích thước, công thức tính diện tích xung quanh, toàn phần và thể tích tự động thế số và tính kết quả tức thì.
6. **Phiếu bài tập A4 & Mã QR:**
   - Giáo viên có thể xuất phiếu bài tập A4 kèm mã QR để học sinh quét camera điện thoại mở ngay hình 3D mà **không cần đăng nhập hay cài đặt**.
7. **PWA Ngoại Tuyến (Offline):**
   - Ứng dụng chạy trực tiếp trên trình duyệt, tự động lưu bộ nhớ đệm. Có thể cài ra màn hình chính điện thoại và mở học khi không có Internet hoặc không có 4G.

---

## 🚀 2. Hướng dẫn từng bước đưa lên GitHub Pages (Dành cho Giáo viên)

> **Lưu ý:** Thầy cô không cần biết lập trình chuyên sâu, chỉ cần thực hiện 5 bước đơn giản dưới đây:

### Bước 1: Chuẩn bị tài khoản GitHub
1. Truy cập trang web: [https://github.com](https://github.com)
2. Nếu chưa có tài khoản, bấm **Sign up** để đăng ký bằng email của thầy cô (hoàn toàn miễn phí).

### Bước 2: Tạo một Repository (Kho chứa) mới
1. Sau khi đăng nhập, bấm vào dấu **`+`** ở góc trên bên phải màn hình -> chọn **New repository**.
2. Tại ô **Repository name**, đặt tên cho kho chứa, ví dụ: `hinh-hoc-3d` (viết liền, không dấu).
3. Chọn chế độ **Public** (để học sinh có thể truy cập miễn phí).
4. Để nguyên các tùy chọn khác và bấm nút xanh **Create repository**.

### Bước 3: Đưa toàn bộ mã nguồn lên GitHub
Thầy cô có thể chọn **1 trong 2 cách** sau:

#### Cách A: Dùng giao diện web (Đơn giản nhất cho giáo viên)
1. Trong trang repository vừa tạo, bấm vào dòng chữ **"uploading an existing file"**.
2. Kéo thả toàn bộ các thư mục và tệp của dự án này vào khung tải lên (bao gồm cả thư mục `.github`, `src`, `public`, `index.html`, `vite.config.ts`, `package.json`,...).
3. Chờ các tệp tải lên xong, cuộn xuống dưới và bấm **Commit changes**.

#### Cách B: Dùng lệnh Git (Nếu thầy cô đã cài Git trên máy)
Mở cửa sổ dòng lệnh tại thư mục dự án và chạy lần lượt:
```bash
git init
git add .
git commit -m "Khoi tao Ung dung Hinh Hoc 3D Tuong Tac"
git branch -M main
git remote add origin https://github.com/[ten-tai-khoan-cua-thay-co]/hinh-hoc-3d.git
git push -u origin main
```

---

### Bước 4: Kích hoạt GitHub Pages tự động

Dự án đã được tích hợp sẵn tệp cấu hình **`.github/workflows/deploy.yml`**. Thầy cô chỉ cần bật chức năng này trên GitHub:

1. Tại trang repository trên GitHub, bấm vào tab **Settings** (biểu tượng bánh răng ở thanh menu ngang phía trên).
2. Ở thanh menu bên trái, tìm và bấm vào mục **Pages** (trong nhóm *Code and automation*).
3. Tại phần **Build and deployment**:
   - Ở ô **Source**, bấm vào mũi tên thả xuống và chọn **`GitHub Actions`**.
4. **Xong!** Hệ thống GitHub sẽ tự động biên dịch và triển khai trang web trong khoảng 1–2 phút.

---

### Bước 5: Nhận liên kết trang web gửi cho học sinh

1. Sau 1–2 phút, tải lại trang mục **Pages** trong Settings.
2. Thầy cô sẽ thấy một khung màu xanh thông báo:  
   **"Your site is live at https://[ten-tai-khoan].github.io/hinh-hoc-3d/"**
3. Sao chép liên kết này gửi vào nhóm Zalo lớp học, nhúng vào trang web trường, hoặc in mã QR cho học sinh quét.

---

## 📱 3. Hướng dẫn học sinh sử dụng trên điện thoại

1. **Mở link trực tiếp:** Học sinh bấm vào liên kết hoặc quét mã QR bằng camera điện thoại/Zalo.
2. **Thao tác 3D:**
   - Dùng 1 ngón tay vuốt trên màn hình để **xoay khối hình 360°**.
   - Dùng 2 ngón tay chụm lại hoặc mở ra để **phóng to / thu nhỏ**.
   - Bấm nút **"Nét khuất (Auto)"** để mắt thấy rõ các cạnh khuất trong không gian.
   - Bấm nút **"Mở hình 2D"** để xem hình khai triển phẳng.
3. **Cài đặt dùng không cần mạng (Offline):**
   - **Trên Android (Chrome):** Bấm nút **"Cài App Offline"** hoặc bấm menu 3 chấm `⋮` > Chọn **"Thêm vào màn hình chính"**.
   - **Trên iPhone/iPad (Safari):** Bấm nút **Chia sẻ** (biểu tượng mũi tên hướng lên) ở thanh dưới > Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
   - Sau khi thêm, ứng dụng sẽ có biểu tượng như một ứng dụng điện thoại thực thụ, mở lên học ngay kể cả khi đi xe bus hoặc ở nơi không có sóng Wi-Fi/4G.

---

## 💻 4. Dành cho lập trình viên hoặc muốn chạy thử trên máy tính cá nhân

### Yêu cầu môi trường
- **Node.js** phiên bản 20 hoặc 22 trở lên.
- **npm** (đi kèm Node.js).

### Lệnh cài đặt và chạy thử
```bash
# Cài đặt các gói thư viện
npm install

# Chạy môi trường phát triển (Development)
npm run dev
# Mở trình duyệt tại: http://localhost:3000

# Kiểm tra biên dịch bản phát hành (Production Build)
npm run build

# Chạy thử bản biên dịch tĩnh (Preview)
npm run preview
```

---

## 🛡️ 5. Bản quyền & Giấy phép sử dụng

- **Giáo dục & Phi thương mại:** Ứng dụng được thiết kế hoàn toàn miễn phí phục vụ học sinh, sinh viên và giáo viên toàn quốc.
- **Giáo viên phát triển:** **Cao Thị Thu Thảo (GV trường THCS và THPT Long Hiệp)**.
- Mọi đóng góp về mặt sư phạm hoặc đề xuất mô hình hình học mới, xin vui lòng gửi ý kiến để ứng dụng ngày càng hoàn thiện hơn.
