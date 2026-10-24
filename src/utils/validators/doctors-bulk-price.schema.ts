import { z } from 'zod';

export const doctorsBulkPriceSchema = z.object({
  doctor_session_price: z
    .string()
    .trim()
    .refine(
      (value) => value !== '' && Number.isInteger(Number(value)) && Number(value) >= 300,
      'Doctor session price must be a whole number of at least 300'
    ),
});

export type DoctorsBulkPriceInput = z.infer<typeof doctorsBulkPriceSchema>;
