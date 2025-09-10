import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const createBrandSchema = z.object({
  brandName: z
    .string(),
    Permissions: z.array(
      z.number()
    ).optional(),
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
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
