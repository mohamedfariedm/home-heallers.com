'use client';

import { useState, useEffect } from 'react';
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
  PiCurrencyDollarBold,
  PiMoneyBold,
  PiCreditCardBold,
  PiUsersBold,
  PiChartBarBold,
  PiGridFourBold,
  PiTagBold,
  PiArrowRightBold,
  PiCaretDownBold,
  PiCaretUpBold,
  PiUserMinusBold,
  PiCalendarBlankBold,
  PiMapPinBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import KpiStatCard, { KPI_STAT_GRID_CLASS } from '@/app/shared/kpis/kpi-stat-card';
import {
  formatPercent,
  metricToneLabel,
  sumUnknownSourceCount,
  toPercent,
  toneColors,
  toneForCancellationRate,
  toneForCollectionRate,
  toneForConfirmationRate,
  toneForUnknownSource,
  type MetricTone,
} from '@/utils/dashboard-metric-helpers';
import { formatStatusReasonLabel } from '@/config/dashboard-enums';
import { formatSourceCampaign } from '@/app/shared/source-campaign-options';

interface StatusCount {
  count?: number;
  sessions_count?: number;
  link?: string;
}

interface ReservationStatistics {
  by_status?: {
    reviewing?: StatusCount | number;
    waitconfirm?: StatusCount | number;
    confirmed?: StatusCount | number;
    canceled?: StatusCount | number;
    completed?: StatusCount | number;
    failed?: StatusCount | number;
  };
  seen_count?: number;
  unseen_count?: number;
  total_count?: number;
  paid_statistics?: {
    count?: number;
    total_amount?: number;
    link?: string;
  };
  unpaid_statistics?: {
    count?: number;
    total_amount?: number;
    link?: string;
  };
  cash_pending_statistics?: {
    count?: number;
    total_amount?: number;
    link?: string;
  };
  remaining_payment_statistics?: {
    count?: number;
    total_remaining?: number;
    link?: string;
  };
  by_source_campaign?: Array<{
    source_campaign?: string | null;
    reservations_count?: number;
    sessions_count?: number;
    link?: string;
  }>;
  by_service?: Array<{
    service_id?: number;
    service_name_ar?: string;
    reservations_count?: number;
    sessions_count?: number;
    link?: string;
  }>;
  by_category?: Array<{
    category_id?: number;
    category_name_ar?: string;
    category_name_en?: string;
    reservations_count?: number;
    sessions_count?: number;
    link?: string;
  }>;
  customers?: {
    total_unique_customers?: {
      count?: number;
      link?: string;
    };
    multiple_bookings?: {
      customers_count?: number;
      total_reservations?: number;
      total_sessions?: number;
      reservations_link?: string;
      clients_link?: string;
    };
  };
  by_cancellation_reason?: Array<{
    status_reason: string;
    count: number;
    canceled_count: number;
    failed_count: number;
    link: string;
  }>;
  unassigned_count?: number;
  unassigned_link?: string;
  same_day_count?: number;
  same_day_link?: string;
  same_day_unassigned_count?: number;
  same_day_unassigned_link?: string;
  upcoming_sessions?: {
    count: number;
    reservations_count: number;
    link: string;
  };
  unscheduled_sessions_count?: number;
  unscheduled_sessions_link?: string;
  sessions_per_reservation?: number;
  package_conversion_rate?: number;
  single_session_clients_count?: number;
  single_session_clients_link?: string;
  package_completion_rate?: number;
  completion_rate?: number;
  sessions_by_city?: Array<{
    city_id?: number | null;
    city?: string | null;
    sessions_count?: number;
    link?: string;
  }>;
  cancellation_by_city?: Array<{
    city_id?: number | null;
    city?: string | null;
    reservations_count?: number;
    canceled_count?: number;
    cancellation_rate?: number;
    link?: string;
  }>;
  unknown_location_rate?: number;
  conversion_by_city?: Array<{
    city_id?: number | null;
    city?: string | null;
    leads_count?: number;
    reservations_count?: number;
    conversion_rate?: number;
    link?: string;
  }>;
  /** Permission-gated money keys */
  gross_revenue?: number;
  collected_revenue?: number;
  pending_revenue?: number;
  collection_rate?: number;
  revenue_by_city?: Array<{
    city_id?: number | null;
    city?: string | null;
    collected_revenue?: number;
    link?: string;
  }>;
}

interface ReservationStatisticsProps {
  statistics?: ReservationStatistics | null;
  className?: string;
}

// Helper function to get count from status (handles both old and new format)
const getStatusCount = (status: StatusCount | number | undefined): number => {
  if (!status) return 0;
  if (typeof status === 'number') return status;
  return status.count || 0;
};

