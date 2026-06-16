'use client';

import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
  PiStethoscopeBold,
} from 'react-icons/pi';
import WidgetCard from '@/components/cards/widget-card';
import { Badge } from '@/components/ui/badge';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import KpiStatCard from '@/app/shared/kpis/kpi-stat-card';
import KpiBreakdownWidget from '@/app/shared/kpis/kpi-breakdown-widget';
import DoctorActivityDrillDownLink from '@/app/shared/doctor-activity-reports/drill-down-link';
import type { DoctorActivitySummary, DoctorRef } from '@/types/doctor-activity-report';

export default function DoctorActivitySummaryPanel({
  doctor,
  summary,
}: {
  doctor: DoctorRef;
  summary: DoctorActivitySummary;
}) {
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
          title="Total Actions"
          value={summary.total_actions}
          icon={PiListChecksBold}
          color="blue"
        />
        <KpiStatCard
          title="Reservations"
          value={summary.reservations_count}
          icon={PiStethoscopeBold}
          color="purple"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {summary.by_event?.length > 0 && (
          <div className="lg:col-span-4">
            <KpiBreakdownWidget
              title="By Event"
              items={summary.by_event.slice(0, 6).map((item, index) => ({
                key: `${String(item.event)}-${index}`,
                label:
                  item.event == null || item.event === ''
                    ? 'Uncategorized'
                    : String(item.event),
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
        {summary.by_log_name?.length > 0 && (
          <div className="lg:col-span-4">
            <KpiBreakdownWidget
              title="By Log Name"
              items={summary.by_log_name.slice(0, 6).map((item, index) => ({
                key: `${String(item.log_name)}-${index}`,
                label: String(item.log_name),
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
        {summary.most_modified_models?.length > 0 && (
          <div className="lg:col-span-4">
            <KpiBreakdownWidget
              title="Most Modified Models"
              items={summary.most_modified_models.slice(0, 6).map((item) => ({
                key: item.type,
                label: item.type,
                count: item.count,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
