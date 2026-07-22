import { instance } from '@/services/instance';

export type ApiNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export const NotificationServices = {
  /**
   * Lấy danh sách thông báo của user hiện tại (GET /notifications)
   */
  getNotifications: async (): Promise<ApiNotification[]> => {
    const response = await instance.get('notifications').json<ApiNotification[]>();
    return response;
  },

  /**
   * Đánh dấu một thông báo là đã đọc (PATCH /notifications/:id/read)
   */
  markAsRead: async (id: string): Promise<void> => {
    await instance.patch(`notifications/${id}/read`).json();
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc (POST /notifications/read-all)
   */
  markAllAsRead: async (): Promise<void> => {
    await instance.post('notifications/read-all').json();
  },
};
