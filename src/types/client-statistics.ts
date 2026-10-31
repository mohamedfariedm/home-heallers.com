import type {
  CancellationReasonStat,
  UpcomingSessionsStat,
} from './dashboard-statistics';

export interface ClientStatusStatistic {
  status: number;
  label: string;
  users_count: number;
  link: string;
}

export interface ClientMetricWithLink {
  users_count: number;
  link: string;
}

export interface ClientListStatistics {
  by_status: Record<string, ClientStatusStatistic>;
  with_coupon: ClientMetricWithLink;
  with_multiple_reservations: ClientMetricWithLink;
  with_multiple_dates_same_reservation: ClientMetricWithLink;
  /** Additive Backend dashboard metrics */
  active_patients_count?: number;
  active_patients_link?: string;
  new_patients_count?: number;
  new_patients_link?: string;
  returning_patients_count?: number;
  returning_patients_link?: string;
  profile_completeness?: import('./dashboard-statistics').ProfileCompletenessStat;
  profiles_without_bookings_count?: number;
  missing_national_id_count?: number;
  missing_national_id_link?: string;
  missing_mobile_count?: number;
  missing_mobile_link?: string;
  shared_mobile_count?: number;
  shared_mobile_link?: string;
  duplicate_identity_count?: number;
  duplicate_identity_link?: string;
  /** Alias of duplicate_identity_count — NOT shared mobiles */
  duplicate_mobile_count?: number;
  duplicate_mobile_link?: string;
  placeholder_value_count?: number;
  placeholder_value_link?: string;
  /** Present only with dashboard.total_revenue permission */
  total_revenue?: number;
  avg_revenue_per_paying_patient?: number;
  avg_booking_value?: number;
}

export type { CancellationReasonStat, UpcomingSessionsStat };

