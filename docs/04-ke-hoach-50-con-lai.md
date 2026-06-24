# 04 — Kế hoạch 50% còn lại

Phần này liệt kê công việc còn lại để hoàn thiện dự án, ưu tiên theo phụ thuộc kỹ thuật.

## 1. Các hạng mục lớn

| #   | Hạng mục                | Mô tả                                                                                    | Phụ thuộc    |
| --- | ----------------------- | ---------------------------------------------------------------------------------------- | ------------ |
| W1  | **Backend nền tảng**    | NestJS, cấu trúc module, kết nối DB, JWT auth                                            | —            |
| W2  | **Cơ sở dữ liệu**       | PostgreSQL (Users, Stories, Chapters, Transactions) + MongoDB (Content, Inline_Comments) | W1           |
| W3  | **Xác thực & OTP**      | Đăng ký/đăng nhập, OTP qua email, Bcrypt, RBAC                                           | W1, W2       |
| W4  | **API truyện**          | List + filter, chi tiết chương, library, tích hợp react-query thay mock                  | W1, W2       |
| W5  | **Tương tác cộng đồng** | Inline comment (+censor), vote/sao, follow tác giả                                       | W2, W4       |
| W6  | **Studio sáng tác**     | Auto-save 30s, quản lý chương, xuất bản, đồng bộ local↔server                            | W4           |
| W7  | **Monetization**        | Ví xu, cổng thanh toán, unlock chương VIP, Transactions                                  | W2, W3       |
| W8  | **Reader nâng cao**     | Nền vàng kem, max 28px, lưu cấu hình, nhớ vị trí, offline cache                          | — (frontend) |
| W9  | **Admin & kiểm duyệt**  | Duyệt nội dung, xử lý report, quản lý user, thống kê                                     | W2, W3       |
| W10 | **AI**                  | Recommendation cá nhân hóa, Content Moderator                                            | W4, W9       |
| W11 | **Bảo mật & vận hành**  | Rate limiting, HTTPS, anti-pirating (FLAG_SECURE), Docker, CI/CD                         | W1           |

## 2. Việc frontend làm được ngay (không chờ backend)

Ưu tiên cao vì gỡ được gap với chi phí thấp:

- [ ] **Reader**: thêm nền "Vàng kem", giới hạn cỡ chữ tối đa 28px (PRD).
- [ ] **Reader**: lưu cấu hình đọc (cỡ chữ/nền) vào `storage.ts`.
- [ ] **Reader**: lưu & khôi phục vị trí đọc dở (scroll position).
- [ ] **Write**: dựng cơ chế auto-save vào Local Storage (chu kỳ 30s).
- [ ] Hoàn thiện trạng thái loading/empty/error (đã có Skeleton, DefaultError).

## 3. Đề xuất timeline (gợi ý — điều chỉnh theo lịch nhóm)

| Giai đoạn | Nội dung                                    | Hạng mục    |
| --------- | ------------------------------------------- | ----------- |
| Sprint 1  | Dựng backend + DB + auth/OTP                | W1, W2, W3  |
| Sprint 2  | API truyện + thay mock + cộng đồng          | W4, W5      |
| Sprint 3  | Studio auto-save + Monetization             | W6, W7      |
| Sprint 4  | Reader nâng cao + Admin + AI                | W8, W9, W10 |
| Sprint 5  | Bảo mật, Docker, CI/CD, kiểm thử, phát hành | W11         |

## 4. Tiêu chí hoàn thành (Definition of Done) cho 100%

- Mọi màn hình dùng **dữ liệu thật qua API** (bỏ `src/mocks/`).
- Auth + OTP + RBAC hoạt động; mật khẩu băm Bcrypt; API qua HTTPS.
- Reader đáp ứng đủ business rule (lưu cấu hình + nhớ vị trí + 3 nền + 14–28px).
- Inline comment qua censor; nạp xu & unlock VIP chạy end-to-end.
- Backend đóng gói Docker + pipeline CI/CD (GitHub Actions) chạy test/build.
