import { z } from 'zod';

export const pationtFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, { message: "English permission name is required" }),
    ar: z.string().min(1, { message: "Arabic permission name is required" }),
  }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().optional(),
  mobile: z.string().min(1, 'Mobile number is required'),
  code: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  blood_group: z.string().optional(),
  languages_spoken: z.string().min(1, 'Language is required'),
  national_id: z.string().min(1, 'National ID is required'),
  nickname: z.string().optional(),
  gender: z.string().min(1, 'Gender is required'),
  insurance_id: z.string().optional(),
  insurance_company: z.string().optional(),
  nationality_id: z.union([z.number(), z.string()]).optional(),
  country_id: z.union([z.number(), z.string()]).optional(),
  city_id: z.union([z.number(), z.string()]).optional(),
});

export type PationtsFormInput = z.infer<typeof pationtFormSchema>;