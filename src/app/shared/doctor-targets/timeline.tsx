'use client';

import dayjs from 'dayjs';
import Spinner from '@/components/ui/spinner';
import { Text, Title } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { useDoctorTargetTimeline } from '@/framework/doctor-targets';
import { formatAchievement, formatMoney } from './status-badge';

type TimelineEvent = {
  type?: string;
  actor_id?: number | null;
  actor_type?: string | null;
  timestamp?: string;
  created_at?: string;
  properties?: Record<string, unknown> | string | null;
};

const PROPERTY_LABELS: Record<string, string> = {
  doctor_id: 'Doctor',
  start_date: 'Start date',
  end_date: 'End date',
  required_sessions: 'Required sessions',
  incentive_amount: 'Incentive',
  from: 'From',
  to: 'To',
  approval_note: 'Approval note',
  snapshot_id: 'Snapshot',
  completed_sessions: 'Completed sessions',
  achievement_percentage: 'Achievement',
  wallet_transaction_id: 'Wallet transaction',
  amount: 'Amount',
  transaction_reference: 'Reference',
  notes: 'Notes',
  reservation_date_id: 'Reservation date',
  date: 'Session date',
};

const EVENT_STYLES: Record<string, { dot: string; badge: string }> = {
  created: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  updated: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
  activated: { dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-800' },
  approved: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
  'wallet credited': {
    dot: 'bg-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  'session counted': {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-800',
  },
};

function eventKey(type?: string) {
  return (type || '').trim().toLowerCase();
}

function humanizeKey(key: string) {
  return (
    PROPERTY_LABELS[key] ||
    key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function formatDateValue(value: string) {
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parsed.format('DD MMM YYYY');
  if (value.includes('00:00:00') && !value.includes('T')) {
    return parsed.format('DD MMM YYYY');
  }
  return parsed.format('DD MMM YYYY, HH:mm');
}

function formatPropertyValue(key: string, value: unknown): string {
  if (value == null || value === '') return '—';

  if (
    key === 'incentive_amount' ||
    key === 'amount' ||
    key.endsWith('_amount')
  ) {
    return formatMoney(Number(value));
  }

  if (key === 'achievement_percentage' || key.endsWith('_percentage')) {
    return formatAchievement(Number(value));
  }

  if (
    key.endsWith('_id') ||
    key === 'snapshot_id' ||
    key === 'reservation_date_id'
  ) {
    return `#${value}`;
  }

  if (key === 'from' || key === 'to') {
    return String(value).replace(/^\w/, (letter) => letter.toUpperCase());
  }

  if (typeof value === 'string') {
    const looksLikeDate =
      /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
    if (looksLikeDate) return formatDateValue(value);
    return value;
  }

  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function actorLabel(event: TimelineEvent) {
  if (event.actor_id == null && !event.actor_type) return 'System';
  const model = (event.actor_type || '').split('\\').pop() || 'Actor';
  if (event.actor_id == null) return model;
  return `${model} #${event.actor_id}`;
}

function EventProperties({ properties }: { properties: TimelineEvent['properties'] }) {
  if (!properties) return null;

  if (typeof properties === 'string') {
    return (
      <Text className="mt-2 text-xs text-gray-600 dark:text-gray-300">
        {properties}
      </Text>
    );
  }

  const entries = Object.entries(properties).filter(
    ([, value]) => value !== undefined
  );
  if (entries.length === 0) return null;

  return (
    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="text-[11px] uppercase tracking-wide text-gray-500">
            {humanizeKey(key)}
          </dt>
          <dd className="text-sm text-gray-800 dark:text-gray-200">
            {formatPropertyValue(key, value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function TargetTimeline({
  targetId,
}: {
  targetId: number | string;
}) {
  const { data, isLoading, isError, error } = useDoctorTargetTimeline(targetId);

  const events: TimelineEvent[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <Title as="h3" className="mb-4 text-base font-semibold">
        Timeline
      </Title>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Text className="text-sm text-red-600">
          {(error as Error)?.message || 'Failed to load timeline'}
        </Text>
      ) : events.length === 0 ? (
        <Text className="text-sm text-gray-500">No lifecycle events yet.</Text>
      ) : (
        <ol className="relative space-y-5 border-s border-gray-200 ps-5 dark:border-gray-700">
          {events.map((event, index) => {
            const style =
              EVENT_STYLES[eventKey(event?.type)] || {
                dot: 'bg-gray-400',
                badge: 'bg-gray-100 text-gray-700',
              };
            return (
              <li
                key={`${event?.type}-${event?.timestamp}-${index}`}
                className="ms-2"
              >
                <span
                  className={`absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white dark:border-gray-900 ${style.dot}`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={style.badge}>{event?.type || 'Event'}</Badge>
                  <Text className="text-xs text-gray-500">
                    {event?.timestamp || event?.created_at
                      ? formatDateValue(
                          String(event.timestamp || event.created_at)
                        )
                      : '—'}
                    {` · ${actorLabel(event)}`}
                  </Text>
                </div>
                <EventProperties properties={event?.properties} />
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
