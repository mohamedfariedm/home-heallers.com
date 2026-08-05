export type ExerciseMediaType = 'image' | 'video' | 'pdf' | 'other';
export type RehabilitationReviewStatus =
  | 'not_reviewed'
  | 'pending'
  | 'approved'
  | 'rejected';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LocalizedString = {
  en: string;
  ar: string;
};

export interface RehabilitationCategory {
  id: number;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  is_active: boolean;
}

export interface Exercise {
  id: number;
  external_ref: string | null;
  title: LocalizedString;
  description: LocalizedString;
  instructions: LocalizedString;
  category_id: number | null;
  body_part: string | null;
  equipment: string | null;
  target: string | null;
  muscle_group: string | null;
  secondary_muscles: string[];
  media_type: ExerciseMediaType | null;
  media_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_public: boolean;
  is_rehabilitation: boolean;
  rehabilitation_review_status: RehabilitationReviewStatus;
  rehab_category_id: number | null;
  rehab_category: RehabilitationCategory | null;
  difficulty: ExerciseDifficulty | null;
  clinical_notes: string | null;
  contraindications: string | null;
  created_by_doctor_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseFilterOptions {
  body_parts: string[];
  equipment: string[];
  targets: string[];
  muscle_groups: string[];
  rehabilitation_review_statuses: RehabilitationReviewStatus[];
  rehabilitation_categories: RehabilitationCategory[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ExercisesListResponse {
  data: Exercise[];
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

export type ExerciseFilterOptionsResponse = ApiResponse<ExerciseFilterOptions>;

export interface ExerciseImportInput {
  source?: string | null;
  body_part?: string | null;
  limit?: number | null;
  skip_media?: boolean;
  fresh?: boolean;
  rehabilitation_only?: boolean;
}

export interface RehabilitationReviewInput {
  id: number;
  status: 'approved' | 'rejected';
  rehab_category_id?: number | null;
  difficulty?: ExerciseDifficulty | null;
  clinical_notes?: string | null;
  contraindications?: string | null;
}

export interface ExerciseImportResult {
  queued: boolean;
}
