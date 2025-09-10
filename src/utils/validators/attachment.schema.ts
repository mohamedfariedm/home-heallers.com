import { z } from 'zod';

export const passwordFormSchema = z.object({
  title: z.object({
    ar: z.string(),
    en: z.string(),
    value:z.any()
  }),
  description: z.object({
    ar: z.string(),
    en: z.string(),
  }),
  additional: z.any(),
  children: z.any(),
  sliders: z.any(),
  active: z.any(),
  attachment:z.any(),
});

export type PasswordFormTypes = z.infer<typeof passwordFormSchema>;
