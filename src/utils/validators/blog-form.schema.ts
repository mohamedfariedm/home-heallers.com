import { z } from 'zod';
import { entitySeoFieldsSchema } from '@/utils/validators/entity-seo.schema';

export const BlogFormSchema = z.object({
  nameEN: z.string().min(1, 'Name (EN) is required'),
  nameAR: z.string().min(1, 'Name (AR) is required'),
  descriptionEN: z.string().min(1, 'Description (EN) is required'),
  descriptionAR: z.string().min(1, 'Description (AR) is required'),
  date: z.string().min(1, 'Date is required'),
  show_in_home_page: z.boolean(),
  relatedBlogs: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  ...entitySeoFieldsSchema,
});

export type BlogFormInput = z.infer<typeof BlogFormSchema>;
