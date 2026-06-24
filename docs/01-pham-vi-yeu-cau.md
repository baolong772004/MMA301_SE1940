# 01 — Phạm vi & Yêu cầu

Tài liệu tóm tắt các yêu cầu từ PRD, làm cơ sở đối chiếu tiến độ ở
[02 — Tiến độ hiện tại](./02-tien-do-hien-tai.md).

## 1. Nhóm tính năng nghiệp vụ (Business Features)

| # | Nhóm tính năng | Mô tả ngắn |
|---|----------------|-----------|
| F1 | Xác thực & Định danh | Đăng ký, đăng nhập, xác thực OTP qua email |
| F2 | Không gian Độc giả | Tìm kiếm, bộ lọc truyện, Thư viện cá nhân, Trình đọc tùy biến |
| F3 | Tương tác Cộng đồng | Inline comment, đánh giá/vote (sao), theo dõi tác giả |
| F4 | Studio Sáng tác | Viết truyện, quản lý chương, auto-save nháp, xuất bản |
| F5 | Đọc ngoại tuyến | Tự động cache chương kế tiếp để đọc khi mất mạng |
| F6 | Kiếm tiền (Monetization) | Nạp xu, mở khóa chương VIP qua cổng thanh toán |
| F7 | Admin Dashboard | Kiểm duyệt nội dung, xử lý report, cấu hình banner/sự kiện |

## 2. Vai trò người dùng (User Roles)

| Vai trò | Quyền chính |
|---------|-------------|
| **Guest** | Xem truyện công khai, đọc thử chương miễn phí, tìm kiếm, xem hồ sơ tác giả, đăng ký |
| **Reader** | Toàn quyền Guest + Thư viện cá nhân, lịch sử đọc, inline comment, thả tim/vote, follow tác giả, nạp xu & mua chương VIP |
| **Writer** | Toàn quyền Reader + Studio sáng tác (tạo truyện/chương, lưu nháp/xuất bản), đặt phí xu chương VIP, xem thống kê (lượt đọc/vote/doanh thu) |
| **Admin** | Quản lý & phân quyền user (khóa/mở), kiểm duyệt nội dung, xử lý report, quản lý nạp/rút tiền, thống kê doanh thu toàn app |

## 3. Yêu cầu chức năng trọng tâm (Functional Requirements)

### FR1 — Trình đọc truyện tùy biến (E-reader)
- **Actors:** Reader, Writer, Guest
- **Input:** Tap, swipe, lựa chọn cấu hình (cỡ chữ, màu nền, font)
- **Output:** Giao diện đọc thay đổi real-time
- **Validation:** Giới hạn cỡ chữ 14px–28px (PRD)
- **Business rule:**
  - Ghi nhớ cấu hình cuối để áp dụng cho mọi truyện khác.
  - Tự đánh dấu vị trí đang đọc dở, lần sau cuộn về đúng vị trí.
- **Error handling:** Mất mạng → hiển thị cache nếu có, không thì báo lỗi kết nối.

### FR2 — Bình luận trong đoạn văn (Inline Comment)
- **Actors:** Reader, Writer
- **Input:** Nhấn giữ đoạn văn + nội dung bình luận
- **Output:** Icon comment cạnh đoạn văn, nội dung lưu vào hệ thống
- **Validation:** Không để trống, tối đa 500 ký tự
- **Business rule:**
  - Chỉ user đã đăng nhập mới được bình luận.
  - Nội dung qua bộ lọc từ ngữ độc hại (censor) trước khi hiển thị công khai.
- **Error handling:** Từ cấm → tự thay bằng `***`; lỗi mạng → báo thất bại + cho thử lại.

### FR3 — Tự động lưu bản nháp (Auto-save Draft)
- **Actors:** Writer
- **Input:** Ký tự văn bản tác giả nhập
- **Output:** Thông báo ngầm "Đã lưu bản nháp", dữ liệu cập nhật liên tục
- **Business rule:** Tự lưu mỗi khi có thay đổi, chu kỳ **30 giây**.
- **Luồng:** Lưu Local Storage trước → đẩy ngầm lên server (nếu có mạng).
- **Error handling:** Mất mạng → tiếp tục lưu local + icon "Đã lưu tạm trên máy", có mạng lại tự đồng bộ.

## 4. Yêu cầu phi chức năng (Non-functional)

| Loại | Yêu cầu |
|------|---------|
| **Performance** | Tải chương < 5000 từ trong < 1.5s với mạng 4G |
| **Capacity** | Hỗ trợ 50.000 concurrent users |
| **Availability** | Uptime 99.9% |
| **Security** | Băm mật khẩu Bcrypt; toàn bộ API qua HTTPS |
| **App size** | Bộ cài đặt ban đầu < 60MB |
| **Anti-pirating** | Chặn copy-paste màn hình đọc; chặn screenshot/quay màn hình (Android FLAG_SECURE) |

## 5. Yêu cầu UI/UX

- Phong cách hiện đại, tối giản (Minimalism), ưu tiên không gian hiển thị chữ.
- Mobile-first, tối ưu thao tác một tay (vuốt/chạm/cuộn).
- **Bắt buộc có Dark Mode** toàn app.
- Trình đọc mượt (cuộn/lật trang giữ 60 FPS).

## 6. Cơ sở dữ liệu (theo PRD — sẽ hiện thực hóa ở 50% sau)

Các bảng chính: `Users`, `Stories`, `Chapters`, `Libraries`, `Inline_Comments`,
`Transactions`. Quan hệ: User 1–N Stories, Story 1–N Chapters, Chapter 1–N
Inline_Comments, User N–N Story (qua Library). Chi tiết schema sẽ đặc tả ở giai
đoạn thiết kế backend — xem [04 — Kế hoạch 50% còn lại](./04-ke-hoach-50-con-lai.md).

## 7. API & AI (phạm vi 50% sau)

- **API:** auth (register/login JWT), stories (list + filter), chapters (detail),
  inline comments, unlock chapter VIP. Header `Authorization: Bearer {JWT}`.
- **AI:** Recommendation (gợi ý cá nhân hóa), Content Moderator (quét vi phạm bản
  quyền/nội dung độc hại trước khi duyệt).
