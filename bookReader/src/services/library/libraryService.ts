import { instance } from '@/services/instance';
import { libraryResponseSchema, LibraryResponse, LibraryItem } from './schema';

export const LibraryServices = {
  /**
   * Thư viện cá nhân (nhóm theo kệ COMPLETED, READING, SAVED) (GET /library)
   */
  getLibrary: async (): Promise<LibraryResponse> => {
    const response = await instance.get('library').json();
    const result = libraryResponseSchema.safeParse(response);
    if (!result.success) {
      console.warn('Zod parse warning in libraryResponseSchema:', result.error);
      return response as any;
    }
    return result.data;
  },

  /**
   * Danh sách đang đọc dở (GET /library/continue)
   */
  getContinueReading: async (): Promise<LibraryItem[]> => {
    const response = await instance.get('library/continue').json();
    return response as LibraryItem[];
  },

  /**
   * Thêm / chuyển kệ truyện trong thư viện (PUT /library/:storyId)
   */
  setShelf: async (storyId: string, shelf: 'SAVED' | 'READING' | 'COMPLETED') => {
    const response = await instance.put(`library/${storyId}`, { json: { shelf } }).json();
    return response;
  },

  /**
   * Xóa truyện khỏi thư viện (DELETE /library/:storyId)
   */
  removeFromLibrary: async (storyId: string) => {
    const response = await instance.delete(`library/${storyId}`).json<{ message: string }>();
    return response;
  },

  /**
   * Vị trí đọc dở của một truyện (GET /library/:storyId/progress)
   */
  getProgress: async (storyId: string) => {
    const response = await instance.get(`library/${storyId}/progress`).json();
    return response;
  },

  /**
   * Lưu vị trí đọc dở (PUT /library/:storyId/progress)
   */
  upsertProgress: async (storyId: string, chapterId: string, position?: number) => {
    const response = await instance
      .put(`library/${storyId}/progress`, {
        json: { chapterId, position },
      })
      .json();
    return response;
  },
};
