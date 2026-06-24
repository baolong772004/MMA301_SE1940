# 00 — Tổng quan dự án

## 1. Thông tin chung

| Mục           | Nội dung                                                 |
| ------------- | -------------------------------------------------------- |
| **Tên dự án** | NovaTales                                                |
| **Loại**      | Cộng đồng đọc & sáng tác truyện chữ trực tuyến           |
| **Nền tảng**  | Mobile App (Android — Expo) + Web Admin (tương lai)      |
| **Ngôn ngữ**  | Tiếng Việt (hỗ trợ mở rộng tiếng Anh — đã có khung i18n) |
| **Đối tượng** | Độc giả 13–35 tuổi & Tác giả sáng tác tự do              |

## 2. Bài toán & mục tiêu

**Vấn đề:** Các app đọc truyện hiện tại thiếu tương tác trực tiếp giữa tác giả và
độc giả, giao diện đọc chưa cá nhân hóa tốt, và tác giả khó sáng tác an toàn trên
điện thoại.

**Mục tiêu chính:** Xây nền tảng di động kết nối độc giả và tác giả, tối ưu trải
nghiệm đọc/viết và tăng tính tương tác cộng đồng.

## 3. Phạm vi mốc 50%

Mốc 50% tập trung **hoàn thiện phần frontend (UI/UX) chạy trên dữ liệu giả lập** và
**chuẩn hóa thiết kế hệ thống**, làm nền cho việc tích hợp backend ở 50% còn lại.

- **Trong phạm vi:** hệ thống theme/design tokens, bộ component theo Atomic Design,
  các màn hình chính, luồng điều hướng, Reader tùy biến (chạy mock).
- **Ngoài phạm vi (50% sau):** backend, cơ sở dữ liệu thật, xác thực OTP, thanh toán,
  AI, offline cache, đồng bộ server.

## 4. Tech Stack (đã chốt & đã áp dụng)

| Lớp            | Công nghệ                                                  | Trạng thái                 |
| -------------- | ---------------------------------------------------------- | -------------------------- |
| Mobile App     | **React Native + Expo (SDK 54, RN 0.81 / React 19)**       | ✅ Đang dùng               |
| Kiến trúc UI   | Atomic Design + theme system (StyleSheet qua `useTheme()`) | ✅                         |
| Điều hướng     | React Navigation (Stack + Bottom Tabs)                     | ✅                         |
| Đa ngôn ngữ    | i18next / react-i18next                                    | ✅                         |
| Data fetching  | react-query + `ky` (client)                                | 🔄 Khung sẵn, chưa nối API |
| Lưu trữ cục bộ | AsyncStorage (wrapper MMKV-shaped)                         | ✅                         |
| Backend        | Node.js (NestJS) **hoặc** Java (Spring Boot)               | ⬜ Chưa bắt đầu            |
| Database       | PostgreSQL + MongoDB                                       | ⬜                         |
| Storage ảnh    | AWS S3 / Cloudinary                                        | ⬜                         |