// Helper function to get sessions count from status
const getStatusSessionsCount = (status: StatusCount | number | undefined): number => {
  if (!status) return 0;
  if (typeof status === 'number') return 0;
  return status.sessions_count || 0;
};

// Helper function to get link from status
const getStatusLink = (status: StatusCount | number | undefined): string | undefined => {
  if (!status) return undefined;
  if (typeof status === 'number') return undefined;
  return status.link;
};

// Helper function to convert API link to frontend query params
const convertApiLinkToQueryParams = (apiLink: string | undefined): string => {
  if (!apiLink) return '';
  
  try {
    const url = new URL(apiLink);
    const params = new URLSearchParams(url.search);
    
    // Convert API query params to frontend format
    const frontendParams = new URLSearchParams();
    
    params.forEach((value, key) => {
      // Convert API format to frontend format
      // e.g., status_equal=1 -> status=1
      // e.g., paid_equal=1 -> paid=1
      // e.g., source_campaign_equal=google -> source_campaign=google
      
      
        frontendParams.set(key, value);
      
    });
    
    return frontendParams.toString();
  } catch (error) {
    console.error('Error converting API link:', error);
    return '';
  }
};

const StatCard = ({
  title,
  value,
  subtitle,
  toneLabel,
  icon,
  bgColor,
  textColor,
  darkBgColor,
  darkTextColor,
  blurColor,
  darkBlurColor,
  link,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckboxChange,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  toneLabel?: string;
  icon: any;
  bgColor: string;
  textColor: string;
  darkBgColor: string;
  darkTextColor: string;
  blurColor: string;
  darkBlurColor: string;
  link?: string;
  onClick?: () => void;
  compact?: boolean;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <KpiStatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      tone={{
        bgColor,
        textColor,
        darkBgColor,
        darkTextColor,
        blurColor,
        darkBlurColor,
      }}
      badge={
        toneLabel ? (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
              bgColor,
              textColor,
              darkBgColor,
              darkTextColor
            )}
          >
            {toneLabel}
          </span>
        ) : undefined
      }
      selected={checked}
      checkbox={
        showCheckbox
          ? {
              checked,
              onChange: (next) => onCheckboxChange?.(next),
            }
          : undefined
      }
      onClick={
        link || onClick
          ? () => {
              if (link) {
                const queryParams = convertApiLinkToQueryParams(link);
                const url = queryParams ? `${pathname}?${queryParams}` : pathname;
                router.push(url);
                return;
              }
              onClick?.();
            }
          : undefined
      }
    />
  );
};

