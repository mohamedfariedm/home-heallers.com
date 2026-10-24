import { z } from 'zod';

export const MAX_WALLET_AMOUNT = 99999999.99;

export const walletAdjustSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Amount is required' })
    .gt(0, 'Amount must be greater than 0')
    .max(MAX_WALLET_AMOUNT, 'Amount is too large')
    .refine((v) => Math.round(v * 100) / 100 === v, 'Use at most 2 decimal places'),
  reason: z
    .string()
    .trim()
    .min(3, 'Reason is required (at least 3 characters)')
    .max(500, 'Reason must be 500 characters or fewer'),
  confirmed: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm to continue' }),
  }),
});

export type WalletAdjustInput = z.infer<typeof walletAdjustSchema>;
