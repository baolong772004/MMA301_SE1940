# NovaTales — Tài liệu tổng hợp Code Review

> Môn: **MMA301_SE1940** · App đọc/viết truyện (React Native + Expo)
> Cập nhật: 2026-06-23 · Mục đích: chuẩn bị cho buổi review code nhóm.

---

## 1. Tổng quan

NovaTales là app **đọc & viết truyện** trên mobile. Source gốc dựa trên boilerplate
**TheCodingMachine (TCM)** rồi migrate sang **Expo SDK 54 (Expo Go)**. Hiện đang ở giai
đoạn ráp UI từ mock data — chưa nối backend thật.

| Hạng mục | Giá trị |
|---|---|
| Nền tảng | React Native 0.81.4 / React 19.1, Expo SDK 54 (Expo Go) |
| Ngôn ngữ | TypeScript |
| Kiến trúc UI | Atomic Design (atoms → molecules → organisms → templates) |
| Theme | Theme system riêng qua `useTheme()` (StyleSheet, **không dùng Tailwind/NativeWind**) |
| Điều hướng | React Navigation (Stack + Bottom Tabs) |
| State (dự kiến) | Redux Toolkit + react-redux (đã cài, **chưa có store/slice**) |
| Backend (dự kiến) | Firebase (đã cài dependency, **chưa cấu hình/sử dụng**) |
| i18n | i18next |
| Data hiện tại | Mock data trong `src/mocks/` |

---

## 2. Tech stack & dependencies chính

- `@react-navigation/native`, `/stack`, `/bottom-tabs`
- `@reduxjs/toolkit`, `react-redux`
- `firebase`
- Fonts: `@expo-google-fonts/merriweather`, `@expo-google-fonts/plus-jakarta-sans`, `expo-font`
- Storage: wrapper đồng bộ trên **AsyncStorage** tại `src/services/storage.ts`
  (vì Expo Go không nạp được `react-native-mmkv`/`nitro-modules`)

---

## 3. Cấu trúc thư mục

```
src/
├── components/
│   ├── atoms/        AppIcon, AppText, Avatar, Button, Cover, ProgressBar,
│   │                 RatingStars, Skeleton, Tag, AssetByVariant, IconByVariant
│   ├── molecules/    AuthorBar, ChapterListItem, ContinueReadingCard, NotificationItem,
│   │                 SearchBar, SectionHeader, SettingRow, StatCard, StatItem,
│   │                 StoryCard, Tabs, DefaultError
│   ├── organisms/    Banner, ErrorBoundary, StoryCarousel, TopAppBar
│   └── templates/    SafeScreen, ScreenContainer
├── screens/          Home, Library, Write, Alerts, Profile, StoryDetail, Reader,
│                     Search, Settings, Streak, Startup, Example
├── navigation/       Application.tsx, MainTabs.tsx, paths.ts, types.ts
├── models/           index.ts (Author, Chapter, Story, ReadingProgress, ...)
├── mocks/            stories, library, notifications, profile, authorWorks
├── services/         instance.ts, storage.ts
├── theme/            _config.ts (tokens), typography.ts, ThemeProvider, hooks
├── hooks/            domain/user, language, useAppFonts
├── translations/     i18n
└── tests/            __mocks__
```

---

## 4. Kiến trúc & quy ước

### 4.1 Atomic Design
Component chia 4 tầng. Tầng trên chỉ ráp tầng dưới, không nhảy cóc logic.
Import qua barrel: `@/components/atoms`, `@/components/molecules`, ...

### 4.2 Theme & Design tokens
- Tokens map vào `src/theme/_config.ts`. Màu lấy qua `useTheme()` → `colors.primary`,
  `colors.surface`, `colors.onSurfaceVariant`, ...
- Typography presets ở `src/theme/typography.ts` + atom `AppText`.
- ⚠️ RN **không tự tổng hợp bold** cho custom font → phải khai báo family theo weight
  (`Merriweather_700Bold`, `PlusJakartaSans_600SemiBold`, ...).

### 4.3 Điều hướng
- `MainTabs.tsx`: Bottom Tabs — **Home · Library · Write · Alerts · Profile**.
- Tên route tập trung trong `navigation/paths.ts` (`Paths`), kiểu trong `types.ts`.
- Icon/label tab map qua record `ICONS`/`LABELS` theo `Paths`.

