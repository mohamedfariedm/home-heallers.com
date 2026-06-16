import type { ActivityLog } from '@/types/activity-log';

export interface DoctorRef {
  id: number;
  name: string;
  email: string | null;
  mobile_number: string | null;
  specialist: string | null;
  status: boolean | null;
}

export interface EventBucket {
  event: string | null;
  count: number;
  link: string;
}

export interface RecordEventBucket {
  event: string | null;
  count: number;
}

export interface LogNameBucket {
  log_name: string;
  count: number;
  link: string;
}

export interface ModelBucket {
  type: string;
  count: number;
}

export interface DoctorReservationRef {
  id: number;
  status: number | string | null;
  client_name: string | null;
  service_name: string | null;
  created_at: string;
}

export interface DoctorActivityRow {
  doctor: DoctorRef;
  total_actions: number;
  reservations_count: number;
  by_event: EventBucket[];
  by_log_name: LogNameBucket[];
  most_modified_models: ModelBucket[];
  first_activity_at: string | null;
  last_activity_at: string | null;
  today: number;
  this_week: number;
  this_month: number;
  active_days: number;
  link: string;
}

export interface DoctorActivityStatistics {
  total_doctors: number;
  total_actions: number;
  today: number;
  this_week: number;
  this_month: number;
  by_event: EventBucket[];
  by_log_name: LogNameBucket[];
  most_modified_models: ModelBucket[];
  top_doctors: Array<{ id: number; name: string; count: number; link: string }>;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface DoctorActivityListResponse {
  data: DoctorActivityRow[];
  links: PaginationLinks;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    last_page?: number;
    path?: string;
    to?: number | null;
    [key: string]: unknown;
  };
  statistics: DoctorActivityStatistics;
  message: string;
}

export type DoctorActivityLogItem = ActivityLog;

export interface DoctorReservationActivityRow {
  reservation: DoctorReservationRef;
  total_actions: number;
  by_event: RecordEventBucket[];
  first_activity_at: string | null;
  last_activity_at: string | null;
  activities: DoctorActivityLogItem[];
}

export interface DoctorActivitySummary {
  total_actions: number;
  reservations_count: number;
  by_event: EventBucket[];
  by_log_name: LogNameBucket[];
  most_modified_models: ModelBucket[];
  first_activity_at: string | null;
  last_activity_at: string | null;
  today: number;
  this_week: number;
  this_month: number;
  active_days: number;
}

export interface DoctorActivityDetailResponse {
  data: {
    doctor: DoctorRef;
    summary: DoctorActivitySummary;
    reservations: DoctorReservationActivityRow[];
  };
  links: PaginationLinks;
  meta: { current_page: number; per_page: number; total: number };
  message: string;
}

export interface DoctorActivityFilterOptions {
  doctors: Array<{ id: number; name: string; email: string | null }>;
  events: string[];
  log_names: string[];
  subject_types: Array<{ value: string; label: string }>;
}

export interface DoctorActivityExportResponse {
  message: string;
  download_url: string;
  file_name: string;
  expires_in: string;
}
