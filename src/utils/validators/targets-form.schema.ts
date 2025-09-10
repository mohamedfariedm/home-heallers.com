import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const TargetFormSchema = z.object({
    user_id: z.number(),
    store_id: z.number(),
    product_id: z.number(),
    tgt_quentity: z.string(),
    tgt_value: z.string(),
    date: z.any()
});

// generate form types from zod validation schema
export type TargetFormInput = z.infer<typeof TargetFormSchema>;
