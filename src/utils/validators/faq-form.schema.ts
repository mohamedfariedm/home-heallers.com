import { z } from 'zod';

export const FaqFormSchema = z.object({
  title_question: z.object({
    en: z.string().min(1, { message: 'English question is required' }),
    ar: z.string().min(1, { message: 'Arabic question is required' }),
  }),
  answer: z.object({
    en: z.string().min(1, { message: 'English answer is required' }),
    ar: z.string().min(1, { message: 'Arabic answer is required' }),
  }),
});

export type FaqFormInput = z.infer<typeof FaqFormSchema>;
