import * as z from 'zod';
import { storySchema } from '../stories/schema';

export const libraryItemSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  storyId: z.string().optional(),
  shelf: z.enum(['SAVED', 'READING', 'COMPLETED']),
  lastReadChapterId: z.string().nullable().optional(),
  lastReadPosition: z.number().optional(),
  updatedAt: z.string().optional(),
  addedAt: z.string().optional(),
  story: storySchema.optional(),
});

export type LibraryItem = z.infer<typeof libraryItemSchema>;

export const libraryResponseSchema = z.object({
  COMPLETED: z.array(libraryItemSchema),
  READING: z.array(libraryItemSchema),
  SAVED: z.array(libraryItemSchema),
});

export type LibraryResponse = z.infer<typeof libraryResponseSchema>;
