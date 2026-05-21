'use client';

import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import EyeIcon from '@/components/icons/eye';
import Spinner from '@/components/ui/spinner';
import { useMemo, useState } from 'react';
import type { DoctorHistoryFilters } from '@/framework/doctors';
import {
  PiCalendarBold,
  PiPhoneBold,
  PiEnvelopeBold,
  PiIdentificationBadgeBold,
  PiDropBold,
  PiGlobeHemisphereEastBold,
  PiCurrencyCircleDollarBold,
  PiCheckCircleBold,
  PiClockBold,
  PiStethoscopeBold,
  PiBriefcaseBold,
  PiStarBold,
  PiMapPinBold,
} from 'react-icons/pi';
import { resolveLocalizedNameOrFallback } from '@/utils/resolve-localized-name';

type DoctorAttachment = {
  id?: string;
  original?: string;
  thumbnail?: string;
  name?: string;
};

type HistorySession = {
  id: number;
  date: string;
  time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  time_period?: string | null;
  status: string;
  status_label: string;
};

type HistoryItem = {
  reservation_id: number;
  status: number;
  status_label: string;
  type: string;
  paid: boolean;
  sessions_count: number;
  session_price?: number | null;
  sub_total?: string | number;
  total_amount?: string | number;
  doctor_attachments?: DoctorAttachment[];
  patient?: {
    id: number;
    name?: { ar?: string; en?: string };
  } | null;
  sessions?: HistorySession[];
  created_at?: string;
  updated_at?: string;
};

type DoctorProfileViewProps = {
  doctor: any;
  historyFilters?: DoctorHistoryFilters;
  onHistoryFiltersChange?: (filters: DoctorHistoryFilters) => void;
  isHistoryLoading?: boolean;
};

