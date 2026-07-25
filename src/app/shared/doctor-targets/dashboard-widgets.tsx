'use client';

import {
  PiCheckCircleBold,
  PiCurrencyDollarBold,
  PiTargetBold,
  PiTrendDownBold,
  PiTrendUpBold,
  PiUsersBold,
  PiWalletBold,
  PiXCircleBold,
  PiChartPieSliceBold,
  PiPercentBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import Spinner from '@/components/ui/spinner';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import { useDoctorTargetsDashboard } from '@/framework/doctor-targets';
import {
  doctorDisplayName,
  formatAchievement,
  formatMoney,
} from './status-badge';
import { routes } from '@/config/routes';

export default function DoctorTargetsDashboardWidgets({
  className,
}: {
  className?: string;
}) {
  const { data, isLoading, isError, error } = useDoctorTargetsDashboard();
  const metrics = data?.data ?? data ?? {};
  const counts = metrics?.counts_by_status ?? {};

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
        {(error as Error)?.message || 'Failed to load dashboard metrics'}
      </div>
    );
  }

  const highest = Array.isArray(metrics?.highest_performing)
    ? metrics.highest_performing
    : [];
  const lowest = Array.isArray(metrics?.lowest_performing)
    ? metrics.lowest_performing
    : [];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title="Draft"
          value={counts.draft ?? 0}
          icon={PiTargetBold}
          color="sky"
          href={`${routes.doctorTargets.index}?tab=targets&status=draft`}
        />
        <KpiStatCard
          title="Active"
          value={counts.active ?? 0}
          icon={PiChartPieSliceBold}
          color="blue"
          href={`${routes.doctorTargets.index}?tab=targets&status=active`}
        />
        <KpiStatCard
          title="Approved"
          value={counts.approved ?? 0}
          icon={PiCheckCircleBold}
          color="amber"
          href={`${routes.doctorTargets.index}?tab=targets&status=approved`}
        />
        <KpiStatCard
          title="Externally paid"
          value={counts.paid ?? 0}
          icon={PiWalletBold}
          color="green"
          href={`${routes.doctorTargets.index}?tab=targets&status=paid`}
        />
      </div>

      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title="Total incentives"
          value={formatMoney(metrics?.total_incentives)}
          icon={PiCurrencyDollarBold}
          color="indigo"
        />
        <KpiStatCard
          title="Total approved"
          value={formatMoney(metrics?.total_approved)}
          icon={PiCurrencyDollarBold}
          color="amber"
        />
        <KpiStatCard
          title="Total paid"
          value={formatMoney(metrics?.total_paid)}
          icon={PiWalletBold}
          color="emerald"
        />
        <KpiStatCard
          title="Avg achievement"
          value={formatAchievement(metrics?.average_achievement_percentage)}
          icon={PiPercentBold}
          color="cyan"
        />
        <KpiStatCard
          title="Completion rate"
          value={formatAchievement(metrics?.completion_rate)}
          icon={PiPercentBold}
          color="purple"
        />
      </div>

      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title="Above target"
          value={metrics?.doctors_above_target ?? 0}
          icon={PiTrendUpBold}
          color="green"
        />
        <KpiStatCard
          title="Below target"
          value={metrics?.doctors_below_target ?? 0}
          icon={PiTrendDownBold}
          color="orange"
        />
        <KpiStatCard
          title="Successfully completed"
          value={metrics?.successfully_completed_targets ?? 0}
          icon={PiCheckCircleBold}
          color="emerald"
        />
        <KpiStatCard
          title="Failed targets"
          value={metrics?.failed_targets ?? 0}
          icon={PiXCircleBold}
          color="orange"
        />
      </div>

      <KpiBreakdownCardsSection
        title="Highest performing"
        description="Top doctors by achievement percentage"
        icon={PiUsersBold}
        items={highest.map((item: any, index: number) => ({
          key: String(item?.doctor_id ?? item?.id ?? `high-${index}`),
          label: doctorDisplayName(item?.doctor, item?.doctor_id ?? item?.id),
          count: Number(
            item?.achievement_percentage ?? item?.achievement ?? 0
          ),
          subtitle: formatAchievement(
            item?.achievement_percentage ?? item?.achievement
          ),
        }))}
      />

      <KpiBreakdownCardsSection
        title="Lowest performing"
        description="Doctors with the lowest achievement percentage"
        icon={PiUsersBold}
        colors={['orange', 'amber', 'sky', 'cyan']}
        items={lowest.map((item: any, index: number) => ({
          key: String(item?.doctor_id ?? item?.id ?? `low-${index}`),
          label: doctorDisplayName(item?.doctor, item?.doctor_id ?? item?.id),
          count: Number(
            item?.achievement_percentage ?? item?.achievement ?? 0
          ),
          subtitle: formatAchievement(
            item?.achievement_percentage ?? item?.achievement
          ),
        }))}
      />
    </div>
  );
}
