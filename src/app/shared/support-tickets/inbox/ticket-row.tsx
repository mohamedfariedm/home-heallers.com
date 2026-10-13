'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  PiImageDuotone,
  PiMapPinDuotone,
  PiMicrophoneDuotone,
  PiUserCircleDuotone,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes';
import type { SupportTicket } from '@/types/support-tickets';
import { STAGE_COLORS, formatRelative, stageLabel, ticketTitle } from '../utils';

function LastMessagePreview({ ticket }: { ticket: SupportTicket }) {
  const { t } = useTranslation();
  const last = ticket.last_message;
  if (!last) return <span className="italic text-gray-400">{t('st_no_messages')}</span>;

  const prefix = last.sender_type === 'client' ? t('st_preview_client') : t('st_preview_support');
  let content: React.ReactNode = last.preview;
  if (last.is_deleted) {
    content = <span className="italic">{t('st_message_deleted')}</span>;
  } else if (last.type === 'image') {
    content = (
      <span className="inline-flex items-center gap-1">
        <PiImageDuotone className="h-4 w-4" />
        {t('st_type_image')}
      </span>
    );
  } else if (last.type === 'voice') {
    content = (
      <span className="inline-flex items-center gap-1">
        <PiMicrophoneDuotone className="h-4 w-4" />
        {t('st_type_voice')}
      </span>
    );
  } else if (last.type === 'location') {
    content = (
      <span className="inline-flex items-center gap-1">
        <PiMapPinDuotone className="h-4 w-4" />
        {t('st_type_location')}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 font-medium text-gray-600">{prefix}:</span>
      <span className="truncate">{content}</span>
    </span>
  );
}

export default function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const { t, i18n } = useTranslation();
  const unread = ticket.unread_count > 0;
  const closed = ticket.status === 'closed';

  return (
    <Link
      href={routes.supportTickets.detail(ticket.id)}
      className={cn(
        'flex flex-col gap-2 border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 md:flex-row md:items-center md:gap-4',
        unread && 'bg-primary-lighter/20'
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-sm text-gray-900', unread ? 'font-bold' : 'font-semibold')}>
            {ticketTitle(t, ticket)}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STAGE_COLORS[ticket.stage] ?? 'bg-gray-100 text-gray-700'
            )}
          >
            {stageLabel(t, ticket.stage)}
          </span>
          {closed && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
              {t('st_status_closed')}
            </span>
          )}
          {ticket.close_requested && !closed && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {t('st_close_requested')}
            </span>
          )}
          {ticket.client_messages_count === 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {t('st_no_client_messages')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
          <span className="font-medium text-gray-800">{ticket.client?.name ?? '—'}</span>
          {ticket.client?.mobile && <span dir="ltr">{ticket.client.mobile}</span>}
        </div>
        <div className="min-w-0 text-xs text-gray-500">
          <LastMessagePreview ticket={ticket} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 text-xs text-gray-500 md:w-64 md:justify-end">
        <span className="inline-flex items-center gap-1" title={t('st_assignee')}>
          <PiUserCircleDuotone className="h-4 w-4" />
          {ticket.assignee?.name ?? t('st_unassigned')}
        </span>
        <span title={ticket.updated_at}>{formatRelative(ticket.updated_at, i18n.language)}</span>
        {unread && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
            {ticket.unread_count}
          </span>
        )}
      </div>
    </Link>
  );
}
