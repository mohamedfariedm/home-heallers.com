import { z, type Schema } from 'zod';

const optionalNumberString = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^\d+(\.\d{1,2})?$/.test(val),
    'Invalid number format'
  );

const insuranceTypeSchema = z.object({
  insurance_id: z.string().optional(),
  insurance_company: z.string().optional(),
});

export const couponFormSchema = z
  .object({
    name: z.object({
      en: z.string().min(1, 'English coupon name is required'),
      ar: z.string().min(1, 'Arabic coupon name is required'),
    }),
    description: z.object({
      en: z.preprocess(
        (val) => (val == null ? '' : String(val)),
        z.string()
      ),
      ar: z.preprocess(
        (val) => (val == null ? '' : String(val)),
        z.string()
      ),
    }),
    code: z.string().min(1, 'Coupon code is required'),
    type: z.enum(['percent', 'fixed', 'free_service', 'free_delivery'], {
      message: 'Invalid coupon type',
    }),
    value: z.string().optional(),
    max_discount: optionalNumberString,
    starts_at: z.date().nullable().optional(),
    ends_at: z.date().nullable().optional(),
    max_redemptions: optionalNumberString,
    daily_limit: optionalNumberString,
    per_client_limit: optionalNumberString,
    min_order_subtotal: optionalNumberString,
    eligible_user_type: z.enum(['any', 'new', 'existing']),
    first_booking_scope: z.enum(['none', 'any_service', 'category']),
    first_booking_category_id: z.string().optional(),
    is_active: z.boolean(),
    service_ids: z.array(z.number()).catch([]),
    free_service_ids: z.array(z.number()).catch([]),
    city_ids: z.array(z.number()).catch([]),
    country_ids: z.array(z.number()).catch([]),
    phone_numbers: z.array(z.string()).catch([]),
    insurance_types: z.array(insuranceTypeSchema).catch([]),
    patient_segments: z.array(z.string()).catch([]),
  })
  .superRefine((data, ctx) => {
    if (
      (data.type === 'percent' || data.type === 'fixed') &&
      (!data.value || !/^\d+(\.\d{1,2})?$/.test(data.value))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Value is required',
        path: ['value'],
      });
    }
    if (data.starts_at && data.ends_at && data.ends_at < data.starts_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['ends_at'],
      });
    }
    if (
      data.first_booking_scope === 'category' &&
      !data.first_booking_category_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category is required for first-booking scope',
        path: ['first_booking_category_id'],
      });
    }
    if (data.type === 'free_service' && data.free_service_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one free service',
        path: ['free_service_ids'],
      });
    }
  });

export type CouponFormInput = z.infer<typeof couponFormSchema>;

export const couponFormValidationSchema =
  couponFormSchema as Schema<CouponFormInput>;
