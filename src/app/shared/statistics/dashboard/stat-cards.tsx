'use client';

import { useState } from 'react';
import {
  PiCalendarCheckBold,
  PiUsersBold,
  PiUserCircleBold,
  PiFileTextBold,
  PiArrowUpRightBold,
  PiReceiptBold,
  PiClockBold,
  PiRepeatBold,
  PiListChecksBold,
  PiChartLineUpBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import type { RateColorRange, RateColorsByMetric } from '@/types/settings';
import RateColorsModal from './rate-colors-modal';
import {
  formatRatePercent,
  getPerformanceColors,
  getPerformanceLabel,
  getRatePerformance,
  type RateMetricKey,
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
  leads?: {
    total_leads: number;
    qualified_leads: number;
    lead_quality_rate: number;
  };
  inbound_leads?: {
    total_leads: number;
    qualified_leads: number;
    lead_quality_rate: number;
  };
  outbound_leads?: {
    total_leads: number;
    qualified_leads: number;
    lead_quality_rate: number;
  };
}

interface StatCardsProps {
  data: AggregateData | null;
  className?: string;
  hasPermission?: (permission: string) => boolean;
  rateColors?: RateColorsByMetric;
  onSaveRateColors?: (rateColors: RateColorsByMetric, onSuccess?: () => void) => void;
  isSavingRateColors?: boolean;
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

const DEFAULT_COLOR = '#22c55e';

function isHexColor(value: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(value);
}

function withHexAlpha(hexColor: string, alphaHex: string) {
  if (!isHexColor(hexColor)) return DEFAULT_COLOR;
  return `${hexColor}${alphaHex}`;
}

function getMatchedRateRange(rate: number, ranges?: RateColorRange[]) {
  if (!ranges || ranges.length === 0) return null;
  const percent = rate * 100;
  const sorted = [...ranges].sort((a, b) => a.from - b.from);
  return sorted.find((range) => percent >= range.from && percent <= range.to) ?? null;
}

export default function StatCards({
  data,
  className,
  hasPermission,
  rateColors,
  onSaveRateColors,
  isSavingRateColors,
}: StatCardsProps) {
  const [editingMetric, setEditingMetric] = useState<RateMetricKey | null>(null);

  if (!data) return null;

  const canEditRateColors =
    Boolean(onSaveRateColors) && (hasPermission ? hasPermission('settings') : true);

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
    metric: RateMetricKey;
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
    {
      permission: 'dashboard.lead_quality_rate',
      title: 'Lead Quality Rate',
      value: `${Number(data.leads?.lead_quality_rate ?? 0).toFixed(2)}%`,
      subtitle: data.leads
        ? `${data.leads.qualified_leads.toLocaleString()} / ${data.leads.total_leads.toLocaleString()} qualified`
        : undefined,
      icon: PiChartLineUpBold,
      metric: 'lead_quality',
      rate: (data.leads?.lead_quality_rate ?? 0) / 100,
      show: Boolean(data.leads),
    },
    {
      permission: 'dashboard.lead_quality_rate',
      title: 'Inbound Quality Rate',
      value: `${Number(data.inbound_leads?.lead_quality_rate ?? 0).toFixed(2)}%`,
      subtitle: data.inbound_leads
        ? `${data.inbound_leads.qualified_leads.toLocaleString()} / ${data.inbound_leads.total_leads.toLocaleString()} qualified`
        : undefined,
      icon: PiChartLineUpBold,
      metric: 'lead_quality',
      rate: (data.inbound_leads?.lead_quality_rate ?? 0) / 100,
      show: Boolean(data.inbound_leads),
    },
    {
      permission: 'dashboard.lead_quality_rate',
      title: 'Outbound Quality Rate',
      value: `${Number(data.outbound_leads?.lead_quality_rate ?? 0).toFixed(2)}%`,
      subtitle: data.outbound_leads
        ? `${data.outbound_leads.qualified_leads.toLocaleString()} / ${data.outbound_leads.total_leads.toLocaleString()} qualified`
        : undefined,
      icon: PiChartLineUpBold,
      metric: 'lead_quality',
      rate: (data.outbound_leads?.lead_quality_rate ?? 0) / 100,
      show: Boolean(data.outbound_leads),
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
      permission: 'dashboard.total_leads',
      title: 'Total Leads',
      value: String(data.leads?.total_leads ?? 0),
      icon: PiUsersBold,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      darkBgColor: 'dark:bg-sky-900/20',
      darkTextColor: 'dark:text-sky-400',
      blurColor: 'bg-sky-50/50',
      darkBlurColor: 'dark:bg-sky-900/10',
      show: Boolean(data.leads),
    },
    {
      permission: 'dashboard.total_leads',
      title: 'Inbound Leads',
      value: String(data.inbound_leads?.total_leads ?? 0),
      icon: PiUsersBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      show: Boolean(data.inbound_leads),
    },
    {
      permission: 'dashboard.total_leads',
      title: 'Outbound Leads',
      value: String(data.outbound_leads?.total_leads ?? 0),
      icon: PiUsersBold,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      darkBgColor: 'dark:bg-violet-900/20',
      darkTextColor: 'dark:text-violet-400',
      blurColor: 'bg-violet-50/50',
      darkBlurColor: 'dark:bg-violet-900/10',
      show: Boolean(data.outbound_leads),
    },
    {
      permission: 'dashboard.qualified_leads',
      title: 'Qualified Leads',
      value: String(data.leads?.qualified_leads ?? 0),
      icon: PiListChecksBold,
      bgColor: 'bg-lime-50',
      textColor: 'text-lime-600',
      darkBgColor: 'dark:bg-lime-900/20',
      darkTextColor: 'dark:text-lime-400',
      blurColor: 'bg-lime-50/50',
      darkBlurColor: 'dark:bg-lime-900/10',
      show: Boolean(data.leads),
    },
    {
      permission: 'dashboard.qualified_leads',
      title: 'Inbound Qualified',
      value: String(data.inbound_leads?.qualified_leads ?? 0),
      icon: PiListChecksBold,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      darkBgColor: 'dark:bg-teal-900/20',
      darkTextColor: 'dark:text-teal-400',
      blurColor: 'bg-teal-50/50',
      darkBlurColor: 'dark:bg-teal-900/10',
      show: Boolean(data.inbound_leads),
    },
    {
      permission: 'dashboard.qualified_leads',
      title: 'Outbound Qualified',
      value: String(data.outbound_leads?.qualified_leads ?? 0),
      icon: PiListChecksBold,
      bgColor: 'bg-fuchsia-50',
      textColor: 'text-fuchsia-600',
      darkBgColor: 'dark:bg-fuchsia-900/20',
      darkTextColor: 'dark:text-fuchsia-400',
      blurColor: 'bg-fuchsia-50/50',
      darkBlurColor: 'dark:bg-fuchsia-900/10',
      show: Boolean(data.outbound_leads),
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
    <>
    <div className={cn('flex w-full flex-wrap gap-5 pb-4', className)}>
      {visibleRateCards.map((card) => {
        const status = getRatePerformance(card.rate, card.metric);
        const colors = getPerformanceColors(status);
        const matchedRange = getMatchedRateRange(card.rate, rateColors?.[card.metric]);
        const customColor = matchedRange?.color && isHexColor(matchedRange.color) ? matchedRange.color : null;
        const customLabel = matchedRange?.label?.trim();

        return (
          <div
            key={card.permission}
            role={canEditRateColors ? 'button' : undefined}
            tabIndex={canEditRateColors ? 0 : undefined}
            onClick={
              canEditRateColors
                ? () => setEditingMetric(card.metric)
                : undefined
            }
            onKeyDown={
              canEditRateColors
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setEditingMetric(card.metric);
                    }
                  }
                : undefined
            }
            className={cn(
              'relative min-w-[180px] flex-1 basis-[calc(20%-16px)] overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
              canEditRateColors && 'cursor-pointer'
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  customColor ? '' : colors.bgColor,
                  customColor ? '' : colors.textColor,
                  customColor ? '' : colors.darkBgColor,
                  customColor ? '' : colors.darkTextColor
                )}
                style={
                  customColor
                    ? {
                        backgroundColor: withHexAlpha(customColor, '1A'),
                        color: customColor,
                      }
                    : undefined
                }
              >
                <card.icon className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  customColor ? '' : colors.badgeClass
                )}
                style={
                  customColor
                    ? {
                        color: customColor,
                        backgroundColor: withHexAlpha(customColor, '26'),
                      }
                    : undefined
                }
              >
                {customLabel || getPerformanceLabel(status)}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p
                className={cn(
                  'mt-1 text-3xl font-bold',
                  customColor ? '' : colors.textColor,
                  customColor ? '' : colors.darkTextColor
                )}
                style={customColor ? { color: customColor } : undefined}
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
                customColor ? '' : colors.blurColor,
                customColor ? '' : colors.darkBlurColor
              )}
              style={
                customColor
                  ? {
                      backgroundColor: withHexAlpha(customColor, '33'),
                    }
                  : undefined
              }
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

    <RateColorsModal
      isOpen={Boolean(editingMetric)}
      onClose={() => setEditingMetric(null)}
      metric={editingMetric}
      rateColors={rateColors || {}}
      onSave={(nextRateColors, onSuccess) => {
        onSaveRateColors?.(nextRateColors, onSuccess ?? (() => setEditingMetric(null)));
      }}
      isSaving={isSavingRateColors}
    />
    </>
  );
}
