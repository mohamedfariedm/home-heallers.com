import type { SupportTicket, SupportTicketLastMessage } from '@/types/support-tickets';

/** Server stamps both fields together when the update is the message itself. */
const SAME_UPDATE_MS = 20_000;

/**
 * Decides whether an inbox event is a new customer message.
 * Staff replies, system lines, reads, and stage changes stay silent.
 * The same message id never alerts twice.
 */
export class ClientMessageAlertTracker {
  private lastMessageId = new Map<number, number>();
  private alerted = new Set<number>();

  consume(ticket: SupportTicket): boolean {
    const message = ticket.last_message;
    const ticketId = Number(ticket.id);
    if (!message || !Number.isFinite(ticketId)) return false;

    const messageId = Number(message.id);
    const previous = this.lastMessageId.get(ticketId);
    if (Number.isFinite(messageId)) this.lastMessageId.set(ticketId, messageId);

    if (!isClientMessage(message) || !Number.isFinite(messageId)) return false;
    if (this.alerted.has(messageId)) return false;

    const isNewOnKnownTicket = previous != null && messageId > previous;
    const isFreshArrival = previous == null && messageMatchesThisUpdate(ticket, message);
    if (!isNewOnKnownTicket && !isFreshArrival) return false;

    this.alerted.add(messageId);
    if (this.alerted.size > 1000) this.alerted.clear();
    return true;
  }
}

function isClientMessage(message: SupportTicketLastMessage) {
  return message.sender_type === 'client' && !message.is_deleted;
}

function messageMatchesThisUpdate(ticket: SupportTicket, message: SupportTicketLastMessage) {
  const sentAt = Date.parse(message.at);
  const updatedAt = Date.parse(ticket.updated_at);
  if (Number.isFinite(sentAt) && Number.isFinite(updatedAt)) {
    return Math.abs(updatedAt - sentAt) <= SAME_UPDATE_MS;
  }
  if (!Number.isFinite(sentAt)) return false;
  const skew = Date.now() - sentAt;
  return skew >= -15_000 && skew <= 90_000;
}

export function ticketFromInboxEvent(payload: unknown): SupportTicket | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, any>;
  const candidates = [root.ticket, root.data?.ticket, root.data, root];
  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === 'object' &&
      'id' in candidate &&
      ('last_message' in candidate || 'number' in candidate || 'unread_count' in candidate)
    ) {
      return candidate as SupportTicket;
    }
  }
  return null;
}
