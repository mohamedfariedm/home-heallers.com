'use client';

import Spinner from '@/components/ui/spinner';
import { Text, Title } from '@/components/ui/text';
import { useDoctorTargetTimeline } from '@/framework/doctor-targets';

function formatTs(value?: string) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function TargetTimeline({
  targetId,
}: {
  targetId: number | string;
}) {
  const { data, isLoading, isError, error } = useDoctorTargetTimeline(targetId);

  const events = Array.isArray(data?.data)
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
        <ol className="relative space-y-4 border-s border-gray-200 ps-5 dark:border-gray-700">
          {events.map((event: any, index: number) => (
            <li key={event?.id ?? `${event?.type}-${index}`} className="ms-2">
              <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-400 dark:border-gray-900" />
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {event?.type || 'Event'}
              </Text>
              <Text className="text-xs text-gray-500">
                {formatTs(event?.timestamp || event?.created_at)}
                {event?.actor_id != null ? ` · Actor #${event.actor_id}` : ''}
              </Text>
              {event?.properties && (
                <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {typeof event.properties === 'string'
                    ? event.properties
                    : JSON.stringify(event.properties, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
