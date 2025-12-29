'use client';

import {
  PiCalendarCheckBold,
  PiUsersBold,
  PiUserCircleBold,
  PiFileTextBold,
  PiArrowUpRightBold,
  PiReceiptBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';

interface AggregateData {
  customer_support?: {
    by_type: Array<{ type: string; label: string; count: number }>;
    total: number;
  };
  reservations?: {
    by_status: Array<{ status: number | string; label: string; count: number }>;
    total: number;
  };
  invoices?: {
    by_status: Array<{ status: string; count: number }>;
    total: number;
  };
  doctors?: {
    total: number;
  };
  clients?: {
    total: number;
  };
  total_revenue?: number;
}

interface StatCardsProps {
  data: AggregateData | null;
  className?: string;
}

export default function StatCards({ data, className }: StatCardsProps) {
  if (!data) return null;

  const cards = [
    {
      title: 'Total Reservations',
      value: data.reservations?.total || 0,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
    },
    {
      title: 'Support Tickets',
      value: data.customer_support?.total || 0,
      icon: PiFileTextBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
    },
    {
      title: 'Total Invoices',
      value: data.invoices?.total || 0,
      icon: PiReceiptBold,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      darkBgColor: 'dark:bg-purple-900/20',
      darkTextColor: 'dark:text-purple-400',
      blurColor: 'bg-purple-50/50',
      darkBlurColor: 'dark:bg-purple-900/10',
    },
    {
      title: 'Total Revenue',
      value: data.total_revenue?.toLocaleString() || 0,
      icon: PiReceiptBold,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      darkBgColor: 'dark:bg-emerald-900/20',
      darkTextColor: 'dark:text-emerald-400',
      blurColor: 'bg-emerald-50/50',
      darkBlurColor: 'dark:bg-emerald-900/10',
    },
    {
      title: 'Active Doctors',
      value: data.doctors?.total || 0,
      icon: PiUserCircleBold,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      darkBgColor: 'dark:bg-orange-900/20',
      darkTextColor: 'dark:text-orange-400',
      blurColor: 'bg-orange-50/50',
      darkBlurColor: 'dark:bg-orange-900/10',
    },
    {
      title: 'Total Clients',
      value: data.clients?.total || 0,
      icon: PiUsersBold,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      darkBgColor: 'dark:bg-pink-900/20',
      darkTextColor: 'dark:text-pink-400',
      blurColor: 'bg-pink-50/50',
      darkBlurColor: 'dark:bg-pink-900/10',
    },
    {
      title: 'Conversion Rate',
      value: (() => {
        const total = data.reservations?.total || 0;
        const confirmed =
          data.reservations?.by_status.find(
            (s) => s.status === 3 || s.status === '3'
          )?.count || 0;
        return total > 0 ? `${((confirmed / total) * 100).toFixed(1)}%` : '0%';
      })(),
      icon: PiArrowUpRightBold,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      darkBgColor: 'dark:bg-violet-900/20',
      darkTextColor: 'dark:text-violet-400',
      blurColor: 'bg-violet-50/50',
      darkBlurColor: 'dark:bg-violet-900/10',
    },
  ];

  return (
    <div className={cn('flex w-full overflow-x-auto pb-4 gap-5', className)}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="min-w-[280px] flex-1 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
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
              {card.value}
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
  );
}
