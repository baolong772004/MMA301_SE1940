import { instance } from '@/services/instance';
import { chapterDetailSchema, ChapterDetail, ChapterComment } from './schema';

export const ChaptersServices = {
  /**
   * Nội dung chương (VIP chưa mở khóa -> locked=true, content=null) (GET /chapters/:id)
   */
  getChapterDetail: async (id: string): Promise<ChapterDetail> => {
    const response = await instance.get(`chapters/${id}`).json();
    return chapterDetailSchema.parse(response);
  },

  /**
   * Cập nhật / auto-save nháp chương (tác giả) (PATCH /chapters/:id)
   */
  updateChapter: async (
    id: string,
    data: {
      coinPrice?: number;
      content?: string;
      isVip?: boolean;
      title?: string;
    },
  ) => {
    const response = await instance.patch(`chapters/${id}`, { json: data }).json();
    return response;
  },

  /**
   * Xuất bản chương (tác giả) (POST /chapters/:id/publish)
   */
  publishChapter: async (id: string) => {
    const response = await instance.post(`chapters/${id}/publish`).json();
    return response;
  },

  /**
   * Xóa chương (tác giả) (DELETE /chapters/:id)
   */
  deleteChapter: async (id: string) => {
    const response = await instance.delete(`chapters/${id}`).json<{ message: string }>();
    return response;
  },

  /**
   * Mở khóa chương VIP bằng xu (POST /chapters/:id/unlock)
   */
  unlockChapter: async (id: string) => {
    const response = await instance.post(`chapters/${id}/unlock`).json<{
      chapterId: string;
      coinBalance: number;
      unlocked: boolean;
    }>();
    return response;
  },

  /**
   * Danh sách bình luận chương (GET /chapters/:id/comments)
   */
  getComments: async (id: string): Promise<ChapterComment[]> => {
    const response = await instance.get(`chapters/${id}/comments`).json();
    return response as ChapterComment[];
  },

  /**
   * Bình luận vào đoạn văn trong chương (POST /chapters/:id/comments)
   */
  createComment: async (
    id: string,
    data: {
      content: string;
      paragraphIndex?: number;
    },
  ) => {
    const response = await instance.post(`chapters/${id}/comments`, { json: data }).json();
    return response;
  },
};
