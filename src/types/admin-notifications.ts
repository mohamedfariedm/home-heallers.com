export type NotificationLang = 'ar' | 'en';

export type NotificationRecipientType =
  | 'all'
  | 'clients'
  | 'doctors'
  | 'specific';

export type NotificationRecipientKind = 'client' | 'doctor';

export type ScheduledNotificationStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'canceled'
  | 'failed';

export type SentNotificationSource = 'immediate' | 'scheduled' | 'system';

export type SentNotificationStatus = 'sent' | 'failed';

export type PushStatus = 'sent' | 'failed' | 'skipped';

export interface NotificationCreator {
  id: number;
  name: string;
}

export interface NotificationRecipientRef {
  type: NotificationRecipientKind;
  id: number;
}

export interface NotificationContentPayload {
  title: string;
  body: string;
  type?: string;
  lang?: NotificationLang;
  deep_link?: string;
  url?: string;
  extra_data?: Record<string, string | number | boolean>;
  /** Preferred for specific / multi-specific sends */
  recipients?: NotificationRecipientRef[];
  /** Legacy single-specific recipient */
  recipient_id?: number;
}

export interface ScheduledNotificationPayload extends NotificationContentPayload {
  recipient_type: NotificationRecipientType;
  scheduled_at: string;
}

export interface ImmediateSendResult {
  status: boolean;
  message: string;
  data: {
    log_id: number;
    queued_count: number;
    recipient_count: number;
    recipient_type: NotificationRecipientType;
  };
}

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  recipient_type: NotificationRecipientType;
  recipient_id: number | null;
  recipients: NotificationRecipientRef[];
  deep_link: string | null;
  url: string | null;
  extra_data: Record<string, unknown>;
  lang: NotificationLang;
  scheduled_at: string;
  status: ScheduledNotificationStatus;
  sent_at: string | null;
  queued_count: number | null;
  created_by: number | null;
  creator: NotificationCreator | null;
  created_at: string;
  updated_at: string;
}

export interface SentNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  recipient_type: NotificationRecipientType;
  recipient_id: number | null;
  recipients: NotificationRecipientRef[];
  deep_link: string | null;
  url: string | null;
  extra_data: Record<string, unknown>;
  lang: NotificationLang;
  source: SentNotificationSource;
  scheduled_notification_id: number | null;
  scheduled_notification: ScheduledNotification | null;
  status: SentNotificationStatus;
  queued_count: number | null;
  recipient_count: number | null;
  delivered_count: number | null;
  read_count: number | null;
  unread_count: number | null;
  sent_at: string;
  created_by: number | null;
  creator: NotificationCreator | null;
  created_at: string;
  updated_at: string;
}

export interface SentNotificationRecipient {
  id: number;
  type: NotificationRecipientKind;
  name: string;
  delivered_at: string | null;
  read_at: string | null;
  push_status: PushStatus;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface ScheduledNotificationsResponse {
  status: boolean;
  message: string;
  data: {
    notifications: ScheduledNotification[];
    pagination: PaginationMeta;
  };
}

export interface SentNotificationsResponse {
  status: boolean;
  message: string;
  data: {
    filters: Record<string, string | null>;
    notifications: SentNotification[];
    pagination: PaginationMeta;
  };
}

export interface SentNotificationRecipientsResponse {
  status: boolean;
  message: string;
  data: {
    notification_id: number;
    recipients: SentNotificationRecipient[];
    pagination: PaginationMeta;
  };
}

export interface SentFilterOptions {
  sources: SentNotificationSource[];
  recipient_types: NotificationRecipientType[];
  statuses: SentNotificationStatus[];
  languages: NotificationLang[];
  types: string[];
  creators: NotificationCreator[];
}

export interface SentFilterOptionsResponse {
  status: boolean;
  message: string;
  data: SentFilterOptions;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}
