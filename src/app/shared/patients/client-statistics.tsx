'use client';

import {
  PiCalendarCheckBold,
  PiCheckBold,
  PiCheckCircleBold,
  PiClockBold,
  PiCurrencyDollarBold,
  PiHourglassBold,
  PiIdentificationCardBold,
  PiPhoneBold,
  PiRepeatBold,
  PiTagBold,
  PiUserPlusBold,
  PiUsersBold,
  PiWarningBold,
  PiXCircleBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import { ReservationStatus } from '@/utils/reservation-payment';
import type { ClientListStatistics } from '@/types/client-statistics';
import {
  formatPercent,
  metricToneLabel,
  toPercent,
  toneColors,
  toneForProfileCompleteness,
} from '@/utils/dashboard-metric-helpers';
import KpiStatCard, {
  KPI_STAT_GRID_CLASS,
  type KpiStatCardTone,
} from '@/app/shared/kpis/kpi-stat-card';

interface ClientStatisticsProps {
  statistics?: ClientListStatistics | null;
  className?: string;
}

type CardStyle = KpiStatCardTone;

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
};

const DEFAULT_STYLE: CardStyle = {
  bgColor: 'bg-slate-50',
  textColor: 'text-slate-600',
  darkBgColor: 'dark:bg-slate-900/20',
  darkTextColor: 'dark:text-slate-400',
  blurColor: 'bg-slate-50/50',
  darkBlurColor: 'dark:bg-slate-900/10',
};

const STATUS_ICONS: Record<number, any> = {
  [ReservationStatus.Reviewing]: PiHourglassBold,
  [ReservationStatus.WaitConfirm]: PiClockBold,
  [ReservationStatus.Confirmed]: PiCheckCircleBold,
  [ReservationStatus.Canceled]: PiXCircleBold,
  [ReservationStatus.Completed]: PiCheckBold,
  [ReservationStatus.Failed]: PiWarningBold,
};

function convertApiLinkToQueryParams(apiLink: string | undefined): string {
  if (!apiLink) return '';
  try {
    return new URL(apiLink).searchParams.toString();
  } catch {
    return '';
  }
}

function StatCard({
  title,
  value,
  subtitle,
  toneLabel,
  icon,
  style,
  link,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  toneLabel?: string;
  icon: any;
  style: CardStyle;
  link?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <KpiStatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      tone={style}
      badge={
        toneLabel ? (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
              style.bgColor,
              style.textColor,
              style.darkBgColor,
              style.darkTextColor
            )}
          >
            {toneLabel}
          </span>
        ) : undefined
      }
      onClick={
        link
          ? () => {
              const q = convertApiLinkToQueryParams(link);
              router.push(q ? `${pathname}?${q}` : pathname);
            }
          : undefined
      }
    />
  );
}

