# 03 — Thiết kế đã làm

Mô tả phần thiết kế đã hiện thực hóa trong code ở mốc 50% (chủ yếu frontend).

## 1. Kiến trúc tổng thể (hiện tại vs mục tiêu)

**Hiện tại (mốc 50%):** App độc lập, dữ liệu từ mock cục bộ.

```text
┌─────────────────────────────────────────────┐
│            NovaTales Mobile App               │
│              (React Native / Expo)            │
│                                               │
│  Screens ── Navigation (Stack + BottomTabs)   │
│     │                                         │
│  Components (Atomic Design)                    │
│     │                                         │
│  ThemeProvider (tokens, dark mode, i18n)       │
│     │                                         │
│  services/storage.ts  ──►  AsyncStorage        │
│  services/instance.ts (ky)  ··► (chưa nối API) │
│     │                                         │
│  src/mocks/  ◄── nguồn dữ liệu hiện tại         │
└─────────────────────────────────────────────┘
```

**Mục tiêu (sau 50%):** thay `mocks` bằng API thật.

```text
App  ──HTTPS/JWT──►  Backend (NestJS)  ──►  PostgreSQL (user, giao dịch)
                          │                  MongoDB   (nội dung, comment)
                          ├──►  Redis  (lịch sử đọc, ranking)
                          ├──►  S3/Cloudinary (ảnh bìa)
                          └──►  AI services (recommend, moderation)
```

## 2. Design System

| Hạng mục | Chi tiết |
|----------|----------|
| Hệ màu | **Material 3 tokens** trong `src/theme/_config.ts` (light + dark) |
| Brand | primary `#5341cd`, primaryContainer `#6c5ce7` |
| Dark mode | ✅ Đầy đủ bộ token `colorsDark`, đổi qua `changeTheme()` |
| Typography | `src/theme/typography.ts` — preset: display, headlineLg/Md, bodyLg/Md, labelMd/Sm, readingText |
| Fonts | **Merriweather** (đọc truyện) + **Plus Jakarta Sans** (UI) qua `@expo-google-fonts` |
| Spacing/Layout | `gutters.ts`, `layout.ts`, `borders.ts`, `backgrounds.ts` (token hoá) |
| Truy cập | `useTheme()` trả về `{ colors, layout, gutters, borders, backgrounds, fonts, variant, changeTheme }` |

## 3. Cấu trúc thành phần (Atomic Design)

```text
src/components/
├── atoms/       (11)  AppText, Button, Tag, Avatar, Cover, ProgressBar,
│                      RatingStars, Skeleton, AppIcon, IconByVariant, AssetByVariant
├── molecules/   (12)  StoryCard, ContinueReadingCard, ChapterListItem, SectionHeader,
│                      Tabs, StatItem, StatCard, AuthorBar, SearchBar, NotificationItem,
│                      SettingRow, DefaultError
├── organisms/   (4)   Banner, StoryCarousel, TopAppBar, ErrorBoundary
└── templates/   (2)   SafeScreen, ScreenContainer
```

## 4. Bản đồ màn hình & điều hướng

**Bottom Tabs** (`MainTabs.tsx`): Home · Library · Write · Alerts · Profile

**Stack** (`Application.tsx`): Login → Startup → Admin → Main(Tabs) → StoryDetail →
Reader → Search → Settings → Streak → Example

| Màn hình | Vai trò | Trạng thái |
|----------|---------|:----------:|
| Login | Đăng nhập/đăng ký (UI) | 🔄 |
| Home | Trang chủ, carousel truyện, continue reading | 🔄 |
| Search | Tìm kiếm + bộ lọc | 🔄 |
| StoryDetail | Chi tiết truyện, danh sách chương | 🔄 |
| Reader | Trình đọc tùy biến | 🔄 |
| Library | Thư viện cá nhân | 🔄 |
| Write | Studio sáng tác | 🔄 |
| Profile | Trang cá nhân, thống kê | 🔄 |
| Alerts | Thông báo | 🔄 |
| Streak | Gamification (đọc liên tục) | 🔄 |
| Settings | Cài đặt, đổi theme/ngôn ngữ | ✅ |
| Admin | Dashboard quản trị (khung) | 🔄 |

> 5 màn hình chính theo PRD (Home, Library, Reader, Studio/Write, Profile) đều đã có
> bản dựng UI chạy được.

## 5. Mô hình dữ liệu phía client (`src/models/index.ts`)

```ts
Author          { id, name, handle?, avatarUri? }
Chapter         { id, index, title, date }
Story           { id, title, author, coverUri, genres?, rating?, ratingCount?,
                  status?: 'completed'|'ongoing', views? }
ReadingProgress { story, chapterLabel, progress (0..1) }
```

> Đây là model rút gọn cho UI. Schema CSDL đầy đủ (Users/Stories/Chapters/Libraries/
> Inline_Comments/Transactions) sẽ thiết kế ở giai đoạn backend —
> xem [04 — Kế hoạch 50% còn lại](./04-ke-hoach-50-con-lai.md).
