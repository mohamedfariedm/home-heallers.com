'use client';

import {
  PiCalendarCheckBold,
  PiUsersBold,
  PiUserCircleBold,
  PiFileTextBold,
  PiArrowUpRightBold,
  PiReceiptBold,
  PiClockBold,
  PiRepeatBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import {
  formatRatePercent,
  getPerformanceColors,
  getPerformanceLabel,
  getRatePerformance,
} from './metric-thresholds';
import type { ConversionRateItem } from './conversion-rate-chart';

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
  sessions_statistics?: {
    total_sessions: number;
    total_reservations: number;
  };
  reservation_rate?: {
    successful_count: number;
    total_count: number;
    rate: number;
  };
  package_conversion_rate?: {
    repeat_clients: number;
    clients_with_reservation: number;
    rate: number;
  };
  conversion_rate?: ConversionRateItem[];
}

interface StatCardsProps {
  data: AggregateData | null;
  className?: string;
  hasPermission?: (permission: string) => boolean;
}

function computeOverallConversionRate(
  items: ConversionRateItem[] | undefined,
  fallbackSupport: number,
  fallbackReservations: number
): number {
  if (items && items.length > 0) {
    const support = items.reduce((sum, i) => sum + i.customer_support_count, 0);
    const reservations = items.reduce(
      (sum, i) => sum + i.reservations_count,
      0
    );
    if (support > 0) return reservations / support;
  }
  if (fallbackSupport > 0) return fallbackReservations / fallbackSupport;
  return 0;
}