const infoStyle: CardStyle = {
  bgColor: 'bg-indigo-50',
  textColor: 'text-indigo-600',
  darkBgColor: 'dark:bg-indigo-900/20',
  darkTextColor: 'dark:text-indigo-400',
  blurColor: 'bg-indigo-50/50',
  darkBlurColor: 'dark:bg-indigo-900/10',
};

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

  const completenessPercent = Number(
    statistics.profile_completeness?.average_percent ?? 0
  );
  const completenessTone = toneForProfileCompleteness(completenessPercent);
  const completenessStyle = toneColors(completenessTone);

  const activePatients = statistics.active_patients_count ?? 0;
  const repeatBookers = statistics.with_multiple_reservations?.users_count ?? 0;
  const repeatRateBase =
    activePatients > 0
      ? activePatients
      : Object.values(statistics.by_status || {}).reduce(
          (sum, item) => sum + (item.users_count || 0),
          0
        );
  const fallbackRepeatRate = toPercent(repeatBookers, repeatRateBase);
  const repeatPatientRate =
    typeof statistics.repeat_patient_rate === 'number'
      ? Number(statistics.repeat_patient_rate)
      : fallbackRepeatRate;

  const summaryCards = [
    {
      title: 'Patients with valid booking (period)',
      value: activePatients,
      subtitle: 'Not canceled/failed/pending payment',
      icon: PiUsersBold,
      style: {
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        darkBgColor: 'dark:bg-emerald-900/20',
        darkTextColor: 'dark:text-emerald-400',
        blurColor: 'bg-emerald-50/50',
        darkBlurColor: 'dark:bg-emerald-900/10',
      },
      link: statistics.active_patients_link,
    },
    {
      title: 'New Patients',
      value: statistics.new_patients_count ?? 0,
      icon: PiUserPlusBold,
      style: {
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-600',
        darkBgColor: 'dark:bg-sky-900/20',
        darkTextColor: 'dark:text-sky-400',
        blurColor: 'bg-sky-50/50',
        darkBlurColor: 'dark:bg-sky-900/10',
      },
      link: statistics.new_patients_link,
    },
    {
      title: 'Returning Patients',
      value: statistics.returning_patients_count ?? 0,
      icon: PiRepeatBold,
      style: {
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
        darkBgColor: 'dark:bg-cyan-900/20',
        darkTextColor: 'dark:text-cyan-400',
        blurColor: 'bg-cyan-50/50',
        darkBlurColor: 'dark:bg-cyan-900/10',
      },
      link: statistics.returning_patients_link,
    },
    {
      title: 'Repeat Patient Rate',
      value: formatPercent(repeatPatientRate),
      subtitle: `${repeatBookers} with 2+ reservations`,
      icon: PiRepeatBold,
      style: {
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-600',
        darkBgColor: 'dark:bg-teal-900/20',
        darkTextColor: 'dark:text-teal-400',
        blurColor: 'bg-teal-50/50',
        darkBlurColor: 'dark:bg-teal-900/10',
      },
      link: statistics.with_multiple_reservations?.link,
    },
    ...('inactive_patients_count' in statistics
      ? [
          {
            title: 'Inactive Patients',
            value: statistics.inactive_patients_count ?? 0,
            subtitle: 'No valid booking in 90 days',
            icon: PiClockBold,
            style: {
              bgColor: 'bg-amber-50',
              textColor: 'text-amber-600',
              darkBgColor: 'dark:bg-amber-900/20',
              darkTextColor: 'dark:text-amber-400',
              blurColor: 'bg-amber-50/50',
              darkBlurColor: 'dark:bg-amber-900/10',
            },
            link: statistics.inactive_patients_link,
          },
        ]
      : []),
    ...('avg_days_since_last_booking' in statistics
      ? [
          {
            title: 'Avg Days Since Last Booking',
            value: Number(statistics.avg_days_since_last_booking ?? 0).toFixed(1),
            icon: PiCalendarCheckBold,
            style: infoStyle,
          },
        ]
      : []),
    {
      title: 'Profile Completeness',
      value: `${completenessPercent.toFixed(2)}%`,
      subtitle: `${statistics.profile_completeness?.patients_count ?? 0} booked profiles`,
      toneLabel: metricToneLabel(completenessTone),
      icon: PiIdentificationCardBold,
      style: {
        bgColor: completenessStyle.bgColor,
        textColor: completenessStyle.textColor,
        darkBgColor: completenessStyle.darkBgColor,
        darkTextColor: completenessStyle.darkTextColor,
        blurColor: completenessStyle.blurColor,
        darkBlurColor: completenessStyle.darkBlurColor,
      },
    },
  ];

  const qualityCards = [
    {
      title: 'Missing National ID',
      value: statistics.missing_national_id_count ?? 0,
      icon: PiIdentificationCardBold,
      style: DEFAULT_STYLE,
      link: statistics.missing_national_id_link,
    },
    {
      title: 'Missing Mobile',
      value: statistics.missing_mobile_count ?? 0,
      icon: PiPhoneBold,
      style: DEFAULT_STYLE,
      link: statistics.missing_mobile_link,
    },
    {
      title: 'Shared Mobiles (info)',
      value: statistics.shared_mobile_count ?? 0,
      subtitle: 'Families may share a phone',
      icon: PiPhoneBold,
      style: infoStyle,
      link: statistics.shared_mobile_link,
    },
    {
      title: 'Duplicate Identities',
      value: statistics.duplicate_identity_count ?? statistics.duplicate_mobile_count ?? 0,
      subtitle: 'Same National ID on multiple records',
      icon: PiWarningBold,
      style: {
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        darkBgColor: 'dark:bg-red-900/20',
        darkTextColor: 'dark:text-red-400',
        blurColor: 'bg-red-50/50',
        darkBlurColor: 'dark:bg-red-900/10',
      },
      link: statistics.duplicate_identity_link || statistics.duplicate_mobile_link,
    },
    {
      title: 'Placeholder Values',
      value: statistics.placeholder_value_count ?? 0,
      icon: PiWarningBold,
      style: {
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        darkBgColor: 'dark:bg-amber-900/20',
        darkTextColor: 'dark:text-amber-400',
        blurColor: 'bg-amber-50/50',
        darkBlurColor: 'dark:bg-amber-900/10',
      },
      link: statistics.placeholder_value_link,
    },
    {
      title: 'Profiles without bookings',
      value: statistics.profiles_without_bookings_count ?? 0,
      icon: PiUsersBold,
      style: DEFAULT_STYLE,
    },
  ];

  const canSeeRevenue = statistics != null && 'total_revenue' in statistics;
  const revenueCards = canSeeRevenue
    ? [
        {
          title: 'Collected Booking Value',
          value: Number(statistics.total_revenue ?? 0).toLocaleString(),
          subtitle: 'SAR · paid reservations (not accounting revenue)',
          icon: PiCurrencyDollarBold,
          style: {
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            darkBgColor: 'dark:bg-green-900/20',
            darkTextColor: 'dark:text-green-400',
            blurColor: 'bg-green-50/50',
            darkBlurColor: 'dark:bg-green-900/10',
          },
        },
        {
          title: 'Avg / Paying Patient',
          value: Number(statistics.avg_revenue_per_paying_patient ?? 0).toLocaleString(),
          icon: PiCurrencyDollarBold,
          style: infoStyle,
        },
        {
          title: 'Avg Booking Value',
          value: Number(statistics.avg_booking_value ?? 0).toLocaleString(),
          icon: PiCurrencyDollarBold,
          style: infoStyle,
        },
        ...('high_value_patients_count' in statistics
          ? [
              {
                title: 'High-value Patients',
                value: statistics.high_value_patients_count ?? 0,
                subtitle: 'Collected ≥ 5000 SAR',
                icon: PiCurrencyDollarBold,
                style: {
                  bgColor: 'bg-emerald-50',
                  textColor: 'text-emerald-600',
                  darkBgColor: 'dark:bg-emerald-900/20',
                  darkTextColor: 'dark:text-emerald-400',
                  blurColor: 'bg-emerald-50/50',
                  darkBlurColor: 'dark:bg-emerald-900/10',
                },
                link: statistics.high_value_patients_link,
              },
            ]
          : []),
        ...('ltv_avg' in statistics
          ? [
              {
                title: 'Avg LTV',
                value: Number(statistics.ltv_avg ?? 0).toLocaleString(),
                subtitle: 'SAR collected / patient',
                icon: PiCurrencyDollarBold,
                style: infoStyle,
              },
            ]
          : []),
      ]
    : [];

  const ltvBucketCards =
    canSeeRevenue && (statistics.ltv_by_bucket || []).length > 0
      ? (statistics.ltv_by_bucket || []).map((b) => ({
          title: `LTV ${b.bucket}`,
          value: b.count,
          icon: PiCurrencyDollarBold,
          style: infoStyle,
          link: b.link,
        }))
      : [];

  const insightCards = [
    {
      title: 'Used Coupon',
      value: statistics.with_coupon?.users_count ?? 0,
      subtitle: 'Clients with coupon reservation',
      icon: PiTagBold,
      style: infoStyle,
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

  const completenessBuckets = statistics.profile_completeness?.buckets || [];

  const rows = [
    { title: 'Patient Summary KPIs', cards: summaryCards },
    ...(revenueCards.length > 0
      ? [{ title: 'Collected Booking Value', cards: revenueCards }]
      : []),
    ...(ltvBucketCards.length > 0
      ? [{ title: 'LTV Buckets', cards: ltvBucketCards }]
      : []),
    { title: 'Data Quality', cards: qualityCards },
    ...(completenessBuckets.length > 0
      ? [
          {
            title: 'Profile Completeness Buckets',
            cards: completenessBuckets.map((b) => ({
              title: `${b.bucket}%`,
              value: b.count,
              icon: PiIdentificationCardBold,
              style: infoStyle,
              link: b.link,
            })),
          },
        ]
      : []),
    { title: 'Existing Insights', cards: insightCards },
    { title: 'Clients by Reservation Status', cards: statusCards },
  ];

  return (
    <div className={cn('w-full space-y-8', className)}>
      {rows.map((row) => (
        <section key={row.title} className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            {row.title}
          </h4>
          <div className={KPI_STAT_GRID_CLASS}>
            {row.cards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
