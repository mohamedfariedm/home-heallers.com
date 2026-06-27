export const ReservationStatus = {
  Reviewing: 1,
  WaitConfirm: 2,
  Confirmed: 3,
  Canceled: 4,
  Completed: 5,
  Failed: 6,
} as const;

export const RESERVATION_STATUS_OPTIONS = [
  { value: ReservationStatus.Reviewing, label: 'Reviewing' },
  { value: ReservationStatus.WaitConfirm, label: 'Wait Confirm' },
  { value: ReservationStatus.Confirmed, label: 'Confirmed' },
  { value: ReservationStatus.Canceled, label: 'Canceled' },
  { value: ReservationStatus.Completed, label: 'Completed' },
  { value: ReservationStatus.Failed, label: 'Failed' },
] as const;

export function isCashPayment(paymentMethod: string | null | undefined): boolean {
  return String(paymentMethod ?? '').toLowerCase() === 'cash';
}

export function getPaymentStatusLabel(
  reservation: { payment_method?: string | null; paid?: boolean | number | null }
): string {
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

export function canConfirmCashPayment(
  reservation: { payment_method?: string | null; paid?: boolean | number | null }
): boolean {
  return isCashPayment(reservation.payment_method) && !Boolean(reservation.paid);
}
