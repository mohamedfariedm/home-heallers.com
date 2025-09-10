import { z } from 'zod';

export const BlogFormSchema = z.object({
nameEN: z.string().min(1, 'Name (EN) is required'),
  nameAR: z.string().min(1, 'Name (AR) is required'),
  descriptionEN: z.string().min(1, 'Description (EN) is required'),
  descriptionAR: z.string().min(1, 'Description (AR) is required'),
  date: z.string().min(1, 'Date is required'),
  show_in_home_page: z.boolean(),
  metaTitleEN: z.string().min(1, 'Meta Title (EN) is required'),
  metaTitleAR: z.string().min(1, 'Meta Title (AR) is required'),
  metaDescriptionEN: z.string().min(1, 'Meta Description (EN) is required'),
  metaDescriptionAR: z.string().min(1, 'Meta Description (AR) is required'),
  relatedBlogs: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

export type BlogFormInput = z.infer<typeof BlogFormSchema>;
