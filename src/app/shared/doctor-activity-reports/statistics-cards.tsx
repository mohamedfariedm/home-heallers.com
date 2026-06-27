'use client';

import Cookies from 'js-cookie';
import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiFlagBold,
  PiMegaphoneBold,
  PiStethoscopeBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import {
  buildDoctorActivityPathFromApiLink,
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

  const locale = Cookies.get('NEXT_LOCALE') || 'en';
  const sessionsStats = statistics.sessions_statistics;

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
        {sessionsStats != null && (
          <KpiStatCard
            title="Total Sessions"
            value={sessionsStats.total_sessions}
            icon={PiCalendarCheckBold}
            color="amber"
            subtitle={`${sessionsStats.total_reservations} reservations`}
          />
        )}
      </div>

      <KpiBreakdownCardsSection
        title="By Status"
        items={(statistics.by_status ?? []).map((bucket, index) => ({
          key: `${String(bucket.status)}-${index}`,
          label: formatReservationStatusLabel(bucket.status),
          count: bucket.count,
          href: buildDoctorActivityPathFromApiLink(locale, bucket.link),
        }))}
        icon={PiFlagBold}
      />

      <KpiBreakdownCardsSection
        title="By Source Campaign"
        items={(statistics.by_source_campaign ?? []).map((bucket) => ({
          key: bucket.source_campaign,
          label: formatSourceCampaignLabel(bucket.source_campaign),
          count: bucket.count,
          href: buildDoctorActivityPathFromApiLink(locale, bucket.link),
        }))}
        icon={PiMegaphoneBold}
      />

      <KpiBreakdownCardsSection
        title="By Session Count"
        items={(sessionsStats?.by_session_count ?? []).map((bucket) => ({
          key: String(bucket.sessions_count),
          label: `${bucket.sessions_count} session${bucket.sessions_count !== 1 ? 's' : ''}`,
          count: bucket.reservations_count,
          subtitle: `${bucket.total_sessions} slots`,
        }))}
        icon={PiCalendarCheckBold}
      />
    </div>
  );
}
