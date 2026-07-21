import * as z from 'zod';

export const storyAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().nullable().optional(),
  avatarUri: z.string().nullable().optional(),
});

export const storySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  coverUri: z.string().optional().nullable(),
  genres: z.array(z.string()).optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  visibility: z.string().optional(),
  moderation: z.string().optional(),
  viewCount: z.number().optional(),
  rating: z.number().optional(),
  ratingCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  author: storyAuthorSchema.optional(),
});

export const storyListResponseSchema = z.object({
  items: z.array(storySchema),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
});

export const storyQuerySchema = z.object({
  genre: z.string().optional(),
  limit: z.number().min(1).max(50).optional(),
  page: z.number().min(1).optional(),
  q: z.string().optional(),
  sort: z.enum(['newest', 'rating', 'views']).optional(),
  status: z.enum(['ongoing', 'completed']).optional(),
});

export type Story = z.infer<typeof storySchema>;
export type StoryListResponse = z.infer<typeof storyListResponseSchema>;
export type StoryQuery = z.infer<typeof storyQuerySchema>;
