import { z } from 'zod';

export const cityFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English city name is required'),
    ar: z.string().min(1, 'Arabic city name is required'),
  }),
  country_id: z.number().min(1, 'Country is required'),
  status: z.enum(['Published', 'Draft']),
});

export type CityFormInput = z.infer<typeof cityFormSchema>;