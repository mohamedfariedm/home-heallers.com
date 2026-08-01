import { z } from 'zod';

const localizedOptional = z.object({
  en: z.string().optional().default(''),
  ar: z.string().optional().default(''),
});

export const exerciseFormSchema = z
  .object({
    title: z.object({
      en: z.string().optional().default(''),
      ar: z.string().optional().default(''),
    }),
    description: localizedOptional,
    instructions: localizedOptional,
    category_id: z.string().optional().nullable(),
    body_part: z.string().optional().nullable(),
    equipment: z.string().optional().nullable(),
    target: z.string().optional().nullable(),
    muscle_group: z.string().optional().nullable(),
    secondary_muscles: z.string().optional().default(''),
    media_type: z.enum(['image', 'video', 'pdf', 'other']).optional().nullable(),
    is_active: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (!data.title.en?.trim() && !data.title.ar?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one title (English or Arabic) is required',
        path: ['title', 'en'],
      });
    }
  });

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;

export const exerciseImportSchema = z.object({
  source: z.string().optional().nullable(),
  body_part: z.string().optional().nullable(),
  limit: z.coerce.number().min(1).max(1324).optional().nullable(),
  skip_media: z.boolean().optional().default(false),
  fresh: z.boolean().optional().default(false),
});

export type ExerciseImportFormInput = z.infer<typeof exerciseImportSchema>;
