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
}
