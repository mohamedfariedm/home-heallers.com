'use client';

import {
  PiCalendarCheckBold,
  PiCellSignalFullBold,
  PiDeviceMobileBold,
  PiDownloadSimpleBold,
  PiRepeatBold,
  PiShieldWarningBold,
  PiUsersBold,
  PiWarningCircleBold,
} from 'react-icons/pi';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import type {
  ActiveUserStats,
  AppAnalyticsOverview,
} from '@/types/app-analytics';

interface AppAnalyticsStatCardsProps {
  data: AppAnalyticsOverview;
  activeUsers?: ActiveUserStats;
}

export default function AppAnalyticsStatCards({
  data,
  activeUsers,
}: AppAnalyticsStatCardsProps) {
  const installations = data.installations;
  const active = activeUsers ?? data.active_users;

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title="Total Installs"
          value={installations.total_installs.toLocaleString()}
          icon={PiDownloadSimpleBold}
          color="blue"
        />
        <KpiStatCard
          title="New Today"
          value={installations.new_installs.today.toLocaleString()}
          subtitle={`${installations.new_installs.this_week.toLocaleString()} this week`}
          icon={PiCalendarCheckBold}
          color="green"
        />
        <KpiStatCard
          title="Active Installations"
          value={installations.active_installations.toLocaleString()}
          subtitle="Seen in last 30 days"
          icon={PiCellSignalFullBold}
          color="emerald"
        />
        <KpiStatCard
          title="Needs Update"
          value={data.devices.should_update.count.toLocaleString()}
          subtitle={`Latest: Android ${data.devices.latest_supported_versions.android} / iOS ${data.devices.latest_supported_versions.ios}`}
          icon={PiShieldWarningBold}
          color="orange"
        />
        <KpiStatCard
          title="Reinstalls"
          value={installations.reinstalls.toLocaleString()}
          icon={PiRepeatBold}
          color="indigo"
        />
      </div>

      {/* <div className="space-y-3">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          Active Users — Installations
        </p>
        <div className="flex w-full flex-wrap gap-5">
          <KpiStatCard
            title="Daily Active Users"
            value={active.installations.dau.toLocaleString()}
            subtitle={`Reference date: ${active.date}`}
            icon={PiUsersBold}
            color="purple"
          />
          <KpiStatCard
            title="Weekly Active Users"
            value={active.installations.wau.toLocaleString()}
            icon={PiUsersBold}
            color="cyan"
          />
          <KpiStatCard
            title="Monthly Active Users"
            value={active.installations.mau.toLocaleString()}
            icon={PiUsersBold}
            color="sky"
          />
        </div>
      </div> */}

      <div className="space-y-3">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          Active Users — Logged-in Users
        </p>
        <div className="flex w-full flex-wrap gap-5">
          <KpiStatCard
            title="Daily Active Users"
            value={active.users.dau.toLocaleString()}
            subtitle={`Source: ${active.source}`}
            icon={PiUsersBold}
            color="amber"
          />
          <KpiStatCard
            title="Weekly Active Users"
            value={active.users.wau.toLocaleString()}
            icon={PiUsersBold}
            color="blue"
          />
          <KpiStatCard
            title="Monthly Active Users"
            value={active.users.mau.toLocaleString()}
            icon={PiUsersBold}
            color="green"
          />
        </div>
      </div>

      <KpiBreakdownCardsSection
        title="New Installs"
        items={[
          {
            key: 'today',
            label: 'Today',
            count: installations.new_installs.today,
          },
          {
            key: 'week',
            label: 'This Week',
            count: installations.new_installs.this_week,
          },
          {
            key: 'month',
            label: 'This Month',
            count: installations.new_installs.this_month,
          },
        ]}
        icon={PiDownloadSimpleBold}
      />

      <KpiBreakdownCardsSection
        title="Platform Split"
        items={[
          {
            key: 'android',
            label: 'Android',
            count: installations.by_platform.android,
          },
          {
            key: 'ios',
            label: 'iOS',
            count: installations.by_platform.ios,
          },
        ]}
        icon={PiDeviceMobileBold}
      />

      <KpiBreakdownCardsSection
        title="Uninstalled / Inactive"
        items={[
          {
            key: 'push_invalid',
            label: 'Push Invalid',
            count: installations.uninstalled.push_invalid,
          },
          {
            key: 'inactive_30_days',
            label: 'Inactive 30+ Days',
            count: installations.uninstalled.inactive_30_days,
          },
          {
            key: 'total',
            label: 'Total Uninstalled',
            count: installations.uninstalled.total,
          },
        ]}
        icon={PiWarningCircleBold}
      />
    </div>
  );
}
