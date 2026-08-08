'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, dayjsLocalizer, type View } from 'react-big-calendar';
import {
  PiCalendarBlankBold,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiStethoscopeBold,
  PiXBold,
  PiPhoneBold,
  PiPackageBold,
  PiArrowRightBold,
  PiCalendarCheckBold,
  PiSparkleBold,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import SelectBox from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useReservationsCalendarMonth } from '@/framework/reservations';
import cn from '@/utils/class-names';
import { resolveLocalizedNameOrFallback } from '@/utils/resolve-localized-name';
import type {
  ReservationCalendarSession,
  SessionStatus,
} from '@/types/reservation-calendar';
import ReservationViewModal from '@/app/shared/reservations/reservation-view-modal';
import client from '@/framework/utils';
import toast from 'react-hot-toast';

const localizer = dayjsLocalizer(dayjs);

const SESSION_STATUS_OPTIONS = [
  { value: '', label: 'All statuses', name: 'All statuses' },
  { value: 'pending', label: 'Pending', name: 'Pending' },
  { value: 'confirmed', label: 'Confirmed', name: 'Confirmed' },
  { value: 'completed', label: 'Completed', name: 'Completed' },
  { value: 'cancelled', label: 'Cancelled', name: 'Cancelled' },
  { value: 'failed', label: 'Failed', name: 'Failed' },
];

const STATUS_META: Record<
  string,
  {
    chip: string;
    soft: string;
    bar: string;
    label: string;
    eventBg: string;
    eventText: string;
  }
> = {
  pending: {
    chip: 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/20',
    soft: 'from-amber-500/15 via-amber-500/5 to-white',
    bar: 'bg-amber-500',
    label: 'Pending',
    eventBg: '#FFF7ED',
    eventText: '#9A3412',
  },
  confirmed: {
    chip: 'bg-sky-500/15 text-sky-800 ring-1 ring-sky-500/20',
    soft: 'from-sky-500/15 via-sky-500/5 to-white',
    bar: 'bg-sky-500',
    label: 'Confirmed',
    eventBg: '#EFF6FF',
    eventText: '#1E40AF',
  },
  completed: {
    chip: 'bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/20',
    soft: 'from-emerald-500/15 via-emerald-500/5 to-white',
    bar: 'bg-emerald-500',
    label: 'Completed',
    eventBg: '#ECFDF5',
    eventText: '#065F46',
  },
  cancelled: {
    chip: 'bg-rose-500/15 text-rose-800 ring-1 ring-rose-500/20',
    soft: 'from-rose-500/15 via-rose-500/5 to-white',
    bar: 'bg-rose-500',
    label: 'Cancelled',
    eventBg: '#FFF1F2',
    eventText: '#9F1239',
  },
  failed: {
    chip: 'bg-slate-500/15 text-slate-700 ring-1 ring-slate-500/20',
    soft: 'from-slate-500/15 via-slate-500/5 to-white',
    bar: 'bg-slate-500',
    label: 'Failed',
    eventBg: '#F8FAFC',
    eventText: '#334155',
  },
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: ReservationCalendarSession;
};

const calendarClassName = cn(
  'reservations-month-calendar overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm',
  '[&_.rbc-month-view]:border-0',
  '[&_.rbc-header]:border-b [&_.rbc-header]:border-gray-100 [&_.rbc-header]:bg-gray-50/80 [&_.rbc-header]:py-3 [&_.rbc-header]:text-[11px] [&_.rbc-header]:font-semibold [&_.rbc-header]:uppercase [&_.rbc-header]:tracking-[0.14em] [&_.rbc-header]:text-gray-500',
  '[&_.rbc-month-row]:border-gray-100 [&_.rbc-day-bg]:border-gray-100',
  '[&_.rbc-off-range-bg]:bg-gray-50/60',
  '[&_.rbc-today]:bg-gradient-to-b [&_.rbc-today]:from-primary/[0.08] [&_.rbc-today]:to-transparent',
  '[&_.rbc-date-cell]:p-2 [&_.rbc-date-cell]:text-right [&_.rbc-date-cell>a]:inline-flex [&_.rbc-date-cell>a]:h-7 [&_.rbc-date-cell>a]:min-w-7 [&_.rbc-date-cell>a]:items-center [&_.rbc-date-cell>a]:justify-center [&_.rbc-date-cell>a]:rounded-full [&_.rbc-date-cell>a]:text-sm [&_.rbc-date-cell>a]:font-semibold [&_.rbc-date-cell>a]:text-gray-700',
  '[&_.rbc-now>.rbc-button-link]:bg-primary [&_.rbc-now>.rbc-button-link]:text-white',
  '[&_.rbc-event]:!rounded-md [&_.rbc-event]:!border-0 [&_.rbc-event]:!px-1.5 [&_.rbc-event]:!py-0.5 [&_.rbc-event]:!shadow-none',
  '[&_.rbc-show-more]:mt-1 [&_.rbc-show-more]:rounded-md [&_.rbc-show-more]:bg-primary/5 [&_.rbc-show-more]:px-1.5 [&_.rbc-show-more]:py-0.5 [&_.rbc-show-more]:text-[11px] [&_.rbc-show-more]:font-semibold [&_.rbc-show-more]:text-primary',
  '[&_.rbc-time-view]:border-0',
  '[&_.rbc-time-content]:border-gray-100',
  '[&_.rbc-timeslot-group]:border-gray-100',
  '[&_.rbc-current-time-indicator]:bg-primary',
  '[&_.rbc-agenda-view]:border-0',
  '[&_.rbc-agenda-table]:border-0'
);

