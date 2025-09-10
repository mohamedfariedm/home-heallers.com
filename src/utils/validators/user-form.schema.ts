import { z } from "zod";

export const userFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
    ar: z.string().min(1, "Arabic name is required"),
  }),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  password_confirmation: z.string().min(6, "Confirm your password"),
  roles: z.array(z.number()).min(1, "At least one role is required"),
  phone: z.string().optional(),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
