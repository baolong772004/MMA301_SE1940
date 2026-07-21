import * as z from 'zod';

export const createReportSchema = z.object({
  storyId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string().min(1),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const reportResponseSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  storyId: z.string().nullable().optional(),
  commentId: z.string().nullable().optional(),
  reason: z.string(),
  status: z.enum(['OPEN', 'RESOLVED', 'DISMISSED']),
  createdAt: z.string(),
});

export type ReportResponse = z.infer<typeof reportResponseSchema>;
