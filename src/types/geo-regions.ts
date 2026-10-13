export type GeoLang = 'ar' | 'en';

export interface GeoBilingual {
  ar: string;
  en: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type GeoRegionStatus = 'active' | 'inactive' | 'expired';

export type GeoCouponStatus =
  | 'none'
  | 'ok'
  | 'inactive'
  | 'not_started'
  | 'expired'
  | 'exhausted';

export interface GeoRegionCoupon {
  id: string;
  code: string;
  name: Partial<GeoBilingual> | string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface GeoRegion {
  id: number;
  country_id: number;
  country?: { id: number; name: Partial<GeoBilingual> | string } | null;
  name: GeoBilingual;
  push_title: GeoBilingual;
  push_body: GeoBilingual;
  points: GeoPoint[];
  polygon?: number[][];
  bounds?: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
  } | null;
  priority: number;
  is_active: boolean;
  expires_at: string | null;
  status: GeoRegionStatus;
  market_coupon_id: string | null;
  coupon: GeoRegionCoupon | null;
  coupon_status: GeoCouponStatus;
  visits_count: number;
  sent_count: number;
  created_at: string;
  updated_at: string;
}

export interface GeoRegionPayload {
  country_id: number;
  name: GeoBilingual;
  push_title: GeoBilingual;
  push_body: GeoBilingual;
  points: GeoPoint[];
  priority: number;
  market_coupon_id: string | null;
  is_active: boolean;
  expires_at: string | null;
}

export type GeoVisitStatus = 'pending' | 'sent' | 'skipped' | 'failed';

export type GeoSkipReason =
  | 'daily_cap'
  | 'lower_priority'
  | 'region_inactive'
  | 'coupon_unavailable';

export interface GeoRegionVisit {
  id: number;
  client: { id: number; name: string; mobile: string } | null;
  day: string;
  entered_at: string | null;
  status: GeoVisitStatus;
  skip_reason: GeoSkipReason | null;
  notified_at: string | null;
  created_at: string;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
