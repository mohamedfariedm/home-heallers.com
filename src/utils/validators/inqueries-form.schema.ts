import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const InquerieFormSchema = z.object({
    inquiry_id:z.string(),
    response:z.string(),
    seen:z.string(),
});

// generate form types from zod validation schema
export type InquerieFormInput = z.infer<typeof InquerieFormSchema>;
