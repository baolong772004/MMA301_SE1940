import { instance } from '@/services/instance';
import { CreateReportInput, reportResponseSchema, ReportResponse } from './schema';

export const ReportServices = {
  /**
   * Báo cáo truyện / bình luận vi phạm (mọi user) (POST /reports)
   */
  createReport: async (input: CreateReportInput): Promise<ReportResponse> => {
    const response = await instance.post('reports', { json: input }).json();
    return reportResponseSchema.parse(response);
  },
};
