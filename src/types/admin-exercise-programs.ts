export type ExerciseProgramStatus = 'draft' | 'sent';

export type ExerciseProgramDay =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

/** API name fields may be plain strings or `{ en, ar }` translation maps. */
export type LocalizedText = string | { en?: string; ar?: string } | null;

export interface ExerciseProgramDoctor {
  id: number;
  name?: LocalizedText;
  email?: string | null;
}

export interface ExerciseProgramClient {
  id: number;
  name?: LocalizedText;
  phone?: string | null;
  email?: string | null;
}

export interface ExerciseProgramSession {
  id: number;
  reservation_date_id?: number;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  label?: string | null;
}

export interface ExerciseProgramItemExercise {
  id: number;
  title?: LocalizedText;
  thumbnail_url?: string | null;
  media_url?: string | null;
  is_public?: boolean;
  is_rehabilitation?: boolean;
}

export interface ExerciseProgramItem {
  id?: number;
  exercise_id: number;
  sets?: number | null;
  repetitions?: number | null;
  duration_seconds?: number | null;
  frequency_per_day?: number | null;
  days?: ExerciseProgramDay[] | null;
  notes?: string | null;
  exercise?: ExerciseProgramItemExercise | null;
}

export interface ExerciseProgram {
  id: number;
  doctor_id: number;
  client_id: number;
  reservation_date_id: number;
  reservation_id?: number | null;
  title: LocalizedText;
  instructions?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: ExerciseProgramStatus;
  sent_at?: string | null;
  has_feedback?: boolean;
  doctor?: ExerciseProgramDoctor | null;
  client?: ExerciseProgramClient | null;
  session?: ExerciseProgramSession | null;
  items?: ExerciseProgramItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseProgramsListResponse {
  data: ExerciseProgram[];
  message?: string;
  links?: Record<string, unknown>;
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    path?: string;
    per_page?: number;
    to?: number;
    total?: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ExerciseProgramCreateInput {
  doctor_id: number;
  client_id: number;
  reservation_date_id: number;
  title: string;
  instructions?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  send_after_save?: boolean;
  items: Array<{
    exercise_id: number;
    sets?: number | null;
    repetitions?: number | null;
    duration_seconds?: number | null;
    frequency_per_day?: number | null;
    days?: ExerciseProgramDay[] | null;
    notes?: string | null;
  }>;
}

export type ExerciseProgramUpdateInput = Omit<
  ExerciseProgramCreateInput,
  'send_after_save'
> & {
  id: number;
};
