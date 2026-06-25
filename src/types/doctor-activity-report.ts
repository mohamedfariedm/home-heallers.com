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

export interface DoctorReservationRef {
  id: number;
  status: number | string | null;
  client_name: string | null;
  service_name: string | null;
  created_at: string;
}

export interface DoctorActivityRow {
  doctor: DoctorRef;
  reservations_count: number;
  by_status: StatusBucket[];
  by_source_campaign: SourceCampaignBucket[];
  link: string;
}

export interface DoctorActivityStatistics {
  total_doctors: number;
  total_reservations: number;
  by_status: StatusBucket[];
  by_source_campaign: SourceCampaignBucket[];
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

export interface DoctorReservationActivityRow {
  reservation: DoctorReservationRef;
}

export interface DoctorActivitySummary {
  reservations_count: number;
  by_status: StatusBucket[];
  by_source_campaign: SourceCampaignBucket[];
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
