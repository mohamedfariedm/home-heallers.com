import { z } from 'zod';

const localizedOptional = z.object({
  en: z.string().optional(),
  ar: z.string().optional(),
});

export const exerciseFormSchema = z
  .object({
    title: z.object({
      en: z.string().optional(),
      ar: z.string().optional(),
    }),
    description: localizedOptional,
    instructions: localizedOptional,
    category_id: z.string().optional().nullable(),
    body_part: z.string().optional().nullable(),
    equipment: z.string().optional().nullable(),
    target: z.string().optional().nullable(),
    muscle_group: z.string().optional().nullable(),
    secondary_muscles: z.string().optional(),
    media_type: z.enum(['image', 'video', 'pdf', 'other']).optional().nullable(),
    is_active: z.boolean().optional(),
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
  limit: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        (Number.isInteger(Number(value)) &&
          Number(value) >= 1 &&
          Number(value) <= 1324),
      'Limit must be between 1 and 1324'
    )
    .optional()
    .nullable(),
  skip_media: z.boolean().optional(),
  fresh: z.boolean().optional(),
  rehabilitation_only: z.boolean().optional(),
});

export type ExerciseImportFormInput = z.infer<typeof exerciseImportSchema>;

export const rehabilitationReviewSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rehab_category_id: z.string().optional().nullable(),
    difficulty: z
      .enum(['beginner', 'intermediate', 'advanced'])
      .optional()
      .nullable(),
    clinical_notes: z.string().optional().nullable(),
    contraindications: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'approved' && !data.rehab_category_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rehabilitation category is required when approving',
        path: ['rehab_category_id'],
      });
    }
  });

export type RehabilitationReviewFormInput = z.infer<
  typeof rehabilitationReviewSchema
>;
