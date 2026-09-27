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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  link,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  link?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative min-w-[140px] flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        link && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
      )}
      onClick={() => {
        if (!link) return;
        const q = convertApiLinkToQueryParams(link);
        // Calendar links go to calendar path when present
        if (link.includes('reservations-calendar')) {
          router.push(`/reservations?${q}`);
          return;
        }
        router.push(q ? `${pathname}?${q}` : pathname);
      }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

export default function DoctorStatistics({
  statistics,
  className,
}: DoctorStatisticsProps) {
  if (!statistics) return null;

  const summaryCards = [
    {
      title: 'Active Doctors',
      value: statistics.active_doctors ?? 0,
      subtitle: 'Administratively active',
      icon: PiUserCircleBold,
    },
    {
      title: 'Working Doctors',
      value: statistics.working_doctors ?? 0,
      subtitle: 'Had sessions in period',
      icon: PiUserCircleBold,
    },
    {
      title: 'Scheduled Sessions',
      value: statistics.scheduled_sessions ?? 0,
      icon: PiCalendarCheckBold,
    },
    {
      title: 'Sessions Completed',
      value: statistics.sessions_completed ?? 0,
      icon: PiCheckCircleBold,
    },
    {
      title: 'Sessions / Working Doctor',
      value: Number(statistics.sessions_per_working_doctor ?? 0).toFixed(2),
      icon: PiCheckCircleBold,
    },
  ];

  const byDoctor = statistics.by_doctor || [];
  const byCity = statistics.by_city || [];

  return (
    <div className={cn('w-full space-y-6', className)}>
      <div className="space-y-3">
        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Doctor Workload (session period)
        </h4>
        <div className="flex flex-wrap gap-3">
          {summaryCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      {byDoctor.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            By Doctor
          </h4>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2 font-medium">Doctor</th>
                  <th className="px-3 py-2 font-medium">Scheduled</th>
                  <th className="px-3 py-2 font-medium">Completed</th>
                  <th className="px-3 py-2 font-medium">Cancelled sessions</th>
                </tr>
              </thead>
              <tbody>
                {byDoctor.map((row) => (
                  <tr
                    key={row.doctor_id}
                    className={cn(
                      'border-t border-gray-100 dark:border-gray-800',
                      row.link && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
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
                        <span className="ms-2 text-xs text-amber-600">(inactive)</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{row.scheduled_sessions}</td>
                    <td className="px-3 py-2">{row.sessions_completed}</td>
                    <td className="px-3 py-2">{row.cancelled_sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Cancelled sessions are factual counts (any cause) — not doctor blame.
          </p>
        </div>
      )}

      {byCity.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Demand vs Served Doctors by City
          </h4>
          <div className="flex flex-wrap gap-3">
            {byCity.map((city) => (
              <StatCard
                key={`${city.city_id ?? 'unknown'}-${city.name}`}
                title={city.name || 'unknown'}
                value={city.sessions_count}
                subtitle={`${city.reservations_count} reservations · ${city.doctors_served_count} doctors served`}
                icon={PiMapPinBold}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Shows served demand only — not capacity or coverage.
          </p>
        </div>
      )}
    </div>
  );
}
