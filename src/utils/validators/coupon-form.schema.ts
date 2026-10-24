import { z, type Schema } from 'zod';
import {
  COUPON_CODE_MAX,
  COUPON_DESCRIPTION_MAX,
  COUPON_FIXED_MAX,
  COUPON_NAME_MAX,
  COUPON_PERCENT_MAX,
} from '@/utils/coupon-constants';

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

function couponNameSchema(label: 'English' | 'Arabic') {
  const required = `${label} coupon name is required`;
  return z
    .string()
    .min(1, required)
    .max(
      COUPON_NAME_MAX,
      `${label} name must be ${COUPON_NAME_MAX} characters or fewer, including spaces`
    )
    .refine((value) => value.trim().length > 0, required);
}

function couponDescriptionSchema(label: 'English' | 'Arabic') {
  return z
    .string()
    .max(
      COUPON_DESCRIPTION_MAX,
      `${label} description must be ${COUPON_DESCRIPTION_MAX} characters or fewer, including spaces`
    )
    .optional()
    .transform((value) => value ?? '');
}

function couponCodeSchema(originalCode?: string | null) {
  const original = (originalCode ?? '').trim();

  return z
    .string()
    .min(1, 'Coupon code is required')
    .superRefine((value, ctx) => {
      const trimmed = value.trim();
      if (!trimmed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Coupon code is required',
        });
        return;
      }
      if (original && trimmed === original) return;
      if (!new RegExp(`^[A-Za-z0-9]{1,${COUPON_CODE_MAX}}$`).test(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Use 1–${COUPON_CODE_MAX} letters or digits (A–Z, 0–9). No spaces or dashes`,
        });
      }
    })
    .transform((value) => {
      const trimmed = value.trim();
      if (original && trimmed === original) return original;
      return trimmed.toUpperCase();
    });
}

export function createCouponFormSchema(originalCode?: string | null) {
  return z
    .object({
      name: z.object({
        en: couponNameSchema('English'),
        ar: couponNameSchema('Arabic'),
      }),
      description: z.object({
        en: couponDescriptionSchema('English'),
        ar: couponDescriptionSchema('Arabic'),
      }),
      code: couponCodeSchema(originalCode),
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
      global: z.boolean().default(false),
      service_ids: z.array(z.number()).catch([]),
      city_ids: z.array(z.number()).catch([]),
      country_ids: z.array(z.number()).catch([]),
      phone_numbers: z.array(z.string()).catch([]),
      insurance_types: z.array(insuranceTypeSchema).catch([]),
      patient_segments: z.array(z.string()).catch([]),
      free_service_ids: z.array(z.number()).catch([]),
    })
    .superRefine((data, ctx) => {
      if (data.type === 'percent' || data.type === 'fixed') {
        const max =
          data.type === 'percent' ? COUPON_PERCENT_MAX : COUPON_FIXED_MAX;
        const label = data.type === 'percent' ? 'Percentage' : 'Fixed amount';
        const wholeNumber = data.value != null && /^\d+$/.test(data.value);
        const amount = wholeNumber ? Number(data.value) : NaN;
        if (!wholeNumber || amount < 1 || amount > max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} must be a whole number from 1 to ${max}`,
            path: ['value'],
          });
        }
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
}

export const couponFormSchema = createCouponFormSchema();

export type CouponFormInput = z.infer<typeof couponFormSchema>;

export function couponFormValidationSchema(originalCode?: string | null) {
  return createCouponFormSchema(originalCode) as Schema<CouponFormInput>;
}
