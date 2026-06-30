'use client';

import { useEffect, useState } from 'react';
import {
  PiXBold,
  PiUser,
  PiCalendarCheck,
  PiCurrencyDollar,
  PiMapPin,
  PiNotePencil,
  PiClock,
} from 'react-icons/pi';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import cn from '@/utils/class-names';
import ConfirmCashPaymentModal from './confirm-cash-payment-modal';

import {
  getReservationPatientName,
  resolveLocalizedNameOrFallback,
} from '@/utils/resolve-localized-name';
import {
  canConfirmCashPayment,
  getPaymentStatusBadgeClasses,
  getPaymentStatusBadgeLabel,
  getPaymentStatusColorClass,
  getPaymentStatusLabel,
  isCashPayment,
} from '@/utils/reservation-payment';

function formatSessionLabel(session: {
  start_time?: string;
  end_time?: string;
  date?: string;
  time_period?: string;
  status_label?: string;
}) {
  let start = '—';
  let end = '—';
  let day = '—';

  try {
    if (session?.start_time) {
      start = new Date(session.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (session?.end_time) {
      end = new Date(session.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (session?.date) {
      day = new Date(session.date).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    // keep defaults
  }

  const timePeriod = session?.time_period ?? '—';
  return { day, timePeriod, start, end, status: session?.status_label };
}

function getStatusColor(status: string | number | undefined) {
  const s = String(status ?? '');
  if (s === '1') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (s === '2') return 'bg-blue-50 text-blue-800 border-blue-200';
  if (s === '3') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === '4') return 'bg-red-50 text-red-800 border-red-200';
  if (s === '5') return 'bg-violet-50 text-violet-800 border-violet-200';
  if (s === '6') return 'bg-gray-50 text-gray-800 border-gray-200';
  if (s === '8') return 'bg-rose-50 text-rose-800 border-rose-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
}

function getSourceColor(source: string | null | undefined) {
  if (source === 'Application') return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  if (source === 'Website') return 'bg-sky-50 text-sky-800 border-sky-200';
  if (source === 'Dashboard') return 'bg-teal-50 text-teal-800 border-teal-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
}

function CustomerTierBadge({ tier }: { tier?: string | null }) {
  const value = (tier || '').trim();
  if (!value) return <span className="text-gray-500">—</span>;

  let colorClasses =
    'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200';
  let symbol = '🙂';
  if (value === 'فضي') {
    colorClasses =
      'bg-gradient-to-r from-slate-50 to-zinc-100 text-slate-800 border-slate-200';
    symbol = '🥈';
  } else if (value === 'ذهبي') {
    colorClasses =
      'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-900 border-amber-200';
    symbol = '🥇';
  } else if (value === 'VIP') {
    colorClasses =
      'bg-gradient-to-r from-fuchsia-50 to-purple-100 text-purple-900 border-purple-200';
    symbol = '👑';
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        colorClasses
      )}
    >
      <span aria-hidden>{symbol}</span>
      {value}
    </Badge>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <Title as="h5" className="text-sm font-semibold text-gray-900">
          {title}
        </Title>
      </div>
      {children}
    </section>
  );
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  const display =
    value === null || value === undefined || value === '' ? '—' : value;

  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-gray-900">{display}</div>
    </div>
  );
}

function useReservationDetails(reservation: any) {
  const patientName = getReservationPatientName(reservation);

  const serviceName = resolveLocalizedNameOrFallback(reservation?.service?.name);
  const doctorName = resolveLocalizedNameOrFallback(reservation?.doctor?.name);

  const cityName =
    resolveLocalizedNameOrFallback(reservation?.address?.city) !== '—'
      ? resolveLocalizedNameOrFallback(reservation?.address?.city)
      : resolveLocalizedNameOrFallback(reservation?.patient?.city?.name);

  const stateName =
    resolveLocalizedNameOrFallback(reservation?.address?.state) !== '—'
      ? resolveLocalizedNameOrFallback(reservation?.address?.state)
      : resolveLocalizedNameOrFallback(
          reservation?.patient?.state?.name ?? reservation?.patient?.state
        );

  const countryName = resolveLocalizedNameOrFallback(
    reservation?.address?.country ?? reservation?.patient?.country?.name
  );

  const addressParts = [
    reservation?.address?.street,
    reservation?.address?.building,
    reservation?.address?.apartment,
  ].filter(Boolean);

  const addressText =
    addressParts.length > 0
      ? addressParts.join(', ')
      : reservation?.address?.link ?? '—';

  return {
    patientName,
    serviceName,
    doctorName,
    cityName,
    stateName,
    countryName,
    addressText,
  };
}

export function ReservationViewContent({
  reservation,
  canEdit = false,
  onReservationUpdate,
}: {
  reservation: any;
  canEdit?: boolean;
  onReservationUpdate?: (updated: any) => void;
}) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const {
    patientName,
    serviceName,
    doctorName,
    cityName,
    stateName,
    countryName,
    addressText,
  } = useReservationDetails(reservation);

  const paidLabel = getPaymentStatusLabel(reservation);
  const paymentStatusBadge = getPaymentStatusBadgeLabel(reservation?.payment_status);
  const showConfirmCash = canEdit && canConfirmCashPayment(reservation);

  return (
    <div className="space-y-5">
      {/* Hero summary */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-primary/5 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Reservation
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              #{reservation?.id ?? '—'}
            </p>
            <p className="mt-1 text-sm text-gray-600">{patientName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold',
                getStatusColor(reservation?.status)
              )}
            >
              {reservation?.status_label ?? '—'}
            </span>
            {reservation?.reservation_source && (
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  getSourceColor(reservation.reservation_source)
                )}
              >
                {reservation.reservation_source}
              </span>
            )}
            {paymentStatusBadge && (
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  getPaymentStatusBadgeClasses(reservation?.payment_status)
                )}
              >
                {paymentStatusBadge}
              </span>
            )}
            {isCashPayment(reservation?.payment_method) && (
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
                Cash
              </span>
            )}
            <CustomerTierBadge tier={reservation?.customer_tier} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-bold text-gray-900">
              {reservation?.total_amount
                ? `${reservation.total_amount} SAR`
                : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-base font-bold text-gray-900">
              {reservation?.remaining_payment != null
                ? `${reservation.remaining_payment} SAR`
                : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Sessions</p>
            <p className="text-base font-bold text-gray-900">
              {reservation?.sessions_count ?? '—'}
            </p>
          </div>
          <div className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Payment</p>
            <p
              className={cn(
                'text-base font-bold',
                getPaymentStatusColorClass(reservation)
              )}
            >
              {paidLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Patient Information" icon={PiUser}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Full Name" value={patientName} className="sm:col-span-2" />
            <DetailItem
              label="Mobile"
              value={
                reservation?.patient?.mobile ?? reservation?.guest_info?.mobile
              }
            />
            <DetailItem
              label="Email"
              value={
                reservation?.patient?.email ?? reservation?.guest_info?.email
              }
            />
            <DetailItem
              label="National ID"
              value={reservation?.patient?.national_id}
            />
            <DetailItem label="Gender" value={reservation?.patient?.gender} />
          </div>
        </Section>

        <Section title="Appointment" icon={PiCalendarCheck}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Doctor" value={doctorName} />
            <DetailItem label="Service" value={serviceName} />
            <DetailItem label="Seen" value={reservation?.seen ? 'Yes' : 'No'} />
            <DetailItem label="CC" value={reservation?.cc} />
            <DetailItem
              label="Source Campaign"
              value={reservation?.source_campaign}
            />
            <DetailItem
              label="Pain Location"
              value={reservation?.pain_location}
            />
          </div>
        </Section>

        <Section title="Location" icon={PiMapPin}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="City" value={cityName} />
            <DetailItem label="State" value={stateName} />
            <DetailItem label="Country" value={countryName} />
            <DetailItem label="Address" value={addressText} className="sm:col-span-2" />
            {reservation?.address?.link && (
              <div className="sm:col-span-2">
                <a
                  href={reservation.address.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Open in Maps
                </a>
              </div>
            )}
          </div>
        </Section>

        <Section title="Payment" icon={PiCurrencyDollar}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem
              label="Payment Method"
              value={
                isCashPayment(reservation?.payment_method)
                  ? 'Cash'
                  : reservation?.payment_method
              }
            />
            <DetailItem
              label="Payment Status"
              value={paymentStatusBadge ?? paidLabel}
            />
            {reservation?.payment_discount != null &&
              Number(reservation.payment_discount) > 0 && (
                <DetailItem
                  label="Payment Discount"
                  value={`${reservation.payment_discount}%`}
                />
              )}
            {reservation?.provider_fee != null &&
              Number(reservation.provider_fee) > 0 && (
                <DetailItem
                  label="Provider Fee"
                  value={`${reservation.provider_fee} SAR`}
                />
              )}
            <DetailItem
              label="Sub Total"
              value={
                reservation?.sub_total ? `${reservation.sub_total} SAR` : undefined
              }
            />
            {Number(reservation?.fees) > 0 && (
              <DetailItem
                label="Fees (VAT)"
                value={`${reservation.fees} SAR`}
              />
            )}
            <DetailItem
              label="Total Amount"
              value={
                reservation?.total_amount
                  ? `${reservation.total_amount} SAR`
                  : undefined
              }
            />
            <DetailItem
              label="Remaining"
              value={
                reservation?.remaining_payment != null
                  ? `${reservation.remaining_payment} SAR`
                  : undefined
              }
            />
          </div>
        </Section>
      </div>

      {(reservation?.notes || reservation?.dates?.length > 0) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reservation?.notes && (
            <Section title="Notes" icon={PiNotePencil} className="lg:col-span-1">
              <Text as="p" className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {reservation.notes}
              </Text>
            </Section>
          )}

          {reservation?.dates?.length > 0 && (
            <Section
              title={`Sessions (${reservation.dates.length})`}
              icon={PiClock}
              className={reservation?.notes ? '' : 'lg:col-span-2'}
            >
              <ul className="space-y-3">
                {reservation.dates.map((session: any, index: number) => {
                  const { day, timePeriod, start, end, status } =
                    formatSessionLabel(session);
                  return (
                    <li
                      key={session?.id ?? index}
                      className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{day}</p>
                        <p className="mt-0.5 text-sm text-gray-600">
                          {timePeriod} · {start} – {end}
                        </p>
                        {status && (
                          <span className="mt-2 inline-block rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                            {status}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}
        </div>
      )}

      {showConfirmCash && (
        <div className="flex justify-end">
          <Button onClick={() => setConfirmModalOpen(true)}>
            Confirm & mark paid
          </Button>
        </div>
      )}

      <ConfirmCashPaymentModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        reservationId={Number(reservation?.id)}
        onSuccess={(updatedReservation) => {
          onReservationUpdate?.(updatedReservation);
        }}
      />

      <div className="flex flex-wrap gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-xs text-gray-500">
        <span>
          <span className="font-medium text-gray-600">Created:</span>{' '}
          {reservation?.created_at ?? '—'}
        </span>
        <span>
          <span className="font-medium text-gray-600">Updated:</span>{' '}
          {reservation?.updated_at ?? '—'}
        </span>
      </div>
    </div>
  );
}

export default function ReservationViewModal({
  reservation,
  canEdit = false,
}: {
  reservation: any;
  canEdit?: boolean;
}) {
  const { closeModal } = useModal();
  const [localReservation, setLocalReservation] = useState(reservation);

  useEffect(() => {
    setLocalReservation(reservation);
  }, [reservation]);

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden bg-gray-50/50">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <Title as="h4" className="text-lg font-semibold text-gray-900">
            Reservation Details
          </Title>
          <Text as="p" className="mt-0.5 text-sm text-gray-500">
            {canEdit && canConfirmCashPayment(localReservation)
              ? 'Review details or confirm cash collection'
              : 'Read-only view'}
          </Text>
        </div>
        <Button onClick={closeModal} variant="outline" size="sm" className="shrink-0">
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <ReservationViewContent
          reservation={localReservation}
          canEdit={canEdit}
          onReservationUpdate={setLocalReservation}
        />
      </div>
    </div>
  );
}
