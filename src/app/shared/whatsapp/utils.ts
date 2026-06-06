import type { WhatsAppChat, WhatsAppMessageStatus } from '@/types/whatsapp';
import dayjs from 'dayjs';

export function formatChatTitle(chat: WhatsAppChat): string {
  if (chat.name?.trim()) return chat.name.trim();
  if (chat.phone) return formatPhoneDisplay(chat.phone);
  return 'Unknown contact';
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  return `+${digits}`;
}

export function formatMessageTime(iso: string): string {
  const d = dayjs(iso);
  if (d.isSame(dayjs(), 'day')) return d.format('HH:mm');
  if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return `Yesterday ${d.format('HH:mm')}`;
  return d.format('MMM D, HH:mm');
}

export function truncatePreview(text: string | null, max = 72): string {
  if (!text) return '';
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function statusTickLabel(status: WhatsAppMessageStatus): string {
  switch (status) {
    case 'sent':
      return '✓';
    case 'delivered':
      return '✓✓';
    case 'read':
      return '✓✓';
    case 'failed':
      return '!';
    default:
      return '';
  }
}

export function isSessionReady(session?: string): boolean {
  return session === 'CONNECTED';
}

export function needsQrPanel(session?: string): boolean {
  return session === 'QR_REQUIRED' || session === 'CONNECTING';
}
