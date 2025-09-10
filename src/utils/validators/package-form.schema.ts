import { z } from 'zod';

export const packageFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English package name is required'), // English package name required
    ar: z.string().min(1, 'Arabic package name is required'), // Arabic package name required
  }),
  description: z.object({
    en: z.string().min(1, 'English description is required'),
    ar: z.string().min(1, 'Arabic description is required'),
  }),
  discount: z.string().min(1, 'Discount is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount format'), // Validate discount format (e.g., 100.00)
  price: z.string().min(1, 'Price is required'), // Validate discount format (e.g., 100.00)
  type: z.enum(['package', 'offer'], { message: 'Invalid package type' }), // Added validation for type
  doctors: z.array(z.object({
    value: z.number(),
    label: z.string(),
  })).min(0, 'At least one doctor is required'), // At least one doctor is required
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;
