import { z } from 'zod';
import { entitySeoFieldsSchema } from '@/utils/validators/entity-seo.schema';

export const ServiceFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  description: z.object({
    en: z.string().min(1, 'English Description is required'),
    ar: z.string().min(1, 'Arabic Description is required'),
  }),
  category_id: z.union([z.number().positive('Category must be a valid category'), z.null()]).optional(),
  ...entitySeoFieldsSchema,
});

export type ServiceFormInput = z.infer<typeof ServiceFormSchema>;
