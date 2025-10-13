import { z } from "zod";

export const packageFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English package name is required"),
    ar: z.string().min(1, "Arabic package name is required"),
  }),
  description: z.object({
    en: z.string().min(1, "English description is required"),
    ar: z.string().min(1, "Arabic description is required"),
  }),
  discount: z
    .string()
    .min(1, "Discount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid discount format"),
  price: z.string().min(1, "Price is required"),
  type: z.enum(["package", "offer"], { message: "Invalid package type" }),

  // ✅ NEW: required sessions_count field
 sessions_count: z.coerce
  .number({
    required_error: "Sessions count is required",
    invalid_type_error: "Sessions count must be a number",
  })
  .min(1, { message: "Sessions count must be at least 1" }),
  
  doctors: z
    .array(
      z.object({
        value: z.number(),
        label: z.string(),
      })
    ).optional(), // Make doctors optional
});

export type PackageFormInput = z.infer<typeof packageFormSchema>;
