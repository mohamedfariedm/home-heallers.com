import { z } from 'zod';
import { entitySeoFieldsSchema } from '@/utils/validators/entity-seo.schema';

const redirectUrlField = z
  .string()
  .max(2048, 'Redirect URL must not exceed 2048 characters')
  .refine(
    (value) =>
      !value ||
      !/^(javascript|data|vbscript):/i.test(value.trim()),
    'Redirect URL format is invalid'
  )
  .optional();

export const BlogFormSchema = z.object({
  nameEN: z.string().min(1, 'Name (EN) is required'),
  nameAR: z.string().min(1, 'Name (AR) is required'),
  descriptionEN: z.string().min(1, 'Description (EN) is required'),
  descriptionAR: z.string().min(1, 'Description (AR) is required'),
  date: z.string().min(1, 'Date is required'),
  show_in_home_page: z.boolean(),
  redirectUrlEN: redirectUrlField,
  redirectUrlAR: redirectUrlField,
  relatedBlogs: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  ...entitySeoFieldsSchema,
});

export type BlogFormInput = z.infer<typeof BlogFormSchema>;
