'use client';

import { useEffect, useMemo, useState } from 'react';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import {
  PiUserCircleBold,
  PiCalendarCheckBold,
  PiCheckCircleBold,
  PiMapPinBold,
  PiBuildingsBold,
  PiMagnifyingGlassBold,
} from 'react-icons/pi';
import type {
  ActiveDoctorsByCategoryRow,
  DoctorListStatistics,
} from '@/types/dashboard-statistics';
import KpiStatCard, { KPI_STAT_GRID_CLASS } from '@/app/shared/kpis/kpi-stat-card';
import Pagination from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';

interface DoctorStatisticsProps {
  statistics?: DoctorListStatistics | null;
  className?: string;
}

const DEPARTMENT_PAGE_SIZE = 8;

function ActiveDoctorsByCategory({
  rows,
}: {
  rows: ActiveDoctorsByCategoryRow[];
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const sortedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) => (b.active_doctors ?? 0) - (a.active_doctors ?? 0)
      ),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter((row) =>
      String(row.name || '')
        .toLowerCase()
        .includes(q)
    );
  }, [sortedRows, search]);

  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / DEPARTMENT_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, rows]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * DEPARTMENT_PAGE_SIZE;
    return filteredRows.slice(start, start + DEPARTMENT_PAGE_SIZE);
  }, [filteredRows, safePage]);

  const maxCount = useMemo(
    () =>
      Math.max(1, ...sortedRows.map((row) => Number(row.active_doctors || 0))),
    [sortedRows]
  );

  const departmentsWithDoctors = useMemo(
    () => sortedRows.filter((row) => Number(row.active_doctors || 0) > 0).length,
    [sortedRows]
  );

  const rangeStart =
    totalItems === 0 ? 0 : (safePage - 1) * DEPARTMENT_PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * DEPARTMENT_PAGE_SIZE, totalItems);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            Active doctors by department
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            {departmentsWithDoctors} departments with active doctors ·{' '}
            {sortedRows.length} total
          </p>
        </div>
        <Input
          type="search"
          placeholder="Search department…"
          value={search}
          onClear={() => setSearch('')}
          onChange={(event) => setSearch(event.target.value)}
          clearable
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          className="w-full sm:w-64"
          inputClassName="h-10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F5F7FB] text-left dark:border-gray-700 dark:bg-gray-900/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Department
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Distribution
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Active doctors
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    No departments match your search.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const count = Number(row.active_doctors || 0);
                  const width = Math.max(4, Math.round((count / maxCount) * 100));
                  return (
                    <tr
                      key={row.category_id ?? `name-${row.name}`}
                      className="border-t border-gray-100 transition-colors hover:bg-[#F8FAFD] dark:border-gray-800 dark:hover:bg-gray-900/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143087]/10 text-[#143087]">
                            <PiBuildingsBold className="h-4 w-4" />
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {row.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-2 w-full min-w-[120px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#143087] to-[#39519B]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            'inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-2.5 py-1 text-sm font-semibold',
                            count > 0
                              ? 'bg-[#143087]/10 text-[#143087]'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                          )}
                        >
                          {count}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Showing {rangeStart}–{rangeEnd} of {totalItems}
          </p>
          {totalItems > DEPARTMENT_PAGE_SIZE && (
            <Pagination
              total={totalItems}
              current={safePage}
              pageSize={DEPARTMENT_PAGE_SIZE}
              onChange={(nextPage: number) => setPage(nextPage)}
              showLessItems
              className="justify-end"
              prevIconClassName="py-0 text-gray-500 !leading-[26px]"
              nextIconClassName="py-0 text-gray-500 !leading-[26px]"
            />
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Uses the doctor status column. A doctor who works in more than one
        department is counted in each. This is not limited to the session dates.
      </p>
    </section>
  );
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
  const byCategory = statistics.active_doctors_by_category || [];

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

      {byCategory.length > 0 && (
        <ActiveDoctorsByCategory rows={byCategory} />
      )}

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
