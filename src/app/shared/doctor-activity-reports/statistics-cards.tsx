'use client';

import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
  PiStethoscopeBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownWidget from '@/app/shared/kpis/kpi-breakdown-widget';
import DoctorActivityDrillDownLink from '@/app/shared/doctor-activity-reports/drill-down-link';
import type { DoctorActivityStatistics } from '@/types/doctor-activity-report';

interface DoctorActivityStatisticsCardsProps {
  statistics?: DoctorActivityStatistics | null;
  className?: string;
}

const cards = [
  { key: 'total_doctors', title: 'Active Doctors', icon: PiStethoscopeBold, color: 'purple' as const },
  { key: 'total_actions', title: 'Total Actions', icon: PiListChecksBold, color: 'blue' as const },
  { key: 'today', title: 'Today', icon: PiClockBold, color: 'green' as const },
  { key: 'this_week', title: 'This Week', icon: PiCalendarCheckBold, color: 'amber' as const },
  { key: 'this_month', title: 'This Month', icon: PiChartBarBold, color: 'indigo' as const },
] as const;

export default function DoctorActivityStatisticsCards({
  statistics,
  className,
}: DoctorActivityStatisticsCardsProps) {
  if (!statistics) return null;

  const hasBreakdowns =
    statistics.by_event?.length > 0 ||
    statistics.by_log_name?.length > 0 ||
    statistics.top_doctors?.length > 0 ||
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
                    <DoctorActivityDrillDownLink link={bucket.link}>
                      {bucket.count}
                    </DoctorActivityDrillDownLink>
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
                  label: bucket.log_name,
                  count: bucket.count,
                  countNode: (
                    <DoctorActivityDrillDownLink link={bucket.link}>
                      {bucket.count}
                    </DoctorActivityDrillDownLink>
                  ),
                }))}
              />
            </div>
          )}

          {statistics.top_doctors?.length > 0 && (
            <div className="lg:col-span-3">
              <KpiBreakdownWidget
                title="Top Doctors"
                items={statistics.top_doctors.slice(0, 5).map((doctor) => ({
                  key: String(doctor.id),
                  label: doctor.name,
                  count: doctor.count,
                  countNode: (
                    <DoctorActivityDrillDownLink link={doctor.link}>
                      {doctor.count}
                    </DoctorActivityDrillDownLink>
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
