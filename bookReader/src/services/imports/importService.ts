import { instance } from '@/services/instance';
import { importResponseSchema, ImportResponse } from './schema';

export const ImportServices = {
  /**
   * Import file EPUB/PDF vào thư viện cá nhân (parse thành truyện + chương) (POST /imports)
   * 
   * @param fileUri Đường dẫn của file trên thiết bị (ví dụ: file://...)
   * @param fileName Tên file (ví dụ: book.epub)
   * @param fileType Kiểu MIME của file (ví dụ: application/epub+zip hoặc application/pdf)
   */
  importFile: async (fileUri: string, fileName: string, fileType: string): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    const response = await instance.post('imports', {
      body: formData,
      // Lưu ý: Không set header 'Content-Type' thủ công khi gửi FormData để ky/fetch tự tính toán boundary.
    }).json();

    return importResponseSchema.parse(response);
  },
};
