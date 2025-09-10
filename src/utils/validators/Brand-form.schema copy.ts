import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const BrandFormSchema = z.object({
  name: z
    .string(),
    image:z.any()

});

// generate form types from zod validation schema
export type BrandFormInput = z.infer<typeof BrandFormSchema>;
