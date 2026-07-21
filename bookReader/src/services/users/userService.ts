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
};