export default function StatCards({ data, className, hasPermission }: StatCardsProps) {
  if (!data) return null;

  const overallConversionRate = computeOverallConversionRate(
    data.conversion_rate,
    data.customer_support?.total ?? 0,
    data.reservations?.total ?? 0
  );

  const rateCards: Array<{
    permission: string;
    title: string;
    value: string;
    subtitle?: string;
    icon: typeof PiArrowUpRightBold;
    metric: 'reservation_rate' | 'conversion_rate' | 'package_conversion';
    rate: number;
    show: boolean;
  }> = [
    {
      permission: 'dashboard.reservation_rate',
      title: 'Reservation Rate',
      value: data.reservation_rate
        ? formatRatePercent(data.reservation_rate.rate)
        : '0%',
      subtitle: data.reservation_rate
        ? `${data.reservation_rate.successful_count.toLocaleString()} / ${data.reservation_rate.total_count.toLocaleString()} confirmed`
        : undefined,
      icon: PiCalendarCheckBold,
      metric: 'reservation_rate',
      rate: data.reservation_rate?.rate ?? 0,
      show: Boolean(data.reservation_rate),
    },
    {
      permission: 'dashboard.conversion_rate',
      title: 'Conversion Rate',
      value: formatRatePercent(overallConversionRate),
      subtitle: data.conversion_rate?.length
        ? `${data.conversion_rate.length} campaigns`
        : data.customer_support?.total
          ? `${(data.reservations?.total ?? 0).toLocaleString()} / ${data.customer_support.total.toLocaleString()} tickets`
          : undefined,
      icon: PiArrowUpRightBold,
      metric: 'conversion_rate',
      rate: overallConversionRate,
      show:
        Boolean(data.conversion_rate?.length) ||
        Boolean(data.customer_support?.total && data.reservations?.total),
    },
    {
      permission: 'dashboard.package_conversion_rate',
      title: 'Package Conversion',
      value: data.package_conversion_rate
        ? formatRatePercent(data.package_conversion_rate.rate)
        : '0%',
      subtitle: data.package_conversion_rate
        ? `${data.package_conversion_rate.repeat_clients.toLocaleString()} / ${data.package_conversion_rate.clients_with_reservation.toLocaleString()} repeat clients`
        : undefined,
      icon: PiRepeatBold,
      metric: 'package_conversion',
      rate: data.package_conversion_rate?.rate ?? 0,
      show: Boolean(data.package_conversion_rate),
    },
  ];

  const staticCards = [
    {
      permission: 'dashboard.total_reservations',
      title: 'Total Reservations',
      value: String(data.reservations?.total || 0),
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      show: true,
    },
    {
      permission: 'dashboard.support_tickets',
      title: 'Support Tickets',
      value: String(data.customer_support?.total || 0),
      icon: PiFileTextBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
      show: true,
    },
    {
      permission: 'dashboard.total_invoices',
      title: 'Total Invoices',
      value: String(data.invoices?.total || 0),
      icon: PiReceiptBold,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      darkBgColor: 'dark:bg-purple-900/20',
      darkTextColor: 'dark:text-purple-400',
      blurColor: 'bg-purple-50/50',
      darkBlurColor: 'dark:bg-purple-900/10',
      show: true,
    },
    {
      permission: 'dashboard.total_revenue',
      title: 'Total Revenue',
      value: data.total_revenue?.toLocaleString() || '0',
      icon: PiReceiptBold,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      darkBgColor: 'dark:bg-emerald-900/20',
      darkTextColor: 'dark:text-emerald-400',
      blurColor: 'bg-emerald-50/50',
      darkBlurColor: 'dark:bg-emerald-900/10',
      show: true,
    },
    {
      permission: 'dashboard.active_doctors',
      title: 'Active Doctors',
      value: String(data.doctors?.total || 0),
      icon: PiUserCircleBold,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      darkBgColor: 'dark:bg-orange-900/20',
      darkTextColor: 'dark:text-orange-400',
      blurColor: 'bg-orange-50/50',
      darkBlurColor: 'dark:bg-orange-900/10',
      show: true,
    },
    {
      permission: 'dashboard.total_clients',
      title: 'Total Clients',
      value: String(data.clients?.total || 0),
      icon: PiUsersBold,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      darkBgColor: 'dark:bg-pink-900/20',
      darkTextColor: 'dark:text-pink-400',
      blurColor: 'bg-pink-50/50',
      darkBlurColor: 'dark:bg-pink-900/10',
      show: true,
    },
    {
      permission: 'dashboard.total_sessions',
      title: 'Total Sessions',
      value: String(data.sessions_statistics?.total_sessions || 0),
      icon: PiClockBold,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      darkBgColor: 'dark:bg-cyan-900/20',
      darkTextColor: 'dark:text-cyan-400',
      blurColor: 'bg-cyan-50/50',
      darkBlurColor: 'dark:bg-cyan-900/10',
      show: true,
    },
  ];

  const visibleRateCards = rateCards.filter(
    (card) =>
      card.show &&
      (hasPermission ? hasPermission(card.permission) : true)
  );

  const visibleStaticCards = staticCards.filter(
    (card) =>
      card.show &&
      (hasPermission ? hasPermission(card.permission) : true)
  );

  return (
    <div className={cn('flex w-full flex-wrap gap-5 pb-4', className)}>
      {visibleRateCards.map((card) => {
        const status = getRatePerformance(card.rate, card.metric);
        const colors = getPerformanceColors(status);

        return (
          <div
            key={card.permission}
            className="relative min-w-[180px] flex-1 basis-[calc(20%-16px)] overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  colors.bgColor,
                  colors.textColor,
                  colors.darkBgColor,
                  colors.darkTextColor
                )}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  colors.badgeClass
                )}
              >
                {getPerformanceLabel(status)}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p
                className={cn(
                  'mt-1 text-3xl font-bold',
                  colors.textColor,
                  colors.darkTextColor
                )}
              >
                {card.value}
              </p>
              {card.subtitle && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {card.subtitle}
                </p>
              )}
            </div>

            <div
              className={cn(
                'absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full blur-2xl',
                colors.blurColor,
                colors.darkBlurColor
              )}
            />
          </div>
        );
      })}

      {visibleStaticCards.map((card) => (
        <div
          key={card.permission}
          className="relative min-w-[180px] flex-1 basis-[calc(20%-16px)] overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
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
