'use client';

import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
  PiUsersBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import type { ActivityLogStatistics } from '@/types/activity-log';
import KpiStatCard, { KPI_STAT_GRID_CLASS } from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';

interface ActivityLogStatisticsCardsProps {
  statistics?: ActivityLogStatistics | null;
  className?: string;
}

const cards = [
  {
    key: 'total',
    title: 'Total',
    icon: PiListChecksBold,
    color: 'blue' as const,
  },
  {
    key: 'today',
    title: 'Today',
    icon: PiClockBold,
    color: 'green' as const,
  },
  {
    key: 'this_week',
    title: 'This Week',
    icon: PiCalendarCheckBold,
    color: 'amber' as const,
  },
  {
    key: 'this_month',
    title: 'This Month',
    icon: PiChartBarBold,
    color: 'indigo' as const,
  },
] as const;

export default function ActivityLogStatisticsCards({
  statistics,
  className,
}: ActivityLogStatisticsCardsProps) {
  if (!statistics) return null;

  const eventEntries = Object.entries(statistics.by_event ?? {}).slice(0, 8);

  return (
    <div className={cn('mb-6 space-y-8', className)}>
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

      <KpiBreakdownCardsSection
        title="By Event"
        items={eventEntries.map(([event, count]) => ({
          key: event,
          label: event,
          count: Number(count) || 0,
        }))}
        icon={PiListChecksBold}
      />

      <KpiBreakdownCardsSection
        title="Top Users"
        items={(statistics.top_users ?? []).slice(0, 8).map((user) => ({
          key: `${user.type}-${user.id}`,
          label: user.name,
          count: user.count,
        }))}
        icon={PiUsersBold}
      />

      <KpiBreakdownCardsSection
        title="Most Modified Models"
        items={(statistics.most_modified_models ?? []).slice(0, 8).map((model) => ({
          key: model.type,
          label: model.type,
          count: model.count,
        }))}
        icon={PiChartBarBold}
      />
    </div>
  );
}
