import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const FeaturesFormSchema = z.object({
  name: z
    .string(),
    is_active: z.number().optional(),
  
});

// generate form types from zod validation schema
export type FeaturesFormInput = z.infer<typeof FeaturesFormSchema>;
