/** Allowed discount.type values for POST /coupons/bulk-personal */
export type BulkPersonalDiscountType = 'percentage' | 'percent' | 'fixed';

export type BulkPersonalNotificationChannel =
  | 'push_notification'
  | 'sms'
  | 'whatsapp';

export type BulkPersonalChannelStatus = 'sent' | 'queued' | 'skipped' | 'failed';

export interface BulkPersonalDiscount {
  type: BulkPersonalDiscountType;
  value: number;
}

export interface BulkPersonalCouponRequest {
  customer_ids: number[];
  create_coupon: boolean;
  discount?: BulkPersonalDiscount;
  has_expiration: boolean;
  expires_at?: string | null;
  notification_channels?: BulkPersonalNotificationChannel[];
}

export type BulkPersonalNotifications = Partial<
  Record<BulkPersonalNotificationChannel, BulkPersonalChannelStatus>
>;

export interface BulkPersonalCustomerResult {
  customer_id: number;
  coupon_code: string | null;
  coupon_created: boolean;
  notifications: BulkPersonalNotifications;
  error?: string;
}

export interface BulkPersonalSummary {
  requested_customers: number;
  coupons_created: number;
  failed: number;
}

export interface BulkPersonalCouponData {
  success: boolean;
  summary: BulkPersonalSummary;
  customers: BulkPersonalCustomerResult[];
}

export interface BulkPersonalCouponSuccessResponse {
  message: string;
  data: BulkPersonalCouponData;
}
