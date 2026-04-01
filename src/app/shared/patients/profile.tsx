'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import EyeIcon from '@/components/icons/eye';
import { useMemo, useState } from 'react';
import {
  PiCalendarBold,
  PiPhoneBold,
  PiEnvelopeBold,
  PiIdentificationBadgeBold,
  PiDropBold,
  PiGlobeHemisphereEastBold,
  PiMapPinBold,
  PiMapTrifoldBold,
  PiCurrencyCircleDollarBold,
  PiCheckCircleBold,
  PiClockBold,
} from 'react-icons/pi';

type Attachment = {
  id?: number | string;
  url: string;
  name?: string;
  mime?: string;
};

type Reservation = {
  id: number;
  status: string;
  status_label: string;
  type: string;
  paid: number;
  sessions_count: number;
  total_amount: string;
  notes?: string | null;
  pain_location?: string | null;
  created_at: string;
  sessions?: Array<{
    id: number;
    date: string;
    time: string;
    start_time: string;
    end_time: string;
    time_period: string;
    status: string;
    status_label: string;
  }>;
  attachments?: Attachment[];
  review?: any;
};

export default function PatientProfileView({ patient }: { patient: any }) {
  const name =
    patient?.name?.en ??
    patient?.name?.ar ??
    patient?.name ??
    '—';
  const isFemale = patient?.gender === 'female';
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'attachments'>('overview');

  const kpis = useMemo(() => {
    const reservations = Array.isArray(patient?.reservations) ? patient.reservations : [];
    const sessions = reservations.flatMap((r: any) => r.sessions || []);
    const completed = sessions.filter((s: any) => (s.status || '').toLowerCase() === 'completed').length;
    return {
      reservationsCount: reservations.length,
      sessionsCount: sessions.length,
      completedSessions: completed,
    };
  }, [patient]);

  function isImage(mimeOrUrl?: string) {
    if (!mimeOrUrl) return false;
    const lower = mimeOrUrl.toLowerCase();
    return (
      lower.includes('image/') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.gif')
    );
  }

  function isPdf(mimeOrUrl?: string) {
    if (!mimeOrUrl) return false;
    const lower = mimeOrUrl.toLowerCase();
    return lower.includes('application/pdf') || lower.endsWith('.pdf');
  }

  const headerBg =
    'bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 text-white shadow-sm ${headerBg}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-semibold ring-1 ring-white/25">
            {String(name).slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text className="text-2xl font-semibold leading-none">{name}</Text>
              {patient?.gender ? (
                <Badge
                  color={isFemale ? 'pink' : 'blue'}
                  rounded="md"
                  className="bg-white/20 text-white"
                >
                  {patient.gender}
                </Badge>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
              <div className="inline-flex items-center gap-1.5">
                <PiPhoneBold className="h-4 w-4" />
                <span>{patient?.mobile ?? '—'}</span>
              </div>
              <span className="opacity-60">•</span>
              <div className="inline-flex items-center gap-1.5">
                <PiEnvelopeBold className="h-4 w-4" />
                <span>{patient?.email ?? '—'}</span>
              </div>
              <span className="opacity-60">•</span>
              <div className="inline-flex items-center gap-1.5">
                <PiCalendarBold className="h-4 w-4" />
                <span>DOB {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <KpiCard label="Reservations" value={kpis.reservationsCount} />
            <KpiCard label="Sessions" value={kpis.sessionsCount} />
            <KpiCard label="Completed" value={kpis.completedSessions} />
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-lg bg-white/10 p-1 text-sm">
          <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabBtn>
          <TabBtn active={activeTab === 'reservations'} onClick={() => setActiveTab('reservations')}>Reservations</TabBtn>
          <TabBtn active={activeTab === 'attachments'} onClick={() => setActiveTab('attachments')}>Attachments</TabBtn>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold">Basic information</Text>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoIconRow icon={<PiIdentificationBadgeBold className="h-4 w-4" />} label="National ID" value={patient?.national_id ?? '—'} />
                <InfoIconRow icon={<PiCalendarBold className="h-4 w-4" />} label="Date of birth" value={patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '—'} />
                <InfoIconRow icon={<PiDropBold className="h-4 w-4" />} label="Blood group" value={patient?.blood_group ?? '—'} />
                <InfoIconRow icon={<PiGlobeHemisphereEastBold className="h-4 w-4" />} label="Languages" value={patient?.languages_spoken ?? '—'} />
                <InfoIconRow icon={<PiIdentificationBadgeBold className="h-4 w-4" />} label="Insurance ID" value={patient?.insurance_id ?? '—'} />
                <InfoIconRow icon={<PiIdentificationBadgeBold className="h-4 w-4" />} label="Insurance company" value={patient?.insurance_company ?? '—'} />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold">Location</Text>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoIconRow icon={<PiGlobeHemisphereEastBold className="h-4 w-4" />} label="Nationality" value={patient?.nationality?.name?.en ?? '—'} />
                <InfoIconRow icon={<PiMapTrifoldBold className="h-4 w-4" />} label="Country" value={patient?.country?.name?.en ?? '—'} />
                <InfoIconRow icon={<PiMapPinBold className="h-4 w-4" />} label="City" value={patient?.city?.name?.en ?? '—'} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text className="mb-4 text-base font-semibold">Meta</Text>
              <div className="grid grid-cols-1 gap-3">
                <InfoIconRow icon={<PiCalendarBold className="h-4 w-4" />} label="Created at" value={patient?.created_at ?? '—'} />
                <InfoIconRow icon={<PiCalendarBold className="h-4 w-4" />} label="Updated at" value={patient?.updated_at ?? '—'} />
                <InfoIconRow icon={<PiIdentificationBadgeBold className="h-4 w-4" />} label="Nickname" value={patient?.nickname ?? '—'} />
                <InfoIconRow icon={<PiIdentificationBadgeBold className="h-4 w-4" />} label="Code" value={patient?.code ?? '—'} />
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'reservations' && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Text className="text-base font-semibold">Reservations</Text>
            <Badge rounded="md" className="bg-gray-100">{patient?.reservations?.length ?? 0}</Badge>
          </div>
          <div className="space-y-4">
            {(patient?.reservations ?? []).map((r: Reservation) => (
              <div key={r.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Text className="font-medium">Reservation #{r.id}</Text>
                  <StatusBadge status={r.status} label={r.status_label} />
                  <div className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <PiCalendarBold className="h-3.5 w-3.5" />
                    Created {r.created_at}
                  </div>
                  <div className="ml-auto inline-flex items-center gap-1 text-sm font-semibold">
                    <PiCurrencyCircleDollarBold className="h-4 w-4" />
                    {r.total_amount} SAR
                  </div>
                </div>

                {r.notes ? (
                  <div className="mt-2 text-sm text-gray-700">
                    {r.notes}
                  </div>
                ) : null}

                {/* Sessions timeline/table hybrid */}
                {Array.isArray(r.sessions) && r.sessions.length > 0 ? (
                  <div className="mt-3">
                    <div className="grid grid-cols-1 gap-2">
                      {r.sessions.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            {(s.status || '').toLowerCase() === 'completed' ? (
                              <PiCheckCircleBold className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <PiClockBold className="h-4 w-4 text-amber-600" />
                            )}
                          </div>
                          <div className="grid flex-1 grid-cols-5 items-center gap-2 text-sm">
                            <div className="font-medium">#{s.id}</div>
                            <div>{new Date(s.date).toLocaleDateString()}</div>
                            <div className="text-gray-700">{new Date(s.time).toLocaleString()}</div>
                            <div className="uppercase text-gray-600">{s.time_period}</div>
                            <div className="flex items-center">
                              <Badge rounded="sm">{s.status_label}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'attachments' && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <Text className="mb-4 text-base font-semibold">All attachments</Text>
          <AttachmentsGrid reservations={patient?.reservations ?? []} isImage={isImage} isPdf={isPdf} />
        </section>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="ml-3 text-sm text-gray-900">{value}</div>
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
      <div className="text-[11px] uppercase tracking-wide opacity-80">{label}</div>
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
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-white/85 hover:text-white'
      } transition`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const key = (status || '').toLowerCase();
  const color =
    key === '3' || key === 'confirmed'
      ? 'success'
      : key === '1' || key === 'reviewing'
      ? 'warning'
      : key === 'pending'
      ? 'orange'
      : 'gray';
  return <Badge color={color as any} rounded="md">{label}</Badge>;
}

function AttachmentsGrid({
  reservations,
  isImage,
  isPdf,
}: {
  reservations: Reservation[];
  isImage: (u?: string) => boolean;
  isPdf: (u?: string) => boolean;
}) {
  const all = reservations.flatMap((r) =>
    (r.attachments || []).map((a) => ({ reservationId: r.id, ...a }))
  ) as Array<{ reservationId: number; id?: string | number; url: string; name?: string; mime?: string }>;

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
        const url = att.url;
        const img = isImage(att.mime ?? url);
        const pdf = isPdf(att.mime ?? url);
        return (
          <div key={key} className="group relative overflow-hidden rounded-lg border">
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
                <div className="opacity-90">Reservation #{att.reservationId}</div>
                {att.name ? <div className="font-medium">{att.name}</div> : null}
              </div>
              <Link href={url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                <ActionIcon size="sm" variant="solid" className="bg-white text-gray-800 hover:bg-white/90">
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

