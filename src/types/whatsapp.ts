export type WhatsAppSessionState =
  | 'CONNECTED'
  | 'QR_REQUIRED'
  | 'CONNECTING'
  | 'DISCONNECTED'
  | 'AUTH_FAILED';

export type WhatsAppMessageStatus =
  | 'received'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface WhatsAppSessionStatus {
  status: WhatsAppSessionState;
  session: WhatsAppSessionState;
  whatsapp: 'connected' | 'disconnected';
  phone?: string | null;
  pushname?: string | null;
  last_seen_at?: string | null;
  lastMessageAt?: string | null;
  hasQr?: boolean;
  success?: boolean;
}

export interface WhatsAppQrResponse {
  session: WhatsAppSessionState;
  qr: string | null;
  qr_png: string | null;
  expires_in?: number;
}

export interface WhatsAppChat {
  id: number;
  provider_chat_id: string;
  name: string | null;
  phone: string | null;
  is_group: boolean;
  unread_count: number;
  last_message: string | null;
  last_message_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WhatsAppChatMessage {
  id: number;
  whatsapp_chat_id: number;
  provider_message_id: string;
  provider_chat_id?: string;
  from_me: boolean;
  sender_phone?: string | null;
  sender_name?: string | null;
  body: string | null;
  type: string;
  has_media: boolean;
  media_url: string | null;
  status: WhatsAppMessageStatus;
  message_at: string;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LaravelPaginator<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SendWhatsAppMessageResult {
  httpStatus: number;
  success?: boolean;
  data?: WhatsAppChatMessage;
  warning?: string;
  provider_message_id?: string;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
