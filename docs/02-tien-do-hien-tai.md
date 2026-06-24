# 02 — Tiến độ hiện tại (Mốc 50%)

> **Bối cảnh:** Toàn bộ frontend hiện chạy trên **dữ liệu giả lập** (`src/mocks/`).
> Backend chưa bắt đầu, nên các tính năng cần server đang ở mức UI/luồng giả lập.

## 1. Tổng quan mức độ hoàn thành

| Mảng                             |   Mức độ    | Ghi chú                                          |
| -------------------------------- | :---------: | ------------------------------------------------ |
| Frontend — Design system & theme |  ✅ ~100%   | Tokens, dark mode, typography, fonts             |
| Frontend — Component library     |   ✅ ~95%   | 11 atoms, 12 molecules, 4 organisms, 2 templates |
| Frontend — Màn hình (UI)         |   🔄 ~80%   | 12 screens dựng xong, còn polish + nối state     |
| Frontend — Điều hướng            |  ✅ ~100%   | Stack + Bottom Tabs wired                        |
| Tích hợp dữ liệu thật (API)      |   ⬜ ~5%    | Mới có client `ky` + khung react-query           |
| Backend (auth/DB/payment/AI)     |    ⬜ 0%    | Chưa bắt đầu                                     |
| **Ước lượng tổng dự án**         | **🔄 ~50%** | Frontend prototype xong; backend là phần còn lại |

## 2. Đối chiếu theo nhóm tính năng PRD

| Tính năng PRD                | Trạng thái | Bằng chứng / Ghi chú                                                                         |
| ---------------------------- | :--------: | -------------------------------------------------------------------------------------------- |
| **F1 — Xác thực & OTP**      | 🔄 UI only | `screens/Login` có UI; chưa có OTP/JWT/backend                                               |
| **F2 — Không gian Độc giả**  |  🔄 ~70%   | Home, Library, Search, StoryDetail dựng trên mock                                            |
| → Tìm kiếm & bộ lọc          |     🔄     | `screens/Search` (287 dòng) lọc trên mock                                                    |
| → Thư viện cá nhân           |     🔄     | `screens/Library` + `mocks/library.ts`; chưa lưu thật                                        |
| → Trình đọc tùy biến         |     🔄     | `screens/Reader` — xem mục 3                                                                 |
| **F3 — Tương tác cộng đồng** |  ⬜ ~15%   | Có RatingStars, AuthorBar UI; **chưa có inline comment / follow / vote thật**                |
| **F4 — Studio sáng tác**     |  🔄 ~40%   | `screens/Write` (99 dòng) có khung soạn thảo; **chưa auto-save / quản lý chương / xuất bản** |
| **F5 — Đọc ngoại tuyến**     |   ⬜ 0%    | Chưa có cache chương                                                                         |
| **F6 — Kiếm tiền (xu/VIP)**  |   ⬜ ~5%   | `mocks` có `Is_VIP/coin` khái niệm; chưa cổng thanh toán / unlock thật                       |
| **F7 — Admin Dashboard**     |  🔄 ~20%   | `screens/Admin/AdminHome` (42 dòng) khung; chưa kiểm duyệt/report thật                       |

## 3. Chi tiết Trình đọc tùy biến (FR1) — `screens/Reader/Reader.tsx`

| Hạng mục                                | Trạng thái | Ghi chú                                                                           |
| --------------------------------------- | :--------: | --------------------------------------------------------------------------------- |
| Hiển thị nội dung chương                |     🔄     | Đang đọc từ `mocks/stories.ts`                                                    |
| Tap giữa màn hình bật/tắt thanh công cụ |     ✅     | `toggleControls`                                                                  |
| Chỉnh cỡ chữ                            |     🔄     | Hiện 14–32px — **PRD yêu cầu 14–28px**, cần chỉnh lại max                         |
| Đổi màu nền sáng/tối                    |     🔄     | Có light/dark; **PRD yêu cầu 3 mức: Trắng / Vàng kem / Đen** → thiếu nền vàng kem |
| Bottom-sheet cài đặt                    |     ✅     | Modal trượt từ dưới                                                               |
| Prev/Next chương + progress bar         |     ✅     | `handlePrevious/handleNext`, `ProgressBar`                                        |
| **Ghi nhớ cấu hình đọc**                |     ⬜     | State cục bộ `useState`, **chưa lưu vào storage**                                 |
| **Nhớ vị trí đang đọc**                 |     ⬜     | Chưa lưu scroll position                                                          |
| Cache khi mất mạng                      |     ⬜     | Chưa có                                                                           |

## 4. Hiện trạng kiến trúc code (thực tế)

| Lớp            | Đã có | Đường dẫn                                                                                                                                                  |
| -------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme / tokens | ✅    | `src/theme/_config.ts`, `typography.ts`, `fonts.ts`, ThemeProvider                                                                                         |
| Atoms (11)     | ✅    | AppText, Button, Tag, Avatar, Cover, ProgressBar, RatingStars, Skeleton, AppIcon, IconByVariant, AssetByVariant                                            |
| Molecules (12) | ✅    | StoryCard, ContinueReadingCard, ChapterListItem, SectionHeader, Tabs, StatItem, StatCard, AuthorBar, SearchBar, NotificationItem, SettingRow, DefaultError |
| Organisms (4)  | ✅    | Banner, StoryCarousel, TopAppBar, ErrorBoundary                                                                                                            |
| Templates (2)  | ✅    | SafeScreen, ScreenContainer                                                                                                                                |
| Screens (12)   | 🔄    | Login, Home, Library, Write, Profile, Alerts, StoryDetail, Reader, Search, Settings, Streak, Admin                                                         |
| Navigation     | ✅    | `Application.tsx` (Stack), `MainTabs.tsx` (Tabs)                                                                                                           |
| Models         | ✅    | `src/models/index.ts` (Author, Chapter, Story, ReadingProgress)                                                                                            |
| Mock data      | ✅    | `src/mocks/` (stories, library, notifications, profile, authorWorks)                                                                                       |
| API client     | 🔄    | `src/services/instance.ts` (ky stub, trỏ `API_URL`)                                                                                                        |
| Local storage  | ✅    | `src/services/storage.ts` (AsyncStorage wrapper, mới persist `theme`)                                                                                      |

## 5. Khoảng cách chính so với PRD (gap)

1. **Backend toàn bộ chưa có** — auth/OTP, DB (PostgreSQL+MongoDB), API, Redis, S3.
2. **Tính năng phụ thuộc server**: inline comment, vote/follow, nạp xu & unlock VIP,
   thống kê tác giả, kiểm duyệt admin — mới ở mức UI/mock.
3. **Reader** thiếu: nền "vàng kem", lưu cấu hình, nhớ vị trí đọc, giới hạn max 28px.
4. **Auto-save** trong Studio chưa hiện thực (chu kỳ 30s + đồng bộ).
5. **Offline cache** và **anti-pirating** (chặn copy/screenshot) chưa làm.
6. **AI** (recommendation, moderation) chưa bắt đầu.

> Toàn bộ khoảng trống trên là nội dung của [04 — Kế hoạch 50% còn lại](./04-ke-hoach-50-con-lai.md).
