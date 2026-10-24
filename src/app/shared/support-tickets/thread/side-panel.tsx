'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { PiClockCounterClockwiseBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { routes } from '@/config/routes';
import type { SupportTicket } from '@/types/support-tickets';
import { STAGE_COLORS, formatDateTime, stageLabel } from '../utils';

function Row({ label, value, ltr }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-end font-medium text-gray-800" dir={ltr ? 'ltr' : undefined}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{title}</h4>
      {children}
    </div>
  );
}

export default function TicketSidePanel({ ticket }: { ticket: SupportTicket }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const participants = ticket.participants ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Section title={t('st_client_info')}>
        <Row label={t('st_name')} value={ticket.client?.name} />
        <Row label={t('st_mobile')} value={ticket.client?.mobile} ltr />
        <Row label={t('st_email')} value={ticket.client?.email} ltr />
        <Row label={t('st_app_language')} value={ticket.client?.locale?.toUpperCase()} />
        {ticket.client?.id && (
          <Link
            href={routes.supportTickets.clientHistory(ticket.client.id)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <PiClockCounterClockwiseBold className="h-4 w-4" />
            {t('st_previous_tickets')}
          </Link>
        )}
      </Section>

      <Section title={t('st_ticket_info')}>
        <Row
          label={t('st_status')}
          value={ticket.status === 'open' ? t('st_status_open') : t('st_status_closed')}
        />
        <Row
          label={t('st_stage')}
          value={
            <span className={cn('rounded-full px-2 py-0.5 text-xs', STAGE_COLORS[ticket.stage])}>
              {stageLabel(t, ticket.stage)}
            </span>
          }
        />
        <Row label={t('st_assignee')} value={ticket.assignee?.name ?? t('st_unassigned')} />
        {ticket.assigned_at && (
          <Row label={t('st_assigned_at')} value={formatDateTime(ticket.assigned_at, lang)} />
        )}
        <Row label={t('st_client_messages_count')} value={ticket.client_messages_count} />
        <Row label={t('st_created_at')} value={formatDateTime(ticket.created_at, lang)} />
        <Row label={t('st_first_response_at')} value={formatDateTime(ticket.first_response_at, lang)} />
        {ticket.resolved_at && (
          <Row label={t('st_resolved_at')} value={formatDateTime(ticket.resolved_at, lang)} />
        )}
        {ticket.close_requested_at && ticket.close_requested && (
          <Row
            label={t('st_close_requested_at')}
            value={formatDateTime(ticket.close_requested_at, lang)}
          />
        )}
        {ticket.closed_at && (
          <>
            <Row label={t('st_closed_at')} value={formatDateTime(ticket.closed_at, lang)} />
            <Row label={t('st_closed_by')} value={ticket.closed_by?.name} />
          </>
        )}
      </Section>

      {participants.length > 0 && (
        <Section title={t('st_participants')}>
          <ul className="space-y-1.5">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-800">{p.name}</span>
                  {p.email && <span className="block truncate text-xs text-gray-500">{p.email}</span>}
                </span>
                <span className="text-xs text-gray-500">
                  {t('st_messages_count', { count: p.messages_count })}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {ticket.close_note && (
        <Section title={t('st_close_note_internal')}>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{ticket.close_note}</p>
        </Section>
      )}
    </div>
  );
}
