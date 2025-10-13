import { z } from 'zod';

export const reservationFormSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  service_id: z.string().optional(),
  doctor_id: z.string().optional(),
  category_id: z.string().min(1, 'Category ID is required'),
  address_id: z.string().min(1, 'Address ID is required'),
  sessions_count: z.string().min(1, 'Sessions count is required'),
  sub_total: z.string().min(1, 'Sub total is required'),
  fees: z.string().min(1, 'Fees is required'),
  total_amount: z.string().min(1, 'Total amount is required'),
  transaction_reference: z.string().min(1, 'Transaction reference is required'),
  pain_location: z.string().min(1, 'Pain location is required'),
  notes: z.string().min(1, 'Notes is required'),
  status: z
    .enum(["1", "2", "3", "4", "5", "6"], {
      errorMap: () => ({ message: "Status is required" }),
    })
    .default("1"),
  dates: z.array(
    z.object({
      start_time: z.string().min(1, 'Start time is required'),
      end_time: z.string().min(1, 'End time is required'),
      time_period: z.string().min(1, 'Time period is required'),
    })
  ).min(1, 'At least one date is required'),
});

export type ReservationFormInput = z.infer<typeof reservationFormSchema>;