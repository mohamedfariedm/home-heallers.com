import { z } from "zod";

export const createPermitionSchema = z.object({
name: z.object({
    en: z.string().min(1, 'English city name is required'),
    ar: z.string().min(1, 'Arabic city name is required'),
  }),
// guard_name: z.string().min(1, { message: "Guard Name is required" }),

});

export type CreatePermitionInput = z.infer<typeof createPermitionSchema>;
