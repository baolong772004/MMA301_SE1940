# NovaTales — Tài liệu dự án (Mốc 50%)

> **Môn học:** MMA301 — SE1940
> **Loại tài liệu:** Báo cáo tiến độ giữa kỳ (50%)
> **Sản phẩm:** Ứng dụng di động đọc & sáng tác truyện chữ (React Native / Expo)
> **Cập nhật:** 2026-06-24

Bộ tài liệu này phản ánh **tiến độ thực tế** của dự án tại mốc 50%, đối chiếu với
bản PRD (Product Requirement Document) đã thống nhất.

## Mục lục

| # | Tài liệu | Nội dung |
|---|----------|----------|
| 00 | [Tổng quan dự án](./00-tong-quan.md) | Mục tiêu, đối tượng, nền tảng, tech stack |
| 01 | [Phạm vi & yêu cầu](./01-pham-vi-yeu-cau.md) | Business features, vai trò, yêu cầu chức năng/phi chức năng |
| 02 | [Tiến độ hiện tại](./02-tien-do-hien-tai.md) | ★ Bảng đối chiếu PRD ↔ thực tế (Done / WIP / Todo) |
| 03 | [Thiết kế đã làm](./03-thiet-ke-da-lam.md) | Kiến trúc, design system, danh mục component & màn hình |
| 04 | [Kế hoạch 50% còn lại](./04-ke-hoach-50-con-lai.md) | Backend, tích hợp, timeline, phân công |
| 05 | [Rủi ro & vấn đề](./05-rui-ro-van-de.md) | Rủi ro kỹ thuật và hướng xử lý |

## Tóm tắt nhanh tình trạng

- ✅ **Frontend UI prototype**: hệ thống theme/tokens, Atomic Design (atoms→organisms),
  12 màn hình chạy được trên dữ liệu giả lập (`src/mocks/`).
- 🔄 **Đang dở**: lưu cấu hình Reader, nhớ vị trí đọc, các luồng cần backend.
- ⬜ **Chưa bắt đầu**: backend (auth/OTP, DB, thanh toán, AI moderation/recommend),
  offline cache, đồng bộ auto-save lên server.

> Chi tiết số liệu xem [02 — Tiến độ hiện tại](./02-tien-do-hien-tai.md).
