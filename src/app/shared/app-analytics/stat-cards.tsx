'use client';

import { useTranslation } from 'react-i18next';
import {
  PiCalendarCheckBold,
  PiCellSignalFullBold,
  PiDeviceMobileBold,
  PiDownloadSimpleBold,
  PiRepeatBold,
  PiShieldWarningBold,
  PiUserMinusBold,
  PiUserPlusBold,
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
  const { t } = useTranslation('app-analytics');
  const installations = data.installations;
  const funnel = installations.funnel ?? {
    installed_not_registered: 0,
    registered: 0,
    total: installations.total_installs ?? 0,
  };
  const active = activeUsers ?? data.active_users;

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title={t('analytics_installed_not_registered', 'Installed (not registered)')}
          value={funnel.installed_not_registered.toLocaleString()}
          subtitle={t('analytics_installed_not_registered_sub', 'Anonymous installs before login')}
          icon={PiDeviceMobileBold}
          color="sky"
        />
        <KpiStatCard
          title={t('analytics_registered', 'Registered')}
          value={funnel.registered.toLocaleString()}
          subtitle={t('analytics_registered_sub', 'Logged-in installations')}
          icon={PiUserPlusBold}
          color="cyan"
        />
        <KpiStatCard
          title={t('analytics_total_installs', 'Total Installs')}
          value={installations.total_installs.toLocaleString()}
          subtitle={t('analytics_funnel_total', {
            count: funnel.total.toLocaleString(),
            defaultValue: 'Funnel total: {{count}}',
          })}
          icon={PiDownloadSimpleBold}
          color="blue"
        />
        <KpiStatCard
          title={t('analytics_new_today', 'New Today')}
          value={installations.new_installs.today.toLocaleString()}
          subtitle={t('analytics_this_week', {
            count: installations.new_installs.this_week.toLocaleString(),
            defaultValue: '{{count}} this week',
          })}
          icon={PiCalendarCheckBold}
          color="green"
        />
        <KpiStatCard
          title={t('analytics_active_installations', 'Active Installations')}
          value={installations.active_installations.toLocaleString()}
          subtitle={t(
            'analytics_active_installations_sub',
            'Seen in last 30 days, excluding uninstalled & unregistered'
          )}
          icon={PiCellSignalFullBold}
          color="emerald"
        />
        <KpiStatCard
          title={t('analytics_needs_update', 'Needs Update')}
          value={data.devices.should_update.count.toLocaleString()}
          subtitle={t('analytics_latest_supported', {
            android: data.devices.latest_supported_versions.android,
            ios: data.devices.latest_supported_versions.ios,
            defaultValue: 'Latest: Android {{android}} / iOS {{ios}}',
          })}
          icon={PiShieldWarningBold}
          color="orange"
        />
        <KpiStatCard
          title={t('analytics_reinstalls', 'Reinstalls')}
          value={installations.reinstalls.toLocaleString()}
          icon={PiRepeatBold}
          color="indigo"
        />
        <KpiStatCard
          title={t('analytics_account_unregistered', 'Account Unregistered')}
          value={(installations.unregistered ?? 0).toLocaleString()}
          subtitle={t('analytics_account_unregistered_sub', 'Linked client deleted their account')}
          icon={PiUserMinusBold}
          color="orange"
        />
      </div>

      <div className="space-y-3">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {t('analytics_active_users_installations', 'Active Users — Installations')}
        </p>
        <div className="flex w-full flex-wrap gap-5">
          <KpiStatCard
            title={t('analytics_dau_installs', 'Daily Active Installs')}
            value={active.installations.dau.toLocaleString()}
            subtitle={t('analytics_reference_date', {
              date: active.date,
              defaultValue: 'Reference date: {{date}}',
            })}
            icon={PiUsersBold}
            color="purple"
          />
          <KpiStatCard
            title={t('analytics_wau_installs', 'Weekly Active Installs')}
            value={active.installations.wau.toLocaleString()}
            icon={PiUsersBold}
            color="cyan"
          />
          <KpiStatCard
            title={t('analytics_mau_installs', 'Monthly Active Installs')}
            value={active.installations.mau.toLocaleString()}
            icon={PiUsersBold}
            color="sky"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {t('analytics_active_users_logged_in', 'Active Users — Logged-in Users')}
        </p>
        <div className="flex w-full flex-wrap gap-5">
          <KpiStatCard
            title={t('analytics_dau_users', 'Daily Active Users')}
            value={active.users.dau.toLocaleString()}
            subtitle={t('analytics_source', {
              source: active.source,
              defaultValue: 'Source: {{source}}',
            })}
            icon={PiUsersBold}
            color="amber"
          />
          <KpiStatCard
            title={t('analytics_wau_users', 'Weekly Active Users')}
            value={active.users.wau.toLocaleString()}
            icon={PiUsersBold}
            color="blue"
          />
          <KpiStatCard
            title={t('analytics_mau_users', 'Monthly Active Users')}
            value={active.users.mau.toLocaleString()}
            icon={PiUsersBold}
            color="green"
          />
        </div>
      </div>

      <KpiBreakdownCardsSection
        title={t('analytics_new_installs', 'New Installs')}
        items={[
          {
            key: 'today',
            label: t('analytics_today', 'Today'),
            count: installations.new_installs.today,
          },
          {
            key: 'week',
            label: t('analytics_this_week_label', 'This Week'),
            count: installations.new_installs.this_week,
          },
          {
            key: 'month',
            label: t('analytics_this_month', 'This Month'),
            count: installations.new_installs.this_month,
          },
        ]}
        icon={PiDownloadSimpleBold}
      />

      <KpiBreakdownCardsSection
        title={t('analytics_platform_split', 'Platform Split')}
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
        title={t('analytics_uninstalled_inactive', 'Uninstalled / Inactive')}
        items={[
          {
            key: 'push_invalid',
            label: t('analytics_push_invalid', 'Push Invalid'),
            count: installations.uninstalled.push_invalid,
          },
          {
            key: 'inactive_30_days',
            label: t('analytics_inactive_30', 'Inactive 30+ Days'),
            count: installations.uninstalled.inactive_30_days,
          },
          {
            key: 'total',
            label: t('analytics_total_uninstalled', 'Total Uninstalled'),
            count: installations.uninstalled.total,
          },
          {
            key: 'unregistered',
            label: t('analytics_account_unregistered', 'Account Unregistered'),
            count: installations.unregistered ?? 0,
          },
        ]}
        icon={PiWarningCircleBold}
      />
    </div>
  );
}
