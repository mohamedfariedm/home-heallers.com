export type SupportTicketStatus = 'open' | 'closed';
export type SupportTicketStage = 'new' | 'in_progress' | 'resolved';
export type SupportMessageType = 'text' | 'location' | 'image' | 'voice';
export type SupportSenderType = 'client' | 'support';
export type SupportSystemEvent =
  | 'welcome'
  | 'close_requested'
  | 'close_request_dismissed'
  | 'resolved'
  | 'closed';

export interface SupportAgent {
  id: number;
  name: string;
  email?: string;
}

export interface SupportTicketClient {
  id: number;
  name: string;
  mobile?: string | null;
  email?: string | null;
  locale?: string | null;
}

export interface SupportTicketParticipant extends SupportAgent {
  messages_count: number;
}

export interface SupportTicketLastMessage {
  id: number;
  type: SupportMessageType;
  preview: string | null;
  sender_type: SupportSenderType;
  is_deleted: boolean;
  at: string;
}

export interface SupportTicket {
  id: number;
  number: number;
  title: string;
  status: SupportTicketStatus;
  status_label: string;
  stage: SupportTicketStage;
  stage_label: string;
  client: SupportTicketClient | null;
  assignee: SupportAgent | null;
  assigned_at: string | null;
  participants?: SupportTicketParticipant[];
  close_requested: boolean;
  close_requested_at: string | null;
  closed_at: string | null;
  closed_by: SupportAgent | null;
  close_note: string | null;
  unread_count: number;
  client_messages_count: number;
  client_last_read_message_id: number | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  last_message: SupportTicketLastMessage | null;
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  sender_type: SupportSenderType;
  sender: SupportAgent | null;
  is_system: boolean;
  system_event: SupportSystemEvent | null;
  type: SupportMessageType;
  body: string | null;
  body_translations?: { ar?: string; en?: string } | null;
  metadata: {
    width?: number;
    height?: number;
    duration_seconds?: number;
    [key: string]: unknown;
  } | null;
  client_message_id: string | null;
  delivered_at: string | null;
  read_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  media_url: string | null;
  created_at: string;
}

export interface SupportTicketsMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface SupportTicketsListResponse {
  tickets: SupportTicket[];
  meta: SupportTicketsMeta;
}

export interface SupportMessagesPage {
  messages: SupportMessage[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

export interface SupportTicketsStats {
  open: number;
  new: number;
  in_progress: number;
  resolved: number;
  close_requested: number;
  unassigned: number;
  mine: number;
  unread_tickets: number;
}

export interface SupportTicketsUnreadCount {
  unread_tickets: number;
  unread_messages: number;
}

export interface SupportTicketsAgentOption {
  id: number;
  name: string;
  email: string;
  open_assigned_count: number;
}

export interface SupportTicketsSettings {
  welcome_message: { ar: string; en: string };
}

export interface SendSupportTextInput {
  type: 'text' | 'location';
  body: string;
  client_message_id?: string;
}

export interface SendSupportMediaInput {
  type: 'image' | 'voice';
  file: File | Blob;
  fileName?: string;
  client_message_id?: string;
  metadata?: { width?: number; height?: number; duration_seconds?: number };
}

export interface SupportMessagesReadEvent {
  ticket_id: number;
  reader_role: 'client' | 'support';
  last_read_message_id: number;
  reader: { id: number; name: string } | null;
}
