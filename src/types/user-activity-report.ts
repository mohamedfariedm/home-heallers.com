import type { ActivityLog } from '@/types/activity-log';

export interface UserRef {
  id: number;
  name: string;
  email: string | null;
  roles: string[];
}

export interface EventBucket {
  event: string | null;
  count: number;
  link: string;
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

export interface UserActivityRow {
  user: UserRef;
  total_actions: number;
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

export interface UserActivityStatistics {
  total_users: number;
  total_actions: number;
  today: number;
  this_week: number;
  this_month: number;
  by_event: EventBucket[];
  by_log_name: LogNameBucket[];
  most_modified_models: ModelBucket[];
  top_users: Array<{ id: number; name: string; count: number; link: string }>;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface UserActivityListResponse {
  data: UserActivityRow[];
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
  statistics: UserActivityStatistics;
  message: string;
}

export type TimelineItem = ActivityLog;

export interface UserActivitySummary {
  total_actions: number;
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

export interface UserActivityDetailResponse {
  data: {
    user: UserRef;
    summary: UserActivitySummary;
    timeline: TimelineItem[];
  };
  links: PaginationLinks;
  meta: { current_page: number; per_page: number; total: number };
  message: string;
}

export interface UserActivityFilterOptions {
  users: Array<{ id: number; name: string; email: string | null }>;
  events: string[];
  log_names: string[];
  subject_types: Array<{ value: string; label: string }>;
}

export interface UserActivityExportResponse {
  message: string;
  download_url: string;
  file_name: string;
  expires_in: string;
}
