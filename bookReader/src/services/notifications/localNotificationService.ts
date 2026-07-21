import { storage } from '../storage';

export type LocalNotification = {
  id: string;
  message: string;
  time: string;
  unread: boolean;
  iconName?: string;
  avatarUri?: string;
  createdAt: number;
};

const DEFAULT_NOTIFICATIONS: LocalNotification[] = [];

// Sử dụng key v3 sạch để đảm bảo bỏ qua mọi dữ liệu mock đã được lưu trước đó trên máy ảo/giả lập
const STORAGE_KEY = 'app_notifications_v3';

export const LocalNotificationServices = {
  getNotifications: (): LocalNotification[] => {
    const dataStr = storage.getString(STORAGE_KEY);
    if (!dataStr) {
      storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    try {
      const parsed = JSON.parse(dataStr) as LocalNotification[];
      return parsed.map((n) => {
        const diffMs = Date.now() - n.createdAt;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeStr = 'Vừa xong';
        if (diffDays > 0) {
          timeStr = `${diffDays} ngày trước`;
        } else if (diffHours > 0) {
          timeStr = `${diffHours} giờ trước`;
        } else if (diffMins > 0) {
          timeStr = `${diffMins} phút trước`;
        }
        return { ...n, time: timeStr };
      });
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  addNotification: (message: string, iconName?: string, avatarUri?: string) => {
    const list = LocalNotificationServices.getNotifications();
    const newNotif: LocalNotification = {
      id: String(Date.now() + Math.random()),
      message,
      time: 'Vừa xong',
      unread: true,
      iconName,
      avatarUri,
      createdAt: Date.now(),
    };
    const updated = [newNotif, ...list];
    storage.set(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  markAllAsRead: (): LocalNotification[] => {
    const list = LocalNotificationServices.getNotifications();
    const updated = list.map((n) => ({ ...n, unread: false }));
    storage.set(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clearAll: () => {
    storage.set(STORAGE_KEY, JSON.stringify([]));
  },
};
