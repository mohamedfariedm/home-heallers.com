'use client';

import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import {
  PiUserCircleBold,
  PiCalendarCheckBold,
  PiCheckCircleBold,
  PiMapPinBold,
} from 'react-icons/pi';
import type { DoctorListStatistics } from '@/types/dashboard-statistics';
import KpiStatCard, { KPI_STAT_GRID_CLASS } from '@/app/shared/kpis/kpi-stat-card';

interface DoctorStatisticsProps {
  statistics?: DoctorListStatistics | null;
  className?: string;
}

function convertApiLinkToQueryParams(apiLink: string | undefined): string {
  if (!apiLink) return '';
  try {
    const url = new URL(apiLink);
    return url.searchParams.toString();
  } catch {
    return '';
  }
}

export default function DoctorStatistics({
  statistics,
  className,
}: DoctorStatisticsProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (!statistics) return null;

  const navigateFromLink = (link?: string) => {
    if (!link) return;
    const q = convertApiLinkToQueryParams(link);
    if (link.includes('reservations-calendar')) {
      router.push(`/reservations?${q}`);
      return;
    }
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const summaryCards = [
    {
      title: 'Active Doctors',
      value: statistics.active_doctors ?? 0,
      subtitle: 'Administratively active',
      icon: PiUserCircleBold,
      color: 'sky' as const,
    },
    {
      title: 'Working Doctors',
      value: statistics.working_doctors ?? 0,
      subtitle: 'Had sessions in period',
      icon: PiUserCircleBold,
      color: 'blue' as const,
    },
    {
      title: 'Scheduled Sessions',
      value: statistics.scheduled_sessions ?? 0,
      icon: PiCalendarCheckBold,
      color: 'indigo' as const,
    },
    {
      title: 'Sessions Completed',
      value: statistics.sessions_completed ?? 0,
      icon: PiCheckCircleBold,
      color: 'emerald' as const,
    },
    {
      title: 'Sessions / Working Doctor',
      value: Number(statistics.sessions_per_working_doctor ?? 0).toFixed(2),
      icon: PiCheckCircleBold,
      color: 'cyan' as const,
    },
  ];

  const byDoctor = statistics.by_doctor || [];
  const byCity = statistics.by_city || [];

  return (
    <div className={cn('w-full space-y-8', className)}>
      <section className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
          Doctor Workload (session period)
        </h4>
        <div className={KPI_STAT_GRID_CLASS}>
          {summaryCards.map((card) => (
            <KpiStatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {byDoctor.length > 0 && (
        <section className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            By Doctor
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2 font-medium">Doctor</th>
                  <th className="px-3 py-2 font-medium">Scheduled</th>
                  <th className="px-3 py-2 font-medium">Completed</th>
                  <th className="px-3 py-2 font-medium">Cancelled sessions</th>
                  {byDoctor.some((r) => typeof r.cancellation_rate === 'number') && (
                    <th className="px-3 py-2 font-medium">Cancel rate</th>
                  )}
                  {byDoctor.some((r) => typeof r.rating === 'number') && (
                    <th className="px-3 py-2 font-medium">Rating</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {byDoctor.map((row) => (
                  <tr
                    key={row.doctor_id}
                    className={cn(
                      'border-t border-gray-100 dark:border-gray-800',
                      row.link &&
                        'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                    onClick={() => {
                      if (!row.link) return;
                      const q = convertApiLinkToQueryParams(row.link);
                      window.location.href = `/reservations?${q}`;
                    }}
                  >
                    <td className="px-3 py-2">
                      {row.name}
                      {!row.is_active && (
                        <span className="ms-2 text-xs text-amber-600">
                          (inactive)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{row.scheduled_sessions}</td>
                    <td className="px-3 py-2">{row.sessions_completed}</td>
                    <td className="px-3 py-2">{row.cancelled_sessions}</td>
                    {byDoctor.some((r) => typeof r.cancellation_rate === 'number') && (
                      <td className="px-3 py-2">
                        {typeof row.cancellation_rate === 'number'
                          ? `${row.cancellation_rate.toFixed(2)}%`
                          : '—'}
                      </td>
                    )}
                    {byDoctor.some((r) => typeof r.rating === 'number') && (
                      <td className="px-3 py-2">
                        {typeof row.rating === 'number'
                          ? row.rating.toFixed(1)
                          : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Cancelled sessions / cancel rate are factual counts — not doctor blame.
            Capacity and utilization are not available from Backend.
          </p>
        </section>
      )}

      {byCity.length > 0 && (
        <section className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            Demand vs Served Doctors by City
          </h4>
          <div className={KPI_STAT_GRID_CLASS}>
            {byCity.map((city) => (
              <KpiStatCard
                key={`${city.city_id ?? 'unknown'}-${city.name}`}
                title={city.name || 'unknown'}
                value={city.sessions_count}
                subtitle={`${city.reservations_count} reservations · ${city.doctors_served_count} doctors served`}
                icon={PiMapPinBold}
                color="sky"
                onClick={city.link ? () => navigateFromLink(city.link) : undefined}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Shows served demand only — not capacity or coverage.
          </p>
        </section>
      )}
    </div>
  );
}
