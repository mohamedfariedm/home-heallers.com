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
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import {
  buildUserActivityLeadFilterPathFromLink,
  buildUserActivityPathFromApiLink,
  formatLeadStatusLabel,
  formatSourceCampaignLabel,
  formatUserActivityLogName,
  isLeadFilterLinkActive,
} from '@/utils/user-activity-query';
import type { UserActivitySummary, UserRef } from '@/types/user-activity-report';

export default function UserActivitySummaryPanel({
  user,
  summary,
}: {
  user: UserRef;
  summary: UserActivitySummary;
}) {
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const campaigns = summary.by_source_campaign ?? [];
  const statuses = summary.by_status ?? [];

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

      <KpiBreakdownCardsSection
        title="By Event"
        items={(summary.by_event ?? []).map((item, index) => ({
          key: `${String(item.event)}-${index}`,
          label:
            item.event == null || item.event === ''
              ? 'Uncategorized'
              : String(item.event),
          count: item.count,
          href: buildUserActivityPathFromApiLink(locale, item.link, user.id),
        }))}
        icon={PiListChecksBold}
      />

      <KpiBreakdownCardsSection
        title="By Log Name"
        items={(summary.by_log_name ?? []).map((item, index) => ({
          key: `${String(item.log_name)}-${index}`,
          label: formatUserActivityLogName(String(item.log_name)),
          count: item.count,
          href: buildUserActivityPathFromApiLink(locale, item.link, user.id),
        }))}
        icon={PiListChecksBold}
      />

      <KpiBreakdownCardsSection
        title="Most Modified Models"
        items={(summary.most_modified_models ?? []).map((item) => ({
          key: item.type,
          label: item.type,
          count: item.count,
        }))}
        icon={PiChartBarBold}
      />

      <KpiBreakdownCardsSection
        title="By Source Campaign"
        description="Click to filter records below; summary stays unchanged"
        items={campaigns.map((item, index) => ({
          key: `campaign-${String(item.source_campaign)}-${index}`,
          label: formatSourceCampaignLabel(item.source_campaign),
          count: item.count,
          href: buildUserActivityLeadFilterPathFromLink(
            locale,
            user.id,
            current,
            item.link
          ),
          selected: isLeadFilterLinkActive(current, item.link),
          subtitle: isLeadFilterLinkActive(current, item.link)
            ? 'Filter active'
            : 'Distinct leads',
        }))}
        icon={PiMegaphoneBold}
      />

      <KpiBreakdownCardsSection
        title="By Status"
        description="Click to filter records below; summary stays unchanged"
        items={statuses.map((item, index) => ({
          key: `status-${String(item.status)}-${index}`,
          label: formatLeadStatusLabel(item.status),
          count: item.count,
          href: buildUserActivityLeadFilterPathFromLink(
            locale,
            user.id,
            current,
            item.link
          ),
          selected: isLeadFilterLinkActive(current, item.link),
          subtitle: isLeadFilterLinkActive(current, item.link)
            ? 'Filter active'
            : 'Distinct leads',
        }))}
        icon={PiFlagBold}
      />
    </div>
  );
}
