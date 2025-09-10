import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const RetailerFormSchema = z.object({
  name: z
    .string(),
    is_active: z.number().optional(),
    
});

// generate form types from zod validation schema
export type RetailerFormInput = z.infer<typeof RetailerFormSchema>;
