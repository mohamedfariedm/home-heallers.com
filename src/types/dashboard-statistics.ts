/** Additive statistics shapes from Backend dashboard work. */

export interface StatLinkItem {
  count: number;
  link: string;
}

export interface FailureReasonStat {
  status_reason: string;
  count: number;
  failed_count: number;
  closed_count: number;
  link: string;
}

export interface FollowUpAgingBucket {
  bucket: '0-24h' | '1-3d' | '3-7d' | '>7d';
  count: number;
  link: string;
}

export interface FollowUpAgingStat {
  open_count: number;
  avg_age_hours: number;
  never_followed_up_count: number;
  sla_breach_count: number;
  sla_breach_link: string;
  buckets: FollowUpAgingBucket[];
}

export interface AgentPerformanceStat {
  agent_id: number;
  name: string;
  roles: string[];
  is_deleted: boolean;
  supports_count: number;
  contact_actions_count: number;
  success_marked_count: number;
  reservations_created_count: number;
  link: string;
}

export interface ConvertedViaLeadStat {
  leads_count: number;
  reservations_count: number;
  sessions_count: number;
  link: string;
}

export interface OfferConversionStat {
  offer: string;
  leads_count: number;
  converted_leads: number;
  reservations_count: number;
  sessions_count: number;
  conversion_rate: number;
  link: string;
}

export interface CancellationReasonStat {
  status_reason: string;
  count: number;
  canceled_count: number;
  failed_count: number;
  link: string;
}

export interface UpcomingSessionsStat {
  count: number;
  reservations_count: number;
  link: string;
}

export interface ProfileCompletenessField {
  field: 'national_id' | 'date_of_birth' | 'gender' | 'city_id';
  complete_count: number;
  missing_or_invalid_count: number;
  link: string;
}

export interface ProfileCompletenessStat {
  patients_count: number;
  average_percent: number;
  buckets: Array<{
    bucket: '0-49' | '50-74' | '75-100';
    count: number;
    link: string;
  }>;
  by_field: ProfileCompletenessField[];
}

export interface DoctorWorkloadRow {
  doctor_id: number;
  name: string;
  is_active: boolean;
  scheduled_sessions: number;
  sessions_completed: number;
  cancelled_sessions: number;
  link: string;
}

export interface DoctorCityDemandRow {
  city_id: number | null;
  name: string;
  reservations_count: number;
  sessions_count: number;
  doctors_served_count: number;
}

export interface DoctorListStatistics {
  active_doctors: number;
  working_doctors: number;
  scheduled_sessions: number;
  sessions_completed: number;
  sessions_per_working_doctor: number;
  by_doctor: DoctorWorkloadRow[];
  by_city: DoctorCityDemandRow[];
}
