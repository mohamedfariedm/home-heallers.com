import { z } from 'zod';

const dayEnum = z.enum([
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
]);

const optionalNumberString = z
  .string()
  .optional()
  .nullable()
  .refine(
    (value) =>
      value == null ||
      value === '' ||
      (!Number.isNaN(Number(value)) && Number(value) >= 0),
    'Must be a valid number'
  );

export const exerciseProgramItemSchema = z.object({
  exercise_id: z.string().min(1, 'Exercise is required'),
  sets: optionalNumberString,
  repetitions: optionalNumberString,
  duration_seconds: optionalNumberString,
  frequency_per_day: optionalNumberString,
  days: z.array(dayEnum).optional(),
  notes: z.string().optional().nullable(),
});

export const exerciseProgramFormSchema = z.object({
  doctor_id: z.string().min(1, 'Doctor is required'),
  client_id: z.string().min(1, 'Patient is required'),
  reservation_date_id: z.string().min(1, 'Session is required'),
  title: z.string().min(1, 'Title is required'),
  instructions: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  send_after_save: z.boolean().optional(),
  items: z
    .array(exerciseProgramItemSchema)
    .min(1, 'Add at least one exercise item'),
});

export type ExerciseProgramFormInput = z.infer<typeof exerciseProgramFormSchema>;
export type ExerciseProgramItemFormInput = z.infer<
  typeof exerciseProgramItemSchema
>;

export const EXERCISE_PROGRAM_DAYS = [
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
] as const;
