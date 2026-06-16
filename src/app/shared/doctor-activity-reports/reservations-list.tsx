'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PiCaretDownBold, PiCaretRightBold } from 'react-icons/pi';
import WidgetCard from '@/components/cards/widget-card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import DateCell from '@/components/ui/date-cell';
import CreateButton from '@/app/shared/create-button';
import ActivityLogDetailsModal from '@/app/shared/activity-logs/details-modal';
import { getSubjectHref } from '@/app/shared/activity-logs/subject-link';
import { formatReservationStatusLabel } from '@/utils/doctor-activity-query';
import type {
  DoctorActivityLogItem,
  DoctorReservationActivityRow,
} from '@/types/doctor-activity-report';

function EventBadge({ event }: { event: string | null }) {
  if (!event) return <Badge variant="flat" color="secondary">—</Badge>;
  const color =
    event === 'created' ? 'success' : event === 'updated' ? 'warning' : 'danger';
  return (
    <Badge variant="flat" color={color} className="capitalize">
      {event}
    </Badge>
  );
}

function ActivityRow({ activity }: { activity: DoctorActivityLogItem }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-700">
      <DateCell date={new Date(activity.created_at)} />
      <EventBadge event={activity.event} />
      <Text className="min-w-0 flex-1 text-sm text-gray-700 dark:text-gray-300">
        {activity.description ?? '—'}
      </Text>
      <Text className="text-xs text-gray-500">{activity.log_name ?? '—'}</Text>
      <CreateButton
        icon={
          <Button size="sm" type="button">
            Details
          </Button>
        }
        view={<ActivityLogDetailsModal id={activity.id} />}
        label=""
        className="m-0 bg-transparent p-0"
        customSize="720px"
      />
    </div>
  );
}

function ReservationCard({ row }: { row: DoctorReservationActivityRow }) {
  const [open, setOpen] = useState(false);
  const reservation = row.reservation;
  const subjectHref = getSubjectHref('Reservation', reservation.id);
  const title =
    reservation.service_name ??
    reservation.client_name ??
    `Reservation #${reservation.id}`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80"
      >
        <span className="mt-1 text-gray-400">
          {open ? (
            <PiCaretDownBold className="h-4 w-4" />
          ) : (
            <PiCaretRightBold className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {subjectHref ? (
              <Link
                href={subjectHref}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {title}
              </Link>
            ) : (
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </Text>
            )}
            <Badge variant="flat" color="secondary">
              #{reservation.id}
            </Badge>
            <Badge variant="outline">
              {formatReservationStatusLabel(reservation.status)}
            </Badge>
          </div>

          {reservation.client_name && reservation.service_name && (
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {reservation.client_name}
            </Text>
          )}

          <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Booked: <DateCell date={new Date(reservation.created_at)} />
            </span>
            <span>{row.total_actions} action(s)</span>
            {row.first_activity_at && (
              <span>
                First: <DateCell date={new Date(row.first_activity_at)} />
              </span>
            )}
            {row.last_activity_at && (
              <span>
                Last: <DateCell date={new Date(row.last_activity_at)} />
              </span>
            )}
          </div>

          {row.by_event?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {row.by_event.map((bucket) => (
                <Badge
                  key={bucket.event ?? 'none'}
                  variant="flat"
                  color="secondary"
                  className="capitalize"
                >
                  {bucket.event ?? 'other'}: {bucket.count}
                </Badge>
              ))}
            </div>
          )}

          {row.total_actions === 0 && (
            <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              No logged actions on this reservation
            </Text>
          )}
        </div>
      </button>

      {open && row.activities?.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-900/30">
          {row.activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DoctorReservationsList({
  reservations,
  totalItems,
}: {
  reservations: DoctorReservationActivityRow[];
  totalItems: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get('page') || 1);
  const pageSize = Number(
    searchParams.get('per_page') || searchParams.get('limit') || 25
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    params.set('per_page', String(pageSize));
    params.delete('limit');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (reservations.length === 0) {
    return (
      <WidgetCard
        title="Reservations"
        description="Reservations assigned to this doctor in the selected date range"
      >
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            No reservations match the current filters.
          </Text>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Reservations"
      description={`${totalItems.toLocaleString()} reservations`}
    >
      <div className="space-y-3">
        {reservations.map((row) => (
          <ReservationCard
            key={row.reservation.id}
            row={row}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <Text className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </Text>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
