import { z } from 'zod';

const optionalPrice = (isValid: (value: number) => boolean, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || isValid(Number(value)), message);

const settingsPrice = optionalPrice(
  (value) => Number.isFinite(value) && value >= 0,
  'Price must be a number of at least 0'
);

export const doctorsBulkPriceSchema = z.object({
  doctor_session_price: optionalPrice(
    (value) => Number.isInteger(value) && value >= 300,
    'Doctor session price must be a whole number of at least 300'
  ),
  session_price: settingsPrice,
  booking_price: settingsPrice,
  reservation_price: settingsPrice,
});

export type DoctorsBulkPriceInput = z.infer<typeof doctorsBulkPriceSchema>;
