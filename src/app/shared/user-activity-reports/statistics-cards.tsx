'use client';

import Cookies from 'js-cookie';
import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
  PiUsersBold,
  PiWarningBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import KpiStatCard, { KPI_STAT_GRID_CLASS } from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import {
  buildUserActivityPathFromApiLink,
  formatUserActivityLogName,
} from '@/utils/user-activity-query';
import { formatPercent } from '@/utils/dashboard-metric-helpers';
import type { UserActivityStatistics } from '@/types/user-activity-report';

interface UserActivityStatisticsCardsProps {
  statistics?: UserActivityStatistics | null;
  className?: string;
}

const cards = [
  { key: 'total_users', title: 'Active Users', icon: PiUsersBold, color: 'purple' as const },
  { key: 'total_actions', title: 'Total Actions', icon: PiListChecksBold, color: 'blue' as const },
  { key: 'today', title: 'Today', icon: PiClockBold, color: 'green' as const },
  { key: 'this_week', title: 'This Week', icon: PiCalendarCheckBold, color: 'amber' as const },
  { key: 'this_month', title: 'This Month', icon: PiChartBarBold, color: 'indigo' as const },
] as const;

export default function UserActivityStatisticsCards({
  statistics,
  className,
}: UserActivityStatisticsCardsProps) {
  if (!statistics) return null;

  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const operationalCards = [
    ...('actions_per_active_user' in statistics
      ? [
          {
            key: 'actions_per_active_user',
            title: 'Actions / Active User',
            value: Number(statistics.actions_per_active_user ?? 0).toFixed(1),
            icon: PiUsersBold,
            color: 'indigo' as const,
          },
        ]
      : []),
    ...('percent_create' in statistics
      ? [
          {
            key: 'percent_create',
            title: '% Create',
            value: formatPercent(Number(statistics.percent_create ?? 0)),
            icon: PiListChecksBold,
            color: 'green' as const,
          },
        ]
      : []),
    ...('percent_update' in statistics
      ? [
          {
            key: 'percent_update',
            title: '% Update',
            value: formatPercent(Number(statistics.percent_update ?? 0)),
            icon: PiListChecksBold,
            color: 'blue' as const,
          },
        ]
      : []),
    ...('percent_delete' in statistics
      ? [
          {
            key: 'percent_delete',
            title: '% Delete',
            value: formatPercent(Number(statistics.percent_delete ?? 0)),
            icon: PiListChecksBold,
            color: 'amber' as const,
          },
        ]
      : []),
    ...('risk_actions_count' in statistics
      ? [
          {
            key: 'risk_actions_count',
            title: 'Risk Actions',
            value: statistics.risk_actions_count ?? 0,
            icon: PiWarningBold,
            color: 'red' as const,
          },
        ]
      : []),
    ...('risk_action_rate' in statistics
      ? [
          {
            key: 'risk_action_rate',
            title: 'Risk Action Rate',
            value: formatPercent(Number(statistics.risk_action_rate ?? 0)),
            icon: PiWarningBold,
            color: 'red' as const,
          },
        ]
      : []),
  ];

  return (
    <div className={cn('space-y-8', className)}>
      <div className={KPI_STAT_GRID_CLASS}>
        {cards.map((card) => (
          <KpiStatCard
            key={card.key}
            title={card.title}
            value={statistics[card.key] ?? 0}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {operationalCards.length > 0 && (
        <section className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            Operational Mix
          </h4>
          <div className={KPI_STAT_GRID_CLASS}>
            {operationalCards.map((card) => (
              <KpiStatCard
                key={card.key}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
              />
            ))}
          </div>
        </section>
      )}

      <KpiBreakdownCardsSection
        title="By Event"
        items={(statistics.by_event ?? []).map((bucket, index) => ({
          key: `${bucket.event ?? 'uncategorized'}-${index}`,
          label: bucket.event ?? 'Uncategorized',
          count: bucket.count,
          href: buildUserActivityPathFromApiLink(locale, bucket.link),
        }))}
        icon={PiListChecksBold}
      />

      <KpiBreakdownCardsSection
        title="By Log Name"
        items={(statistics.by_log_name ?? []).map((bucket) => ({
          key: bucket.log_name,
          label: formatUserActivityLogName(bucket.log_name),
          count: bucket.count,
          href: buildUserActivityPathFromApiLink(locale, bucket.link),
        }))}
        icon={PiListChecksBold}
      />

      <KpiBreakdownCardsSection
        title="Top Users"
        items={(statistics.top_users ?? []).map((user) => ({
          key: String(user.id),
          label: user.name,
          count: user.count,
          href: buildUserActivityPathFromApiLink(locale, user.link),
        }))}
        icon={PiUsersBold}
      />

      <KpiBreakdownCardsSection
        title="Most Modified Models"
        items={(statistics.most_modified_models ?? []).map((model) => ({
          key: model.type,
          label: model.type,
          count: model.count,
        }))}
        icon={PiChartBarBold}
      />
    </div>
  );
}
