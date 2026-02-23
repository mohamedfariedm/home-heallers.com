import { z } from "zod";

export const createNationalitySchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    ar: z.string().min(1, 'Arabic name is required'),
  }),
});

export type CreateNationalityInput = z.infer<typeof createNationalitySchema>;
