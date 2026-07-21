import { instance } from '@/services/instance';
import { adminStatsSchema, AdminStats, UserManagement, userListResponseSchema } from './schema';

export const AdminServices = {
  /**
   * Thống kê toàn app (admin) (GET /admin/stats)
   */
  getStats: async (): Promise<AdminStats> => {
    const response = await instance.get('admin/stats').json();
    return adminStatsSchema.parse(response);
  },

  /**
   * Danh sách user (admin) (GET /admin/users)
   */
  getUsers: async (): Promise<UserManagement[]> => {
    const response = await instance.get('admin/users').json();
    const parsed = userListResponseSchema.parse(response);
    return parsed.items ?? [];
  },

  /**
   * Khóa/mở user, đổi vai trò (admin) (PATCH /admin/users/:id)
   */
  updateUser: async (id: string, data: { status?: 'ACTIVE' | 'BANNED'; role?: 'READER' | 'WRITER' | 'ADMIN' }) => {
    const response = await instance.patch(`admin/users/${id}`, { json: data }).json();
    return response;
  },

  /**
   * Danh sách truyện theo trạng thái kiểm duyệt (admin) (GET /admin/stories)
   */
  getStories: async (moderation?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any[]> => {
    const searchParams = moderation ? { moderation } : undefined;
    const response = await instance.get('admin/stories', { searchParams }).json();
    return response as any[];
  },

  /**
   * Duyệt / từ chối truyện (admin) (PATCH /admin/stories/:id/moderation)
   */
  moderateStory: async (id: string, moderation: 'APPROVED' | 'REJECTED') => {
    const response = await instance.patch(`admin/stories/${id}/moderation`, { json: { moderation } }).json();
    return response;
  },

  /**
   * Danh sách report (admin) (GET /admin/reports)
   */
  getReports: async (status?: 'OPEN' | 'RESOLVED' | 'DISMISSED'): Promise<any[]> => {
    const searchParams = status ? { status } : undefined;
    const response = await instance.get('admin/reports', { searchParams }).json();
    return response as any[];
  },

  /**
   * Xử lý report (admin) (PATCH /admin/reports/:id)
   */
  resolveReport: async (id: string, data: { status: 'RESOLVED' | 'DISMISSED'; action?: 'HIDE_COMMENT' | 'REJECT_STORY' | 'BAN_USER' }) => {
    const response = await instance.patch(`admin/reports/${id}`, { json: data }).json();
    return response;
  },
};
