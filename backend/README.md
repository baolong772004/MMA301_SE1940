# NovaTales Backend (MMA301_SE1940)

Backend NestJS + Prisma cho app đọc truyện NovaTales, hiện thực các hạng mục
W1–W7 + W9 trong [docs/04-ke-hoach-50-con-lai.md](../docs/04-ke-hoach-50-con-lai.md).

## Chạy dev

```bash
cd backend
npm install
npx prisma migrate deploy   # tạo DB (SQLite: prisma/dev.db)
npx prisma db seed          # seed dữ liệu demo khớp mock frontend
npm run build && npm start  # hoặc: npm run start:dev
```

- API: `http://localhost:3000` — Swagger UI: `http://localhost:3000/docs`
- Kết nối từ app Expo trên thiết bị thật: đặt `API_URL=http://<IP-LAN-máy-bạn>:3000`
  trong `bookReader/.env` (điện thoại và máy tính cùng mạng Wi-Fi).

### Tài khoản demo (mật khẩu chung `Password@123`)

| Vai trò | Email | Ghi chú |
|---|---|---|
| ADMIN | admin@novatales.app | Kiểm duyệt, report, thống kê |
| READER | reader@novatales.app | Có 200 xu, thư viện + tiến độ đọc sẵn |
| WRITER | john@ / jane@ / alex@novatales.app | Tác giả các truyện seed |

## Database

- Dev dùng **SQLite** (không cần cài gì thêm). Chuyển sang **PostgreSQL** khi deploy:
  sửa `provider = "postgresql"` trong `prisma/schema.prisma` + `DATABASE_URL` trong `.env`,
  rồi chạy lại `npx prisma migrate dev`.
- SQLite không hỗ trợ enum/array nên các trường enum dùng String
  (hằng số tại `src/common/constants.ts`), `genres` lưu JSON string.

Bảng chính: `User`, `OtpCode`, `Story`, `Chapter`, `LibraryEntry`,
`ReadingProgress`, `Comment` (inline), `Rating`, `Follow`, `Transaction`,
`ChapterUnlock`, `Report`.

## Xác thực & phân quyền

- JWT Bearer (`Authorization: Bearer <token>`), mật khẩu băm bcrypt.
- OTP đăng ký: chưa có SMTP nên mã OTP được **log ra console server** và trả về
  trường `devOtp` khi `NODE_ENV !== 'production'` để demo.
- RBAC: `READER` → `WRITER` (tự nâng khi tạo truyện đầu tiên) → `ADMIN`.
  Guard toàn cục: route không đánh dấu `@Public()` đều yêu cầu JWT;
  route `@RequireRoles(...)` kiểm tra vai trò; user `BANNED` bị chặn.
- Rate limiting: 300 request/phút/IP (`@nestjs/throttler`).

## API chính

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/register` | Đăng ký, gửi OTP |
| POST | `/auth/verify-otp` | Xác thực OTP → JWT |
| POST | `/auth/resend-otp` | Gửi lại OTP |
| POST | `/auth/login` | Đăng nhập → JWT |
| GET | `/auth/me` | Tài khoản hiện tại |
| GET | `/stories` | Danh sách + tìm kiếm (`q`, `genre`, `status`, `sort`, `page`, `limit`) |
| GET | `/stories/:id` | Chi tiết + danh sách chương + `myRating` |
| POST/PATCH/DELETE | `/stories(/:id)` | CRUD truyện (tác giả) |
| POST | `/stories/:id/chapters` | Thêm chương |
| PUT | `/stories/:id/rating` | Đánh giá 1–5 sao |
| GET | `/stories/mine` | Truyện của tôi (Studio) |
| GET | `/chapters/:id` | Nội dung chương; VIP chưa mở → `locked=true, content=null` |
| PATCH | `/chapters/:id` | **Auto-save nháp** (FR3) — trả `autoSavedAt` |
| POST | `/chapters/:id/publish` | Xuất bản chương |
| POST | `/chapters/:id/unlock` | Mở khóa VIP bằng xu (transaction) |
| GET/POST | `/chapters/:id/comments` | **Inline comment** (FR2, censor từ cấm → `***`, max 500 ký tự) |
| GET | `/library` | Thư viện nhóm theo kệ READING/SAVED/COMPLETED |
| PUT/DELETE | `/library/:storyId` | Thêm/chuyển kệ, xóa |
| GET | `/library/continue` | Danh sách đang đọc dở |
| GET/PUT | `/library/:storyId/progress` | Nhớ vị trí đọc (FR1) |
| GET | `/users/:id`, `/users/:id/stories` | Hồ sơ công khai, truyện của tác giả |
| POST/DELETE | `/users/:id/follow` | Theo dõi tác giả |
| GET | `/wallet` | Số dư xu + lịch sử giao dịch |
| POST | `/wallet/topup` | Nạp xu (cổng thanh toán **giả lập**) |
| POST | `/reports` | Báo cáo truyện/bình luận |
| GET | `/admin/stats` | Thống kê toàn app |
| GET/PATCH | `/admin/users(/:id)` | Quản lý user (khóa/mở, đổi vai trò) |
| GET/PATCH | `/admin/stories(/:id/moderation)` | Kiểm duyệt truyện (PENDING → APPROVED/REJECTED) |
| GET/PATCH | `/admin/reports(/:id)` | Xử lý report (kèm ẩn bình luận) |

Chi tiết schema request/response: mở Swagger `/docs`.

## Quy tắc nghiệp vụ đã hiện thực

- Truyện mới tạo ở trạng thái `PENDING`, chỉ hiện công khai sau khi admin duyệt (F7).
- Chương `DRAFT` chỉ tác giả thấy; publish mới hiện với độc giả.
- Unlock chương VIP chạy trong DB transaction: kiểm tra đủ xu → trừ xu →
  ghi `ChapterUnlock` + `Transaction` (F6).
- Comment qua bộ lọc từ cấm (`src/common/utils/censor.ts`) trước khi lưu (FR2).
- Lưu tiến độ đọc tự thêm truyện vào kệ READING (FR1).
- Mở chi tiết truyện tự tăng `viewCount`; rating cập nhật aggregate ngay.

## Chưa làm (kế hoạch tiếp)

- Gửi OTP qua SMTP thật (hiện log console / `devOtp`).
- Cổng thanh toán thật (hiện topup giả lập thành công ngay).
- AI recommendation & content moderation (W10).
- Docker + CI/CD + HTTPS (W11) — hiện chạy dev HTTP.
- Tích hợp frontend: thay `src/mocks/` bằng gọi API qua `services/instance.ts` (W4).
