import { z } from 'zod';
import { messages } from '@/config/messages'; // Assuming you have custom messages

// Define the validation schema for the service form
export const ServiceFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }).refine(data => data.en !== data.ar, {
    message: 'The English and Arabic names must be different',
    path: ['en', 'ar'],
  }),
  slug: z.object({
    en: z.string().min(1, 'English slug is required'),
    ar: z.string().min(1, 'Arabic slug is required'),
  }).refine(data => data.en !== data.ar, {
    message: 'The English and Arabic slugs must be different',
    path: ['en', 'ar'],
  }),
  description: z.object({
    en: z.string().min(1, 'English Description is required'),
    ar: z.string().min(1, 'Arabic Description is required'),
  }).refine(data => data.en !== data.ar, {
    message: 'The English and Arabic Descriptions must be different',
    path: ['en', 'ar'],
  }),
  meta_title: z.object({
    en: z.string().min(1, 'meta title EN is required'),
    ar: z.string().min(1, 'meta title AR is required'),
  }),
  meta_description: z.object({
    en: z.string().min(1, 'meta Description EN is required'),
    ar: z.string().min(1, 'meta Description AR is required'),
  }),
  category_id: z.number().min(1, 'Category is required').positive('Category must be a valid category'),
});

// Generate form types from zod validation schema
export type ServiceFormInput = z.infer<typeof ServiceFormSchema>;
