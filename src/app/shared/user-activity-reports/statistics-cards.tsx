'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import KpiBreakdownWidget from '@/app/shared/kpis/kpi-breakdown-widget';
import {
  buildUserActivityDetailPath,
  buildUserActivityListPath,
  formatUserActivityLogName,
  parseUserApiLinkToSearchParams,
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

function DrillDownLink({
  link,
  children,
  className,
}: {
  link: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = parseUserApiLinkToSearchParams(link);
    params.set('tab', 'users');

    const userMatch = link.match(/\/user-activity\/(\d+)/);
    if (userMatch) {
      router.push(buildUserActivityDetailPath(locale, Number(userMatch[1]), params));
      return;
    }

    router.push(buildUserActivityListPath(locale, params));
  };

  return (
    <Link
      href={pathname}
      onClick={handleClick}
      className={cn(
        'font-semibold text-blue-600 hover:underline dark:text-blue-400',
        className
      )}
    >
      {children}
    </Link>
  );
}

export default function UserActivityStatisticsCards({
  statistics,
  className,
}: UserActivityStatisticsCardsProps) {
  if (!statistics) return null;

  const hasBreakdowns =
    statistics.by_event?.length > 0 ||
    statistics.by_log_name?.length > 0 ||
    statistics.top_users?.length > 0 ||
    statistics.most_modified_models?.length > 0;

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

      {hasBreakdowns && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {statistics.by_event?.length > 0 && (
            <div className="lg:col-span-3">
              <KpiBreakdownWidget
                title="By Event"
                items={statistics.by_event.slice(0, 5).map((bucket) => ({
                  key: bucket.event ?? 'uncategorized',
                  label: bucket.event ?? 'Uncategorized',
                  count: bucket.count,
                  countNode: (
                    <DrillDownLink link={bucket.link}>{bucket.count}</DrillDownLink>
                  ),
                }))}
              />
            </div>
          )}

          {statistics.by_log_name?.length > 0 && (
            <div className="lg:col-span-3">
              <KpiBreakdownWidget
                title="By Log Name"
                items={statistics.by_log_name.slice(0, 5).map((bucket) => ({
                  key: bucket.log_name,
                  label: formatUserActivityLogName(bucket.log_name),
                  count: bucket.count,
                  countNode: (
                    <DrillDownLink link={bucket.link}>{bucket.count}</DrillDownLink>
                  ),
                }))}
              />
            </div>
          )}

          {statistics.top_users?.length > 0 && (
            <div className="lg:col-span-3">
              <KpiBreakdownWidget
                title="Top Users"
                items={statistics.top_users.slice(0, 5).map((user) => ({
                  key: String(user.id),
                  label: user.name,
                  count: user.count,
                  countNode: (
                    <DrillDownLink link={user.link}>{user.count}</DrillDownLink>
                  ),
                }))}
              />
            </div>
          )}

          {statistics.most_modified_models?.length > 0 && (
            <div className="lg:col-span-3">
              <KpiBreakdownWidget
                title="Most Modified Models"
                items={statistics.most_modified_models.slice(0, 5).map((model) => ({
                  key: model.type,
                  label: model.type,
                  count: model.count,
                }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
