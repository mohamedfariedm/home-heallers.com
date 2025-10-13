import { z } from "zod";

export const createPermitionSchema = z.object({
name: z.string().min(1, 'English permission name is required')
// guard_name: z.string().min(1, { message: "Guard Name is required" }),

});

export type CreatePermitionInput = z.infer<typeof createPermitionSchema>;
