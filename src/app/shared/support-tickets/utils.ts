import type { TFunction } from 'i18next';
import type {
  SupportMessage,
  SupportTicket,
  SupportTicketStage,
} from '@/types/support-tickets';

export const STAGE_COLORS: Record<SupportTicketStage, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
};

export function stageLabel(t: TFunction, stage: SupportTicketStage) {
  return t(`st_stage_${stage}`);
}

export function ticketTitle(t: TFunction, ticket: Pick<SupportTicket, 'number'>) {
  return t('st_ticket_no', { number: ticket.number });
}

export function formatDateTime(value: string | null | undefined, locale: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatRelative(value: string | null | undefined, locale: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSec / 86400), 'day');
  return formatDateTime(value, locale);
}

export function formatTime(value: string | null | undefined, locale: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds?: number | null) {
  if (!seconds || seconds < 0) return '';
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function messageBody(message: SupportMessage, locale: string) {
  if (message.is_system && message.body_translations) {
    const lang = locale === 'ar' ? 'ar' : 'en';
    return message.body_translations[lang] || message.body || '';
  }
  return message.body || '';
}

export function parseLocation(body: string | null) {
  if (!body) return null;
  const [lat, lng] = body.split(',').map((part) => Number(part.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Merge message lists by id (newer copies, e.g. tombstones, win) and sort oldest first. */
export function mergeMessages(current: SupportMessage[], incoming: SupportMessage[]) {
  const byId = new Map<number, SupportMessage>();
  current.forEach((m) => byId.set(m.id, m));
  incoming.forEach((m) => byId.set(m.id, { ...byId.get(m.id), ...m }));
  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
}

export function newClientMessageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
