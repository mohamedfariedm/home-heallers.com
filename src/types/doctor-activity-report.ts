export interface DoctorRef {
  id: number;
  name: string;
  email: string | null;
  mobile_number: string | null;
  specialist: string | null;
  status: boolean | null;
}

export interface StatusBucket {
  status: string | number | null;
  count: number;
  link: string;
}

export interface SourceCampaignBucket {
  source_campaign: string;
  count: number;
  link: string;
}

export interface SessionCountBucket {
  sessions_count: number;
  reservations_count: number;
  total_sessions: number;
}

export interface SessionsStatistics {
  by_session_count: SessionCountBucket[];
  total_sessions: number;
  total_reservations: number;
}

export interface DoctorHistoryAttachment {
  id: string;
  original: string;
  thumbnail: string;
  name?: string;
}

export interface DoctorHistorySession {
  id: number;
  date: string | null;
  time: string | null;
  start_time: string | null;
  end_time: string | null;
  time_period: string | null;
  status: string | null;
  status_label: string | null;
}

export interface DoctorHistoryItem {
  reservation_id: number;
  status: number;
  status_label: string | null;
  type: string;
  paid: boolean;
  sessions_count: number;
  session_price: number | null;
  sub_total: string | number | null;
  total_amount: string | number | null;
  doctor_attachments: DoctorHistoryAttachment[];
  patient: { id: number; name: { ar?: string; en?: string } } | null;
  sessions: DoctorHistorySession[];
  created_at: string;
  updated_at: string;
}

export interface DoctorActivityRow {
  doctor: DoctorRef;
  reservations_count: number;
  by_status: StatusBucket[];
  by_source_campaign: SourceCampaignBucket[];
  sessions_statistics?: SessionsStatistics;
  link: string;
}

export interface DoctorActivityStatistics {
  total_doctors: number;
  total_reservations: number;
  by_status: StatusBucket[];
  by_source_campaign: SourceCampaignBucket[];
  sessions_statistics?: SessionsStatistics;
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

export interface DoctorActivitySummary {
  reservations_count: number;
  by_status: StatusBucket[];
  by_source_campaign: SourceCampaignBucket[];
  sessions_statistics?: SessionsStatistics;
}

export interface DoctorActivityDetailResponse {
  data: {
    doctor: DoctorRef;
    summary: DoctorActivitySummary;
    reservations: DoctorHistoryItem[];
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
