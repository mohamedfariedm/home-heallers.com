'use client';

import Cookies from 'js-cookie';
import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
  PiUsersBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import {
  buildUserActivityPathFromApiLink,
  formatUserActivityLogName,
} from '@/utils/user-activity-query';
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

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex w-full flex-wrap gap-5">
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
