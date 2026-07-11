'use client';

import {
  PiCalendarCheckBold,
  PiCheckBold,
  PiCheckCircleBold,
  PiClockBold,
  PiHourglassBold,
  PiRepeatBold,
  PiTagBold,
  PiWarningBold,
  PiXCircleBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import { ReservationStatus } from '@/utils/reservation-payment';
import type { ClientListStatistics } from '@/types/client-statistics';

interface ClientStatisticsProps {
  statistics?: ClientListStatistics | null;
  className?: string;
}

type CardStyle = {
  bgColor: string;
  textColor: string;
  darkBgColor: string;
  darkTextColor: string;
  blurColor: string;
  darkBlurColor: string;
};

const STATUS_STYLES: Record<number, CardStyle> = {
  [ReservationStatus.Reviewing]: {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    darkBgColor: 'dark:bg-amber-900/20',
    darkTextColor: 'dark:text-amber-400',
    blurColor: 'bg-amber-50/50',
    darkBlurColor: 'dark:bg-amber-900/10',
  },
  [ReservationStatus.WaitConfirm]: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    darkBgColor: 'dark:bg-yellow-900/20',
    darkTextColor: 'dark:text-yellow-400',
    blurColor: 'bg-yellow-50/50',
    darkBlurColor: 'dark:bg-yellow-900/10',
  },
  [ReservationStatus.Confirmed]: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    darkBgColor: 'dark:bg-green-900/20',
    darkTextColor: 'dark:text-green-400',
    blurColor: 'bg-green-50/50',
    darkBlurColor: 'dark:bg-green-900/10',
  },
  [ReservationStatus.Canceled]: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    darkBgColor: 'dark:bg-red-900/20',
    darkTextColor: 'dark:text-red-400',
    blurColor: 'bg-red-50/50',
    darkBlurColor: 'dark:bg-red-900/10',
  },
  [ReservationStatus.Completed]: {
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    darkBgColor: 'dark:bg-emerald-900/20',
    darkTextColor: 'dark:text-emerald-400',
    blurColor: 'bg-emerald-50/50',
    darkBlurColor: 'dark:bg-emerald-900/10',
  },
  [ReservationStatus.Failed]: {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    darkBgColor: 'dark:bg-orange-900/20',
    darkTextColor: 'dark:text-orange-400',
    blurColor: 'bg-orange-50/50',
    darkBlurColor: 'dark:bg-orange-900/10',
  },
  [ReservationStatus.PendingPayment]: {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    darkBgColor: 'dark:bg-purple-900/20',
    darkTextColor: 'dark:text-purple-400',
    blurColor: 'bg-purple-50/50',
    darkBlurColor: 'dark:bg-purple-900/10',
  },
};

const DEFAULT_STYLE: CardStyle = {
  bgColor: 'bg-slate-50',
  textColor: 'text-slate-600',
  darkBgColor: 'dark:bg-slate-900/20',
  darkTextColor: 'dark:text-slate-400',
  blurColor: 'bg-slate-50/50',
  darkBlurColor: 'dark:bg-slate-900/10',
};

const STATUS_ICONS: Record<number, typeof PiCalendarCheckBold> = {
  [ReservationStatus.Reviewing]: PiHourglassBold,
  [ReservationStatus.WaitConfirm]: PiClockBold,
  [ReservationStatus.Confirmed]: PiCheckCircleBold,
  [ReservationStatus.Canceled]: PiXCircleBold,
  [ReservationStatus.Completed]: PiCheckBold,
  [ReservationStatus.Failed]: PiWarningBold,
  [ReservationStatus.PendingPayment]: PiCalendarCheckBold,
};

const convertApiLinkToQueryParams = (apiLink: string | undefined): string => {
  if (!apiLink) return '';

  try {
    const url = new URL(apiLink);
    const params = new URLSearchParams(url.search);
    const frontendParams = new URLSearchParams();

    params.forEach((value, key) => {
      frontendParams.set(key, value);
    });

    return frontendParams.toString();
  } catch (error) {
    console.error('Error converting API link:', error);
    return '';
  }
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  style,
  link,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: typeof PiCalendarCheckBold;
  style: CardStyle;
  link?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (!link) return;
    const queryParams = convertApiLinkToQueryParams(link);
    const url = queryParams ? `${pathname}?${queryParams}` : pathname;
    router.push(url);
  };

  return (
    <div
      role={link ? 'button' : undefined}
      tabIndex={link ? 0 : undefined}
      onClick={link ? handleClick : undefined}
      onKeyDown={
        link
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={cn(
        'relative min-w-[180px] flex-1 basis-[calc(20%-16px)] overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow dark:border-gray-700 dark:bg-gray-800',
        link && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            style.bgColor,
            style.textColor,
            style.darkBgColor,
            style.darkTextColor
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      <div
        className={cn(
          'absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full blur-2xl',
          style.blurColor,
          style.darkBlurColor
        )}
      />
    </div>
  );
}

export default function ClientStatistics({ statistics, className }: ClientStatisticsProps) {
  if (!statistics) return null;

  const statusCards = Object.values(statistics.by_status || {})
    .sort((a, b) => a.status - b.status)
    .map((item) => ({
      title: item.label,
      value: item.users_count,
      subtitle: 'Clients with reservation',
      icon: STATUS_ICONS[item.status] || PiCalendarCheckBold,
      style: STATUS_STYLES[item.status] || DEFAULT_STYLE,
      link: item.link,
    }));

  const insightCards = [
    {
      title: 'Used Coupon',
      value: statistics.with_coupon?.users_count ?? 0,
      subtitle: 'Clients with coupon reservation',
      icon: PiTagBold,
      style: {
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        darkBgColor: 'dark:bg-indigo-900/20',
        darkTextColor: 'dark:text-indigo-400',
        blurColor: 'bg-indigo-50/50',
        darkBlurColor: 'dark:bg-indigo-900/10',
      },
      link: statistics.with_coupon?.link,
    },
    {
      title: 'Repeat Bookers',
      value: statistics.with_multiple_reservations?.users_count ?? 0,
      subtitle: '2+ reservations',
      icon: PiRepeatBold,
      style: {
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
        darkBgColor: 'dark:bg-cyan-900/20',
        darkTextColor: 'dark:text-cyan-400',
        blurColor: 'bg-cyan-50/50',
        darkBlurColor: 'dark:bg-cyan-900/10',
      },
      link: statistics.with_multiple_reservations?.link,
    },
    {
      title: 'Multi-Session Bookings',
      value: statistics.with_multiple_dates_same_reservation?.users_count ?? 0,
      subtitle: '2+ dates on same reservation',
      icon: PiCalendarCheckBold,
      style: {
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-600',
        darkBgColor: 'dark:bg-pink-900/20',
        darkTextColor: 'dark:text-pink-400',
        blurColor: 'bg-pink-50/50',
        darkBlurColor: 'dark:bg-pink-900/10',
      },
      link: statistics.with_multiple_dates_same_reservation?.link,
    },
  ];

  const rows = [
    { title: 'Clients by Reservation Status', cards: statusCards },
    { title: 'Client Insights', cards: insightCards },
  ];

  return (
    <div className={cn('w-full space-y-6', className)}>
      {rows.map((row) => (
        <div key={row.title} className="space-y-3">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {row.title}
          </h4>
          <div className="flex w-full flex-wrap gap-5 pb-2">
            {row.cards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