### 4.4 Quy ước code
- Path alias `@/` trỏ về `src/`.
- Model types tập trung ở `src/models/index.ts`.
- Dữ liệu màn hình lấy từ `src/mocks/` (sẽ thay bằng API/Firebase sau).

---

## 5. Trạng thái tính năng (để review tập trung đúng chỗ)

| Màn hình | Trạng thái | Ghi chú review |
|---|---|---|
| Home | ✅ UI từ mock | StoryCarousel, ContinueReadingCard, SectionHeader |
| Library | ✅ UI từ mock | |
| Profile | ✅ UI từ mock | mới merge (PR #3) |
| StoryDetail | ⏳ kiểm tra | AuthorBar, ChapterListItem, RatingStars |
| Reader | ⏳ kiểm tra | màn đọc truyện |
| Write | ⏳ kiểm tra | writer studio |
| Search | ⏳ kiểm tra | SearchBar |
| Alerts | ⏳ kiểm tra | NotificationItem |
| Settings / Streak | ⏳ kiểm tra | SettingRow, StatCard/StatItem |
| Startup | ✅ | màn khởi động |

> ⏳ = cần xác nhận mức hoàn thiện trong buổi review.

---

## 6. Cách chạy (để reviewer reproduce)

```bash
cd MMA301_SE1940/bookReader
npm install
npx expo install --fix     # đồng bộ version cho Expo SDK 54
npx expo start             # mở bằng Expo Go trên điện thoại
```

> Lưu ý: thư mục `android/`, `ios/`, `yarn.lock` cũ (RN 0.84) **không dùng** cho luồng Expo Go.

---

## 7. Checklist Review (điểm chấm trong buổi)

**Kiến trúc & cấu trúc**
- [ ] Component đặt đúng tầng Atomic (atom không chứa logic màn hình)?
- [ ] Có import qua barrel `@/components/...` thay vì path tương đối dài?
- [ ] Model dùng chung từ `src/models`, không khai báo type trùng lặp?

**Theme & UI**
- [ ] Màu/spacing lấy từ token (`useTheme()`), không hard-code hex?
- [ ] Font khai báo đúng family-theo-weight, không dựa `fontWeight: 'bold'`?
- [ ] UI responsive (SafeArea, scroll) qua `SafeScreen`/`ScreenContainer`?

**Code quality**
- [ ] Không còn `console.log` / code chết / file Example thừa?
- [ ] Đặt tên props/biến nhất quán, có type rõ ràng (tránh `any`)?
- [ ] Tách logic lặp ra hook/util thay vì copy giữa các screen?

**Chức năng**
- [ ] Điều hướng giữa các tab/màn hoạt động đúng?
- [ ] Mock data tách bạch, dễ thay bằng API sau này?
- [ ] Có xử lý loading/empty/error (Skeleton, DefaultError, ErrorBoundary)?

**Quy trình Git**
- [ ] PR có mô tả rõ, review chéo trước khi merge?
- [ ] Branch đặt tên theo convention (vd `QuangHD_UIHomePage`, `profile`)?

---

## 8. Known issues / TODO (chốt hướng sau review)

- [ ] **Redux Toolkit đã cài nhưng chưa có store/slice** → cần quyết định scope state
      (auth, reading progress, theme...) hay tạm bỏ nếu chưa cần.
- [ ] **Firebase đã cài nhưng chưa cấu hình** → chốt: Auth? Firestore? lưu gì?
- [ ] Thay dần mock data → service layer thật.
- [ ] Hoàn thiện các screen còn ⏳ (Reader, Write, StoryDetail, Search, Settings, Streak).
- [ ] Dọn `src/screens/Example` và asset/boilerplate thừa của TCM nếu không dùng.
- [ ] Bổ sung test (hiện chỉ có `Example.test.tsx`).

---

## 9. Phân công (điền trong buổi review)

| Thành viên | Phụ trách | PR liên quan |
|---|---|---|
| QuangHD (SE180734) | Layout / Home UI | #2 |
| baolong772004 | Profile | #3 |
| ... | ... | ... |

---

*File này là điểm khởi đầu cho buổi review — cập nhật cột trạng thái & phân công khi họp.*
