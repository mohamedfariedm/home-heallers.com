export const RESERVATION_SOURCE_APPLICATION = 'Application' as const;
export const RESERVATION_SOURCE_WEBSITE = 'Website' as const;

export const RESERVATION_SOURCES_LOCKED = [
  RESERVATION_SOURCE_APPLICATION,
  RESERVATION_SOURCE_WEBSITE,
] as const;

export type ReservationSource =
  | (typeof RESERVATION_SOURCES_LOCKED)[number]
  | 'Dashboard'
  | string
  | null;

export const isReservationLockedSource = (reservation: {
  reservation_source?: ReservationSource;
}) => {
  const source = reservation?.reservation_source;
  return (
    source === RESERVATION_SOURCE_APPLICATION ||
    source === RESERVATION_SOURCE_WEBSITE
  );
};

export const isReservationEditable = (reservation: {
  reservation_source?: ReservationSource;
}) => {
  const source = reservation?.reservation_source;
  if (source == null || source === '') return true;
  return !isReservationLockedSource(reservation);
};
export const canEditReservationWithPermission = (
  canEdit: boolean,
  reservation: { reservation_source?: ReservationSource }
) => canEdit && isReservationEditable(reservation);
