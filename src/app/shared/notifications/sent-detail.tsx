'use client';

import Link from 'next/link';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { Text, Title } from '@/components/ui/text';
import DateCell from '@/components/ui/date-cell';
import { useSentNotification } from '@/framework/notifications';
import {
  formatRecipientType,
  statusBadgeClass,
} from '@/app/shared/notifications/constants';
import { routes } from '@/config/routes';
import type { SentNotification } from '@/types/admin-notifications';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 @md:grid-cols-[180px_1fr]">
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}

export default function SentNotificationDetailView({
  notificationId,
}: {
  notificationId: number;
}) {
  const { data, isLoading, isError, error } = useSentNotification(notificationId);
  const notification = (data as { data?: SentNotification } | undefined)?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error?.message ?? 'Sent notification not found.'}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title as="h3" className="text-xl font-semibold">
            {notification.title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Log #{notification.id}
          </Text>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${statusBadgeClass(notification.status)}`}
        >
          {notification.status}
        </span>
      </div>

      <DetailRow label="Message" value={notification.body} />
      <DetailRow label="Source" value={notification.source} />
      <DetailRow
        label="Audience"
        value={formatRecipientType(notification.recipient_type)}
      />
      <DetailRow
        label="Recipient ID"
        value={notification.recipient_id ?? '—'}
      />
      <DetailRow label="Type" value={notification.type || '—'} />
      <DetailRow label="Language" value={notification.lang?.toUpperCase()} />
      <DetailRow label="Deep link" value={notification.deep_link || '—'} />
      <DetailRow
        label="External URL"
        value={
          notification.url ? (
            <a
              href={notification.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {notification.url}
            </a>
          ) : (
            '—'
          )
        }
      />
      <DetailRow
        label="Extra data"
        value={
          notification.extra_data && Object.keys(notification.extra_data).length > 0 ? (
            <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs">
              {JSON.stringify(notification.extra_data, null, 2)}
            </pre>
          ) : (
            '—'
          )
        }
      />
      <DetailRow label="Queued jobs" value={notification.queued_count ?? '—'} />
      <DetailRow
        label="Sent at"
        value={<DateCell date={new Date(notification.sent_at)} />}
      />
      <DetailRow label="Created by" value={notification.creator?.name ?? '—'} />
      <DetailRow
        label="Created at"
        value={<DateCell date={new Date(notification.created_at)} />}
      />
      {notification.scheduled_notification_id ? (
        <DetailRow
          label="Scheduled source"
          value={
            <Link
              href={`${routes.notifications.index}?tab=scheduled`}
              className="text-primary underline"
            >
              Scheduled #{notification.scheduled_notification_id}
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
