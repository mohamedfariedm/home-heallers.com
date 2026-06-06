'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  PiCalendarCheckBold,
  PiChartBarBold,
  PiClockBold,
  PiListChecksBold,
  PiStethoscopeBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import {
  buildDoctorActivityDetailPath,
  buildDoctorActivityListPath,
  parseDoctorApiLinkToSearchParams,
} from '@/utils/doctor-activity-query';
import type { DoctorActivityStatistics } from '@/types/doctor-activity-report';

interface DoctorActivityStatisticsCardsProps {
  statistics?: DoctorActivityStatistics | null;
  className?: string;
}

const cards = [
  { key: 'total_doctors', title: 'Active Doctors', icon: PiStethoscopeBold, color: 'purple' },
  { key: 'total_actions', title: 'Total Actions', icon: PiListChecksBold, color: 'blue' },
  { key: 'today', title: 'Today', icon: PiClockBold, color: 'green' },
  { key: 'this_week', title: 'This Week', icon: PiCalendarCheckBold, color: 'amber' },
  { key: 'this_month', title: 'This Month', icon: PiChartBarBold, color: 'indigo' },
] as const;

const colorMap = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

function DrillDownLink({
  link,
  children,
  className,
}: {
  link: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = Cookies.get('NEXT_LOCALE') || 'en';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = parseDoctorApiLinkToSearchParams(link);
    params.set('tab', 'doctors');

    const doctorMatch = link.match(/\/doctor-activity\/(\d+)/);
    if (doctorMatch) {
      router.push(buildDoctorActivityDetailPath(locale, Number(doctorMatch[1]), params));
      return;
    }

    router.push(buildDoctorActivityListPath(locale, params));
  };

  return (
    <Link
      href={pathname}
      onClick={handleClick}
      className={cn(
        'font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400',
        className
      )}
    >
      {children}
    </Link>
  );
}

export default function DoctorActivityStatisticsCards({
  statistics,
  className,
}: DoctorActivityStatisticsCardsProps) {
  if (!statistics) return null;

  return (
    <div className={cn('mb-6 space-y-4', className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const colors = colorMap[card.color];
          const value = statistics[card.key] ?? 0;

          return (
            <div
              key={card.key}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-lg',
                    colors.bg,
                    colors.text
                  )}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(statistics.by_event?.length > 0 ||
        statistics.top_doctors?.length > 0 ||
        statistics.most_modified_models?.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {statistics.by_event?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                By Event
              </p>
              <div className="space-y-2">
                {statistics.by_event.slice(0, 5).map((bucket) => (
                  <div
                    key={bucket.event ?? 'uncategorized'}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-gray-700 dark:text-gray-300">
                      {bucket.event ?? 'Uncategorized'}
                    </span>
                    <DrillDownLink link={bucket.link}>{bucket.count}</DrillDownLink>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statistics.top_doctors?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Top Doctors
              </p>
              <div className="space-y-2">
                {statistics.top_doctors.slice(0, 5).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {doctor.name}
                    </span>
                    <DrillDownLink link={doctor.link}>{doctor.count}</DrillDownLink>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statistics.most_modified_models?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Most Modified Models
              </p>
              <div className="space-y-2">
                {statistics.most_modified_models.slice(0, 5).map((model) => (
                  <div
                    key={model.type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {model.type}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {model.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
