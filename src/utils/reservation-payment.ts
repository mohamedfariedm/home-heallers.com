export const ReservationStatus = {
  Reviewing: 1,
  WaitConfirm: 2,
  Confirmed: 3,
  Canceled: 4,
  Completed: 5,
  Failed: 6,
  PendingPayment: 8,
} as const;

export const RESERVATION_STATUS_OPTIONS = [
  { value: ReservationStatus.Reviewing, label: 'Reviewing' },
  { value: ReservationStatus.WaitConfirm, label: 'Wait Confirm' },
  { value: ReservationStatus.Confirmed, label: 'Confirmed' },
  { value: ReservationStatus.Canceled, label: 'Canceled' },
  { value: ReservationStatus.Completed, label: 'Completed' },
  { value: ReservationStatus.Failed, label: 'Failed' },
  { value: ReservationStatus.PendingPayment, label: 'Pending Payment' },
] as const;

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cash_pending';

type ReservationPaymentFields = {
  payment_status?: string | null;
  payment_method?: string | null;
  paid?: boolean | number | null;
};

export function isCashPayment(paymentMethod: string | null | undefined): boolean {
  return String(paymentMethod ?? '').toLowerCase() === 'cash';
}

export function isCashPending(reservation: ReservationPaymentFields): boolean {
  if (reservation.payment_status === 'cash_pending') return true;
  return (
    isCashPayment(reservation.payment_method) &&
    reservation.payment_status !== 'paid' &&
    !Boolean(reservation.paid)
  );
}

export function shouldHidePaymentLink(reservation: ReservationPaymentFields): boolean {
  if (reservation.payment_status === 'cash_pending') return true;
  if (reservation.payment_status === 'paid') return true;
  return isCashPayment(reservation.payment_method);
}

export function getPaymentStatusBadgeLabel(
  paymentStatus: string | null | undefined
): string | null {
  if (!paymentStatus) return null;

  const labels: Record<string, string> = {
    pending: 'Pending payment',
    paid: 'Paid',
    failed: 'Failed',
    cash_pending: 'Cash pending',
  };

  return labels[paymentStatus] ?? paymentStatus;
}

export function getPaymentStatusBadgeClasses(
  paymentStatus: string | null | undefined
): string {
  switch (paymentStatus) {
    case 'pending':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'failed':
      return 'border-red-300 bg-red-100 text-red-800';
    case 'paid':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'cash_pending':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}

export function getPaymentStatusLabel(reservation: ReservationPaymentFields): string {
  const status = reservation.payment_status;

  if (status === 'cash_pending') return 'Cash to collect';
  if (status === 'pending') return 'Awaiting payment';
  if (status === 'failed') return 'Payment failed';
  if (status === 'paid') {
    return isCashPayment(reservation.payment_method) ? 'Paid (cash)' : 'Paid';
  }

  const isCash = isCashPayment(reservation.payment_method);
  const paid = Boolean(reservation.paid);

  if (isCash) {
    return paid ? 'Paid (cash)' : 'Cash pending';
  }

  if (reservation.paid === null || reservation.paid === undefined) {
    return '—';
  }

  return paid ? 'Paid' : 'Unpaid online';
}

export function getPaymentStatusColorClass(
  reservation: ReservationPaymentFields
): string {
  const status = reservation.payment_status;

  if (status === 'pending' || status === 'failed') return 'text-red-600';
  if (status === 'paid') return 'text-emerald-700';
  if (status === 'cash_pending') return 'text-orange-700';

  if (isCashPayment(reservation.payment_method)) {
    return reservation.paid ? 'text-emerald-700' : 'text-orange-700';
  }

  return reservation.paid ? 'text-emerald-700' : 'text-red-600';
}

export function canConfirmCashPayment(reservation: ReservationPaymentFields): boolean {
  return isCashPending(reservation);
}
