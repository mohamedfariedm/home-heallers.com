import { z } from 'zod';

export const pationtFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, { message: "English permission name is required" }),
    ar: z.string().min(1, { message: "Arabic permission name is required" }),
  }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().optional(),
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .refine(
      (val) => {
        const digits = String(val || '').replace(/\D/g, '');
        // Reject all-zero placeholders like 0500000000 / 0000000000
        if (!digits) return false;
        if (/^0+$/.test(digits)) return false;
        if (/^05?0+$/.test(digits)) return false;
        return true;
      },
      {
        message:
          'The mobile looks like a placeholder number. Enter the real mobile number.',
      }
    ),
  code: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  blood_group: z.string().optional(),
  languages_spoken: z.string().min(1, 'Language is required'),
  national_id: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || !String(val).trim()) return true;
        const digits = String(val).replace(/\D/g, '');
        if (!/^[12]\d{9}$/.test(digits)) return false;
        // Reject placeholders: single repeated digit or sequential 1234567890
        if (/^(\d)\1{9}$/.test(digits)) return false;
        if (digits === '1234567890') return false;
        return true;
      },
      {
        message:
          'National ID must be a valid 10-digit Saudi ID/Iqama, or leave empty when unknown',
      }
    ),
  nickname: z.string().optional(),
  gender: z.string().min(1, 'Gender is required'),
  insurance_id: z.string().optional(),
  insurance_company: z.string().optional(),
  nationality_id: z.union([z.number(), z.string()]).optional(),
  country_id: z.union([z.number(), z.string()]).optional(),
  city_id: z.union([z.number(), z.string()]).optional(),
});

export type PationtsFormInput = z.infer<typeof pationtFormSchema>;