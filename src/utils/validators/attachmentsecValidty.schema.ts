import { z } from 'zod';

export const passwordFormSchemaValidty = z.object({
  title: z.object({
    ar: z.string(),
    en: z.string(),
    value: z.any()
  }),
  description: z.object({
    ar: z.string(),
    en: z.string(),
  }),
  additional: z.any(),
  children: z.any(),
  sliders: z.any(),
  active: z.any(),
});

export type PasswordValidtyFormTypes = z.infer<typeof passwordFormSchemaValidty>;
