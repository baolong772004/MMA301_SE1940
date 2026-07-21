import * as z from 'zod';

export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  type: z.enum(['TOPUP', 'UNLOCK', 'REWARD', 'WITHDRAW', 'OTHER']).catch('OTHER'),
  description: z.string().nullable().optional(),
  chapterId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const walletResponseSchema = z.object({
  coinBalance: z.number(),
  transactions: z.array(transactionSchema),
});

export type WalletResponse = z.infer<typeof walletResponseSchema>;