function toSelectValue(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return String((value as { value: string | number }).value);
  }
  return String(value);
}

function getPatientName(session: ReservationCalendarSession): string {
  return resolveLocalizedNameOrFallback(session.patient?.name, 'Guest');
}

function getDoctorName(session: ReservationCalendarSession): string {
  return resolveLocalizedNameOrFallback(session.doctor?.name, '—');
}

function getServiceName(session: ReservationCalendarSession): string {
  return resolveLocalizedNameOrFallback(session.service?.name, 'Session');
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function parseSessionStart(session: ReservationCalendarSession): Date {
  if (session.start_time) {
    const parsed = dayjs(session.start_time);
    if (parsed.isValid()) return parsed.toDate();
  }
  if (session.date && session.time) {
    const parsed = dayjs(`${session.date} ${session.time}`);
    if (parsed.isValid()) return parsed.toDate();
  }
  if (session.date) {
    return dayjs(session.date).hour(9).minute(0).second(0).toDate();
  }
  return new Date();
}

function parseSessionEnd(session: ReservationCalendarSession, start: Date): Date {
  if (session.end_time) {
    const parsed = dayjs(session.end_time);
    if (parsed.isValid()) {
      if (!parsed.isAfter(dayjs(start))) {
        return dayjs(start).add(30, 'minute').toDate();
      }
      return parsed.toDate();
    }
  }
  return dayjs(start).add(1, 'hour').toDate();
}

function SessionDetailModal({
  session,
}: {
  session: ReservationCalendarSession;
}) {
  const { closeModal, openModal } = useModal();
  const [loadingReservation, setLoadingReservation] = useState(false);
  const isGuest = session.patient?.id == null;
  const patientName = getPatientName(session);
  const doctorName = getDoctorName(session);
  const serviceName = getServiceName(session);
  const status = STATUS_META[session.status] || STATUS_META.pending;
  const dateLabel = dayjs(session.date).format('dddd, MMM D, YYYY');
  const timeLabel = session.time || '—';
  const endLabel = session.end_time
    ? dayjs(session.end_time).format('HH:mm')
    : null;

  const openFullReservation = async () => {
    setLoadingReservation(true);
    try {
      const response = await client.reservations.findOne(session.reservation_id);
      const reservation =
        (response as any)?.data?.[0] ??
        (response as any)?.data ??
        response;

      if (!reservation?.id) {
        throw new Error('Reservation not found');
      }

      openModal({
        view: <ReservationViewModal reservation={reservation} />,
        customSize: '960px',
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load reservation details');
    } finally {
      setLoadingReservation(false);
    }
  };

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden bg-white">
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-gradient-to-br px-6 pb-6 pt-5',
          status.soft
        )}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
        <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-white/30 blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                status.chip
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.bar)} />
              {session.status_label || status.label}
            </span>
            {isGuest && (
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                Guest
              </span>
            )}
          </div>
          <Button
            onClick={closeModal}
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full border-white/60 bg-white/70 p-0 shadow-sm backdrop-blur"
          >
            <PiXBold className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative mt-5 flex items-end gap-4">
          <div className="rounded-2xl bg-white/90 px-4 py-3 text-center shadow-sm ring-1 ring-black/5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {dayjs(session.date).format('MMM')}
            </p>
            <p className="text-3xl font-bold leading-none text-gray-900">
              {dayjs(session.date).format('D')}
            </p>
            <p className="mt-1 text-[11px] font-medium text-gray-500">
              {dayjs(session.date).format('ddd')}
            </p>
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm text-gray-600">{dateLabel}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              {timeLabel}
              {endLabel && endLabel !== timeLabel ? (
                <span className="text-lg font-semibold text-gray-500">
                  {' '}
                  – {endLabel}
                </span>
              ) : null}
            </p>
            {session.time_period && (
              <p className="mt-1 text-xs font-medium capitalize text-gray-500">
                {session.time_period} session
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-white shadow-sm">
            {getInitials(patientName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {patientName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
              <PiPhoneBold className="h-3.5 w-3.5" />
              {session.patient?.mobile || 'No mobile'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Booking
            </p>
            <p className="text-sm font-bold text-gray-900">
              #{session.reservation_id}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile
            icon={<PiStethoscopeBold className="h-4 w-4" />}
            label="Doctor"
            value={doctorName}
          />
          <InfoTile
            icon={<PiPackageBold className="h-4 w-4" />}
            label="Service"
            value={serviceName}
          />
          <InfoTile
            icon={<PiCalendarCheckBold className="h-4 w-4" />}
            label="Booking status"
            value={session.reservation?.status_label || '—'}
          />
          <InfoTile
            icon={<PiSparkleBold className="h-4 w-4" />}
            label="Plan"
            value={
              [
                session.reservation?.type,
                session.reservation?.sessions_count != null
                  ? `${session.reservation.sessions_count} sessions`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || '—'
            }
          />
        </div>

        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-500">
          Session ID{' '}
          <span className="font-semibold text-gray-700">#{session.id}</span>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
        <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl">
          Close
        </Button>
        <Button
          onClick={openFullReservation}
          isLoading={loadingReservation}
          disabled={loadingReservation}
          className="flex-[1.4] rounded-xl"
        >
          View full reservation
          <PiArrowRightBold className="ms-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          {icon}
        </span>
        {label}
      </div>
      <p className="text-sm font-semibold leading-snug text-gray-900">{value}</p>
    </div>
  );
}

export default function ReservationsCalendar({ className }: { className?: string }) {
  const { openModal } = useModal();
  const [currentDate, setCurrentDate] = useState(() =>
    dayjs().startOf('month').toDate()
  );
  const [view, setView] = useState<View>('month');
  const [status, setStatus] = useState<SessionStatus | ''>('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState<
    Array<{ value: string; label: string; name: string }>
  >([{ value: '', label: 'All doctors', name: 'All doctors' }]);

  const year = dayjs(currentDate).year();
  const month = dayjs(currentDate).month() + 1;

  const { data: sessions = [], isLoading, isFetching, error, refetch } =
    useReservationsCalendarMonth({
      year,
      month,
      status: status || undefined,
      doctor_id: doctorId || undefined,
    });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors/list');
        const result = await response.json();
        const doctorsData = result.data || result || [];
        setDoctors([
          { value: '', label: 'All doctors', name: 'All doctors' },
          ...doctorsData.map((doctor: any) => {
            const name = resolveLocalizedNameOrFallback(
              doctor.name,
              `Doctor #${doctor.id}`
            );
            return {
              value: String(doctor.id),
              label: name,
              name,
            };
          }),
        ]);
      } catch {
        // keep default
      }
    };
    fetchDoctors();
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      failed: 0,
    };
    sessions.forEach((s) => {
      if (counts[s.status] != null) counts[s.status] += 1;
    });
    return counts;
  }, [sessions]);

  const events = useMemo<CalendarEvent[]>(
    () =>
      sessions.map((session) => {
        const start = parseSessionStart(session);
        const end = parseSessionEnd(session, start);
        const patient = getPatientName(session);
        const timeLabel = session.time || dayjs(start).format('HH:mm');

        return {
          id: session.id,
          title: `${timeLabel} ${patient}`,
          start,
          end,
          resource: session,
        };
      }),
    [sessions]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      openModal({
        view: <SessionDetailModal session={event.resource} />,
        customSize: '520px',
      });
    },
    [openModal]
  );

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setCurrentDate(start);
    setView('day');
  }, []);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const meta = STATUS_META[event.resource.status] || STATUS_META.pending;
    return {
      style: {
        backgroundColor: meta.eventBg,
        color: meta.eventText,
        borderLeft: `3px solid ${meta.eventText}`,
        borderRadius: '6px',
        border: 'none',
        boxShadow: 'none',
      },
    };
  }, []);

  const { views, formats } = useMemo(
    () => ({
      views: {
        month: true,
        week: true,
        day: true,
        agenda: true,
      },
      formats: {
        monthHeaderFormat: 'MMMM YYYY',
        dayFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
          loc?.format(date, 'ddd D', culture) ?? '',
        weekdayFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
          loc?.format(date, 'ddd', culture) ?? '',
        timeGutterFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
          loc?.format(date, 'HH:mm', culture) ?? '',
        eventTimeRangeFormat: () => '',
        agendaTimeFormat: (date: Date, culture?: string, loc?: typeof localizer) =>
          loc?.format(date, 'HH:mm', culture) ?? '',
      },
    }),
    []
  );

  const shiftMonth = (delta: number) => {
    setCurrentDate((prev) =>
      dayjs(prev).add(delta, 'month').startOf('month').toDate()
    );
    setView('month');
  };

  const goToday = () => {
    setCurrentDate(dayjs().toDate());
  };

  if (error) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-rose-100 bg-rose-50/50 p-10 text-center',
          className
        )}
      >
        <p className="text-lg font-semibold text-rose-700">Failed to load calendar</p>
        <p className="mt-2 text-sm text-rose-600/80">{error.message}</p>
        <Button className="mt-5 rounded-xl" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('@container space-y-5', className)}>
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="relative border-b border-gray-100 bg-gradient-to-br from-slate-50 via-white to-primary/[0.06] px-5 py-5 sm:px-6">
          <div className="absolute inset-y-0 end-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                <PiCalendarBlankBold className="h-3.5 w-3.5" />
                Sessions calendar
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {dayjs(currentDate).format('MMMM YYYY')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {sessions.length} session{sessions.length === 1 ? '' : 's'} this
                month
                {isLoading || isFetching ? ' · refreshing…' : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <Button
                  variant="text"
                  size="sm"
                  className="h-9 w-9 rounded-lg p-0"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                >
                  <PiCaretLeftBold className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg px-3"
                  onClick={goToday}
                >
                  Today
                </Button>
                <Button
                  variant="text"
                  size="sm"
                  className="h-9 w-9 rounded-lg p-0"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                >
                  <PiCaretRightBold className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-0.5 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                {(['month', 'week', 'day', 'agenda'] as View[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                      view === v
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setStatus((prev) => (prev === key ? '' : (key as SessionStatus)))
                }
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  status === key
                    ? meta.chip
                    : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', meta.bar)} />
                {meta.label}
                <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-gray-700">
                  {statusCounts[key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-44">
              <SelectBox
                options={SESSION_STATUS_OPTIONS}
                value={status}
                onChange={(value) =>
                  setStatus(toSelectValue(value) as SessionStatus | '')
                }
                placeholder="Status"
                getOptionValue={(option) => option.value}
                displayValue={(selected) =>
                  SESSION_STATUS_OPTIONS.find(
                    (o) => o.value === toSelectValue(selected)
                  )?.name ?? 'All statuses'
                }
              />
            </div>
            <div className="w-52">
              <SelectBox
                options={doctors}
                value={doctorId}
                onChange={(value) => setDoctorId(toSelectValue(value))}
                placeholder="Doctor"
                getOptionValue={(option) => option.value}
                displayValue={(selected) =>
                  doctors.find((o) => o.value === toSelectValue(selected))
                    ?.name ?? 'All doctors'
                }
              />
            </div>
          </div>
        </div>

        <div className="relative p-3 sm:p-4">
          {isFetching && sessions.length > 0 && (
            <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/10">
              <div className="h-full w-1/3 animate-pulse bg-primary" />
            </div>
          )}

          {isLoading && sessions.length === 0 ? (
            <div className="flex min-h-[640px] items-center justify-center rounded-2xl bg-gray-50/50">
              <div className="text-center">
                <Loader size="xl" />
                <p className="mt-3 text-sm text-gray-500">Loading month sessions…</p>
              </div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              date={currentDate}
              view={view}
              onView={setView}
              onNavigate={handleNavigate}
              views={views}
              formats={formats}
              startAccessor="start"
              endAccessor="end"
              popup
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventPropGetter}
              toolbar={false}
              className={cn('h-[680px] md:h-[820px]', calendarClassName)}
              components={{
                event: ({ event }: { event: CalendarEvent }) => {
                  const patient = getPatientName(event.resource);
                  const time =
                    event.resource.time || dayjs(event.start).format('HH:mm');
                  return (
                    <div
                      className="flex items-center gap-1 truncate"
                      title={`${time} · ${patient} · ${getServiceName(event.resource)}`}
                    >
                      <span className="shrink-0 font-bold opacity-80">{time}</span>
                      <span className="truncate font-medium">{patient}</span>
                    </div>
                  );
                },
              }}
            />
          )}

          {!isLoading && sessions.length === 0 && (
            <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <PiCalendarBlankBold className="h-7 w-7 text-gray-400" />
              </div>
              <Title as="h5" className="mt-4 text-base font-semibold text-gray-900">
                No sessions this month
              </Title>
              <Text className="mt-1 text-sm text-gray-500">
                Try another month or clear status / doctor filters
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
