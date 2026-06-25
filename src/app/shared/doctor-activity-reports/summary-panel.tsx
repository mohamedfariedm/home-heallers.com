'use client';

import { PiFlagBold, PiMegaphoneBold, PiStethoscopeBold } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import WidgetCard from '@/components/cards/widget-card';
import { Badge } from '@/components/ui/badge';
import AvatarCard from '@/components/ui/avatar-card';
import KpiStatCard, { type KpiStatCardColor } from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownWidget from '@/app/shared/kpis/kpi-breakdown-widget';
import DoctorActivityDrillDownLink from '@/app/shared/doctor-activity-reports/drill-down-link';
import {
  buildDoctorReservationFilterPathFromLink,
  formatReservationStatusLabel,
  formatSourceCampaignLabel,
  isReservationFilterLinkActive,
} from '@/utils/doctor-activity-query';
import type {
  DoctorActivitySummary,
  DoctorRef,
  SourceCampaignBucket,
  StatusBucket,
} from '@/types/doctor-activity-report';

const BREAKDOWN_COLORS: KpiStatCardColor[] = [
  'purple',
  'blue',
  'green',
  'amber',
  'indigo',
  'emerald',
];

function BreakdownStatCardsSection<T extends { count: number; link: string }>({
  title,
  description,
  items,
  icon,
  doctorId,
  getLabel,
  getKey,
}: {
  title: string;
  description: string;
  items: T[];
  icon: typeof PiMegaphoneBold;
  doctorId: number;
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
            color={BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length]}
            subtitle={
              isReservationFilterLinkActive(current, item.link)
                ? 'Reservations filter active'
                : undefined
            }
            href={buildDoctorReservationFilterPathFromLink(
              locale,
              doctorId,
              current,
              item.link
            )}
            selected={isReservationFilterLinkActive(current, item.link)}
          />
        ))}
      </div>
    </div>
  );
}

export default function DoctorActivitySummaryPanel({
  doctor,
  summary,
}: {
  doctor: DoctorRef;
  summary: DoctorActivitySummary;
}) {
  const statuses = summary.by_status ?? [];
  const campaigns = summary.by_source_campaign ?? [];

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
      </div>

      {(statuses.length > 0 || campaigns.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {statuses.length > 0 && (
            <div className="lg:col-span-6">
              <KpiBreakdownWidget
                title="By Status"
                items={statuses.slice(0, 6).map((item: StatusBucket, index) => ({
                  key: `${String(item.status)}-${index}`,
                  label: formatReservationStatusLabel(item.status),
                  count: item.count,
                  countNode: item.link ? (
                    <DoctorActivityDrillDownLink link={item.link} doctorId={doctor.id}>
                      {item.count}
                    </DoctorActivityDrillDownLink>
                  ) : undefined,
                }))}
              />
            </div>
          )}
          {campaigns.length > 0 && (
            <div className="lg:col-span-6">
              <KpiBreakdownWidget
                title="By Source Campaign"
                items={campaigns
                  .slice(0, 6)
                  .map((item: SourceCampaignBucket) => ({
                    key: item.source_campaign,
                    label: formatSourceCampaignLabel(item.source_campaign),
                    count: item.count,
                    countNode: item.link ? (
                      <DoctorActivityDrillDownLink
                        link={item.link}
                        doctorId={doctor.id}
                      >
                        {item.count}
                      </DoctorActivityDrillDownLink>
                    ) : undefined,
                  }))}
              />
            </div>
          )}
        </div>
      )}

      {(statuses.length > 0 || campaigns.length > 0) && (
        <div className="space-y-6">
          <BreakdownStatCardsSection
            title="Reservations by Source Campaign"
            description="Filters reservations below; summary stays unchanged"
            items={campaigns}
            icon={PiMegaphoneBold}
            doctorId={doctor.id}
            getLabel={(item) => formatSourceCampaignLabel(item.source_campaign)}
            getKey={(item) => item.source_campaign}
          />
          <BreakdownStatCardsSection
            title="Reservations by Status"
            description="Filters reservations below; summary stays unchanged"
            items={statuses}
            icon={PiFlagBold}
            doctorId={doctor.id}
            getLabel={(item) => formatReservationStatusLabel(item.status)}
            getKey={(item, index) => `${String(item.status)}-${index}`}
          />
        </div>
      )}
    </div>
  );
}