export default function DoctorProfileView({
  doctor,
  historyFilters = {},
  onHistoryFiltersChange,
  isHistoryLoading = false,
}: DoctorProfileViewProps) {
  const name =
    doctor?.name?.en ?? doctor?.name?.ar ?? doctor?.name ?? '—';
  const isFemale = doctor?.gender === 'female';
  const [activeTab, setActiveTab] = useState<
    'overview' | 'history' | 'attachments'
  >('overview');

  const history: HistoryItem[] = Array.isArray(doctor?.history)
    ? doctor.history
    : [];

  const kpis = useMemo(() => {
    const sessions = history.flatMap((r) => r.sessions || []);
    const completed = sessions.filter(
      (s) => (s.status || '').toLowerCase() === 'completed'
    ).length;
    return {
      bookingsCount: history.length,
      sessionsCount: sessions.length,
      completedSessions: completed,
    };
  }, [history]);

  const mobile = [doctor?.country_code, doctor?.mobile_number]
    .filter(Boolean)
    .join(' ')
    .trim();

  function isImage(url?: string) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.gif')
    );
  }

  function isPdf(url?: string) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.pdf');
  }

  const headerBg =
    'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600';

  const rangeStart = historyFilters.history_date_from
    ? dayjs(historyFilters.history_date_from).toDate()
    : null;
  const rangeEnd = historyFilters.history_date_to
    ? dayjs(historyFilters.history_date_to).toDate()
    : null;

  function handleDateRangeChange(dates: [Date | null, Date | null]) {
    const [start, end] = dates;
    onHistoryFiltersChange?.({
      history_date_from: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
      history_date_to: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
    });
  }

  function clearDateRange() {
    onHistoryFiltersChange?.({});
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 text-white shadow-sm ${headerBg}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          {doctor?.image ? (
            <Image
              src={doctor.image}
              alt={String(name)}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/25"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-semibold ring-1 ring-white/25">
              {String(name).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text className="text-2xl font-semibold leading-none">{name}</Text>
              {doctor?.doctor_role ? (
                <Badge
                  rounded="md"
                  className="bg-white/20 capitalize text-white"
                >
                  {doctor.doctor_role}
                </Badge>
              ) : null}
              {doctor?.gender ? (
                <Badge
                  color={isFemale ? 'pink' : 'blue'}
                  rounded="md"
                  className="bg-white/20 text-white"
                >
                  {doctor.gender}
                </Badge>
              ) : null}
              {doctor?.status === false ? (
                <Badge rounded="md" className="bg-white/20 text-white">
                  Inactive
                </Badge>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
              <div className="inline-flex items-center gap-1.5">
                <PiPhoneBold className="h-4 w-4" />
                <span>{mobile || '—'}</span>
              </div>
              <span className="opacity-60">•</span>
              <div className="inline-flex items-center gap-1.5">
                <PiEnvelopeBold className="h-4 w-4" />
                <span>{doctor?.email ?? '—'}</span>
              </div>
              {doctor?.city ? (
                <>
                  <span className="opacity-60">•</span>
                  <div className="inline-flex items-center gap-1.5">
                    <PiMapPinBold className="h-4 w-4" />
                    <span>{resolveLocalizedNameOrFallback(doctor.city.name)}</span>
                  </div>
                </>
              ) : null}
              {doctor?.rate != null ? (
                <>
                  <span className="opacity-60">•</span>
                  <div className="inline-flex items-center gap-1.5">
                    <PiStarBold className="h-4 w-4" />
                    <span>{doctor.rate}</span>
                  </div>
                </>
              ) : null}
              {doctor?.session_price != null ? (
                <>
                  <span className="opacity-60">•</span>
                  <div className="inline-flex items-center gap-1.5">
                    <PiCurrencyCircleDollarBold className="h-4 w-4" />
                    <span>{doctor.session_price} SAR / session</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <KpiCard label="Bookings" value={kpis.bookingsCount} />
            <KpiCard label="Sessions" value={kpis.sessionsCount} />
            <KpiCard label="Completed" value={kpis.completedSessions} />
          </div>
        </div>
        <div className="mt-6 flex gap-1 rounded-lg bg-white/10 p-1 text-sm">
          <TabBtn
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabBtn>
          <TabBtn
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            Booking history
          </TabBtn>
          <TabBtn
            active={activeTab === 'attachments'}
            onClick={() => setActiveTab('attachments')}
          >
            Attachments
          </TabBtn>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold">
                Basic information
              </Text>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoIconRow
                  icon={<PiIdentificationBadgeBold className="h-4 w-4" />}
                  label="National ID"
                  value={doctor?.national_id ?? '—'}
                />
                <InfoIconRow
                  icon={<PiCalendarBold className="h-4 w-4" />}
                  label="Date of birth"
                  value={doctor?.date_of_birth ?? '—'}
                />
                <InfoIconRow
                  icon={<PiDropBold className="h-4 w-4" />}
                  label="Blood group"
                  value={doctor?.blood_group ?? '—'}
                />
                <InfoIconRow
                  icon={<PiGlobeHemisphereEastBold className="h-4 w-4" />}
                  label="Languages"
                  value={doctor?.languages_spoken ?? '—'}
                />
                <InfoIconRow
                  icon={<PiGlobeHemisphereEastBold className="h-4 w-4" />}
                  label="Nationality"
                  value={doctor?.nationality?.name?.en ?? '—'}
                />
                <InfoIconRow
                  icon={<PiBriefcaseBold className="h-4 w-4" />}
                  label="Department"
                  value={doctor?.department ?? '—'}
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold">
                Professional details
              </Text>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoIconRow
                  icon={<PiStethoscopeBold className="h-4 w-4" />}
                  label="Degree"
                  value={doctor?.degree ?? '—'}
                />
                <InfoIconRow
                  icon={<PiStethoscopeBold className="h-4 w-4" />}
                  label="Specialized in"
                  value={doctor?.specialized_in ?? '—'}
                />
                <InfoIconRow
                  icon={<PiStethoscopeBold className="h-4 w-4" />}
                  label="Classification"
                  value={doctor?.classification ?? '—'}
                />
                <InfoIconRow
                  icon={<PiBriefcaseBold className="h-4 w-4" />}
                  label="Experience"
                  value={
                    doctor?.experience != null
                      ? `${doctor.experience} years`
                      : '—'
                  }
                />
                <InfoIconRow
                  icon={<PiBriefcaseBold className="h-4 w-4" />}
                  label="Medical school"
                  value={doctor?.medical_school ?? '—'}
                />
                <InfoIconRow
                  icon={<PiIdentificationBadgeBold className="h-4 w-4" />}
                  label="Registration no."
                  value={doctor?.medical_registration_number ?? '—'}
                />
                <InfoIconRow
                  icon={<PiCalendarBold className="h-4 w-4" />}
                  label="License expiry"
                  value={doctor?.medical_license_expiry ?? '—'}
                />
                <InfoIconRow
                  icon={<PiBriefcaseBold className="h-4 w-4" />}
                  label="Clinic"
                  value={doctor?.clinic_name ?? '—'}
                />
                <InfoIconRow
                  icon={<PiClockBold className="h-4 w-4" />}
                  label="Working hours"
                  value={
                    doctor?.from && doctor?.to
                      ? `${doctor.from} – ${doctor.to}`
                      : '—'
                  }
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold">Meta</Text>
              <div className="grid grid-cols-1 gap-3">
                <InfoIconRow
                  icon={<PiCalendarBold className="h-4 w-4" />}
                  label="Created at"
                  value={doctor?.created_at ?? '—'}
                />
                <InfoIconRow
                  icon={<PiCalendarBold className="h-4 w-4" />}
                  label="Updated at"
                  value={doctor?.updated_at ?? '—'}
                />
                <InfoIconRow
                  icon={<PiBriefcaseBold className="h-4 w-4" />}
                  label="Specialist"
                  value={doctor?.specialist ?? '—'}
                />
                <InfoIconRow
                  icon={<PiBriefcaseBold className="h-4 w-4" />}
                  label="Sub-specialist"
                  value={doctor?.sub_specialist ?? '—'}
                />
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'history' && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Text className="text-base font-semibold">Booking history</Text>
              <Badge rounded="md" className="bg-gray-100">
                {history.length}
              </Badge>
              {isHistoryLoading ? (
                <Spinner size="sm" className="ms-2" />
              ) : null}
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[240px]">
                <DatePicker
                  selectsRange
                  startDate={rangeStart}
                  endDate={rangeEnd}
                  onChange={(dates) =>
                    handleDateRangeChange(dates as [Date | null, Date | null])
                  }
                  placeholderText="Filter by session date range"
                  dateFormat="dd MMM yyyy"
                  inputProps={{ size: 'sm', label: 'Session dates' }}
                />
              </div>
              {(historyFilters.history_date_from ||
                historyFilters.history_date_to) && (
                <Button size="sm" variant="outline" onClick={clearDateRange}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
              No bookings found for this doctor.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <HistoryCard key={item.reservation_id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'attachments' && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <Text className="mb-4 text-base font-semibold">
            Doctor attachments
          </Text>
          <AttachmentsGrid
            history={history}
            isImage={isImage}
            isPdf={isPdf}
          />
        </section>
      )}
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const patientName =
    item.patient?.name?.en ?? item.patient?.name?.ar ?? null;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Text className="font-medium">
          Reservation #{item.reservation_id}
        </Text>
        <StatusBadge status={item.status} label={item.status_label} />
        <Badge variant="outline" rounded="md" className="capitalize">
          {item.type}
        </Badge>
        {item.paid ? (
          <Badge color="success" rounded="md">
            Paid
          </Badge>
        ) : (
          <Badge color="warning" rounded="md">
            Unpaid
          </Badge>
        )}
        <div className="inline-flex items-center gap-1 text-xs text-gray-500">
          <PiCalendarBold className="h-3.5 w-3.5" />
          Created {item.created_at ?? '—'}
        </div>
        <div className="ml-auto inline-flex items-center gap-1 text-sm font-semibold">
          <PiCurrencyCircleDollarBold className="h-4 w-4" />
          {item.total_amount ?? '—'} SAR
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
        {patientName ? (
          <span>
            Patient:{' '}
            {item.patient?.id ? (
              <Link
                href={`clients/${item.patient.id}`}
                className="font-medium text-primary hover:underline"
              >
                {patientName}
              </Link>
            ) : (
              patientName
            )}
          </span>
        ) : (
          <span className="italic text-gray-500">Guest patient</span>
        )}
        <span>Sessions: {item.sessions_count}</span>
        {item.session_price != null ? (
          <span>Unit price: {item.session_price} SAR</span>
        ) : null}
        {item.sub_total != null ? <span>Subtotal: {item.sub_total}</span> : null}
      </div>

      {Array.isArray(item.sessions) && item.sessions.length > 0 ? (
        <div className="mt-3 space-y-2">
          {item.sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                {(s.status || '').toLowerCase() === 'completed' ? (
                  <PiCheckCircleBold className="h-4 w-4 text-emerald-600" />
                ) : (
                  <PiClockBold className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="font-medium">#{s.id}</div>
                <div>
                  {s.date ? new Date(s.date).toLocaleDateString() : '—'}
                </div>
                <div className="text-gray-700">
                  {s.time
                    ? s.time
                    : s.start_time
                      ? new Date(s.start_time).toLocaleTimeString()
                      : '—'}
                </div>
                <div className="flex items-center">
                  <Badge rounded="sm">{s.status_label}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {Array.isArray(item.doctor_attachments) &&
      item.doctor_attachments.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.doctor_attachments.map((att, idx) => {
            const url = att.original ?? '';
            const key = att.id ?? `${item.reservation_id}-${idx}`;
            if (!url) return null;
            return (
              <Link
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                <EyeIcon className="h-3.5 w-3.5" />
                {att.name ?? 'Attachment'}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function InfoIconRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="inline-flex items-center gap-2">
        {icon}
        <div className="text-xs font-medium text-gray-600">{label}</div>
      </div>
      <div className="ml-3 text-sm text-gray-900">{value}</div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/15 px-3 py-2 text-white ring-1 ring-white/20">
      <div className="text-[11px] uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="text-lg font-semibold leading-tight">{value}</div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-white/85 hover:text-white'
      } transition`}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: number | string;
  label: string;
}) {
  const key = String(status).toLowerCase();
  const color =
    key === '3' || key === 'confirmed' || key === '5' || key === 'completed'
      ? 'success'
      : key === '1' || key === '2' || key === 'reviewing' || key === 'waitconfirm'
        ? 'warning'
        : key === '4' || key === '6' || key === 'canceled' || key === 'failed'
          ? 'danger'
          : 'gray';
  return (
    <Badge color={color as any} rounded="md">
      {label}
    </Badge>
  );
}

function AttachmentsGrid({
  history,
  isImage,
  isPdf,
}: {
  history: HistoryItem[];
  isImage: (u?: string) => boolean;
  isPdf: (u?: string) => boolean;
}) {
  const all = history.flatMap((r) =>
    (r.doctor_attachments || []).map((a) => ({
      reservationId: r.reservation_id,
      ...a,
    }))
  );

  if (all.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-600">
        No attachments found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {all.map((att, idx) => {
        const key = att.id ?? `${att.reservationId}-${idx}`;
        const url = att.original ?? '';
        if (!url) return null;
        const img = isImage(url);
        const pdf = isPdf(url);
        return (
          <div
            key={key}
            className="group relative overflow-hidden rounded-lg border"
          >
            {img ? (
              <Image
                src={url}
                alt={att.name ?? 'attachment'}
                width={400}
                height={260}
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-gray-50 text-sm text-gray-600">
                {pdf ? 'PDF Document' : (att.name ?? 'File')}
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="text-xs text-white">
                <div className="opacity-90">
                  Reservation #{att.reservationId}
                </div>
                {att.name ? <div className="font-medium">{att.name}</div> : null}
              </div>
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <ActionIcon
                  size="sm"
                  variant="solid"
                  className="bg-white text-gray-800 hover:bg-white/90"
                >
                  <EyeIcon className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
