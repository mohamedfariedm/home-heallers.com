import { z } from 'zod';

export const countryFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English country name is required'),
    ar: z.string().min(1, 'Arabic country name is required'),
  }),
  currency: z.object({
    en: z.string().min(1, 'English currency is required'),
    ar: z.string().min(1, 'Arabic currency is required'),
  }),
  status: z.enum(['Published', 'Draft']),
});

export type CountryFormInput = z.infer<typeof countryFormSchema>;
