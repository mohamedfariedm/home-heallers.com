'use client';

import Link from 'next/link';
import {
  PiCalendarBold,
  PiCheckCircleBold,
  PiClockBold,
  PiCurrencyCircleDollarBold,
} from 'react-icons/pi';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import EyeIcon from '@/components/icons/eye';
import { getSubjectHref } from '@/app/shared/activity-logs/subject-link';
import { resolveLocalizedNameOrFallback } from '@/utils/resolve-localized-name';
import type { DoctorHistoryItem } from '@/types/doctor-activity-report';

function StatusBadge({
  status,
  label,
}: {
  status: number | string;
  label: string | null;
}) {
  const key = String(status).toLowerCase();
  const color =
    key === '3' || key === 'confirmed' || key === '5' || key === 'completed'
      ? 'success'
      : key === '1' || key === '2' || key === 'reviewing' || key === 'waitconfirm'
        ? 'warning'
        : key === '4' || key === '6' || key === 'canceled' || key === 'failed'
          ? 'danger'
          : 'gray';

  return (
    <Badge color={color as 'success' | 'warning' | 'danger' | 'gray'} rounded="md">
      {label ?? status}
    </Badge>
  );
}

export default function DoctorHistoryCard({ item }: { item: DoctorHistoryItem }) {
  const patientName = item.patient?.name
    ? resolveLocalizedNameOrFallback(item.patient.name)
    : null;
  const reservationHref = getSubjectHref('Reservation', item.reservation_id);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center gap-2">
        {reservationHref ? (
          <Link
            href={reservationHref}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Reservation #{item.reservation_id}
          </Link>
        ) : (
          <Text className="font-medium">Reservation #{item.reservation_id}</Text>
        )}
        <StatusBadge status={item.status} label={item.status_label} />
        <Badge variant="outline" rounded="md" className="capitalize">
          {item.type}
        </Badge>
        {item.paid ? (
          <Badge color="success" rounded="md">
            Paid
          </Badge>
        ) : (
          <Badge color="warning" rounded="md">
            Unpaid
          </Badge>
        )}
        <div className="inline-flex items-center gap-1 text-xs text-gray-500">
          <PiCalendarBold className="h-3.5 w-3.5" />
          Created {item.created_at ?? '—'}
        </div>
        <div className="ml-auto inline-flex items-center gap-1 text-sm font-semibold">
          <PiCurrencyCircleDollarBold className="h-4 w-4" />
          {item.total_amount ?? '—'} SAR
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        {patientName ? (
          <span>
            Patient:{' '}
            {item.patient?.id ? (
              <Link
                href={`/clients/${item.patient.id}`}
                className="font-medium text-primary hover:underline"
              >
                {patientName}
              </Link>
            ) : (
              patientName
            )}
          </span>
        ) : (
          <span className="italic text-gray-500">Guest patient</span>
        )}
        <span>Sessions: {item.sessions_count}</span>
        {item.session_price != null ? (
          <span>Unit price: {item.session_price} SAR</span>
        ) : null}
        {item.sub_total != null ? <span>Subtotal: {item.sub_total}</span> : null}
      </div>

      {item.sessions?.length > 0 ? (
        <div className="mt-3 space-y-2">
          {item.sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                {(session.status || '').toLowerCase() === 'completed' ? (
                  <PiCheckCircleBold className="h-4 w-4 text-emerald-600" />
                ) : (
                  <PiClockBold className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="font-medium">#{session.id}</div>
                <div>
                  {session.date ? new Date(session.date).toLocaleDateString() : '—'}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {session.time
                    ? session.time
                    : session.start_time
                      ? new Date(session.start_time).toLocaleTimeString()
                      : '—'}
                </div>
                <div className="flex items-center">
                  <Badge rounded="sm">{session.status_label ?? session.status ?? '—'}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {item.doctor_attachments?.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.doctor_attachments.map((att, idx) => {
            const url = att.original ?? '';
            const key = att.id ?? `${item.reservation_id}-${idx}`;
            if (!url) return null;
            return (
              <Link
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <EyeIcon className="h-3.5 w-3.5" />
                {att.name ?? 'Attachment'}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
