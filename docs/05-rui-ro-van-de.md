# 05 — Rủi ro & Vấn đề

Các rủi ro kỹ thuật đã gặp / dự kiến và hướng xử lý.

## 1. Đã gặp & đã xử lý

| Vấn đề | Bối cảnh | Hướng xử lý đã áp dụng |
|--------|----------|------------------------|
| **MMKV không chạy trên Expo Go** | `react-native-mmkv`/nitro-modules cần native build | Thay bằng wrapper đồng bộ trên **AsyncStorage** (`src/services/storage.ts`) + `hydrateStorage()` gọi trước render trong `App.tsx` |
| **Bug `require.context('/icons')`** | Sai đường dẫn tuyệt đối | Sửa thành `'./icons'` |
| **Tàn dư cấu hình RN bare** | android/ios, yarn.lock cũ (RN 0.84) còn sót | Đã dọn để chạy thuần Expo Go |

## 2. Lệch giữa PRD và triển khai thực tế

| Điểm lệch | PRD | Thực tế | Ghi chú / Quyết định |
|-----------|-----|---------|----------------------|
| **Framework frontend** | Flutter | **React Native / Expo** | Dùng boilerplate TheCodingMachine; cần thống nhất & ghi rõ trong báo cáo |
| **Số mức nền Reader** | 3 (Trắng/Vàng kem/Đen) | 2 (sáng/tối) | Thiếu nền vàng kem — đã đưa vào kế hoạch (W8) |
| **Giới hạn cỡ chữ** | 14–28px | 14–32px | Cần chỉnh max về 28px |
| **Nguồn dữ liệu** | API + DB | Mock cục bộ | Đúng giai đoạn; sẽ thay ở 50% sau |

## 3. Rủi ro dự kiến (50% còn lại)

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|--------|:---------:|-----------|
| **Anti-pirating trên Expo Go** | Cao | `FLAG_SECURE` cần native config → có thể phải dùng EAS Build / dev build thay Expo Go |
| **Hiệu năng đọc 5000 từ < 1.5s** | Trung bình | Phân trang/ảo hoá nội dung, cache chương, đo thực tế trên 4G |
| **Hai DB (PostgreSQL + MongoDB)** | Trung bình | Tăng độ phức tạp đồng bộ; cân nhắc ranh giới rõ ràng (giao dịch ↔ nội dung) |
| **Cổng thanh toán & ví xu** | Cao | Cần môi trường sandbox; xử lý idempotency cho giao dịch |
| **AI moderation/recommend** | Trung bình | Có thể dùng dịch vụ ngoài; cần phương án fallback khi AI lỗi |
| **Tải 50.000 concurrent users** | Cao | Redis cache + load test trước phát hành; ngoài phạm vi đồ án có thể chỉ chứng minh kiến trúc |
| **Đồng bộ auto-save offline↔server** | Trung bình | Xử lý xung đột (last-write-wins / version), hàng đợi gửi lại khi có mạng |

## 4. Phụ thuộc bên ngoài cần chuẩn bị

- Tài khoản cổng thanh toán (sandbox) cho nạp xu.
- Dịch vụ gửi email cho OTP.
- AWS S3 / Cloudinary cho ảnh bìa.
- Hạ tầng cloud (AWS/GCP) + GitHub Actions cho CI/CD.