export default function ReservationStatistics({ 
  statistics, 
  className 
}: ReservationStatisticsProps) {
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  // State to track checked source campaigns
  const [checkedSourceCampaigns, setCheckedSourceCampaigns] = useState<Set<string>>(new Set());
  const stats = statistics || {};

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const permissionsRaw = window.localStorage.getItem('permissions');
      if (!permissionsRaw) return;

      const parsed = JSON.parse(permissionsRaw);
      if (Array.isArray(parsed)) {
        setPermissions(parsed.filter((permission): permission is string => typeof permission === 'string'));
      }
    } catch (storageError) {
      console.error('Failed to parse permissions from localStorage:', storageError);
    }
  }, []);

  const hasPermission = (permission: string) => permissions.includes(permission);

  // Calculate total sessions from all statuses
  const totalSessions = 
    getStatusSessionsCount(stats.by_status?.reviewing) +
    getStatusSessionsCount(stats.by_status?.waitconfirm) +
    getStatusSessionsCount(stats.by_status?.confirmed) +
    getStatusSessionsCount(stats.by_status?.completed) +
    getStatusSessionsCount(stats.by_status?.canceled) +
    getStatusSessionsCount(stats.by_status?.failed);

  const totalReservations = stats.total_count || 0;
  const confirmedCount = getStatusCount(stats.by_status?.confirmed);
  const canceledCount = getStatusCount(stats.by_status?.canceled);
  const confirmationRate = toPercent(confirmedCount, totalReservations);
  const cancellationRate = toPercent(canceledCount, totalReservations);
  const paidAmount = Number(stats.paid_statistics?.total_amount || 0);
  const unpaidAmount = Number(stats.unpaid_statistics?.total_amount || 0);
  const fallbackCollectionRate = toPercent(paidAmount, paidAmount + unpaidAmount);
  const collectionRate =
    typeof stats.collection_rate === 'number'
      ? Number(stats.collection_rate)
      : fallbackCollectionRate;
  const { unknownCount, totalCount: sourceTotal } = sumUnknownSourceCount(
    stats.by_source_campaign || []
  );
  const unknownSourceRate = toPercent(unknownCount, sourceTotal || totalReservations);
  const showUnknownSourceAlert = unknownSourceRate > 20;
  const showSameDayUnassignedAlert = (stats.same_day_unassigned_count ?? 0) > 0;
  const showCollectionAlert =
    typeof stats.collection_rate === 'number' && stats.collection_rate < 85;
  const showCancellationAlert = cancellationRate > 12;

  const confirmationToneKey: MetricTone = toneForConfirmationRate(confirmationRate);
  const cancellationToneKey: MetricTone = toneForCancellationRate(cancellationRate);
  const collectionToneKey: MetricTone = toneForCollectionRate(collectionRate);
  const unknownToneKey: MetricTone = toneForUnknownSource(unknownSourceRate);
  const confirmationTone = toneColors(confirmationToneKey);
  const cancellationTone = toneColors(cancellationToneKey);
  const collectionTone = toneColors(collectionToneKey);
  const unknownTone = toneColors(unknownToneKey);

  const topKpiCards = [
    {
      title: 'Total Reservations',
      value: totalReservations,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      compact: true,
    },
    {
      title: 'Total Sessions',
      value: totalSessions,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      darkBgColor: 'dark:bg-sky-900/20',
      darkTextColor: 'dark:text-sky-400',
      blurColor: 'bg-sky-50/50',
      darkBlurColor: 'dark:bg-sky-900/10',
      compact: true,
    },
    {
      title: 'Confirmation Rate',
      value: formatPercent(confirmationRate),
      subtitle: `${confirmedCount} confirmed`,
      toneLabel: metricToneLabel(confirmationToneKey),
      icon: PiCheckCircleBold,
      ...confirmationTone,
      compact: true,
    },
    {
      title: 'Cancellation Rate',
      value: formatPercent(cancellationRate),
      subtitle: `${canceledCount} canceled`,
      toneLabel: metricToneLabel(cancellationToneKey),
      icon: PiXCircleBold,
      ...cancellationTone,
      compact: true,
    },
    ...(hasPermission('dashboard.total_revenue')
      ? [
          {
            title: 'Collection Rate',
            value: formatPercent(collectionRate),
            subtitle:
              typeof stats.collected_revenue === 'number'
                ? `${Number(stats.collected_revenue).toLocaleString()} collected · ${Number(stats.pending_revenue ?? 0).toLocaleString()} pending`
                : `${paidAmount.toLocaleString()} / ${(paidAmount + unpaidAmount).toLocaleString()} SAR`,
            toneLabel: metricToneLabel(collectionToneKey),
            icon: PiMoneyBold,
            ...collectionTone,
            compact: true,
          },
        ]
      : []),
    {
      title: '% Unknown Source',
      value: formatPercent(unknownSourceRate),
      subtitle: `${unknownCount} of ${sourceTotal || totalReservations}`,
      toneLabel: metricToneLabel(unknownToneKey),
      icon: PiTagBold,
      ...unknownTone,
      compact: true,
    },
    {
      title: 'Unassigned',
      value: stats.unassigned_count ?? 0,
      subtitle: 'Open without doctor',
      icon: PiUserMinusBold,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      darkBgColor: 'dark:bg-red-900/20',
      darkTextColor: 'dark:text-red-400',
      blurColor: 'bg-red-50/50',
      darkBlurColor: 'dark:bg-red-900/10',
      link: stats.unassigned_link,
      compact: true,
    },
    {
      title: 'Same-day',
      value: stats.same_day_count ?? 0,
      icon: PiCalendarBlankBold,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      darkBgColor: 'dark:bg-violet-900/20',
      darkTextColor: 'dark:text-violet-400',
      blurColor: 'bg-violet-50/50',
      darkBlurColor: 'dark:bg-violet-900/10',
      link: stats.same_day_link,
      compact: true,
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcoming_sessions?.count ?? 0,
      subtitle: `${stats.upcoming_sessions?.reservations_count ?? 0} reservations (next 7 days)`,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      darkBgColor: 'dark:bg-sky-900/20',
      darkTextColor: 'dark:text-sky-400',
      blurColor: 'bg-sky-50/50',
      darkBlurColor: 'dark:bg-sky-900/10',
      link: stats.upcoming_sessions?.link,
      compact: true,
    },
    {
      title: 'Unscheduled Sessions',
      value: stats.unscheduled_sessions_count ?? 0,
      icon: PiHourglassBold,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      darkBgColor: 'dark:bg-amber-900/20',
      darkTextColor: 'dark:text-amber-400',
      blurColor: 'bg-amber-50/50',
      darkBlurColor: 'dark:bg-amber-900/10',
      link: stats.unscheduled_sessions_link,
      compact: true,
    },
    ...('same_day_unassigned_count' in stats
      ? [
          {
            title: 'Same-day Unassigned',
            value: stats.same_day_unassigned_count ?? 0,
            subtitle: 'Confirmed, no doctor, next 24h',
            icon: PiUserMinusBold,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            darkBgColor: 'dark:bg-red-900/20',
            darkTextColor: 'dark:text-red-400',
            blurColor: 'bg-red-50/50',
            darkBlurColor: 'dark:bg-red-900/10',
            link: stats.same_day_unassigned_link,
            compact: true,
          },
        ]
      : []),
    ...('sessions_per_reservation' in stats
      ? [
          {
            title: 'Sessions / Reservation',
            value: Number(stats.sessions_per_reservation ?? 0).toFixed(2),
            icon: PiCalendarCheckBold,
            bgColor: 'bg-sky-50',
            textColor: 'text-sky-600',
            darkBgColor: 'dark:bg-sky-900/20',
            darkTextColor: 'dark:text-sky-400',
            blurColor: 'bg-sky-50/50',
            darkBlurColor: 'dark:bg-sky-900/10',
            compact: true,
          },
        ]
      : []),
    ...('package_conversion_rate' in stats
      ? [
          {
            title: 'Package Conversion',
            value: formatPercent(Number(stats.package_conversion_rate ?? 0)),
            icon: PiChartBarBold,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            darkBgColor: 'dark:bg-indigo-900/20',
            darkTextColor: 'dark:text-indigo-400',
            blurColor: 'bg-indigo-50/50',
            darkBlurColor: 'dark:bg-indigo-900/10',
            compact: true,
          },
        ]
      : []),
    ...('single_session_clients_count' in stats
      ? [
          {
            title: 'Single-session Clients',
            value: stats.single_session_clients_count ?? 0,
            subtitle: 'Upsell opportunity',
            icon: PiUsersBold,
            bgColor: 'bg-fuchsia-50',
            textColor: 'text-fuchsia-600',
            darkBgColor: 'dark:bg-fuchsia-900/20',
            darkTextColor: 'dark:text-fuchsia-400',
            blurColor: 'bg-fuchsia-50/50',
            darkBlurColor: 'dark:bg-fuchsia-900/10',
            link: stats.single_session_clients_link,
            compact: true,
          },
        ]
      : []),
    ...('package_completion_rate' in stats
      ? [
          {
            title: 'Package Completion',
            value: formatPercent(Number(stats.package_completion_rate ?? 0)),
            icon: PiCheckBold,
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            darkBgColor: 'dark:bg-emerald-900/20',
            darkTextColor: 'dark:text-emerald-400',
            blurColor: 'bg-emerald-50/50',
            darkBlurColor: 'dark:bg-emerald-900/10',
            compact: true,
          },
        ]
      : []),
    ...('completion_rate' in stats
      ? [
          {
            title: 'Session Completion',
            value: formatPercent(Number(stats.completion_rate ?? 0)),
            icon: PiCheckCircleBold,
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-600',
            darkBgColor: 'dark:bg-teal-900/20',
            darkTextColor: 'dark:text-teal-400',
            blurColor: 'bg-teal-50/50',
            darkBlurColor: 'dark:bg-teal-900/10',
            compact: true,
          },
        ]
      : []),
  ];

  // Row 1: Reservation by Status (with Reviewing and Total Sessions)
  const reservationByStatusCards = [
    {
      title: 'Total Reservations',
      value: totalReservations,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      compact: true,
    },
    {
      title: 'Total Sessions',
      value: totalSessions,
      subtitle: 'Across all statuses',
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      compact: true,
    },
    {
      title: 'Reviewing',
      value: getStatusCount(stats.by_status?.reviewing),
      subtitle: `${getStatusSessionsCount(stats.by_status?.reviewing)} sessions`,
      icon: PiHourglassBold,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      darkBgColor: 'dark:bg-amber-900/20',
      darkTextColor: 'dark:text-amber-400',
      blurColor: 'bg-amber-50/50',
      darkBlurColor: 'dark:bg-amber-900/10',
      link: getStatusLink(stats.by_status?.reviewing),
      compact: true,
    },
    {
      title: 'Wait Confirm',
      value: getStatusCount(stats.by_status?.waitconfirm),
      subtitle: `${getStatusSessionsCount(stats.by_status?.waitconfirm)} sessions`,
      icon: PiClockBold,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      darkBgColor: 'dark:bg-yellow-900/20',
      darkTextColor: 'dark:text-yellow-400',
      blurColor: 'bg-yellow-50/50',
      darkBlurColor: 'dark:bg-yellow-900/10',
      link: getStatusLink(stats.by_status?.waitconfirm),
      compact: true,
    },
    {
      title: 'Confirmed',
      value: getStatusCount(stats.by_status?.confirmed),
      subtitle: `${getStatusSessionsCount(stats.by_status?.confirmed)} sessions`,
      icon: PiCheckCircleBold,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      darkBgColor: 'dark:bg-green-900/20',
      darkTextColor: 'dark:text-green-400',
      blurColor: 'bg-green-50/50',
      darkBlurColor: 'dark:bg-green-900/10',
      link: getStatusLink(stats.by_status?.confirmed),
      compact: true,
    },
    {
      title: 'Completed',
      value: getStatusCount(stats.by_status?.completed),
      subtitle: `${getStatusSessionsCount(stats.by_status?.completed)} sessions`,
      icon: PiCheckBold,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      darkBgColor: 'dark:bg-emerald-900/20',
      darkTextColor: 'dark:text-emerald-400',
      blurColor: 'bg-emerald-50/50',
      darkBlurColor: 'dark:bg-emerald-900/10',
      link: getStatusLink(stats.by_status?.completed),
      compact: true,
    },
    {
      title: 'Canceled',
      value: getStatusCount(stats.by_status?.canceled),
      subtitle: `${getStatusSessionsCount(stats.by_status?.canceled)} sessions`,
      icon: PiXCircleBold,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      darkBgColor: 'dark:bg-red-900/20',
      darkTextColor: 'dark:text-red-400',
      blurColor: 'bg-red-50/50',
      darkBlurColor: 'dark:bg-red-900/10',
      link: getStatusLink(stats.by_status?.canceled),
      compact: true,
    },
    {
      title: 'Failed',
      value: getStatusCount(stats.by_status?.failed),
      subtitle: `${getStatusSessionsCount(stats.by_status?.failed)} sessions`,
      icon: PiWarningBold,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      darkBgColor: 'dark:bg-orange-900/20',
      darkTextColor: 'dark:text-orange-400',
      blurColor: 'bg-orange-50/50',
      darkBlurColor: 'dark:bg-orange-900/10',
      link: getStatusLink(stats.by_status?.failed),
      compact: true,
    },
    
  ];

  // Row 2: Review (Paid, Unpaid, Seen, Unseen, Remaining Payment)
  const reviewCards = [
    {
      title: 'Paid',
      value: stats.paid_statistics?.count || 0,
      subtitle: `${(stats.paid_statistics?.total_amount || 0).toLocaleString()} SAR`,
      icon: PiCheckCircleBold,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      darkBgColor: 'dark:bg-green-900/20',
      darkTextColor: 'dark:text-green-400',
      blurColor: 'bg-green-50/50',
      darkBlurColor: 'dark:bg-green-900/10',
      link: stats.paid_statistics?.link,
      compact: true,
    },
    {
      title: 'Unpaid (online)',
      value: stats.unpaid_statistics?.count || 0,
      subtitle: `${(stats.unpaid_statistics?.total_amount || 0).toLocaleString()} SAR`,
      icon: PiXCircleBold,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      darkBgColor: 'dark:bg-red-900/20',
      darkTextColor: 'dark:text-red-400',
      blurColor: 'bg-red-50/50',
      darkBlurColor: 'dark:bg-red-900/10',
      link: stats.unpaid_statistics?.link,
      compact: true,
    },
    {
      title: 'Cash to collect',
      value: stats.cash_pending_statistics?.count || 0,
      subtitle: `${(stats.cash_pending_statistics?.total_amount || 0).toLocaleString()} SAR`,
      icon: PiMoneyBold,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      darkBgColor: 'dark:bg-orange-900/20',
      darkTextColor: 'dark:text-orange-400',
      blurColor: 'bg-orange-50/50',
      darkBlurColor: 'dark:bg-orange-900/10',
      link: stats.cash_pending_statistics?.link,
      compact: true,
    },
    {
      title: 'Outstanding (online)',
      value: stats.remaining_payment_statistics?.count || 0,
      subtitle: `${(stats.remaining_payment_statistics?.total_remaining || 0).toLocaleString()} SAR`,
      icon: PiCreditCardBold,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      darkBgColor: 'dark:bg-yellow-900/20',
      darkTextColor: 'dark:text-yellow-400',
      blurColor: 'bg-yellow-50/50',
      darkBlurColor: 'dark:bg-yellow-900/10',
      link: stats.remaining_payment_statistics?.link,
      compact: true,
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
      compact: true,
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
      compact: true,
    },
    
  ];

  // Row 3: Source Campaigns
  const allSourceCampaigns = stats.by_source_campaign || [];
  
  // Initialize checked state for all campaigns on first render
  useEffect(() => {
    if (checkedSourceCampaigns.size === 0 && allSourceCampaigns.length > 0) {
      const initialChecked = new Set(allSourceCampaigns.map(c => c.source_campaign || ''));
      setCheckedSourceCampaigns(initialChecked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSourceCampaigns.length]);

  const sourceCampaignCards = allSourceCampaigns.map((campaign) => {
    const campaignKey = formatSourceCampaign(campaign.source_campaign);
    const isChecked = checkedSourceCampaigns.has(campaignKey);
    
    return {
      title: campaignKey,
      value: campaign.reservations_count || 0,
      subtitle: `${campaign.sessions_count || 0} sessions`,
      icon: PiTagBold,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      darkBgColor: 'dark:bg-purple-900/20',
      darkTextColor: 'dark:text-purple-400',
      blurColor: 'bg-purple-50/50',
      darkBlurColor: 'dark:bg-purple-900/10',
      link: campaign.link,
      compact: true,
      showCheckbox: true,
      checked: isChecked,
      campaignKey: campaignKey,
    };
  });

  // Calculate total of checked source campaigns (reservations count)
  const totalSourceCampaigns = sourceCampaignCards
    .filter(card => card.checked)
    .reduce((sum, card) => sum + (typeof card.value === 'number' ? card.value : 0), 0);

  // Total Source Campaigns card
  const totalSourceCampaignCard = {
    title: 'Total Source Campaigns',
    value: totalSourceCampaigns,
    icon: PiTagBold,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    darkBgColor: 'dark:bg-purple-900/30',
    darkTextColor: 'dark:text-purple-300',
    blurColor: 'bg-purple-100/50',
    darkBlurColor: 'dark:bg-purple-900/15',
    compact: true,
  };

  const handleSourceCampaignCheckboxChange = (campaignKey: string, checked: boolean) => {
    setCheckedSourceCampaigns(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(campaignKey);
      } else {
        newSet.delete(campaignKey);
      }
      return newSet;
    });
  };

  // Row 3: Services
  // Sort services by sessions_count in descending order (greater to smaller)
  const sortedServices = [...(stats.by_service || [])].sort((a, b) => {
    const aSessions = a.sessions_count || 0;
    const bSessions = b.sessions_count || 0;
    return bSessions - aSessions; // Descending order
  });
  
  const allServiceCards = sortedServices.map((service) => ({
    title: service.service_name_ar || `Service ${service.service_id}`,
    value: `${service.reservations_count || 0}`,
    subtitle: `${service.sessions_count || 0} sessions`,
    icon: PiChartBarBold,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    darkBgColor: 'dark:bg-cyan-900/20',
    darkTextColor: 'dark:text-cyan-400',
    blurColor: 'bg-cyan-50/50',
    darkBlurColor: 'dark:bg-cyan-900/10',
    link: service.link,
    compact: true,
  }));
  
  // Show only first 6 services when collapsed
  const SERVICES_PER_ROW = 6;
  const serviceCards = servicesExpanded 
    ? allServiceCards 
    : allServiceCards.slice(0, SERVICES_PER_ROW);

  // Categories (same pattern as Services)
  const sortedCategories = [...(stats.by_category || [])].sort((a, b) => {
    const aSessions = a.sessions_count || 0;
    const bSessions = b.sessions_count || 0;
    return bSessions - aSessions;
  });

  const allCategoryCards = sortedCategories.map((category) => ({
    title:
      category.category_name_ar ||
      category.category_name_en ||
      `Category ${category.category_id}`,
    value: `${category.reservations_count || 0}`,
    subtitle: `${category.sessions_count || 0} sessions`,
    icon: PiGridFourBold,
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    darkBgColor: 'dark:bg-teal-900/20',
    darkTextColor: 'dark:text-teal-400',
    blurColor: 'bg-teal-50/50',
    darkBlurColor: 'dark:bg-teal-900/10',
    link: category.link,
    compact: true,
  }));

  const CATEGORIES_PER_ROW = 6;
  const categoryCards = categoriesExpanded
    ? allCategoryCards
    : allCategoryCards.slice(0, CATEGORIES_PER_ROW);

  // Row 4: Clients
  const totalUniqueCustomersValue: number = Number(stats.customers?.total_unique_customers?.count ?? 0);
    
  const clientCards = [
    {
      title: 'Total Unique Customers',
      value: totalUniqueCustomersValue,
      icon: PiUsersBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      link: stats.customers?.total_unique_customers?.link,
      compact: true,
    },
    {
      title: 'Multiple Bookings',
      value: stats.customers?.multiple_bookings?.customers_count || 0,
      subtitle: `${stats.customers?.multiple_bookings?.total_reservations || 0} reservations, ${stats.customers?.multiple_bookings?.total_sessions || 0} sessions`,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
      link: stats.customers?.multiple_bookings?.reservations_link,
      compact: true,
    },
  ];

  const financeCards = [
    ...('gross_revenue' in stats
      ? [
          {
            title: 'Gross Revenue',
            value: Number(stats.gross_revenue ?? 0).toLocaleString(),
            subtitle: 'SAR · issued totals',
            icon: PiMoneyBold,
            bgColor: 'bg-slate-50',
            textColor: 'text-slate-600',
            darkBgColor: 'dark:bg-slate-900/20',
            darkTextColor: 'dark:text-slate-400',
            blurColor: 'bg-slate-50/50',
            darkBlurColor: 'dark:bg-slate-900/10',
            compact: true,
          },
        ]
      : []),
    ...('collected_revenue' in stats
      ? [
          {
            title: 'Collected Revenue',
            value: Number(stats.collected_revenue ?? 0).toLocaleString(),
            subtitle: 'SAR · paid only',
            icon: PiCheckCircleBold,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            darkBgColor: 'dark:bg-green-900/20',
            darkTextColor: 'dark:text-green-400',
            blurColor: 'bg-green-50/50',
            darkBlurColor: 'dark:bg-green-900/10',
            compact: true,
          },
        ]
      : []),
    ...('pending_revenue' in stats
      ? [
          {
            title: 'Pending Revenue',
            value: Number(stats.pending_revenue ?? 0).toLocaleString(),
            subtitle: 'SAR',
            icon: PiCreditCardBold,
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            darkBgColor: 'dark:bg-amber-900/20',
            darkTextColor: 'dark:text-amber-400',
            blurColor: 'bg-amber-50/50',
            darkBlurColor: 'dark:bg-amber-900/10',
            compact: true,
          },
        ]
      : []),
    ...reviewCards,
  ];

  const citySessionCards = (stats.sessions_by_city || []).map((c) => ({
    title: c.city || 'Unknown',
    value: c.sessions_count ?? 0,
    subtitle: 'Sessions',
    icon: PiMapPinBold,
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
    darkBgColor: 'dark:bg-sky-900/20',
    darkTextColor: 'dark:text-sky-400',
    blurColor: 'bg-sky-50/50',
    darkBlurColor: 'dark:bg-sky-900/10',
    link: c.link,
    compact: true,
  }));

  const cityCancelCards = (stats.cancellation_by_city || []).map((c) => ({
    title: c.city || 'Unknown',
    value: formatPercent(Number(c.cancellation_rate ?? 0)),
    subtitle: `${c.canceled_count ?? 0} / ${c.reservations_count ?? 0}`,
    icon: PiXCircleBold,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    darkBgColor: 'dark:bg-red-900/20',
    darkTextColor: 'dark:text-red-400',
    blurColor: 'bg-red-50/50',
    darkBlurColor: 'dark:bg-red-900/10',
    link: c.link,
    compact: true,
  }));

  const cityConversionCards = (stats.conversion_by_city || []).map((c) => ({
    title: c.city || 'Unknown',
    value: formatPercent(Number(c.conversion_rate ?? 0)),
    subtitle: `${c.reservations_count ?? 0} / ${c.leads_count ?? 0} leads`,
    icon: PiChartBarBold,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    darkBgColor: 'dark:bg-indigo-900/20',
    darkTextColor: 'dark:text-indigo-400',
    blurColor: 'bg-indigo-50/50',
    darkBlurColor: 'dark:bg-indigo-900/10',
    link: c.link,
    compact: true,
  }));

  const cityRevenueCards = (stats.revenue_by_city || []).map((c) => ({
    title: c.city || 'Unknown',
    value: Number(c.collected_revenue ?? 0).toLocaleString(),
    subtitle: 'Collected SAR',
    icon: PiMoneyBold,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    darkBgColor: 'dark:bg-green-900/20',
    darkTextColor: 'dark:text-green-400',
    blurColor: 'bg-green-50/50',
    darkBlurColor: 'dark:bg-green-900/10',
    link: c.link,
    compact: true,
  }));

  const rows = [
    { title: 'Top KPIs', cards: topKpiCards },
    { title: 'Reservation by Status', cards: reservationByStatusCards },
    ...((stats.by_cancellation_reason || []).length > 0
      ? [
          {
            title: 'Cancellation / Failure Reasons',
            cards: (stats.by_cancellation_reason || []).map((r) => ({
              title: formatStatusReasonLabel(r.status_reason),
              value: r.count,
              subtitle: `${r.canceled_count} canceled · ${r.failed_count} failed`,
              icon: PiWarningBold,
              bgColor: 'bg-rose-50',
              textColor: 'text-rose-600',
              darkBgColor: 'dark:bg-rose-900/20',
              darkTextColor: 'dark:text-rose-400',
              blurColor: 'bg-rose-50/50',
              darkBlurColor: 'dark:bg-rose-900/10',
              link: r.link,
              compact: true,
            })),
          },
        ]
      : []),
    ...(hasPermission('dashboard.total_revenue')
      ? [{ title: 'Revenue & Collection', cards: financeCards }]
      : []),
    { title: 'Source Campaigns', cards: sourceCampaignCards },
    { title: 'Services', cards: serviceCards },
    { title: 'Categories', cards: categoryCards },
    { title: 'Clients & Multiple Bookings', cards: clientCards },
    ...(citySessionCards.length > 0
      ? [{ title: 'Sessions by City', cards: citySessionCards }]
      : []),
    ...(cityCancelCards.length > 0
      ? [{ title: 'Cancellation by City', cards: cityCancelCards }]
      : []),
    ...(cityConversionCards.length > 0
      ? [{ title: 'Conversion by City', cards: cityConversionCards }]
      : []),
    ...(hasPermission('dashboard.total_revenue') && cityRevenueCards.length > 0
      ? [{ title: 'Collected Revenue by City', cards: cityRevenueCards }]
      : []),
    ...('unknown_location_rate' in stats
      ? [
          {
            title: 'Location Quality',
            cards: [
              {
                title: '% Unknown Location',
                value: formatPercent(Number(stats.unknown_location_rate ?? 0)),
                icon: PiMapPinBold,
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-600',
                darkBgColor: 'dark:bg-amber-900/20',
                darkTextColor: 'dark:text-amber-400',
                blurColor: 'bg-amber-50/50',
                darkBlurColor: 'dark:bg-amber-900/10',
                compact: true,
              },
            ],
          },
        ]
      : []),
  ];

  const router = useRouter();
  const pathname = usePathname();

  const handleViewAll = () => {
    // Navigate to reservations page without filters
    router.push(pathname);
    // Scroll to table after a short delay
    setTimeout(() => {
      const tableElement = document.querySelector('[data-table="reservations"]');
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {showUnknownSourceAlert ||
      (stats.unassigned_count ?? 0) > 0 ||
      showSameDayUnassignedAlert ||
      showCollectionAlert ||
      showCancellationAlert ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-semibold">Red Flags</p>
          <ul className="mt-1 list-disc space-y-0.5 ps-5">
            {showUnknownSourceAlert && (
              <li>
                Unknown Source is {formatPercent(unknownSourceRate)} ({unknownCount} reservations) — above 20% threshold.
              </li>
            )}
            {showCancellationAlert && (
              <li>
                Cancellation Rate is {formatPercent(cancellationRate)} — above 12% threshold.
              </li>
            )}
            {(stats.unassigned_count ?? 0) > 0 && (
              <li>
                {stats.unassigned_count} unassigned open reservation(s) without a doctor.
              </li>
            )}
            {showSameDayUnassignedAlert && (
              <li>
                {stats.same_day_unassigned_count} same-day unassigned reservation(s) in the next 24h.
              </li>
            )}
            {showCollectionAlert && (
              <li>
                Collection Rate is {formatPercent(collectionRate)} — below 85% threshold.
              </li>
            )}
          </ul>
        </div>
      ) : null}
      {rows.map((row, rowIndex) => {
        const isServicesRow = row.title === 'Services';
        const hasMoreServices = isServicesRow && allServiceCards.length > SERVICES_PER_ROW;
        const isCategoriesRow = row.title === 'Categories';
        const hasMoreCategories =
          isCategoriesRow && allCategoryCards.length > CATEGORIES_PER_ROW;

        return (
          <div key={rowIndex} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {row.title}
              </h4>
              {isServicesRow && hasMoreServices && (
                <button
                  onClick={() => setServicesExpanded(!servicesExpanded)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {servicesExpanded ? (
                    <>
                      <span>Show Less</span>
                      <PiCaretUpBold className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show All ({allServiceCards.length})</span>
                      <PiCaretDownBold className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
              {isCategoriesRow && hasMoreCategories && (
                <button
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {categoriesExpanded ? (
                    <>
                      <span>Show Less</span>
                      <PiCaretUpBold className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show All ({allCategoryCards.length})</span>
                      <PiCaretDownBold className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
            <div className={KPI_STAT_GRID_CLASS}>
              {row.title === 'Source Campaigns' && (
                <StatCard key="total-source-campaigns" {...totalSourceCampaignCard} />
              )}
              {row.cards.map((card: any, cardIndex: number) => (
                <StatCard 
                  key={cardIndex} 
                  {...card}
                  onCheckboxChange={card.campaignKey ? (checked: boolean) => handleSourceCampaignCheckboxChange(card.campaignKey, checked) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
