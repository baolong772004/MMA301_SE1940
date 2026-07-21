import * as z from 'zod';

export const importResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverUri: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  chapters: z.array(z.any()).optional(),
}).partial().passthrough();

export type ImportResponse = z.infer<typeof importResponseSchema>;
