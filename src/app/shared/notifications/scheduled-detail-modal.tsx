'use client';

import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Title, Text } from '@/components/ui/text';
import DateCell from '@/components/ui/date-cell';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  formatRecipientType,
} from '@/app/shared/notifications/constants';
import type { ScheduledNotification } from '@/types/admin-notifications';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 last:border-b-0 @md:grid-cols-[160px_1fr]">
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}

export default function ScheduledNotificationDetailsModal({
  notification,
}: {
  notification: ScheduledNotification;
}) {
  const { closeModal } = useModal();

  const recipients =
    notification.recipients?.length > 0
      ? notification.recipients
          .map((item) => `${item.type === 'doctor' ? 'Doctor' : 'Client'} #${item.id}`)
          .join(', ')
      : notification.recipient_id != null
        ? `#${notification.recipient_id}`
        : '—';

  return (
    <div className="relative flex flex-grow flex-col gap-4 p-6 @container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Title as="h4" className="font-semibold">
            {notification.title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Scheduled #{notification.id}
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="rounded-lg border border-gray-200 px-4">
        <DetailRow label="Message" value={notification.body} />
        <DetailRow
          label="Status"
          value={
            <Badge variant="flat" className="capitalize">
              {notification.status}
            </Badge>
          }
        />
        <DetailRow
          label="Audience"
          value={formatRecipientType(notification.recipient_type)}
        />
        <DetailRow label="Specific recipients" value={recipients} />
        <DetailRow label="Type" value={notification.type || '—'} />
        <DetailRow label="Language" value={notification.lang?.toUpperCase() || '—'} />
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
          label="Scheduled at"
          value={<DateCell date={new Date(notification.scheduled_at)} />}
        />
        <DetailRow
          label="Sent at"
          value={
            notification.sent_at ? (
              <DateCell date={new Date(notification.sent_at)} />
            ) : (
              '—'
            )
          }
        />
        <DetailRow label="Queued jobs" value={notification.queued_count ?? '—'} />
        <DetailRow label="Created by" value={notification.creator?.name ?? '—'} />
        <DetailRow
          label="Created at"
          value={<DateCell date={new Date(notification.created_at)} />}
        />
      </div>
    </div>
  );
}
