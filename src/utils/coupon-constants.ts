import type {
  CouponDiscountType,
  EligibleUserType,
  FirstBookingScope,
} from '@/types/coupon';

export const COUPON_TYPES: { value: CouponDiscountType; label: string }[] = [
  { value: 'percent', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed amount (SAR)' },
  { value: 'free_service', label: 'Free service' },
  { value: 'free_delivery', label: 'Free delivery' },
];

export const ELIGIBLE_USER_TYPES: { value: EligibleUserType; label: string }[] =
  [
    { value: 'any', label: 'Any user' },
    { value: 'new', label: 'New users only' },
    { value: 'existing', label: 'Existing users only' },
  ];

export const FIRST_BOOKING_SCOPES: {
  value: FirstBookingScope;
  label: string;
}[] = [
  { value: 'none', label: 'No first-booking rule' },
  { value: 'any_service', label: 'First paid booking (any service)' },
  { value: 'category', label: 'First booking in category' },
];

export const PATIENT_SEGMENT_OPTIONS = [
  { value: 'عادي', label: 'عادي' },
  { value: 'فضي', label: 'فضي' },
  { value: 'ذهبي', label: 'ذهبي' },
  { value: 'VIP', label: 'VIP' },
];

export function formatCouponType(type: CouponDiscountType): string {
  return COUPON_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function formatCouponValue(
  type: CouponDiscountType,
  value: number
): string {
  if (type === 'percent') return `${value}%`;
  if (type === 'fixed') return `${value} SAR`;
  if (type === 'free_service') return 'Free service';
  if (type === 'free_delivery') return 'Free delivery';
  return String(value);
}
