import { number, z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const FeaturesFormSchema = z.object({
  name: z
    .string(),
    is_active: z.number().optional(),
    BG_id:z.string(),
    VCP_id:z.string(),
    BU_id:z.string(),
  
});

// generate form types from zod validation schema
export type FeaturesFormInput = z.infer<typeof FeaturesFormSchema>;
