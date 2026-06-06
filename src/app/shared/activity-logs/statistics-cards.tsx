'use client';

import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import type { ActivityLogStatistics } from '@/types/activity-log';

interface ActivityLogStatisticsCardsProps {
  statistics?: ActivityLogStatistics | null;
  className?: string;
}

const cards = [
  {
    key: 'total',
    title: 'Total',
    icon: PiListChecksBold,
    color: 'blue',
  },
  {
    key: 'today',
    title: 'Today',
    icon: PiClockBold,
    color: 'green',
  },
  {
    key: 'this_week',
    title: 'This Week',
    icon: PiCalendarCheckBold,
    color: 'amber',
  },
  {
    key: 'this_month',
    title: 'This Month',
    icon: PiChartBarBold,
    color: 'indigo',
  },
] as const;

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

export default function ActivityLogStatisticsCards({
  statistics,
  className,
}: ActivityLogStatisticsCardsProps) {
  if (!statistics) return null;

  const eventEntries = Object.entries(statistics.by_event ?? {}).slice(0, 4);

  return (
    <div className={cn('mb-6 space-y-4', className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const colors = colorMap[card.color];
          const value = statistics[card.key] ?? 0;

          return (
            <div
              key={card.key}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg',
                    colors.bg,
                    colors.text
                  )}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(eventEntries.length > 0 ||
        statistics.top_users?.length > 0 ||
        statistics.most_modified_models?.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {eventEntries.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                By Event
              </p>
              <div className="space-y-2">
                {eventEntries.map(([event, count]) => (
                  <div
                    key={event}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-gray-700 dark:text-gray-300">
                      {event}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statistics.top_users?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Top Users
              </p>
              <div className="space-y-2">
                {statistics.top_users.slice(0, 5).map((user) => (
                  <div
                    key={`${user.type}-${user.id}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {user.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statistics.most_modified_models?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Most Modified Models
              </p>
              <div className="space-y-2">
                {statistics.most_modified_models.slice(0, 5).map((model) => (
                  <div
                    key={model.type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {model.type}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {model.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
