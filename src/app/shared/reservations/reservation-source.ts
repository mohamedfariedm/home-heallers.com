export const RESERVATION_SOURCES_LOCKED = ['Application', 'Website'] as const;

export type ReservationSource =
  | (typeof RESERVATION_SOURCES_LOCKED)[number]
  | 'Dashboard'
  | string
  | null;

export const isReservationEditable = (reservation: {
  reservation_source?: ReservationSource;
}) => {
  const source = reservation?.reservation_source;
  if (source == null || source === '') return true;
  return !RESERVATION_SOURCES_LOCKED.includes(
    source as (typeof RESERVATION_SOURCES_LOCKED)[number]
  );
};

export const isReservationLockedSource = (reservation: {
  reservation_source?: ReservationSource;
}) => !isReservationEditable(reservation);

export const canEditReservationWithPermission = (
  canEdit: boolean,
  reservation: { reservation_source?: ReservationSource }
) => canEdit && isReservationEditable(reservation);
