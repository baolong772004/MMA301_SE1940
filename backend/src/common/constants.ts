// Các "enum" dạng hằng số vì SQLite không hỗ trợ enum trong Prisma.
export const Roles = {
  ADMIN: 'ADMIN',
  READER: 'READER',
  WRITER: 'WRITER',
} as const;
export type Role = (typeof Roles)[keyof typeof Roles];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
} as const;

export const Moderation = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const;

export const ChapterStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export const Shelf = {
  COMPLETED: 'COMPLETED',
  READING: 'READING',
  SAVED: 'SAVED',
} as const;

export const TransactionType = {
  TOPUP: 'TOPUP',
  UNLOCK: 'UNLOCK',
} as const;

export const ReportStatus = {
  DISMISSED: 'DISMISSED',
  OPEN: 'OPEN',
  RESOLVED: 'RESOLVED',
} as const;
