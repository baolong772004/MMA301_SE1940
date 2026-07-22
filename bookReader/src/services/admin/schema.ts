import * as z from 'zod';

export const adminStatsSchema = z.object({
  usersCount: z.number().catch(0),
  storiesCount: z.number().catch(0),
  pendingStories: z.number().catch(0),
  chaptersCount: z.number().catch(0),
  commentsCount: z.number().catch(0),
  openReports: z.number().catch(0),
  coinsToppedUp: z.number().catch(0),
  coinsSpentOnUnlocks: z.number().catch(0),
  unlockedCount: z.number().optional(),
  activeUsers30d: z.number().optional(),
  newUsersThisMonth: z.number().optional(),
}).partial().passthrough();

export type AdminStats = z.infer<typeof adminStatsSchema>;

export const userManagementSchema = z.object({
  id: z.string(),
  name: z.string().catch(''),
  email: z.string().catch(''),
  handle: z.string().nullable().optional(),
  avatarUri: z.string().nullable().optional(),
  role: z.string().catch('READER'),
  status: z.string().catch('ACTIVE'),
  coinBalance: z.number().catch(0),
  createdAt: z.string().catch(''),
}).partial().passthrough();

export type UserManagement = z.infer<typeof userManagementSchema>;

export const userListResponseSchema = z.object({
  items: z.array(userManagementSchema),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
}).partial().passthrough();

export type UserListResponse = z.infer<typeof userListResponseSchema>;
