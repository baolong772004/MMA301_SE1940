import { instance } from '@/services/instance';
import { userProfileSchema, UserProfile } from './schema';

export const UserServices = {
  /**
   * Lấy hồ sơ công khai của người dùng / tác giả theo ID (GET /users/:id)
   */
  getProfile: async (id: string): Promise<UserProfile> => {
    const response = await instance.get(`users/${id}`).json();
    return userProfileSchema.parse(response);
  },

  /**
   * Lấy danh sách truyện công khai của tác giả theo ID (GET /users/:id/stories)
   */
  getAuthorStories: async (id: string) => {
    const response = await instance.get(`users/${id}/stories`).json();
    return response;
  },

  /**
   * Theo dõi người dùng / tác giả (POST /users/:id/follow)
   */
  followUser: async (id: string) => {
    const response = await instance.post(`users/${id}/follow`).json<{ following: boolean }>();
    return response;
  },

  /**
   * Bỏ theo dõi người dùng / tác giả (DELETE /users/:id/follow)
   */
  unfollowUser: async (id: string) => {
    const response = await instance.delete(`users/${id}/follow`).json<{ following: boolean }>();
    return response;
  },

  /**
   * Thống kê streak đọc sách của bản thân (GET /users/me/streak)
   */
  getStreak: async (): Promise<{ currentStreak: number; longestStreak: number; totalReadingDays: number }> => {
    const response = await instance.get('users/me/streak').json<{
      currentStreak: number;
      longestStreak: number;
      totalReadingDays: number;
    }>();
    return response;
  },

  /**
   * Thống kê chi tiết truyện (views, rating, unlock/comment từng chương) (GET /stories/:id/stats)
   * Chỉ tác giả mới được xem.
   */
  getStoryStats: async (storyId: string) => {
    const response = await instance.get(`stories/${storyId}/stats`).json<{
      title: string;
      viewCount: number;
      rating: number;
      ratingCount: number;
      totalRevenueCoin: number;
      chapters: Array<{
        id: string;
        index: number;
        title: string;
        wordCount: number;
        isVip: boolean;
        coinPrice: number;
        status: string;
        unlockCount: number;
        commentCount: number;
      }>;
    }>();
    return response;
  },

  /**
   * Cập nhật hồ sơ cá nhân (tên, avatarUri, handle) (PATCH /users/me)
   */
  updateProfile: async (data: { avatarUri?: string; handle?: string; name?: string }) => {
    const response = await instance.patch('users/me', { json: data }).json();
    return response;
  },
};
