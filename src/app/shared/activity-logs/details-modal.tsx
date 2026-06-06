'use client';

import dayjs from 'dayjs';
import { PiArrowRight, PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import SimpleBar from '@/components/ui/simplebar';
import Link from 'next/link';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useActivityLog } from '@/framework/activity-logs';
import {
  formatSubjectLabel,
  getSubjectHref,
} from '@/app/shared/activity-logs/subject-link';
import type { ActivityLog } from '@/types/activity-log';

function isDateString(value: unknown): boolean {
  if (!value || typeof value !== 'string') return false;
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3,6})?(Z|[+-]\d{2}:\d{2})?)?$/;
  return isoDateRegex.test(value) && !Number.isNaN(Date.parse(value));
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (isDateString(value)) {
    return dayjs(String(value)).format('MMM DD, YYYY [at] HH:mm:ss');
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function EventBadge({ event }: { event: ActivityLog['event'] }) {
  if (!event) {
    return (
      <Badge variant="flat" color="secondary">
        —
      </Badge>
    );
  }

  const color =
    event === 'created' ? 'success' : event === 'updated' ? 'warning' : 'danger';

  return (
    <Badge variant="flat" color={color} className="capitalize">
      {event}
    </Badge>
  );
}

function ChangeDiff({
  oldValues,
  newValues,
}: {
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
}) {
  const keys = Array.from(
    new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
  );

  return (
    <div className="space-y-2">
      {keys.map((key) => {
        const oldValue = oldValues[key];
        const newValue = newValues[key];
        const formattedOld = formatValue(oldValue);
        const formattedNew = formatValue(newValue);

        return (
          <div
            key={key}
            className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {formatLabel(key)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md bg-red-50 px-2 py-1.5 text-sm dark:bg-red-900/20">
                <div className="text-xs text-red-600 dark:text-red-400">Before</div>
                <div className="font-medium text-red-700 dark:text-red-300">
                  {formattedOld || <span className="italic text-gray-400">(none)</span>}
                </div>
              </div>
              <PiArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
              <div className="flex-1 rounded-md bg-green-50 px-2 py-1.5 text-sm dark:bg-green-900/20">
                <div className="text-xs text-green-600 dark:text-green-400">After</div>
                <div className="font-medium text-green-700 dark:text-green-300">
                  {formattedNew || <span className="italic text-gray-400">(none)</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PropertiesList({ properties }: { properties: Record<string, unknown> }) {
  const entries = Object.entries(properties).filter(
    ([key]) => !['attributes', 'old'].includes(key)
  );

  if (entries.length === 0) {
    return <Text className="text-gray-500">No additional properties.</Text>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {formatLabel(key)}
          </div>
          <div className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-200">
            {formatValue(value) || <span className="italic text-gray-400">(none)</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityLogDetailsContent({ log }: { log: ActivityLog }) {
  const subjectHref = getSubjectHref(log.subject.type, log.subject.id);
  const hasDiff = log.old_values && log.new_values;

  return (
    <SimpleBar className="max-h-[70vh]">
      <div className="space-y-6 pr-2">
        <section>
          <Title as="h6" className="mb-3 text-sm font-semibold">
            General Information
          </Title>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Text className="text-xs text-gray-500">ID</Text>
              <Text className="font-medium">{log.id}</Text>
            </div>
            <div>
              <Text className="text-xs text-gray-500">Log Name</Text>
              <Text className="font-medium">{log.log_name ?? '—'}</Text>
            </div>
            <div>
              <Text className="text-xs text-gray-500">Event</Text>
              <div className="mt-1">
                <EventBadge event={log.event} />
              </div>
            </div>
            <div>
              <Text className="text-xs text-gray-500">Created At</Text>
              <Text className="font-medium">
                {dayjs(log.created_at).format('DD MMM YYYY, HH:mm:ss')}
              </Text>
            </div>
            <div className="sm:col-span-2">
              <Text className="text-xs text-gray-500">Description</Text>
              <Text className="font-medium">{log.description}</Text>
            </div>
            {log.batch_uuid && (
              <div className="sm:col-span-2">
                <Text className="text-xs text-gray-500">Batch UUID</Text>
                <Text className="font-medium">{log.batch_uuid}</Text>
              </div>
            )}
          </div>
        </section>

        <section>
          <Title as="h6" className="mb-3 text-sm font-semibold">
            Actor Information
          </Title>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Text className="text-xs text-gray-500">Name</Text>
              <Text className="font-medium">{log.causer.name}</Text>
            </div>
            <div>
              <Text className="text-xs text-gray-500">Type</Text>
              <Text className="font-medium">{log.causer.type ?? 'System'}</Text>
            </div>
            <div>
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="font-medium">{log.causer.email ?? '—'}</Text>
            </div>
          </div>
        </section>

        <section>
          <Title as="h6" className="mb-3 text-sm font-semibold">
            Entity Information
          </Title>
          {subjectHref ? (
            <Link
              href={subjectHref}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {formatSubjectLabel(log.subject.type, log.subject.id)}
            </Link>
          ) : (
            <Text className="font-medium">
              {formatSubjectLabel(log.subject.type, log.subject.id)}
            </Text>
          )}
        </section>

        <section>
          <Title as="h6" className="mb-3 text-sm font-semibold">
            {hasDiff ? 'Changed Values' : 'Properties'}
          </Title>
          {hasDiff ? (
            <ChangeDiff oldValues={log.old_values!} newValues={log.new_values!} />
          ) : (
            <PropertiesList properties={log.properties} />
          )}
        </section>
      </div>
    </SimpleBar>
  );
}

export default function ActivityLogDetailsModal({ id }: { id: number }) {
  const { closeModal } = useModal();
  const { data, isLoading, isError, error } = useActivityLog(id);

  return (
    <div className="flex flex-grow flex-col gap-4 p-6 @container">
      <div className="flex items-center justify-between">
        <Title as="h3" className="text-lg font-semibold">
          Activity Log Details
        </Title>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      {isLoading ? (
        <div className="m-auto py-10">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error?.message ?? 'Failed to load activity log.'}
        </div>
      ) : (data as import('@/types/activity-log').ActivityLogResponse | undefined)?.data ? (
        <ActivityLogDetailsContent
          log={(data as import('@/types/activity-log').ActivityLogResponse).data}
        />
      ) : (
        <Text className="text-gray-500">Activity log not found.</Text>
      )}

      <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
}
