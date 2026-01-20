import { z } from 'zod';

export const couponFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English coupon name is required'), // English coupon name required
    ar: z.string().min(1, 'Arabic coupon name is required'), // Arabic coupon name required
  }),
  code: z.string().min(1, 'Coupon code is required'), // Coupon code required
  discount: z.string().min(1, 'Discount is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount format'), // Validate discount format (e.g., 100.00)
  type: z.enum(['نسبه مئويه', 'عريضه'], { message: 'Invalid coupon type' }), // Added validation for type
  doctors: z.array(z.object({
    value: z.number(),
    label: z.string(),
  })).min(1, 'At least one doctor is required'), // At least one doctor is required
});

export type CouponFormInput = z.infer<typeof couponFormSchema>;
