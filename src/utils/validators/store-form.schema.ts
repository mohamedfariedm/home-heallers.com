import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const StoreFormSchema = z.object({
    name: z.string(),
    is_active: z.number().optional(),
    // region_id: z.number().optional(),
    city_id: z.number(),
    retailer_id: z.number(),
    // channel_code: z.string().optional(),
    type: z.string(),
    contact_number: z.string(),
    address: z.string(),
    contact_email: z.string(),
    store_code:z.string(),
    image:z.any().optional(),
    lat: z.string(),
    lng: z.string(),
});

// generate form types from zod validation schema
export type StoreFormInput = z.infer<typeof StoreFormSchema>;
