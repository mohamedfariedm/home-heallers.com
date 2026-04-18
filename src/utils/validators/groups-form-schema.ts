import { z } from 'zod';

export const groupFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  doctor_ids: z.array(z.string()).optional().default([]),
});

export type GroupFormInput = z.infer<typeof groupFormSchema>;
