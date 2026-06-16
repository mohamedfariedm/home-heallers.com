'use client';

import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiFlagBold,
  PiListChecksBold,
  PiMegaphoneBold,
} from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import WidgetCard from '@/components/cards/widget-card';
import { Badge } from '@/components/ui/badge';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import KpiStatCard, { type KpiStatCardColor } from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownWidget from '@/app/shared/kpis/kpi-breakdown-widget';
import UserActivityDrillDownLink from '@/app/shared/user-activity-reports/drill-down-link';
import {
  buildUserActivityLeadFilterPathFromLink,
  formatLeadStatusLabel,
  formatSourceCampaignLabel,
  formatUserActivityLogName,
  isLeadFilterLinkActive,
} from '@/utils/user-activity-query';
import type {
  LeadStatusBucket,
  SourceCampaignBucket,
  UserActivitySummary,
  UserRef,
} from '@/types/user-activity-report';

const LEAD_STAT_COLORS: KpiStatCardColor[] = [
  'purple',
  'blue',
  'green',
  'amber',
  'indigo',
  'emerald',
  'cyan',
  'sky',
  'orange',
];

function LeadStatCardsSection<T extends { count: number; link: string }>({
  title,
  description,
  items,
  icon,
  userId,
  getLabel,
  getKey,
}: {
  title: string;
  description: string;
  items: T[];
  icon: typeof PiMegaphoneBold;
  userId: number;
  getLabel: (item: T) => string;
  getKey: (item: T, index: number) => string;
}) {
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex w-full flex-wrap gap-5">
        {items.map((item, index) => (
          <KpiStatCard
            key={getKey(item, index)}
            title={getLabel(item)}
            value={item.count}
            icon={icon}
            color={LEAD_STAT_COLORS[index % LEAD_STAT_COLORS.length]}
            subtitle={
              isLeadFilterLinkActive(current, item.link)
                ? 'Records filter active'
                : 'Distinct leads'
            }
            href={buildUserActivityLeadFilterPathFromLink(
              locale,
              userId,
              current,
              item.link
            )}
            selected={isLeadFilterLinkActive(current, item.link)}
          />
        ))}
      </div>
    </div>
  );
}

export default function UserActivitySummaryPanel({
  user,
  summary,
}: {
  user: UserRef;
  summary: UserActivitySummary;
}) {
  const campaigns = summary.by_source_campaign ?? [];
  const statuses = summary.by_status ?? [];
  const hasLeadStats = campaigns.length > 0 || statuses.length > 0;

  return (
    <div className="space-y-6">
      <WidgetCard
        title={user.name}
        description={user.email ?? undefined}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <AvatarCard
            src=""
            name={user.name}
            description={user.email ?? undefined}
            avatarProps={{
              name: user.name,
              className: '!bg-gray-200 !text-gray-700',
            }}
          />
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role} variant="flat" color="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </WidgetCard>

      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title="Total Actions"
          value={summary.total_actions}
          icon={PiListChecksBold}
          color="blue"
        />
        <KpiStatCard
          title="Today"
          value={summary.today}
          icon={PiClockBold}
          color="green"
        />
        <KpiStatCard
          title="This Week"
          value={summary.this_week}
          icon={PiCalendarCheckBold}
          color="amber"
        />
        <KpiStatCard
          title="This Month"
          value={summary.this_month}
          icon={PiChartBarBold}
          color="indigo"
        />
        <KpiStatCard
          title="Active Days"
          value={summary.active_days}
          icon={PiListChecksBold}
          color="cyan"
          subtitle={
            summary.most_modified_models?.[0]?.type
              ? `Top model: ${summary.most_modified_models[0].type}`
              : undefined
          }
        />
        <KpiStatCard
          title="First Activity"
          value={
            summary.first_activity_at ? (
              <DateCell date={new Date(summary.first_activity_at)} />
            ) : (
              '—'
            )
          }
          icon={PiClockBold}
          color="sky"
          className="[&_.text-3xl]:text-xl [&_.text-3xl]:font-semibold"
        />
        <KpiStatCard
          title="Last Activity"
          value={
            summary.last_activity_at ? (
              <DateCell date={new Date(summary.last_activity_at)} />
            ) : (
              '—'
            )
          }
          icon={PiClockBold}
          color="orange"
          className="[&_.text-3xl]:text-xl [&_.text-3xl]:font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {summary.by_event?.length > 0 && (
          <div className="lg:col-span-4">
            <KpiBreakdownWidget
              title="By Event"
              items={summary.by_event.slice(0, 6).map((item, index) => ({
                key: `${String(item.event)}-${index}`,
                label:
                  item.event == null || item.event === ''
                    ? 'Uncategorized'
                    : String(item.event),
                count: item.count,
                countNode: item.link ? (
                  <UserActivityDrillDownLink link={item.link} userId={user.id}>
                    {item.count}
                  </UserActivityDrillDownLink>
                ) : undefined,
              }))}
            />
          </div>
        )}
        {summary.by_log_name?.length > 0 && (
          <div className="lg:col-span-4">
            <KpiBreakdownWidget
              title="By Log Name"
              items={summary.by_log_name.slice(0, 8).map((item, index) => ({
                key: `${String(item.log_name)}-${index}`,
                label: formatUserActivityLogName(String(item.log_name)),
                count: item.count,
                countNode: item.link ? (
                  <UserActivityDrillDownLink link={item.link} userId={user.id}>
                    {item.count}
                  </UserActivityDrillDownLink>
                ) : undefined,
              }))}
            />
          </div>
        )}
        {summary.most_modified_models?.length > 0 && (
          <div className="lg:col-span-4">
            <KpiBreakdownWidget
              title="Most Modified Models"
              items={summary.most_modified_models.slice(0, 6).map((item) => ({
                key: item.type,
                label: item.type,
                count: item.count,
              }))}
            />
          </div>
        )}
      </div>

      {hasLeadStats && (
        <div className="space-y-6">
          <LeadStatCardsSection<SourceCampaignBucket>
            title="Leads by Source Campaign"
            description="Filters activity records below; summary stays unchanged"
            items={campaigns}
            icon={PiMegaphoneBold}
            userId={user.id}
            getLabel={(item) => formatSourceCampaignLabel(item.source_campaign)}
            getKey={(item, index) =>
              `campaign-${String(item.source_campaign)}-${index}`
            }
          />
          <LeadStatCardsSection<LeadStatusBucket>
            title="Leads by Status"
            description="Filters activity records below; summary stays unchanged"
            items={statuses}
            icon={PiFlagBold}
            userId={user.id}
            getLabel={(item) => formatLeadStatusLabel(item.status)}
            getKey={(item, index) => `status-${String(item.status)}-${index}`}
          />
        </div>
      )}
    </div>
  );
}
