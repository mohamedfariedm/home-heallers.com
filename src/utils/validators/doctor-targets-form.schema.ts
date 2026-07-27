import { z } from 'zod';

export const doctorTargetCreateSchema = z
  .object({
    doctor_ids: z.array(z.string()).min(1, 'Select at least one doctor'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    required_sessions: z.coerce
      .number({ invalid_type_error: 'Required sessions is required' })
      .int()
      .min(1, 'Must be at least 1'),
    incentive_amount: z.coerce
      .number({ invalid_type_error: 'Incentive amount is required' })
      .min(0, 'Must be 0 or greater'),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

export type DoctorTargetCreateInput = z.infer<typeof doctorTargetCreateSchema>;

export const doctorTargetEditSchema = z
  .object({
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    required_sessions: z.coerce
      .number({ invalid_type_error: 'Required sessions is required' })
      .int()
      .min(1, 'Must be at least 1'),
    incentive_amount: z.coerce
      .number({ invalid_type_error: 'Incentive amount is required' })
      .min(0, 'Must be 0 or greater'),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

export type DoctorTargetEditInput = z.infer<typeof doctorTargetEditSchema>;

export const doctorTargetAdjustSchema = z.object({
  completed_sessions: z.coerce
    .number({ invalid_type_error: 'Completed sessions is required' })
    .int()
    .min(0, 'Must be 0 or greater'),
  reason: z.string().trim().min(1, 'Reason is required'),
});

export type DoctorTargetAdjustInput = z.infer<typeof doctorTargetAdjustSchema>;

export const doctorTargetRetargetSchema = z
  .object({
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

export type DoctorTargetRetargetInput = z.infer<
  typeof doctorTargetRetargetSchema
>;

export const doctorTargetApproveSchema = z.object({
  approval_note: z.string().optional().nullable(),
});

export type DoctorTargetApproveInput = z.infer<typeof doctorTargetApproveSchema>;

export const withdrawalRejectSchema = z.object({
  rejection_reason: z.string().trim().min(1, 'Rejection reason is required'),
});

export type WithdrawalRejectInput = z.infer<typeof withdrawalRejectSchema>;
