import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const CategoryFormSchema = z.object({
  name: z
    .string(),
priority: z.string(),
parent_category: z.string().nullable().optional(),
grand_parent_category: z.any().optional(),
is_active: z.number().optional(),    
});

// generate form types from zod validation schema
export type CategoryFormInput = z.infer<typeof CategoryFormSchema>;
