'use client';

import {
  PiChartBarBold,
  PiStethoscopeBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownWidget from '@/app/shared/kpis/kpi-breakdown-widget';
import DoctorActivityDrillDownLink from '@/app/shared/doctor-activity-reports/drill-down-link';
import {
  formatReservationStatusLabel,
  formatSourceCampaignLabel,
} from '@/utils/doctor-activity-query';
import type { DoctorActivityStatistics } from '@/types/doctor-activity-report';

interface DoctorActivityStatisticsCardsProps {
  statistics?: DoctorActivityStatistics | null;
  className?: string;
}

const cards = [
  {
    key: 'total_doctors',
    title: 'Doctors with Reservations',
    icon: PiStethoscopeBold,
    color: 'purple' as const,
  },
  {
    key: 'total_reservations',
    title: 'Total Reservations',
    icon: PiChartBarBold,
    color: 'blue' as const,
  },
] as const;

export default function DoctorActivityStatisticsCards({
  statistics,
  className,
}: DoctorActivityStatisticsCardsProps) {
  if (!statistics) return null;

  const hasBreakdowns =
    statistics.by_status?.length > 0 ||
    statistics.by_source_campaign?.length > 0;

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
          {statistics.by_status?.length > 0 && (
            <div className="lg:col-span-6">
              <KpiBreakdownWidget
                title="By Status"
                items={statistics.by_status.slice(0, 6).map((bucket, index) => ({
                  key: `${String(bucket.status)}-${index}`,
                  label: formatReservationStatusLabel(bucket.status),
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

          {statistics.by_source_campaign?.length > 0 && (
            <div className="lg:col-span-6">
              <KpiBreakdownWidget
                title="By Source Campaign"
                items={statistics.by_source_campaign.slice(0, 6).map((bucket) => ({
                  key: bucket.source_campaign,
                  label: formatSourceCampaignLabel(bucket.source_campaign),
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
        </div>
      )}
    </div>
  );
}
