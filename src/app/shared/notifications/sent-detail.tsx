'use client';

import Link from 'next/link';
import {
  PiUsersThreeBold,
  PiCheckCircleBold,
  PiEnvelopeOpenBold,
  PiEnvelopeBold,
  PiListChecksBold,
  PiLinkBold,
  PiGlobeBold,
  PiCalendarBlankBold,
  PiUserBold,
  PiArrowLeftBold,
} from 'react-icons/pi';
import Spinner from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text, Title } from '@/components/ui/text';
import DateCell from '@/components/ui/date-cell';
import { useSentNotification } from '@/framework/notifications';
import {
  formatRecipientType,
  formatSentSource,
} from '@/app/shared/notifications/constants';
import SentNotificationRecipientsTable from '@/app/shared/notifications/sent-recipients-table';
import { routes } from '@/config/routes';
import type {
  NotificationRecipientRef,
  SentNotification,
} from '@/types/admin-notifications';
import cn from '@/utils/class-names';

function formatSpecificRecipients(recipients?: NotificationRecipientRef[] | null) {
  if (!recipients || recipients.length === 0) return null;
  return recipients
    .map((item) => `${item.type === 'doctor' ? 'Doctor' : 'Client'} #${item.id}`)
    .join(', ');
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </Text>
          <Text className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            {value ?? '—'}
          </Text>
        </div>
        <span
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-lg',
            accent
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <div className="text-sm font-medium text-gray-900">{value}</div>
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
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error?.message ?? 'Sent notification not found.'}
      </div>
    );
  }

  const specificRecipients =
    formatSpecificRecipients(notification.recipients) ??
    (notification.recipient_id != null ? `#${notification.recipient_id}` : null);

  const readRate =
    notification.recipient_count && notification.read_count != null
      ? Math.round((notification.read_count / notification.recipient_count) * 100)
      : null;

  const statusColor =
    notification.status === 'sent'
      ? 'success'
      : notification.status === 'failed'
        ? 'danger'
        : 'secondary';

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-gray-100/80 px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="flat" color={statusColor} className="capitalize">
                  {notification.status}
                </Badge>
                <Badge variant="flat" className="capitalize">
                  {formatSentSource(notification.source)}
                </Badge>
                <Badge variant="flat" className="capitalize">
                  {formatRecipientType(notification.recipient_type)}
                </Badge>
                {notification.type ? (
                  <Badge variant="flat" color="info" className="capitalize">
                    {notification.type}
                  </Badge>
                ) : null}
              </div>

              <div>
                <Title
                  as="h3"
                  className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl"
                >
                  {notification.title}
                </Title>
                <Text className="mt-1.5 text-sm text-gray-500">
                  Log #{notification.id}
                  {notification.lang ? ` · ${notification.lang.toUpperCase()}` : ''}
                </Text>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <PiCalendarBlankBold className="h-4 w-4 text-gray-400" />
                  <DateCell date={new Date(notification.sent_at)} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PiUserBold className="h-4 w-4 text-gray-400" />
                  {notification.creator?.name ??
                    (notification.source === 'system' ? 'System' : '—')}
                </span>
              </div>
            </div>

            <Link href={`${routes.notifications.index}?tab=sent`}>
              <Button variant="outline" className="gap-2">
                <PiArrowLeftBold className="h-4 w-4" />
                Back to history
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="Recipients"
            value={notification.recipient_count}
            icon={<PiUsersThreeBold className="h-5 w-5 text-sky-700" />}
            accent="bg-sky-50"
          />
          <MetricCard
            label="Delivered"
            value={notification.delivered_count}
            icon={<PiCheckCircleBold className="h-5 w-5 text-emerald-700" />}
            accent="bg-emerald-50"
          />
          <MetricCard
            label="Read"
            value={
              readRate != null
                ? `${notification.read_count ?? 0} (${readRate}%)`
                : notification.read_count
            }
            icon={<PiEnvelopeOpenBold className="h-5 w-5 text-indigo-700" />}
            accent="bg-indigo-50"
          />
          <MetricCard
            label="Unread"
            value={notification.unread_count}
            icon={<PiEnvelopeBold className="h-5 w-5 text-amber-700" />}
            accent="bg-amber-50"
          />
          <MetricCard
            label="Queued jobs"
            value={notification.queued_count}
            icon={<PiListChecksBold className="h-5 w-5 text-gray-700" />}
            accent="bg-gray-100"
          />
        </div>
      </section>

      {/* Content + meta */}
      <div className="grid gap-6 @4xl:grid-cols-5">
        <section className="@4xl:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Message
          </Text>
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-5">
            <Text className="whitespace-pre-wrap text-[15px] leading-7 text-gray-800">
              {notification.body}
            </Text>
          </div>

          {(notification.deep_link || notification.url) && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {notification.deep_link ? (
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <PiLinkBold className="h-3.5 w-3.5" />
                    Deep link
                  </div>
                  <Text className="break-all text-sm font-medium text-gray-900">
                    {notification.deep_link}
                  </Text>
                </div>
              ) : null}
              {notification.url ? (
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <PiGlobeBold className="h-3.5 w-3.5" />
                    External URL
                  </div>
                  <a
                    href={notification.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm font-medium text-primary hover:underline"
                  >
                    {notification.url}
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section className="@4xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Details
          </Text>
          <div className="mt-5 space-y-5">
            <MetaItem
              label="Audience"
              value={formatRecipientType(notification.recipient_type)}
            />
            {specificRecipients ? (
              <MetaItem label="Specific recipients" value={specificRecipients} />
            ) : null}
            <MetaItem
              label="Language"
              value={notification.lang?.toUpperCase() || '—'}
            />
            <MetaItem label="Type" value={notification.type || '—'} />
            <MetaItem
              label="Created at"
              value={<DateCell date={new Date(notification.created_at)} />}
            />
            {notification.scheduled_notification_id ? (
              <MetaItem
                label="Scheduled source"
                value={
                  <Link
                    href={`${routes.notifications.index}?tab=scheduled`}
                    className="text-primary hover:underline"
                  >
                    Scheduled #{notification.scheduled_notification_id}
                  </Link>
                }
              />
            ) : null}
            {notification.extra_data &&
            Object.keys(notification.extra_data).length > 0 ? (
              <div className="space-y-2">
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Extra data
                </Text>
                <pre className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700">
                  {JSON.stringify(notification.extra_data, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Recipients */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <SentNotificationRecipientsTable notificationId={notificationId} />
      </section>
    </div>
  );
}
