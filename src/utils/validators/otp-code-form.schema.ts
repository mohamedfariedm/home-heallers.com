import { z } from 'zod';

export const updateOtpCodeSchema = z.object({
  otp: z
    .string()
    .max(10, 'OTP must be at most 10 characters')
    .optional()
    .or(z.literal('')),
  otp_expires_at: z.string().optional().or(z.literal('')),
});

export type UpdateOtpCodeInput = z.infer<typeof updateOtpCodeSchema>;
