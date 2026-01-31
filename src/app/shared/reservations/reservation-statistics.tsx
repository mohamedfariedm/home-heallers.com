'use client';

import {
  PiCalendarCheckBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiCheckCircleBold,
  PiXCircleBold,
  PiClockBold,
  PiHourglassBold,
  PiCheckBold,
  PiWarningBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';

interface ReservationStatistics {
  by_status?: {
    reviewing?: number;
    waitconfirm?: number;
    confirmed?: number;
    canceled?: number;
    completed?: number;
    failed?: number;
  };
  seen_count?: number;
  unseen_count?: number;
  total_count?: number;
}

interface ReservationStatisticsProps {
  statistics?: ReservationStatistics | null;
  className?: string;
}

export default function ReservationStatistics({ 
  statistics, 
  className 
}: ReservationStatisticsProps) {
  // Static data for now - will be replaced with statistics prop in the future
  const stats = statistics || {
    by_status: {
      reviewing: 1659,
      waitconfirm: 0,
      confirmed: 11,
      canceled: 7,
      completed: 9,
      failed: 5,
    },
    seen_count: 1691,
    unseen_count: 0,
    total_count: 1691,
  };

  const cards = [
    {
      title: 'Total Reservations',
      value: stats.total_count || 0,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
    },
    {
      title: 'Reviewing',
      value: stats.by_status?.reviewing || 0,
      icon: PiHourglassBold,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      darkBgColor: 'dark:bg-amber-900/20',
      darkTextColor: 'dark:text-amber-400',
      blurColor: 'bg-amber-50/50',
      darkBlurColor: 'dark:bg-amber-900/10',
    },
    {
      title: 'Wait Confirm',
      value: stats.by_status?.waitconfirm || 0,
      icon: PiClockBold,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      darkBgColor: 'dark:bg-yellow-900/20',
      darkTextColor: 'dark:text-yellow-400',
      blurColor: 'bg-yellow-50/50',
      darkBlurColor: 'dark:bg-yellow-900/10',
    },
    {
      title: 'Confirmed',
      value: stats.by_status?.confirmed || 0,
      icon: PiCheckCircleBold,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      darkBgColor: 'dark:bg-green-900/20',
      darkTextColor: 'dark:text-green-400',
      blurColor: 'bg-green-50/50',
      darkBlurColor: 'dark:bg-green-900/10',
    },
    {
      title: 'Completed',
      value: stats.by_status?.completed || 0,
      icon: PiCheckBold,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      darkBgColor: 'dark:bg-emerald-900/20',
      darkTextColor: 'dark:text-emerald-400',
      blurColor: 'bg-emerald-50/50',
      darkBlurColor: 'dark:bg-emerald-900/10',
    },
    {
      title: 'Canceled',
      value: stats.by_status?.canceled || 0,
      icon: PiXCircleBold,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      darkBgColor: 'dark:bg-red-900/20',
      darkTextColor: 'dark:text-red-400',
      blurColor: 'bg-red-50/50',
      darkBlurColor: 'dark:bg-red-900/10',
    },
    {
      title: 'Failed',
      value: stats.by_status?.failed || 0,
      icon: PiWarningBold,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      darkBgColor: 'dark:bg-orange-900/20',
      darkTextColor: 'dark:text-orange-400',
      blurColor: 'bg-orange-50/50',
      darkBlurColor: 'dark:bg-orange-900/10',
    },
    {
      title: 'Seen',
      value: stats.seen_count || 0,
      icon: PiEyeBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
    },
    {
      title: 'Unseen',
      value: stats.unseen_count || 0,
      icon: PiEyeSlashBold,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      darkBgColor: 'dark:bg-gray-900/20',
      darkTextColor: 'dark:text-gray-400',
      blurColor: 'bg-gray-50/50',
      darkBlurColor: 'dark:bg-gray-900/10',
    },
  ];

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reservation Statistics
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of reservation statuses and counts
        </p>
      </div>
      
      <div className={cn('flex w-full overflow-x-auto pb-4 gap-5', className)}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="min-w-[200px] flex-1 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  card.bgColor,
                  card.textColor,
                  card.darkBgColor,
                  card.darkTextColor
                )}
              >
                <card.icon className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </p>
            </div>

            <div
              className={cn(
                'absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full blur-2xl',
                card.blurColor,
                card.darkBlurColor
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
