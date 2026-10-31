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
import KpiStatCard, {
  KPI_STAT_GRID_3_CLASS,
  KPI_STAT_GRID_CLASS,
} from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import type {
  ActiveUserStats,
  AppAnalyticsOverview,
} from '@/types/app-analytics';

interface AppAnalyticsStatCardsProps {
  data: AppAnalyticsOverview;
  activeUsers?: ActiveUserStats;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
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
    <div className="space-y-8">
      <Section
        title={t('analytics_overview', 'Overview')}
        description={t(
          'analytics_overview_desc',
          'Install funnel, activity, and device health at a glance'
        )}
      >
        <div className={KPI_STAT_GRID_CLASS}>
          <KpiStatCard
            title={t('analytics_installed_not_registered', 'Installed (not registered)')}
            value={funnel.installed_not_registered.toLocaleString()}
            subtitle={t(
              'analytics_installed_not_registered_sub',
              'Anonymous installs before login'
            )}
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
            subtitle={t('analytics_reinstalls_sub', 'Devices that reinstalled the app')}
            icon={PiRepeatBold}
            color="indigo"
          />
          <KpiStatCard
            title={t('analytics_account_unregistered', 'Account Unregistered')}
            value={(installations.unregistered ?? 0).toLocaleString()}
            subtitle={t(
              'analytics_account_unregistered_sub',
              'Linked client deleted their account'
            )}
            icon={PiUserMinusBold}
            color="orange"
          />
        </div>
      </Section>

      <Section
        title={t('analytics_active_users_installations', 'Active Users — Installations')}
        description={t(
          'analytics_active_users_installations_desc',
          'Daily, weekly, and monthly active installations'
        )}
      >
        <div className={KPI_STAT_GRID_3_CLASS}>
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
            subtitle={t('analytics_last_7_days', 'Last 7 days')}
            icon={PiUsersBold}
            color="cyan"
          />
          <KpiStatCard
            title={t('analytics_mau_installs', 'Monthly Active Installs')}
            value={active.installations.mau.toLocaleString()}
            subtitle={t('analytics_last_30_days', 'Last 30 days')}
            icon={PiUsersBold}
            color="sky"
          />
        </div>
      </Section>

      <Section
        title={t('analytics_active_users_logged_in', 'Active Users — Logged-in Users')}
        description={t(
          'analytics_active_users_logged_in_desc',
          'Engagement among authenticated users'
        )}
      >
        <div className={KPI_STAT_GRID_3_CLASS}>
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
            subtitle={t('analytics_last_7_days', 'Last 7 days')}
            icon={PiUsersBold}
            color="blue"
          />
          <KpiStatCard
            title={t('analytics_mau_users', 'Monthly Active Users')}
            value={active.users.mau.toLocaleString()}
            subtitle={t('analytics_last_30_days', 'Last 30 days')}
            icon={PiUsersBold}
            color="green"
          />
        </div>
      </Section>

      <KpiBreakdownCardsSection
        title={t('analytics_new_installs', 'New Installs')}
        description={t('analytics_new_installs_desc', 'Fresh installs by period')}
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
        description={t('analytics_platform_split_desc', 'Installations by operating system')}
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
        description={t(
          'analytics_uninstalled_inactive_desc',
          'Devices that stopped receiving push or went inactive'
        )}
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
