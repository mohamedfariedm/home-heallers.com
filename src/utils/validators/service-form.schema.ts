import { z } from 'zod';
import { messages } from '@/config/messages'; // Assuming you have custom messages

// Define the validation schema for the service form
export const ServiceFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  slug: z.object({
    en: z.string().min(1, 'English slug is required'),
    ar: z.string().min(1, 'Arabic slug is required'),
  }),
  description: z.object({
    en: z.string().min(1, 'English Description is required'),
    ar: z.string().min(1, 'Arabic Description is required'),
  }),
  meta_title: z.object({
    en: z.string().min(1, 'meta title EN is required'),
    ar: z.string().min(1, 'meta title AR is required'),
  }),
  meta_description: z.object({
    en: z.string().min(1, 'meta Description EN is required'),
    ar: z.string().min(1, 'meta Description AR is required'),
  }),
  // category can be null (no category selected)
  category_id: z.union([z.number().positive('Category must be a valid category'), z.null()]).optional(),
});

// Generate form types from zod validation schema
export type ServiceFormInput = z.infer<typeof ServiceFormSchema>;
