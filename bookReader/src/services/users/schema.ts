import * as z from 'zod';

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().nullable(),
  avatarUri: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: z.string(),
  createdAt: z.string(),
  followersCount: z.number(),
  followingCount: z.number(),
  storiesCount: z.number(),
  isFollowing: z.boolean(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
