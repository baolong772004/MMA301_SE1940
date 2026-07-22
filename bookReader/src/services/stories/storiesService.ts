import { instance } from '@/services/instance';
import { storyListResponseSchema, StoryListResponse, StoryQuery } from './schema';

export const StoriesServices = {
  /**
   * Lấy danh sách truyện (tìm kiếm + bộ lọc) (GET /stories)
   */
  getStories: async (query?: StoryQuery): Promise<StoryListResponse> => {
    const searchParams: Record<string, string | number> = {};
    if (query?.q) searchParams.q = query.q;
    if (query?.genre) searchParams.genre = query.genre;
    if (query?.status) searchParams.status = query.status;
    if (query?.sort) searchParams.sort = query.sort;
    if (query?.page) searchParams.page = query.page;
    if (query?.limit) searchParams.limit = query.limit;

    const response = await instance.get('stories', { searchParams }).json();
    return storyListResponseSchema.parse(response);
  },

  /**
   * Chi tiết truyện + danh sách chương (GET /stories/:id)
   */
  getStoryDetail: async (id: string) => {
    const response = await instance.get(`stories/${id}`).json<any>();
    return response;
  },

  /**
   * Truyện của tôi (Studio sáng tác) (GET /stories/mine)
   */
  getMyStories: async () => {
    const response = await instance.get('stories/mine').json<any>();
    return response;
  },

  /**
   * Thống kê truyện (chỉ tác giả) (GET /stories/:id/stats)
   */
  getStoryStats: async (id: string) => {
    const response = await instance.get(`stories/${id}/stats`).json<any>();
    return response;
  },

  /**
   * Tạo truyện mới (POST /stories)
   */
  createStory: async (data: {
    coverUri?: string;
    description?: string;
    genres?: string[];
    status?: string;
    title: string;
  }) => {
    const response = await instance.post('stories', { json: data }).json();
    return response;
  },

  /**
   * Đánh giá truyện 1-5 sao (PUT /stories/:id/rating)
   */
  rateStory: async (id: string, stars: number) => {
    const response = await instance.put(`stories/${id}/rating`, { json: { stars } }).json<any>();
    return response;
  },

  /**
   * Cập nhật thông tin truyện (PATCH /stories/:id)
   */
  updateStory: async (
    id: string,
    data: {
      coverUri?: string;
      description?: string;
      genres?: string[];
      status?: string;
      title?: string;
    },
  ) => {
    const response = await instance.patch(`stories/${id}`, { json: data }).json();
    return response;
  },

  /**
   * Xóa truyện (DELETE /stories/:id)
   */
  deleteStory: async (id: string) => {
    const response = await instance.delete(`stories/${id}`).json<{ message: string }>();
    return response;
  },

  /**
   * Thêm chương mới cho truyện (POST /stories/:id/chapters)
   */
  createChapter: async (
    storyId: string,
    data: {
      coinPrice?: number;
      content?: string;
      isVip?: boolean;
      title: string;
    },
  ) => {
    const response = await instance.post(`stories/${storyId}/chapters`, { json: data }).json();
    return response;
  },
};
