import { z } from "zod";
import { entitySeoFieldsSchema } from "@/utils/validators/entity-seo.schema";

export const createCategoriesSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
  description: z.object({
    en: z.string().min(1, 'English Description is required'),
    ar: z.string().min(1, 'Arabic Description is required'),
  }),
  ...entitySeoFieldsSchema,
});

export type CreateCategoriesInput = z.infer<typeof createCategoriesSchema>;
