import { z } from 'zod';
import { messages } from '@/config/messages';

// form zod validation schema
export const ProductFormSchema = z.object({
    category_id: z.number(),
    sub_category_id: z.number(),
    sub_sub_category_id: z.number(),
    brand_id: z.number(),
    barcode: z.string(),
    model: z.string(),
    sku_code: z.string(),
    description: z.string(),
    freatures_category: z.string().optional(),
    features: z.string().optional(),
    image:z.any(),
    
});

// generate form types from zod validation schema
export type ProductFormInput = z.infer<typeof ProductFormSchema>;
