import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, { message: "English name is required" }),

});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
