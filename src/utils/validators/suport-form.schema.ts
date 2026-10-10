import { z } from 'zod';
import { LEAD_STATUS_REASONS, LEAD_STATUSES } from '@/config/dashboard-enums';

const leadStatusReasonValues = LEAD_STATUS_REASONS.map((r) => r.value) as [
  string,
  ...string[],
];

export const leadFormSchema = z
  .object({
    name: z.string().optional(),
    first_name: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().optional(),
    offer: z.string().optional(),
    agent_name: z.string().optional(),
    status: z.string().optional(),
    reason: z.string().optional(),
    status_reason: z.string().optional(),
    age: z.union([z.string(), z.number()]).optional(),
    gender: z.string().optional(),
    lead_source: z.string().optional(),
    mobile_phone: z.string().optional(),
    booking_phone_number: z.string().optional(),
    home_phone: z.string().optional(),
    address_1: z.string().optional(),
    city: z.string().max(255, 'City must not exceed 255 characters').optional(),
    state: z.string().max(255, 'State must not exceed 255 characters').optional(),
    source_campaign: z.string().min(1, 'Source is required'),

    activity_code: z.string().optional(),
    call_sub_result: z.string().optional(),
    will_call_us_again_reason: z.string().optional(),
    not_interested_reason: z.string().optional(),
    inquiry_only_reason: z.string().optional(),
    injection_date: z.string().optional(),
    duplicate_lead: z.string().optional(),
    call_count: z.union([z.string(), z.number()]).optional(),
    modified_by: z.string().optional(),
    patient_id: z.string().optional(),
    phonecall_patient_id: z.string().optional(),
    description: z.string().optional(),
    first_call_time: z.string().optional(),
    last_call_result: z.string().optional(),
    last_call_total_duration: z.union([z.string(), z.number()]).optional(),
    last_phone: z.string().optional(),
    last_call_created_by: z.string().optional(),
    booking_count: z.union([z.string(), z.number()]).optional(),
    reservation_date_1: z.string().optional(),
    doctor1: z.string().optional(),
    notes: z.string().optional(),
    ads: z.string().optional(),
    ad_set: z.string().optional(),
    no_show_lost_reason: z.string().optional(),
    specialtie_1: z.string().optional(),
    specialtie_2: z.string().optional(),
    specialtie_3: z.string().optional(),
    ads_name: z.string().optional(),
    modified_on: z.string().optional(),
    created_by: z.string().optional(),
    event_agent_name: z.string().optional(),
    communication_channel: z.string().min(1, 'Communication Channel is required'),
    cc: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val === 'Rework - Whatsapp' ||
          val === 'Rework - Call',
        { message: 'Please select a valid CC option' }
      ),
    rework: z.coerce.number().int().min(0).optional(),
    communication_times: z.coerce.number().int().min(0).optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const status = String(data.status || '').toLowerCase();
    if (status === 'failed' || status === 'closed') {
      if (!data.status_reason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Status reason is required when status is failed or closed',
          path: ['status_reason'],
        });
      } else if (!leadStatusReasonValues.includes(data.status_reason)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid status reason',
          path: ['status_reason'],
        });
      } else if (
        data.status_reason === 'other' &&
        !(data.notes && String(data.notes).trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Notes are required when reason is Other',
          path: ['notes'],
        });
      }
    }
    if (data.status && !(LEAD_STATUSES as readonly string[]).includes(status)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid status',
        path: ['status'],
      });
    }
  });

export type LeadFormInput = z.infer<typeof leadFormSchema>;
