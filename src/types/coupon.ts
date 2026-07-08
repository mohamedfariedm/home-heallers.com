export type CouponDiscountType =
  | 'percent'
  | 'fixed'
  | 'free_service'
  | 'free_delivery';

export type EligibleUserType = 'any' | 'new' | 'existing';

export type FirstBookingScope = 'none' | 'any_service' | 'category';

export type CouponInsuranceFilter = {
  insurance_id?: number | null;
  insurance_company?: string | null;
};

export type TranslatedField = {
  en?: string;
  ar?: string;
};

export type MarketCoupon = {
  id: string;
  code: string;
  name: TranslatedField;
  description?: TranslatedField | null;
  type: CouponDiscountType;
  value: number;
  max_discount?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  max_redemptions?: number | null;
  daily_limit?: number | null;
  per_client_limit?: number | null;
  min_order_subtotal?: number | null;
  eligible_user_type: EligibleUserType;
  first_booking_scope: FirstBookingScope;
  first_booking_category_id?: number | null;
  is_active: boolean;
  service_ids: number[];
  free_service_ids: number[];
  city_ids: number[];
  country_ids: number[];
  phone_numbers: string[];
  insurance_types: CouponInsuranceFilter[];
  patient_segments: string[];
  redemptions_count?: number;
  created_at?: string;
  updated_at?: string;
};
