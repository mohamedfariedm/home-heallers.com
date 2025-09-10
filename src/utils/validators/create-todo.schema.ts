import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const createToDoSchema = z.object({
    title: z
    .string(),
    description: z
    .string(),

  // roleColor: z
  //   .object({
  //     r: z.number(),
  //     g: z.number(),
  //     b: z.number(),
  //     a: z.number(),
  //   })
  //   .optional(),
});

// generate form types from zod validation schema
export type CreateToDoInput = z.infer<typeof createToDoSchema>;
