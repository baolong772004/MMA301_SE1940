import * as z from 'zod';

export const chapterDetailSchema = z.object({
  id: z.string(),
  storyId: z.string(),
  index: z.number(),
  title: z.string(),
  content: z.string().nullable().optional(),
  isVip: z.boolean().optional(),
  coinPrice: z.number().optional(),
  status: z.string().optional(),
  wordCount: z.number().optional(),
  pageStart: z.number().nullable().optional(),
  pageEnd: z.number().nullable().optional(),
  autoSavedAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  locked: z.boolean().optional(),
  nextChapterId: z.string().nullable().optional(),
  previousChapterId: z.string().nullable().optional(),
  story: z
    .object({
      id: z.string(),
      title: z.string(),
      authorId: z.string(),
      moderation: z.string().optional(),
      author: z
        .object({
          id: z.string(),
          name: z.string(),
          handle: z.string().nullable().optional(),
          avatarUri: z.string().nullable().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type ChapterDetail = z.infer<typeof chapterDetailSchema>;

export const commentSchema = z.object({
  id: z.string(),
  chapterId: z.string(),
  userId: z.string(),
  paragraphIndex: z.number().optional(),
  content: z.string(),
  createdAt: z.string().optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      handle: z.string().nullable().optional(),
      avatarUri: z.string().nullable().optional(),
    })
    .optional(),
});

export type ChapterComment = z.infer<typeof commentSchema>;
