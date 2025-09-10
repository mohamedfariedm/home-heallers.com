import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const JourneyFormSchema = z.object({
    user_id: z.string(),
    store_id: z.string(),
    priority: z.string(),
    date: z.date().optional(),
    date_from: z.date().optional(),
    date_to: z.date().optional()
});

// generate form types from zod validation schema
export type JourneyFormInput = z.infer<typeof JourneyFormSchema>;
