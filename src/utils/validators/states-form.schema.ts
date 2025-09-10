import { z } from 'zod';

export const statesFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English states name is required'),
    ar: z.string().min(1, 'Arabic states name is required'),
  }),
  city_id: z.number().min(1, 'Country is required'),
  status: z.enum(['Published', 'Draft']),
});

export type StatesFormInput = z.infer<typeof statesFormSchema>;