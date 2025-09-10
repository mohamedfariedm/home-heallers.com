import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const StockFormSchema = z.object({
    product_id: z.number().optional(),
    store_id: z.number(),
    price: z.number(),
    quentity: z.number(),
    discount: z.number(),
});

// generate form types from zod validation schema
export type StockFormInput = z.infer<typeof StockFormSchema>;
