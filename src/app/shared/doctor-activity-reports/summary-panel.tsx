'use client';

import { PiCalendarCheckBold, PiFlagBold, PiMegaphoneBold, PiStethoscopeBold } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import WidgetCard from '@/components/cards/widget-card';
import { Badge } from '@/components/ui/badge';
import AvatarCard from '@/components/ui/avatar-card';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownCardsSection from '@/app/shared/kpis/kpi-breakdown-cards-section';
import {
  buildDoctorReservationFilterPathFromLink,
  formatReservationStatusLabel,
  formatSourceCampaignLabel,
  isReservationFilterLinkActive,
} from '@/utils/doctor-activity-query';
import type { DoctorActivitySummary, DoctorRef } from '@/types/doctor-activity-report';

export default function DoctorActivitySummaryPanel({
  doctor,
  summary,
}: {
  doctor: DoctorRef;
  summary: DoctorActivitySummary;
}) {
  const searchParams = useSearchParams();
  const current = new URLSearchParams(searchParams.toString());
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const statuses = summary.by_status ?? [];
  const campaigns = summary.by_source_campaign ?? [];
  const sessionsStats = summary.sessions_statistics;

  return (
    <div className="space-y-6">
      <WidgetCard
        title={doctor.name}
        description={
          doctor.specialist ?? doctor.email ?? doctor.mobile_number ?? undefined
        }
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <AvatarCard
            src=""
            name={doctor.name}
            description={
              doctor.specialist ?? doctor.email ?? doctor.mobile_number ?? undefined
            }
            avatarProps={{
              name: doctor.name,
              className: '!bg-gray-200 !text-gray-700',
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            {doctor.specialist && (
              <Badge variant="flat" color="secondary">
                {doctor.specialist}
              </Badge>
            )}
            {doctor.status != null && (
              <Badge
                variant="flat"
                color={doctor.status ? 'success' : 'danger'}
              >
                {doctor.status ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </div>
      </WidgetCard>

      <div className="flex w-full flex-wrap gap-5">
        <KpiStatCard
          title="Reservations"
          value={summary.reservations_count}
          icon={PiStethoscopeBold}
          color="purple"
        />
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
        description="Click to filter reservations below; summary stays unchanged"
        items={statuses.map((item, index) => ({
          key: `${String(item.status)}-${index}`,
          label: formatReservationStatusLabel(item.status),
          count: item.count,
          href: buildDoctorReservationFilterPathFromLink(
            locale,
            doctor.id,
            current,
            item.link
          ),
          selected: isReservationFilterLinkActive(current, item.link),
          subtitle: isReservationFilterLinkActive(current, item.link)
            ? 'Filter active'
            : undefined,
        }))}
        icon={PiFlagBold}
      />

      <KpiBreakdownCardsSection
        title="By Source Campaign"
        description="Click to filter reservations below; summary stays unchanged"
        items={campaigns.map((item) => ({
          key: item.source_campaign,
          label: formatSourceCampaignLabel(item.source_campaign),
          count: item.count,
          href: buildDoctorReservationFilterPathFromLink(
            locale,
            doctor.id,
            current,
            item.link
          ),
          selected: isReservationFilterLinkActive(current, item.link),
          subtitle: isReservationFilterLinkActive(current, item.link)
            ? 'Filter active'
            : undefined,
        }))}
        icon={PiMegaphoneBold}
      />

      <KpiBreakdownCardsSection
        title="By Session Count"
        items={(sessionsStats?.by_session_count ?? []).map((item) => ({
          key: String(item.sessions_count),
          label: `${item.sessions_count} session${item.sessions_count !== 1 ? 's' : ''}`,
          count: item.reservations_count,
          subtitle: `${item.total_sessions} slots`,
        }))}
        icon={PiCalendarCheckBold}
      />
    </div>
  );
}
