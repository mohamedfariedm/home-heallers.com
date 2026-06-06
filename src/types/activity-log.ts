export interface ActivityLog {
  id: number;
  log_name: string | null;
  description: string;
  event: 'created' | 'updated' | 'deleted' | null;
  batch_uuid: string | null;
  created_at: string;
  subject: ActivityLogSubject;
  causer: ActivityLogCauser;
  properties: Record<string, unknown>;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}

export interface ActivityLogSubject {
  type: string | null;
  id: number | null;
}

export interface ActivityLogCauser {
  type: string | null;
  id: number | null;
  name: string;
  email: string | null;
}

export interface ActivityLogStatistics {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_event: Record<string, number>;
  top_users: Array<{
    type: string;
    id: number;
    name: string;
    count: number;
  }>;
  most_modified_models: Array<{
    type: string;
    count: number;
  }>;
}

export interface ActivityLogFilterOptions {
  events: string[];
  log_names: string[];
  subject_types: Array<{ value: string; label: string }>;
  causer_types: Array<{ value: string; label: string }>;
}

export interface ActivityLogPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ActivityLogListResponse {
  data: ActivityLog[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: ActivityLogPaginationMeta;
  statistics: ActivityLogStatistics;
  message: string;
}

export interface ActivityLogResponse {
  data: ActivityLog;
  message: string;
}
