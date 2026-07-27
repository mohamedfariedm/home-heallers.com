export type DashboardNotificationEvent =
  | 'booking.created'
  | 'customer-operation-ticket.created'
  | 'customer-operation-ticket.imported'
  | 'customer.registration.otp-sent'
  | (string & {});

export type DashboardNotificationActionEntity =
  | 'reservation'
  | 'customer_support'
  | 'client'
  | (string & {});

export interface DashboardNotificationAction {
  type: 'route' | (string & {});
  entity: DashboardNotificationActionEntity;
  id: number | null;
}

export interface DashboardNotification {
  id: string;
  type: DashboardNotificationEvent;
  event: DashboardNotificationEvent;
  title: string;
  body: string;
  priority: string;
  sound: string;
  action: DashboardNotificationAction | null;
  extra_data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface DashboardNotificationsPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface DashboardNotificationsListData {
  notifications: DashboardNotification[];
  pagination: DashboardNotificationsPagination;
  unread_count: number;
}

export interface DashboardNotificationsListResponse {
  status: boolean;
  message: string;
  data: DashboardNotificationsListData;
}

export interface DashboardUnreadCountResponse {
  status: boolean;
  message: string;
  data: { unread_count: number };
}

export interface PushTokenRecord {
  id: number;
  platform: 'web' | string;
  token: string;
  revoked_at: string | null;
  last_used_at: string | null;
}

export interface PushTokenResponse {
  status: boolean;
  message: string;
  data: PushTokenRecord;
}

export interface RegisterPushTokenInput {
  platform?: 'web';
  token: string;
  user_agent?: string;
}

export interface RevokePushTokenInput {
  token: string;
}
