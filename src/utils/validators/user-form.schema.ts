import { z } from "zod";

// Base schema
const baseUserFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
    ar: z.string().min(1, "Arabic name is required"),
  }),
  email: z.string().email("Invalid email"),
  roles: z.array(z.number()).min(1, "At least one role is required"),
  mobile: z.string().optional(),
});

// Schema for creating users (password required)
export const createUserFormSchema = baseUserFormSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(1, "Password confirmation is required"),
})
  .refine((data) => {
    return data.password === data.password_confirmation;
  }, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Schema for updating users (password optional)
export const updateUserFormSchema = baseUserFormSchema.extend({
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
})
  .refine((data) => {
    // If password is provided, it must be at least 6 characters
    if (data.password && data.password.length > 0) {
      return data.password.length >= 8;
    }
    return true;
  }, {
    message: "Password must be at least 8 characters",
    path: ["password"],
  })
  .refine((data) => {
    // If password is provided, password_confirmation must match
    if (data.password && data.password.length > 0) {
      return data.password === data.password_confirmation;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })
  .refine((data) => {
    // If password_confirmation is provided, password must also be provided
    if (data.password_confirmation && data.password_confirmation.length > 0) {
      return data.password && data.password.length > 0;
    }
    return true;
  }, {
    message: "Please enter password",
    path: ["password"],
  });

// Default export for backward compatibility (update schema - password optional)
export const userFormSchema = updateUserFormSchema;

export type UserFormInput = z.infer<typeof updateUserFormSchema>;
